/**
 * Analysis result sanitizer.
 *
 * Defense-in-depth layer between untrusted input (AI response, legacy
 * localStorage entries, static demo JSON) and the rendering components.
 * Guarantees that `sanitizeAnalysisResult` always returns a fully valid
 * AnalysisResult, even when the input is missing fields, has wrong types,
 * malformed enums, duplicates, or oversized strings.
 *
 * Philosophy: filter + repair instead of reject. A malformed entry that
 * partially passes is salvaged. A malformed entry beyond repair falls back
 * to safe empty defaults so consumers never see `undefined`.
 *
 * Security posture:
 * - Pure functions, no IO, no DOM, no network
 * - All string fields are length-capped (DoS protection)
 * - All array fields are length-capped (DoS + UI pollution protection)
 * - URLs rejected unless http/https (XSS defense)
 * - Enums restricted to whitelists with safe fallbacks
 * - Finite number checks for every numeric field
 * - Deduplication prevents the UI from showing misleading repeated items
 */

import type {
  AnalysisResult,
  Classification,
  Gap,
  MatchedSkill,
  MissingKeyword,
  ExperienceAnalysis,
  CertificationAnalysis,
  StudyPlanItem,
  StudyResource,
  RewriteSuggestion,
} from '@/types/analysis';
import { synthesizeExecutiveSummary, validateAiSummary } from '@/lib/analysis/summary';

// ─── Limits ──────────────────────────────────────────────────────────────────

export const CAPS = {
  // Array sizes
  matchedSkills: 12,
  gaps: 8,
  missingKeywords: 10,
  studyPlan: 6,
  studyResources: 6,
  certifications: 8,
  rewriteKeywords: 8,
  // String sizes
  shortString: 500, // skill, keyword, resource name, platform, etc.
  mediumString: 1500, // context, suggestion, topic
  longString: 2500, // reason, description, before/after, suggestedText
  veryLongString: 4000, // required/found experience text
  executiveSummary: 800,
} as const;

// ─── Classification thresholds (mirror of deriveClassification) ──────────────

function classificationFromScore(score: number): Classification {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped >= 85) return 'Aderência Excelente';
  if (clamped >= 70) return 'Alta Aderência';
  if (clamped >= 40) return 'Aderência Parcial';
  return 'Baixa Aderência';
}

// ─── Primitive helpers ──────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Coerces a value to a non-empty trimmed string within `maxLength`.
 * Returns null if the input is not usable (not a string, empty after trim,
 * or contains only whitespace/control chars).
 */
function coerceToBoundedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

/** Coerces a value to a bounded string, or returns the provided fallback if invalid. */
function coerceToBoundedStringOrDefault(
  value: unknown,
  maxLength: number,
  fallback: string,
): string {
  return coerceToBoundedString(value, maxLength) ?? fallback;
}

/**
 * Coerces a value to a finite number within [min, max]. Returns null otherwise.
 * Rejects NaN, Infinity, -Infinity, strings that look like numbers.
 */
function coerceToFiniteNumber(value: unknown, min: number, max: number): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

/**
 * Normalizes a string for fuzzy enum matching: removes accents, lowercases,
 * trims, removes trailing punctuation.
 */
function normalizeForEnumMatch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[:.;!?\s]+$/g, '')
    .trim();
}

/**
 * Matches an input string against a whitelist of enum values using normalized
 * comparison. Falls back to the provided default if no match.
 */
function coerceToEnum<T extends string>(value: unknown, whitelist: readonly T[], fallback: T): T {
  if (typeof value !== 'string') return fallback;
  const target = normalizeForEnumMatch(value);
  if (target.length === 0) return fallback;
  for (const option of whitelist) {
    if (normalizeForEnumMatch(option) === target) return option;
  }
  return fallback;
}

/**
 * Safe URL validator: accepts only http(s) URLs. Rejects javascript:, data:,
 * file:, and any malformed URL.
 */
function sanitizeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Returns the input array if it is an array, otherwise an empty array. */
function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

// ─── Sub-structure sanitizers ───────────────────────────────────────────────

/**
 * Sanitizes a single matched skill. Requires a non-empty skill name;
 * returns null when the skill is invalid so the caller can filter it out.
 */
function sanitizeMatchedSkill(raw: unknown): MatchedSkill | null {
  if (!isRecord(raw)) return null;
  const skill = coerceToBoundedString(raw.skill, CAPS.shortString);
  if (skill === null) return null;
  const context = coerceToBoundedStringOrDefault(raw.context, CAPS.mediumString, '');
  return { skill, context };
}

const GAP_PRIORITIES: readonly Gap['priority'][] = ['Crítico', 'Importante', 'Desejável'];

