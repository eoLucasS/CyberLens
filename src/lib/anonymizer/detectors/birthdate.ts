import type { Match } from '../types';

/**
 * Two-pass strategy:
 *
 *   1. Context-anchored dates: a date that follows an explicit cue like
 *      "nascido em", "data de nascimento", "DN:", "nasc.:" is treated as a
 *      birthdate regardless of year.
 *
 *   2. Bare full dates (dd/mm/yyyy or dd-mm-yyyy) are only emitted when the
 *      year is in the plausible birth-year window (1900-2004). This keeps
 *      typical work-history dates (01/01/2020 onwards) out of the redaction
 *      pipeline while still catching headers like "Joao Silva, 15/03/1990".
 */
const CONTEXT_RE =
  /(?:nascid[oa]\s+em|data\s+de\s+nascimento|DN\b|nasc\.)\s*[:.\-]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi;

const PLAUSIBLE_BIRTHDATE_RE =
  /\b(?:0?[1-9]|[12]\d|3[01])[\/\-](?:0?[1-9]|1[0-2])[\/\-](?:19\d{2}|200[0-4])\b/g;

export function detectBirthdate(text: string): Match[] {
  const matches: Match[] = [];
  const consumed = new Set<number>();

  for (const m of text.matchAll(CONTEXT_RE)) {
    if (m.index === undefined || !m[1]) continue;
    const dateOffset = m[0].indexOf(m[1]);
    const start = m.index + dateOffset;
    const end = start + m[1].length;
    for (let i = start; i < end; i++) consumed.add(i);
    matches.push({
      start,
      end,
      original: m[1],
      category: 'birthdate',
      detector: 'birthdate-context',
    });
  }

  for (const m of text.matchAll(PLAUSIBLE_BIRTHDATE_RE)) {
    if (m.index === undefined) continue;
    if (consumed.has(m.index)) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      original: m[0],
      category: 'birthdate',
      detector: 'birthdate-plausible-year',
    });
  }

  return matches;
}
