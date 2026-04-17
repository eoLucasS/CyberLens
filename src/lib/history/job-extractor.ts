/**
 * Heuristic extractor that pulls a job title and optionally a company name
 * from a raw job description text.
 *
 * Zero ML, zero dependency. Works purely on positional and orthographic
 * clues that hold across most job postings in Portuguese and English.
 *
 * Security posture:
 * - Input is bounded (defensive slice) to avoid CPU blowups on giant pastes
 * - All returned strings are trimmed and length-capped
 * - Control/bidi/zero-width characters are removed via existing normalizer
 *   before the extraction runs at the call site (useAnalysis)
 */

/** Maximum characters we scan from the description. */
const SCAN_BUDGET = 1200;

/** Maximum number of leading non-empty lines we consider. */
const MAX_HEADER_LINES = 8;

/** Maximum length of a line to still be considered a potential title. */
const MAX_TITLE_LINE_LENGTH = 120;

/** Trim and length-cap a candidate string before returning it. */
function tidy(value: string, max = 160): string {
  const trimmed = value.trim();
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed;
}

/**
 * Checks if a line looks like a job title.
 * Heuristics used (combined with OR, permissive):
 *  - Contains a common job-role keyword
 *  - Is title-cased (most words start uppercase)
 *  - Starts with a known seniority or role indicator
 */
function looksLikeTitle(line: string): boolean {
  if (line.length < 4 || line.length > MAX_TITLE_LINE_LENGTH) return false;

  const normalized = line.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const roleKeywords = [
    'analista', 'desenvolvedor', 'desenvolvedora', 'engenheiro', 'engenheira',
    'arquiteto', 'arquiteta', 'especialista', 'coordenador', 'coordenadora',
    'gerente', 'lider', 'tech lead', 'consultor', 'consultora', 'estagiario',
    'estagiaria', 'trainee', 'assistente', 'auditor', 'auditora', 'cientista',
    'administrador', 'administradora', 'tecnico', 'tecnica', 'analyst',
    'developer', 'engineer', 'architect', 'specialist', 'manager', 'lead',
    'consultant', 'intern', 'designer', 'scientist', 'officer',
  ];
  for (const kw of roleKeywords) {
    if (normalized.includes(kw)) return true;
  }

  // Title-case check: at least 2 words, most starting uppercase
  const words = line.trim().split(/\s+/).filter((w) => w.length > 1);
  if (words.length >= 2) {
    const capitalized = words.filter((w) => /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÚÜÇ]/.test(w));
    if (capitalized.length / words.length >= 0.5) return true;
  }

  return false;
}

/** Attempts to extract a company name from a separator pattern like "Title - Company". */
function splitTitleAndCompany(line: string): { title: string; company?: string } {
  // Common separators between title and company in listings:
  //   "Analista de Dados - Empresa X"
  //   "Analista de Dados | Empresa X"
  //   "Analista de Dados @ Empresa X"
  //   "Analista de Dados na Empresa X"
  const separatorMatch = line.match(/^(.+?)\s+(?:[-|@]|na|no|em|at|\u2013|\u2014)\s+(.+)$/i);
  if (separatorMatch) {
    const title = tidy(separatorMatch[1]);
    const company = tidy(separatorMatch[2], 120);
    if (title.length >= 4 && company.length >= 2) {
      return { title, company };
    }
  }
  return { title: tidy(line) };
}

export interface ExtractedJobMeta {
  /** Extracted title, or a short snippet fallback. */
  title: string;
  /** Extracted company name, when a clear separator pattern matched. */
  company?: string;
}

/**
 * Extracts a job title (and optionally a company) from a raw or normalized
 * job description. Always returns a non-empty title; falls back to the first
 * meaningful words of the description if nothing structured is detected.
 */
export function extractJobMeta(description: string): ExtractedJobMeta {
  if (typeof description !== 'string' || description.trim().length === 0) {
    return { title: 'Vaga sem título' };
  }

  const scanWindow = description.slice(0, SCAN_BUDGET);
  const lines = scanWindow
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .slice(0, MAX_HEADER_LINES);

  // Pass 1: try to find a line that clearly looks like a title
  for (const line of lines) {
    if (looksLikeTitle(line)) {
      return splitTitleAndCompany(line);
    }
  }

  // Pass 2: fallback to the first sufficiently-short line
  for (const line of lines) {
    if (line.length >= 4 && line.length <= MAX_TITLE_LINE_LENGTH) {
      return { title: tidy(line) };
    }
  }

  // Pass 3: take the first words of the whole description as a last resort
  const snippet = tidy(scanWindow.replace(/\s+/g, ' '), 60);
  return { title: snippet.length > 0 ? snippet : 'Vaga sem título' };
}
