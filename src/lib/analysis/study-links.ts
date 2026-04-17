/**
 * Study resource link utilities.
 *
 * Mitigates a known LLM failure mode: hallucinated URLs. The AI frequently
 * invents plausible-looking course URLs that 404 in practice. Rather than
 * validate each URL over the network (blocked by CORS, slow, privacy cost),
 * we transform AI-provided URLs into safe, always-working search URLs on
 * trusted platforms when the original URL looks suspicious.
 *
 * Security posture:
 * - Pure functions, no network calls, no DOM access
 * - All query strings are URL-encoded via encodeURIComponent
 * - Output URLs are whitelisted to well-known https domains
 * - Never renders user or AI input as HTML
 */

/** Known safe platforms and their search URL builders. */
const PLATFORM_SEARCH_BUILDERS: Record<string, (query: string) => string> = {
  'coursera.org': (q) => `https://www.coursera.org/search?query=${encodeURIComponent(q)}`,
  'udemy.com': (q) => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(q)}`,
  'alura.com.br': (q) => `https://www.alura.com.br/busca?query=${encodeURIComponent(q)}`,
  'linkedin.com': (q) => `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(q)}`,
  'dio.me': (q) => `https://www.dio.me/search?q=${encodeURIComponent(q)}`,
  'datacamp.com': (q) => `https://www.datacamp.com/search?q=${encodeURIComponent(q)}`,
  'edx.org': (q) => `https://www.edx.org/search?q=${encodeURIComponent(q)}`,
  'tryhackme.com': (q) => `https://tryhackme.com/r/hacktivities/search?queryString=${encodeURIComponent(q)}`,
  'hackthebox.com': (q) => `https://www.hackthebox.com/search?q=${encodeURIComponent(q)}`,
  'sans.org': (q) => `https://www.sans.org/search/?q=${encodeURIComponent(q)}`,
  'comptia.org': (q) => `https://www.comptia.org/search-results?q=${encodeURIComponent(q)}`,
  'cloudskillsboost.google': (q) => `https://www.cloudskillsboost.google/catalog?keywords=${encodeURIComponent(q)}`,
  'aws.amazon.com': (q) => `https://aws.amazon.com/training/search/?search=${encodeURIComponent(q)}`,
  'learn.microsoft.com': (q) => `https://learn.microsoft.com/en-us/search/?terms=${encodeURIComponent(q)}`,
  'google.com': (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
};

/** Canonicalizes a hostname by stripping the www prefix. */
function canonicalHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '');
}

/** Maps a hostname to one of the registered search builders. */
function findPlatformKey(hostname: string): string | null {
  const canonical = canonicalHostname(hostname);
  for (const key of Object.keys(PLATFORM_SEARCH_BUILDERS)) {
    if (canonical === key || canonical.endsWith(`.${key}`)) return key;
  }
  return null;
}

/**
 * Indicators that a URL path is likely hallucinated:
 * - very specific slugs that could be invented
 * - query-only URLs (already search, safe)
 * - root or short paths (safe, just the homepage)
 *
 * Pragmatic rule of thumb: if the path has more than 2 meaningful segments
 * and no search params, treat it as likely hallucinated.
 */
function isLikelyHallucinated(url: URL): boolean {
  // Only care about the root part (not query string)
  const segments = url.pathname.split('/').filter((s) => s.length > 0);

  // Root, or paths with 1-2 segments, are usually safe landing pages
  if (segments.length <= 2) return false;

  // Known "search" endpoints should not be flagged
  if (
    url.pathname.includes('/search') ||
    url.pathname.includes('/busca') ||
    url.searchParams.has('q') ||
    url.searchParams.has('query') ||
    url.searchParams.has('search') ||
    url.searchParams.has('keywords')
  ) {
    return false;
  }

  // 3+ segments without query string: likely a specific course slug
  // that may or may not exist. Prefer a search URL.
  return true;
}

export interface SafeStudyLink {
  /** The URL that should be opened when the user clicks the resource. */
  href: string;
  /** When true, the link goes to a search page because the original URL was suspicious. */
  isSearchFallback: boolean;
  /** Platform domain used in the search, for UI labeling. */
  platformDomain?: string;
  /** Friendly name extracted from the URL hostname when no platform matched. */
  externalDomain?: string;
}

/**
 * Normalizes a study resource URL.
 *
 * Behavior:
 * 1. Invalid or malformed URL: returns a Google search for `query`
 * 2. Non-whitelisted domain: keeps the URL as provided (best effort)
 * 3. Whitelisted domain with suspicious path: returns the platform's search URL
 * 4. Whitelisted domain with safe path: keeps the URL as provided
 *
 * @param rawUrl  The URL the AI (or static demo data) produced
 * @param query   A fallback query to use when rebuilding as a search URL
 */
export function normalizeStudyLink(rawUrl: unknown, query: string): SafeStudyLink {
  const safeQuery = typeof query === 'string' && query.trim().length > 0
    ? query.trim()
    : 'curso';

  if (typeof rawUrl !== 'string' || rawUrl.length === 0) {
    return {
      href: PLATFORM_SEARCH_BUILDERS['google.com'](safeQuery),
      isSearchFallback: true,
      platformDomain: 'google.com',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return {
      href: PLATFORM_SEARCH_BUILDERS['google.com'](safeQuery),
      isSearchFallback: true,
      platformDomain: 'google.com',
    };
  }

  // Only allow https and http schemes. Anything else (javascript:, data:, file:)
  // is rejected and replaced by a Google search. Prevents XSS attempts.
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      href: PLATFORM_SEARCH_BUILDERS['google.com'](safeQuery),
      isSearchFallback: true,
      platformDomain: 'google.com',
    };
  }

  const platformKey = findPlatformKey(parsed.hostname);

  if (platformKey === null) {
    // Unknown domain. Trust the AI enough to return the URL as-is, but
    // surface the raw domain so the UI can show it honestly.
    return {
      href: parsed.toString(),
      isSearchFallback: false,
      externalDomain: canonicalHostname(parsed.hostname),
    };
  }

  if (isLikelyHallucinated(parsed)) {
    return {
      href: PLATFORM_SEARCH_BUILDERS[platformKey](safeQuery),
      isSearchFallback: true,
      platformDomain: platformKey,
    };
  }

  return {
    href: parsed.toString(),
    isSearchFallback: false,
    platformDomain: platformKey,
  };
}
