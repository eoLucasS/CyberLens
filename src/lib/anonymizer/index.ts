/**
 * PII anonymizer.
 *
 * Defense-in-depth layer between the user's resume text and any AI provider.
 * Detects structurally identifiable Brazilian PII and replaces every match
 * with a stable categorical token so the resulting text is safe to transmit.
 *
 * Coverage in v1:
 *   - E-mail
 *   - Telefone (BR, multiple shapes)
 *   - CPF (validator-backed via check digits)
 *   - CEP (formatted only)
 *   - Datas de nascimento (context-anchored or plausible-year)
 *   - URL do LinkedIn
 *   - URL do GitHub
 *
 * Out of scope for v1 (planned for v1.1 with human review):
 *   - Nome (precisa de dicionario de prenomes BR e heuristica contextual)
 *   - Endereco completo (alto risco de falso positivo em CVs com bullets)
 *   - Idade (colide com "X anos de experiencia")
 *   - Foto (requires PDF-level pixel redaction, deferred to v2)
 *
 * Security posture:
 *   - Pure function, no IO, no DOM, no network access
 *   - Deterministic, fully synchronous
 *   - Idempotent: anonymize(anonymize(x)) === anonymize(x)
 *   - ReDoS-safe regexes (no nested quantifiers, no catastrophic backtracking)
 */

import { DETECTORS } from './detectors';
import { TOKENS } from './tokens';
import type { AnonymizationResult, AnonymizeOptions, Category, Match } from './types';

/**
 * Conflict priority between categories. When two detectors flag overlapping
 * spans the higher priority wins. The ordering mirrors detection confidence:
 * CPF uses a math validator, e-mail and CEP are unambiguous structurally,
 * URLs are anchored on known hosts, and bare phone digit runs are the most
 * ambiguous source so they sit at the bottom.
 */
const CATEGORY_PRIORITY: Record<Category, number> = {
  cpf: 5,
  cep: 4,
  email: 4,
  linkedin: 3,
  github: 3,
  birthdate: 2,
  phone: 1,
};

/**
 * Resolves overlapping matches by greedily selecting the highest-priority,
 * longest, earliest match first. The remaining matches are skipped when they
 * intersect with anything already accepted.
 */
function resolveOverlaps(matches: Match[]): Match[] {
  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    const lenA = a.end - a.start;
    const lenB = b.end - b.start;
    if (lenA !== lenB) return lenB - lenA;
    return CATEGORY_PRIORITY[b.category] - CATEGORY_PRIORITY[a.category];
  });

  const accepted: Match[] = [];
  for (const m of sorted) {
    const overlaps = accepted.some((a) => m.start < a.end && a.start < m.end);
    if (!overlaps) accepted.push(m);
  }

  return accepted.sort((a, b) => a.start - b.start);
}

/**
 * Applies the resolved matches back-to-front so earlier offsets stay valid
 * as later substrings are replaced. Matches must already be sorted by start
 * ascending; the function iterates in reverse internally.
 */
function applySubstitutions(text: string, sortedMatches: Match[]): string {
  let out = text;
  for (let i = sortedMatches.length - 1; i >= 0; i--) {
    const m = sortedMatches[i];
    out = out.slice(0, m.start) + TOKENS[m.category] + out.slice(m.end);
  }
  return out;
}

/**
 * Empty result returned for blank or unusable input. Keeps callers from
 * having to special-case null/empty strings.
 */
function emptyResult(): AnonymizationResult {
  return {
    redactedText: '',
    matches: [],
    countsByCategory: {
      email: 0,
      phone: 0,
      cpf: 0,
      cep: 0,
      birthdate: 0,
      linkedin: 0,
      github: 0,
    },
  };
}

/**
 * Main entry point. Accepts any string and returns a fully redacted version
 * plus the list of applied substitutions. Never throws; on bad input returns
 * an empty result.
 */
export function anonymize(text: string, opts?: AnonymizeOptions): AnonymizationResult {
  if (typeof text !== 'string' || text.length === 0) {
    return emptyResult();
  }

  const enabled = opts?.enabledCategories;

  const collected: Match[] = [];
  for (const category of Object.keys(DETECTORS) as Category[]) {
    if (enabled && enabled[category] === false) continue;
    collected.push(...DETECTORS[category](text));
  }

  const resolved = resolveOverlaps(collected);
  const redactedText = applySubstitutions(text, resolved);

  const countsByCategory: Record<Category, number> = {
    email: 0,
    phone: 0,
    cpf: 0,
    cep: 0,
    birthdate: 0,
    linkedin: 0,
    github: 0,
  };
  for (const m of resolved) countsByCategory[m.category]++;

  return { redactedText, matches: resolved, countsByCategory };
}

export type {
  AnonymizationResult,
  AnonymizeOptions,
  Category,
  CategoryOptions,
  Match,
} from './types';
export { TOKENS, CATEGORY_LABELS, CATEGORIES, DEFAULT_CATEGORY_STATE } from './tokens';
export { DEFAULT_PREFS, sanitizePrefs, toEnabledMap, countDisabledCategories } from './preferences';
