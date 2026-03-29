/**
 * Client-side resume section parser using heuristics.
 * Detects common resume sections in Portuguese and English.
 * Zero dependencies. Runs entirely in the browser.
 * No data leaves the device during this step.
 */

export interface ResumeSection {
  label: string;
  content: string;
}

export interface ParsedResume {
  sections: ResumeSection[];
  /** Whether the text came from OCR (may contain errors) */
  isOcr: boolean;
  /** Compact structured text for the AI prompt */
  structured: string;
}

// Section header patterns (pt-BR and en)
// Each entry: [regex, canonical label]
const SECTION_PATTERNS: Array<[RegExp, string]> = [
  // Experience
  [/\b(experiencia\s*profissional|experiencia|professional\s*experience|work\s*experience|experience)\b/i, 'Experiência Profissional'],
  // Education
  [/\b(formacao\s*academica|formacao|educacao|escolaridade|education|academic\s*background)\b/i, 'Formação Acadêmica'],
  // Skills
  [/\b(habilidades|competencias|skills|technical\s*skills|hard\s*skills|soft\s*skills|conhecimentos\s*tecnicos|ferramentas)\b/i, 'Habilidades e Competências'],
  // Certifications
  [/\b(certificacoes|certificados|certifications|licenses|licencas)\b/i, 'Certificações'],
  // Projects
  [/\b(projetos|projects|portfolio)\b/i, 'Projetos'],
  // Languages
  [/\b(idiomas|languages|linguas)\b/i, 'Idiomas'],
  // Summary / Objective
  [/\b(resumo|objetivo|summary|objective|perfil\s*profissional|sobre\s*mim|about)\b/i, 'Resumo Profissional'],
  // Courses
  [/\b(cursos|courses|treinamentos|training)\b/i, 'Cursos e Treinamentos'],
  // Awards
  [/\b(premios|awards|reconhecimentos|achievements|conquistas)\b/i, 'Prêmios e Reconhecimentos'],
  // Volunteer
  [/\b(voluntariado|volunteer|trabalho\s*voluntario)\b/i, 'Trabalho Voluntário'],
  // Publications
  [/\b(publicacoes|publications|artigos|papers)\b/i, 'Publicações'],
  // References
  [/\b(referencias|references)\b/i, 'Referências'],
];

// Normalize text for pattern matching (remove accents)
function normalizeForMatch(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Parses raw resume text into labeled sections.
 * Uses line-by-line analysis to detect section headers.
 *
 * Security: operates on in-memory strings only. No network calls. No storage.
 */
export function parseResumeSections(
  rawText: string,
  isOcr: boolean = false,
): ParsedResume {
  const lines = rawText.split('\n');
  const sections: ResumeSection[] = [];
  let currentLabel = 'Informações Gerais';
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this line looks like a section header
    const normalized = normalizeForMatch(trimmed);
    let matchedLabel: string | null = null;

    for (const [pattern, label] of SECTION_PATTERNS) {
      // A section header is typically a short line (< 60 chars) that matches a pattern
      if (normalized.length < 60 && pattern.test(normalized)) {
        matchedLabel = label;
        break;
      }
    }

    if (matchedLabel) {
      // Save previous section
      if (currentLines.length > 0) {
        sections.push({
          label: currentLabel,
          content: currentLines.join('\n').trim(),
        });
      }
      currentLabel = matchedLabel;
      currentLines = [];
    } else {
      currentLines.push(trimmed);
    }
  }

  // Save last section
  if (currentLines.length > 0) {
    sections.push({
      label: currentLabel,
      content: currentLines.join('\n').trim(),
    });
  }

  // Build structured text
  const structured = buildStructuredText(sections, isOcr);

  return { sections, isOcr, structured };
}

/**
 * Builds a compact, labeled text representation for the AI prompt.
 * This structured format helps the LLM understand the resume layout
 * without wasting tokens on guessing what each section contains.
 */
function buildStructuredText(sections: ResumeSection[], isOcr: boolean): string {
  const parts: string[] = [];

  if (isOcr) {
    parts.push(
      '[AVISO: Este texto foi extraído via OCR e pode conter erros de digitalização ' +
      '(letras trocadas, palavras fragmentadas, acentos incorretos). ' +
      'Interprete o conteúdo considerando possíveis imprecisões. ' +
      'Foque no sentido geral, não em match exato de strings.]',
    );
    parts.push('');
  }

  for (const section of sections) {
    // Skip empty sections
    if (!section.content.trim()) continue;

    parts.push(`### ${section.label}`);
    parts.push(section.content);
    parts.push('');
  }

  return parts.join('\n').trim();
}