const REWRITE_TYPES: readonly RewriteSuggestion['type'][] = ['rewrite', 'study'];

function sanitizeRewriteSuggestion(raw: unknown): RewriteSuggestion | null {
  if (!isRecord(raw)) return null;

  const type = coerceToEnum(raw.type, REWRITE_TYPES, 'rewrite');

  if (type === 'rewrite') {
    // "rewrite" requires at least one of before/after to be useful.
    const before = coerceToBoundedString(raw.before, CAPS.longString);
    const after = coerceToBoundedString(raw.after, CAPS.longString);
    if (before === null && after === null) return null;

    const keywords = asArray(raw.keywords)
      .map((k) => coerceToBoundedString(k, CAPS.shortString))
      .filter((k): k is string => k !== null)
      .slice(0, CAPS.rewriteKeywords);

    return {
      type: 'rewrite',
      before: before ?? undefined,
      after: after ?? undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
    };
  }

  // "study" requires at least a resource or a suggestedText to be useful.
  const resource = coerceToBoundedString(raw.resource, CAPS.mediumString);
  const estimatedTime = coerceToBoundedString(raw.estimatedTime, CAPS.shortString);
  const suggestedText = coerceToBoundedString(raw.suggestedText, CAPS.longString);
  if (resource === null && suggestedText === null) return null;

  return {
    type: 'study',
    resource: resource ?? undefined,
    estimatedTime: estimatedTime ?? undefined,
    suggestedText: suggestedText ?? undefined,
  };
}

function sanitizeGap(raw: unknown): Gap | null {
  if (!isRecord(raw)) return null;
  const skill = coerceToBoundedString(raw.skill, CAPS.shortString);
  if (skill === null) return null;
  const priority = coerceToEnum(raw.priority, GAP_PRIORITIES, 'Importante');
  const reason = coerceToBoundedStringOrDefault(
    raw.reason,
    CAPS.longString,
    'Sem justificativa específica disponível.',
  );

  const rewriteSuggestion =
    raw.rewriteSuggestion !== undefined
      ? (sanitizeRewriteSuggestion(raw.rewriteSuggestion) ?? undefined)
      : undefined;

  return { skill, priority, reason, rewriteSuggestion };
}

function sanitizeMissingKeyword(raw: unknown): MissingKeyword | null {
  if (!isRecord(raw)) return null;
  const keyword = coerceToBoundedString(raw.keyword, CAPS.shortString);
  if (keyword === null) return null;
  const suggestion = coerceToBoundedStringOrDefault(raw.suggestion, CAPS.mediumString, '');
  return { keyword, suggestion };
}

function emptyCertificationAnalysis(): CertificationAnalysis {
  return { required: [], found: [], missing: [] };
}

function sanitizeCertificationList(raw: unknown): string[] {
  return asArray(raw)
    .map((item) => coerceToBoundedString(item, CAPS.shortString))
    .filter((c): c is string => c !== null)
    .slice(0, CAPS.certifications);
}

function sanitizeCertificationAnalysis(raw: unknown): CertificationAnalysis {
  if (!isRecord(raw)) return emptyCertificationAnalysis();
  return {
    required: sanitizeCertificationList(raw.required),
    found: sanitizeCertificationList(raw.found),
    missing: sanitizeCertificationList(raw.missing),
  };
}

function emptyExperienceAnalysis(): ExperienceAnalysis {
  return {
    required: '',
    found: '',
    gap: '',
    certifications: emptyCertificationAnalysis(),
  };
}

function sanitizeExperienceAnalysis(raw: unknown): ExperienceAnalysis {
  if (!isRecord(raw)) return emptyExperienceAnalysis();
  return {
    required: coerceToBoundedStringOrDefault(raw.required, CAPS.veryLongString, ''),
    found: coerceToBoundedStringOrDefault(raw.found, CAPS.veryLongString, ''),
    gap: coerceToBoundedStringOrDefault(raw.gap, CAPS.longString, ''),
    certifications: sanitizeCertificationAnalysis(raw.certifications),
  };
}

const STUDY_RESOURCE_TYPES: readonly StudyPlanItem['resourceType'][] = [
  'Curso',
  'Certificação',
  'Projeto Prático',
  'Leitura',
  'Laboratório',
];

const STUDY_PRIORITIES: readonly StudyPlanItem['priority'][] = ['Alta', 'Média', 'Baixa'];

function sanitizeStudyResource(raw: unknown): StudyResource | null {
  if (!isRecord(raw)) return null;
  const name = coerceToBoundedString(raw.name, CAPS.mediumString);
  if (name === null) return null;
  const url = sanitizeUrl(raw.url) ?? '';
  const platform = coerceToBoundedStringOrDefault(
    raw.platform,
    CAPS.shortString,
    'Recurso externo',
  );
  return { name, url, platform };
}

