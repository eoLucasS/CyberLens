import type { Match } from '../types';

/**
 * Only the formatted CEP shape (XXXXX-XXX) is detected. Raw 8-digit runs
 * appear in too many non-CEP contexts (product codes, internal IDs, OCR
 * artefacts) to redact without producing more harm than good.
 */
const CEP_FORMATTED = /\b\d{5}-\d{3}\b/g;

export function detectCep(text: string): Match[] {
  const matches: Match[] = [];
  for (const m of text.matchAll(CEP_FORMATTED)) {
    if (m.index === undefined) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      original: m[0],
      category: 'cep',
      detector: 'cep-formatted',
    });
  }
  return matches;
}
