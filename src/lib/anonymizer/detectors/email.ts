import type { Match } from '../types';

/**
 * Conservative RFC-like email pattern: local part, at-sign, domain with a TLD
 * of at least two letters. Word boundaries prevent catching email-like
 * fragments inside larger tokens (e.g. log lines).
 */
const EMAIL_RE = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;

export function detectEmail(text: string): Match[] {
  const matches: Match[] = [];
  for (const m of text.matchAll(EMAIL_RE)) {
    if (m.index === undefined) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      original: m[0],
      category: 'email',
      detector: 'email-rfc',
    });
  }
  return matches;
}
