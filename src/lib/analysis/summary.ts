/**
 * Executive summary utilities.
 *
 * The primary path is the AI generating the summary. These utilities exist
 * as a robust fallback layer: if the AI output is missing, too short,
 * too long, or in the wrong language, we synthesize a deterministic summary
 * from the other fields of the analysis, so the user always sees something
 * coherent and consistent with the score.
 */

import type { AnalysisResult, Gap, StudyPlanItem } from '@/types';

/** Minimum length (in characters) for an AI-generated summary to be accepted as-is. */
const MIN_SUMMARY_LENGTH = 60;

/** Maximum length before we truncate. Covers ~4 reasonably long sentences. */
const MAX_SUMMARY_LENGTH = 800;

/**
 * Detects summaries that look like English output (AI sometimes ignores pt-BR
 * instruction, especially with smaller Llama models). Heuristic: counts
 * common English function words that rarely appear in Portuguese text.
 */
function looksLikeEnglish(text: string): boolean {
  const normalized = ` ${text.toLowerCase()} `;
  const englishMarkers = [
    ' the ', ' your ', ' with ', ' that ', ' this ',
    ' resume ', ' candidate ', ' should ', ' would ',
    ' applicant ', ' position ',
  ];
  let hits = 0;
  for (const marker of englishMarkers) {
    if (normalized.includes(marker)) hits++;
  }
  // More than 2 markers strongly suggests English. Single hits can happen
  // in pt-BR text that borrows English terms (e.g., "a position of").
  return hits >= 3;
}

/**
 * Picks the most relevant gap to mention in the summary.
 * Preference order: Crítico > Importante > Desejável > first available.
 */
function pickTopGap(gaps: Gap[]): Gap | undefined {
  if (gaps.length === 0) return undefined;
  return (
    gaps.find((g) => g.priority === 'Crítico') ??
    gaps.find((g) => g.priority === 'Importante') ??
    gaps.find((g) => g.priority === 'Desejável') ??
    gaps[0]
  );
}

/**
 * Picks the first study plan item to recommend (assumed highest priority,
 * since the AI sorts the plan by priority).
 */
function pickFirstStudy(plan: StudyPlanItem[]): StudyPlanItem | undefined {
  if (plan.length === 0) return undefined;
  const sorted = [...plan].sort((a, b) => a.order - b.order);
  return sorted[0];
}

/**
 * Returns the diagnostic sentence calibrated to the score range.
 * Tone is constructive across all ranges, never discouraging.
 */
function diagnosticByScore(score: number): string {
  if (score >= 85) {
    return 'Sua candidatura está em excelente forma para esta vaga, com aderência muito alta ao perfil desejado.';
  }
  if (score >= 70) {
    return 'Sua candidatura tem alta aderência à vaga, com espaço para ajustes pontuais que podem destacá-la ainda mais.';
  }
  if (score >= 40) {
    return 'Sua candidatura tem aderência parcial e pode se beneficiar de preparação direcionada antes de competir pela vaga.';
  }
  return 'Sua candidatura ainda não cobre os principais requisitos desta vaga, mas há um caminho claro de preparação a seguir.';
}

/**
 * Builds a deterministic executive summary from the structured analysis fields.
 * Always returns a valid, coherent, pt-BR summary regardless of AI output.
 *
 * Security: operates on in-memory objects only. No network calls. No storage.
 */
export function synthesizeExecutiveSummary(result: AnalysisResult): string {
  const parts: string[] = [diagnosticByScore(result.score)];

  const topGap = pickTopGap(result.gaps);
  if (topGap) {
    parts.push(
      `O principal ponto de atenção é ${topGap.skill}, classificado como ${topGap.priority.toLowerCase()} para esta vaga.`,
    );
  }

  const firstStudy = pickFirstStudy(result.studyPlan);
  if (firstStudy) {
    parts.push(
      `Como próximo passo, priorize ${firstStudy.topic.toLowerCase()} para fechar a maior lacuna identificada.`,
    );
  } else if (result.matchedSkills.length > 0) {
    // No study plan? Fall back to reinforcing existing strengths.
    parts.push(
      'Como próximo passo, destaque no currículo as habilidades já identificadas como aderentes à vaga.',
    );
  }

  return parts.join(' ');
}

/**
 * Truncates a long summary at the boundary of the last complete sentence
 * that fits within MAX_SUMMARY_LENGTH. Preserves readability (never cuts
 * mid-word or mid-sentence).
 */
function truncateAtSentence(text: string): string {
  if (text.length <= MAX_SUMMARY_LENGTH) return text;

  const slice = text.slice(0, MAX_SUMMARY_LENGTH);
  // Find the last sentence-ending punctuation.
  const lastPeriod = slice.lastIndexOf('.');
  const lastQuestion = slice.lastIndexOf('?');
  const lastExclaim = slice.lastIndexOf('!');
  const lastBoundary = Math.max(lastPeriod, lastQuestion, lastExclaim);

  if (lastBoundary > MAX_SUMMARY_LENGTH / 2) {
    return slice.slice(0, lastBoundary + 1).trim();
  }

  // No decent boundary found: fall back to word boundary.
  const lastSpace = slice.lastIndexOf(' ');
  return slice.slice(0, lastSpace > 0 ? lastSpace : slice.length).trim() + '.';
}

/**
 * Validates and normalizes an AI-generated executive summary.
 * Returns a clean summary, or null if the AI output should be rejected
 * and replaced by the synthesized fallback.
 */
export function validateAiSummary(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim();

  if (trimmed.length < MIN_SUMMARY_LENGTH) return null;
  if (looksLikeEnglish(trimmed)) return null;

  return truncateAtSentence(trimmed);
}

/**
 * Resolves the final executive summary for an analysis result.
 * Tries the AI output first; falls back to deterministic synthesis.
 * Always returns a valid, non-empty pt-BR string.
 */
export function resolveExecutiveSummary(
  aiSummary: unknown,
  result: AnalysisResult,
): string {
  const valid = validateAiSummary(aiSummary);
  if (valid !== null) return valid;
  return synthesizeExecutiveSummary(result);
}
