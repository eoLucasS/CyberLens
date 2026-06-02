import type { Match } from '../types';

/**
 * Brazilian phone-number patterns, ordered from most to least specific.
 *
 * Patterns covered:
 *   1. +55 (international) with optional parens around DDD and mobile leading 9
 *   2. (DDD) NNNN-NNNN or (DDD) NNNNN-NNNN (parenthesised area code)
 *   3. DDD NNNNN-NNNN (mobile, space-separated)
 *   4. DDD NNNN-NNNN (landline, space-separated)
 *   5. 11-digit run with no separators (mobile fallback)
 *   6. 10-digit run with no separators (landline fallback)
 *
 * The two raw-digit patterns collide with CPF and CEP. The overlap resolver
 * in `anonymize` deconflicts: CPF wins when its check digits validate, CEP
 * wins because CEP is shorter and we never emit unformatted CEP.
 */
const PHONE_PATTERNS: ReadonlyArray<{ re: RegExp; detector: string }> = [
  {
    re: /\+55\s?\(?\d{2}\)?\s?9?\d{4}[\s\-]?\d{4}\b/g,
    detector: 'phone-br-international',
  },
  {
    re: /\(\d{2}\)\s?9?\d{4}[\s\-]?\d{4}\b/g,
    detector: 'phone-br-parens',
  },
  {
    re: /\b\d{2}\s9\d{4}[\s\-]?\d{4}\b/g,
    detector: 'phone-br-mobile-spaced',
  },
  {
    re: /\b\d{2}\s\d{4}[\s\-]\d{4}\b/g,
    detector: 'phone-br-landline-spaced',
  },
  {
    re: /\b\d{11}\b/g,
    detector: 'phone-br-11-digit',
  },
  {
    re: /\b\d{10}\b/g,
    detector: 'phone-br-10-digit',
  },
];

export function detectPhone(text: string): Match[] {
  const matches: Match[] = [];
  for (const { re, detector } of PHONE_PATTERNS) {
    for (const m of text.matchAll(re)) {
      if (m.index === undefined) continue;
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        original: m[0],
        category: 'phone',
        detector,
      });
    }
  }
  return matches;
}
