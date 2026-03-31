/**
 * Cleans raw job description text by removing irrelevant sections.
 * Strips company descriptions, benefits, footers, and website noise,
 * keeping only the content relevant for resume comparison.
 * Zero dependencies. Runs entirely in the browser.
 * No data leaves the device during this step.
 */

// Headers that indicate sections to REMOVE
const REMOVE_SECTION_PATTERNS = [
  /^#{1,4}\s*(sobre\s+(a\s+empresa|n[oó]s|o\s+time|a\s+companhia))/i,
  /^#{1,4}\s*(quem\s+somos)/i,
  /^#{1,4}\s*(benef[ií]cios|o\s+que\s+oferecemos|vantagens)/i,
  /^#{1,4}\s*(about\s+(us|the\s+company|our\s+team))/i,
  /^#{1,4}\s*(benefits|perks|what\s+we\s+offer)/i,
  /^#{1,4}\s*(nosso\s+time|nossa\s+equipe|nosso\s+ambiente)/i,
  /^#{1,4}\s*(cultura\s+(da\s+empresa|organizacional))/i,
  /^#{1,4}\s*(local\s+de\s+trabalho|localiza[çc][ãa]o)/i,
  /^#{1,4}\s*(faixa\s+salarial|sal[aá]rio|remunera[çc][ãa]o|compensa[çc][ãa]o)/i,
  /^#{1,4}\s*(etapas\s+do\s+processo|processo\s+seletivo)/i,
  /^#{1,4}\s*(como\s+se\s+candidatar|how\s+to\s+apply)/i,
];

// Inline headers (no # prefix, but short bold-like lines)
const REMOVE_INLINE_HEADERS = [
  /^(sobre\s+(a\s+empresa|n[oó]s|o\s+time)):?\s*$/i,
  /^(quem\s+somos):?\s*$/i,
  /^(benef[ií]cios):?\s*$/i,
  /^(o\s+que\s+oferecemos):?\s*$/i,
  /^(about\s+(us|the\s+company)):?\s*$/i,
  /^(benefits):?\s*$/i,
  /^(etapas\s+do\s+processo):?\s*$/i,
  /^(processo\s+seletivo):?\s*$/i,
];

// Patterns for individual lines to remove
const REMOVE_LINE_PATTERNS = [
  /^https?:\/\//i,                              // bare URLs
  /^www\./i,                                     // bare domains
  /^\S+@\S+\.\S+$/,                             // standalone email addresses
  /^(candidatar|aplicar|apply|inscrever|enviar\s+curr[ií]culo)/i,
  /^(compartilh|share\s+this|salvar\s+vaga|save\s+job)/i,
  /^(denuncia|report\s+this)/i,
  /^(cookie|privacy\s+policy|pol[ií]tica\s+de\s+privacidade)/i,
  /^(termos\s+de\s+uso|terms\s+of\s+service)/i,
  /^(copyright|©|\(c\))\s/i,
  /^(voltar|back|home|menu)\s*$/i,
  /^\d+\s+(candidato|applicant|pessoa)/i,        // "132 candidatos"
  /^(publicad[oa]|posted)\s+(h[aá]|em|on)\s/i,   // "Publicada há 3 dias"
];

// Headers that indicate sections to KEEP
const KEEP_SECTION_PATTERNS = [
  /requisitos?/i,
  /responsabilidades/i,
  /atividades/i,
  /qualifica[çc][õo]es/i,
  /compet[eê]ncias/i,
  /habilidades/i,
  /diferencia/i,
  /descri[çc][ãa]o\s+(da\s+vaga|do\s+cargo)/i,
  /o\s+que\s+(voc[eê]|buscamos|esperamos|procuramos)/i,
  /requirements/i,
  /responsibilities/i,
  /qualifications/i,
  /skills/i,
  /nice\s+to\s+have/i,
  /preferred/i,
];

function isRemoveSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const pattern of REMOVE_SECTION_PATTERNS) {
    if (pattern.test(normalized)) return true;
  }
  // Inline headers (short lines, < 50 chars)
  if (normalized.length < 50) {
    for (const pattern of REMOVE_INLINE_HEADERS) {
      if (pattern.test(normalized)) return true;
    }
  }
  return false;
}

function isKeepSectionHeader(line: string): boolean {
  const trimmed = line.trim();
  if (trimmed.length > 80) return false;
  const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const pattern of KEEP_SECTION_PATTERNS) {
    if (pattern.test(normalized)) return true;
  }
  return false;
}

function isRemovableLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const pattern of REMOVE_LINE_PATTERNS) {
    if (pattern.test(normalized)) return true;
  }
  return false;
}

/**
 * Cleans a raw job description by removing irrelevant content.
 * Returns the cleaned text with only job-relevant sections.
 *
 * Security: operates on in-memory strings only. No network calls. No storage.
 */
export function cleanJobDescription(raw: string): string {
  const lines = raw.split('\n');
  const output: string[] = [];
  let skipping = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty lines: keep them as paragraph separators if not skipping
    if (!trimmed) {
      if (!skipping && output.length > 0) {
        output.push('');
      }
      continue;
    }

    // Check if this line starts a section to remove
    if (isRemoveSectionHeader(trimmed)) {
      skipping = true;
      continue;
    }

    // Check if this line starts a section to keep (ends skipping)
    if (isKeepSectionHeader(trimmed)) {
      skipping = false;
      output.push(trimmed);
      continue;
    }

    // If currently skipping a removed section, skip this line
    if (skipping) continue;

    // Check if this individual line should be removed
    if (isRemovableLine(trimmed)) continue;

    output.push(trimmed);
  }

  // Clean up: remove trailing empty lines and collapse multiple empty lines
  return output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