function sanitizeStudyPlanItem(raw: unknown, fallbackOrder: number): StudyPlanItem | null {
  if (!isRecord(raw)) return null;
  const topic = coerceToBoundedString(raw.topic, CAPS.mediumString);
  if (topic === null) return null;

  const orderCoerced = coerceToFiniteNumber(raw.order, 1, 100);
  const order = orderCoerced !== null ? Math.round(orderCoerced) : fallbackOrder;
  const description = coerceToBoundedStringOrDefault(raw.description, CAPS.longString, '');
  const resourceType = coerceToEnum(raw.resourceType, STUDY_RESOURCE_TYPES, 'Curso');
  const priority = coerceToEnum(raw.priority, STUDY_PRIORITIES, 'Média');
  const estimatedTime = coerceToBoundedStringOrDefault(
    raw.estimatedTime,
    CAPS.shortString,
    'A definir',
  );

  const resources = asArray(raw.resources)
    .map(sanitizeStudyResource)
    .filter((r): r is StudyResource => r !== null)
    .slice(0, CAPS.studyResources);

  return {
    order,
    topic,
    description,
    resourceType,
    priority,
    estimatedTime,
    resources,
  };
}

// ─── Dedupe helpers ──────────────────────────────────────────────────────────

/** Dedupes by a case-insensitive, accent-insensitive key. Keeps the first. */
function dedupeByKey<T>(items: T[], keyOf: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = normalizeForEnumMatch(keyOf(item));
    if (key.length === 0 || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

// ─── Main entry point ──────────────────────────────────────────────────────

/**
 * Accepts any input and returns a fully valid AnalysisResult.
 * Never throws. Never returns undefined. Never leaves arrays or required
 * objects as null. Always safe to render.
 */
export function sanitizeAnalysisResult(raw: unknown): AnalysisResult {
  const source = isRecord(raw) ? raw : {};

  // Score: required, must be a finite number in [0, 100].
  const scoreCoerced = coerceToFiniteNumber(source.score, 0, 100);
  const score = scoreCoerced !== null ? Math.round(scoreCoerced) : 0;

  // Classification: always derived from score (ignore AI-provided value).
  const classification = classificationFromScore(score);

  // Matched skills: sanitize each, filter invalid, dedupe by skill name, cap.
  const matchedSkillsRaw = asArray(source.matchedSkills)
    .map(sanitizeMatchedSkill)
    .filter((s): s is MatchedSkill => s !== null);
  const matchedSkills = dedupeByKey(matchedSkillsRaw, (s) => s.skill).slice(0, CAPS.matchedSkills);

  // Gaps: sanitize, dedupe by skill, cap.
  const gapsRaw = asArray(source.gaps)
    .map(sanitizeGap)
    .filter((g): g is Gap => g !== null);
  const gaps = dedupeByKey(gapsRaw, (g) => g.skill).slice(0, CAPS.gaps);

  // Missing keywords: sanitize, dedupe by keyword, cap.
  const missingKeywordsRaw = asArray(source.missingKeywords)
    .map(sanitizeMissingKeyword)
    .filter((k): k is MissingKeyword => k !== null);
  const missingKeywords = dedupeByKey(missingKeywordsRaw, (k) => k.keyword).slice(
    0,
    CAPS.missingKeywords,
  );

  const experienceAnalysis = sanitizeExperienceAnalysis(source.experienceAnalysis);

  // Study plan: sanitize, assign sequential order when needed, cap.
  const studyPlanRaw = asArray(source.studyPlan)
    .map((item, idx) => sanitizeStudyPlanItem(item, idx + 1))
    .filter((i): i is StudyPlanItem => i !== null);
  // Ensure unique, sequential order values for stable rendering.
  const studyPlan = studyPlanRaw
    .slice(0, CAPS.studyPlan)
    .map((item, idx) => ({ ...item, order: idx + 1 }));

  // Build the result skeleton without the summary so the deterministic
  // synthesizer sees all the sanitized context.
  const skeleton: AnalysisResult = {
    score,
    classification,
    executiveSummary: '',
    matchedSkills,
    gaps,
    missingKeywords,
    experienceAnalysis,
    studyPlan,
  };

  // Executive summary: validate AI output; if invalid (missing, too short,
  // English, etc.) synthesize a deterministic pt-BR summary from the
  // sanitized fields. Always returns a non-empty string.
  const validated = validateAiSummary(source.executiveSummary);
  skeleton.executiveSummary = validated ?? synthesizeExecutiveSummary(skeleton);

  return skeleton;
}
