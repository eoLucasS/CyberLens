import type { Match } from '../types';

/**
 * Matches GitHub user, repo and org URLs in two shapes:
 *   1. Full URL with scheme: https://github.com/<user>[/<repo>]
 *   2. Bare host form: github.com/<user>[/<repo>]
 *
 * GitHub usernames are limited to alphanumeric plus hyphen, 1-39 chars.
 * The pattern allows an optional repository segment because resumes often
 * link directly to a sample project.
 */
const GITHUB_USER_PART = '[A-Za-z0-9][A-Za-z0-9_\\-]{0,38}';
const GITHUB_REPO_PART = '(?:\\/[A-Za-z0-9._\\-]+)?\\/?';

const GITHUB_WITH_SCHEME = new RegExp(
  `https?:\\/\\/(?:www\\.)?github\\.com\\/${GITHUB_USER_PART}${GITHUB_REPO_PART}`,
  'gi',
);

const GITHUB_BARE = new RegExp(`\\bgithub\\.com\\/${GITHUB_USER_PART}${GITHUB_REPO_PART}`, 'gi');

export function detectGithub(text: string): Match[] {
  const matches: Match[] = [];
  const consumed = new Set<number>();

  for (const m of text.matchAll(GITHUB_WITH_SCHEME)) {
    if (m.index === undefined) continue;
    for (let i = m.index; i < m.index + m[0].length; i++) consumed.add(i);
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      original: m[0],
      category: 'github',
      detector: 'github-full-url',
    });
  }

  for (const m of text.matchAll(GITHUB_BARE)) {
    if (m.index === undefined) continue;
    if (consumed.has(m.index)) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      original: m[0],
      category: 'github',
      detector: 'github-bare-host',
    });
  }

  return matches;
}
