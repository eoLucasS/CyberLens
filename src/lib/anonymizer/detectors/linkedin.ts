import type { Match } from '../types';

/**
 * Matches LinkedIn profile, public and company URLs in two shapes:
 *   1. Full URL with scheme: https://www.linkedin.com/in/<slug>
 *   2. Bare host form: linkedin.com/in/<slug>
 *
 * The slug character class allows the alphanumeric subset LinkedIn permits
 * plus the common URL-safe extras. The country-code subdomain ("br.", "pt.",
 * etc.) is optional and ignored.
 */
const LINKEDIN_WITH_SCHEME =
  /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub|company|profile)\/[A-Za-z0-9._\-%]+\/?/gi;

const LINKEDIN_BARE =
  /\b(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub|company|profile)\/[A-Za-z0-9._\-%]+\/?/gi;

export function detectLinkedin(text: string): Match[] {
  const matches: Match[] = [];
  const consumed = new Set<number>();

  for (const m of text.matchAll(LINKEDIN_WITH_SCHEME)) {
    if (m.index === undefined) continue;
    for (let i = m.index; i < m.index + m[0].length; i++) consumed.add(i);
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      original: m[0],
      category: 'linkedin',
      detector: 'linkedin-full-url',
    });
  }

  for (const m of text.matchAll(LINKEDIN_BARE)) {
    if (m.index === undefined) continue;
    if (consumed.has(m.index)) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      original: m[0],
      category: 'linkedin',
      detector: 'linkedin-bare-host',
    });
  }

  return matches;
}
