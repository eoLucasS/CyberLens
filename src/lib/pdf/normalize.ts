/**
 * Text normalization utilities for PDF-extracted content.
 *
 * Cleans up the raw output from pdfjs-dist or Tesseract.js so the AI pipeline
 * (section parser, TF-IDF, LLM) receives consistent, safe text.
 *
 * Security posture:
 * - All regex patterns are linear (no nested quantifiers). No ReDoS vectors.
 * - Input size is bounded (MAX_INPUT_LENGTH) to prevent DoS.
 * - Removes bidi and zero-width characters that could be used to hide
 *   content in shared analyses.
 * - Pure functions, no side effects.
 */

/** Maximum length of input accepted by the normalizer. Larger inputs are truncated. */
export const MAX_INPUT_LENGTH = 500_000;

/**
 * Unicode ranges of control characters we remove, keeping only \t (U+0009),
 * \n (U+000A) and \r (U+000D) which are legitimate whitespace.
 */
const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Bidirectional text control characters. Safe to remove from resume text;
 * their presence is almost always a red flag (visual spoofing vector).
 */
const BIDI_CONTROL_PATTERN = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;

/**
 * Zero-width characters. Invisible, sometimes used to embed hidden tokens
 * or confuse keyword matching.
 */
const ZERO_WIDTH_PATTERN = /[\u200B-\u200D\uFEFF]/g;

/**
 * Common bullet-like Unicode symbols. Mapped to a regular hyphen so the
 * section parser and TF-IDF can tokenize lists consistently.
 */
const BULLET_REPLACEMENTS: Array<[RegExp, string]> = [
  [/[•▪▫●◦◉◆◇■□▸▹▶►★☆✦✧]/g, '- '],
  // Arrow-like prefixes that sometimes appear as bullets.
  [/[→➜➤➔▶]/g, '- '],
];

// ─── Individual transformations ──────────────────────────────────────────────

/** Removes invisible control chars, bidi overrides and zero-width chars. */
export function removeControlChars(text: string): string {
  return text
    .replace(CONTROL_CHAR_PATTERN, '')
    .replace(BIDI_CONTROL_PATTERN, '')
    .replace(ZERO_WIDTH_PATTERN, '');
}

/** Converts bullet-like symbols into a consistent "- " prefix. */
export function normalizeBullets(text: string): string {
  let out = text;
  for (const [pattern, replacement] of BULLET_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

/**
 * Joins words that were split by end-of-line hyphenation. Only joins when
 * both sides are lowercase Latin letters (with or without accents), so real
 * compound words ("auto-gerenciado") and proper nouns are left intact.
 */
export function joinHyphenatedWords(text: string): string {
  return text.replace(/([a-zà-ÿ])-\n([a-zà-ÿ])/g, '$1$2');
}

/** Collapses runs of 3+ consecutive newlines into exactly 2 (paragraph break). */
export function collapseBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n');
}

/** Collapses runs of multiple spaces/tabs into a single space. */
export function collapseInlineWhitespace(text: string): string {
  return text.replace(/[ \t]{2,}/g, ' ');
}

/**
 * Compatibility normalization (NFKC) folds homoglyphs like fullwidth variants
 * and certain ligatures into canonical forms. Helps the matcher recognize
 * "Pythön" vs "Python" inconsistencies coming from OCR.
 */
function nfkcNormalize(text: string): string {
  try {
    return text.normalize('NFKC');
  } catch {
    // Extremely unlikely, but some runtimes may throw on malformed input.
    return text;
  }
}

// ─── Main entry point ────────────────────────────────────────────────────────

/**
 * Applies the full normalization pipeline. Accepts any string and always
 * returns a safe, well-formed text suitable for the rest of the pipeline.
 *
 * The input is truncated to MAX_INPUT_LENGTH up front as a DoS guard.
 */
export function normalizeExtractedText(raw: string): string {
  if (typeof raw !== 'string') return '';
  if (raw.length === 0) return '';

  const bounded = raw.length > MAX_INPUT_LENGTH ? raw.slice(0, MAX_INPUT_LENGTH) : raw;

  let out = bounded;
  out = nfkcNormalize(out);
  out = removeControlChars(out);
  out = normalizeBullets(out);
  out = joinHyphenatedWords(out);
  out = collapseInlineWhitespace(out);
  out = collapseBlankLines(out);

  return out.trim();
}
