/**
 * Client-side TF-IDF keyword extraction and matching.
 * Includes synonym dictionary and job section weighting.
 * Zero dependencies. Runs entirely in the browser.
 * No data leaves the device during this step.
 */

// ── Stop words (filtered out from analysis) ──────────────────────────────────

const STOP_WORDS = new Set([
  // pt-BR
  'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas', 'um', 'uma',
  'uns', 'umas', 'com', 'por', 'para', 'que', 'se', 'ou', 'ao', 'aos', 'pela',
  'pelo', 'pelas', 'pelos', 'como', 'mais', 'ser', 'ter', 'seu', 'sua', 'seus',
  'suas', 'este', 'esta', 'estes', 'estas', 'esse', 'essa', 'esses', 'essas',
  'entre', 'sobre', 'ate', 'sem', 'sob', 'nos', 'nao', 'sim', 'muito', 'bem',
  'tambem', 'ainda', 'ja', 'quando', 'onde', 'qual', 'quais', 'todo', 'toda',
  'todos', 'todas', 'cada', 'outro', 'outra', 'outros', 'outras', 'mesmo',
  'mesma', 'mesmos', 'mesmas', 'apos', 'antes', 'desde', 'durante', 'contra',
  'assim', 'pois', 'porque', 'portanto', 'mas', 'porem', 'entretanto',
  'contudo', 'embora', 'enquanto', 'apenas', 'somente', 'inclusive',
  'area', 'anos', 'ano', 'empresa', 'trabalho', 'experiencia', 'conhecimento',
  'nivel', 'vaga', 'profissional', 'cargo', 'funcao', 'atividades',
  // en
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were',
  'been', 'being', 'have', 'has', 'had', 'having', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'must', 'not', 'but',
  'its', 'our', 'your', 'their', 'you', 'they', 'she', 'her', 'him', 'his',
  'who', 'which', 'what', 'where', 'when', 'how', 'all', 'each', 'every',
  'both', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too',
  'very', 'just', 'also', 'into', 'over', 'after', 'before', 'between',
  'under', 'above', 'below', 'any', 'only',
]);

// ── Synonym dictionary ───────────────────────────────────────────────────────

const SYNONYMS: Map<string, string[]> = new Map([
  // Languages and frameworks
  ['javascript', ['js', 'ecmascript', 'es6', 'es2015']],
  ['typescript', ['ts']],
  ['python', ['py', 'python3']],
  ['node.js', ['nodejs', 'node']],
  ['react', ['reactjs', 'react.js']],
  ['angular', ['angularjs', 'angular.js']],
  ['vue', ['vuejs', 'vue.js']],
  ['next.js', ['nextjs', 'next']],
  ['c#', ['csharp', 'c sharp', 'dotnet', '.net']],
  ['c++', ['cpp']],
  ['golang', ['go']],

  // Cloud and infra
  ['amazon web services', ['aws']],
  ['microsoft azure', ['azure']],
  ['google cloud platform', ['gcp', 'google cloud']],
  ['kubernetes', ['k8s']],
  ['docker', ['containers', 'containerização']],
  ['terraform', ['iac', 'infraestrutura como código']],
  ['ci/cd', ['integração contínua', 'continuous integration', 'continuous delivery', 'cicd', 'pipeline']],
  ['devops', ['dev ops', 'sre', 'site reliability']],

  // Databases
  ['sql server', ['mssql', 'microsoft sql']],
  ['postgresql', ['postgres', 'pgsql']],
  ['mongodb', ['mongo']],
  ['mysql', ['mariadb']],
  ['redis', ['cache em memória']],
  ['elasticsearch', ['elastic', 'elk']],

  // Data and analytics
  ['machine learning', ['ml', 'aprendizado de máquina', 'aprendizado de maquina']],
  ['inteligência artificial', ['ia', 'ai', 'artificial intelligence']],
  ['deep learning', ['dl', 'redes neurais', 'neural networks']],
  ['big data', ['dados massivos']],
  ['power bi', ['powerbi']],
  ['tableau', ['visualização de dados']],
  ['apache spark', ['spark', 'pyspark']],
  ['apache kafka', ['kafka']],
  ['etl', ['extract transform load', 'pipeline de dados']],
  ['data warehouse', ['dw', 'armazém de dados']],
  ['business intelligence', ['bi']],

  // Security
  ['segurança da informação', ['infosec', 'information security', 'cybersecurity', 'cibersegurança']],
  ['siem', ['security information', 'splunk', 'qradar', 'sentinel']],
  ['firewall', ['waf', 'web application firewall']],
  ['pentest', ['penetration testing', 'teste de penetração', 'teste de invasão']],
  ['soc', ['security operations center', 'centro de operações de segurança']],
  ['iso 27001', ['iso27001', 'sgsi']],
  ['lgpd', ['lei geral de proteção de dados', 'data protection']],
  ['gdpr', ['general data protection regulation']],
  ['nist', ['nist framework', 'nist csf']],
  ['owasp', ['owasp top 10']],

  // Tools and platforms
  ['git', ['github', 'gitlab', 'bitbucket', 'controle de versão']],
  ['jira', ['atlassian', 'confluence']],
  ['linux', ['unix', 'ubuntu', 'centos', 'debian', 'rhel']],
  ['windows server', ['active directory', 'ad']],
  ['api rest', ['restful', 'rest api', 'api restful']],
  ['graphql', ['gql']],
  ['microserviços', ['microservices', 'microsservicos']],

  // Methodologies
  ['scrum', ['agile', 'ágil', 'sprint', 'kanban']],
  ['itil', ['itsm', 'gestão de serviços']],
  ['cobit', ['governança de ti']],

  // Certifications (common abbreviations)
  ['comptia security+', ['security+', 'sec+']],
  ['comptia network+', ['network+', 'net+']],
  ['aws certified', ['aws certification']],
  ['azure certified', ['az-900', 'az-104', 'az-500']],
  ['cissp', ['certified information systems security']],
  ['ceh', ['certified ethical hacker']],

  // Soft skills
  ['liderança', ['leadership', 'gestão de equipe', 'gestao de equipe']],
  ['comunicação', ['communication']],
  ['resolução de problemas', ['problem solving']],
  ['trabalho em equipe', ['teamwork', 'colaboração']],
]);

// Build a reverse lookup: synonym -> canonical term
const REVERSE_SYNONYMS = new Map<string, string>();
for (const [canonical, synonyms] of SYNONYMS) {
  for (const syn of synonyms) {
    REVERSE_SYNONYMS.set(normalize(syn), normalize(canonical));
  }
  REVERSE_SYNONYMS.set(normalize(canonical), normalize(canonical));
}

// ── Job description section detection (for weighting) ────────────────────────

interface JobSection {
  weight: number;
  text: string;
}

const REQUIRED_PATTERNS = [
  /requisitos?\s*(obrigat[oó]rios?|m[ií]nimos?|essenciais?|da\s+vaga)/i,
  /requisitos?\s*$/im,
  /obrigat[oó]rio/i,
  /indispens[aá]vel/i,
  /responsabilidades/i,
  /o\s+que\s+(voc[eê]|esperamos|buscamos|procuramos)\s+(far[aá]|precisa|deve)/i,
  /required|requirements|must\s+have|mandatory/i,
  /principais\s+atividades/i,
];

const DESIRED_PATTERNS = [
  /diferencia[il]/i,
  /desej[aá]vel/i,
  /plus|nice\s+to\s+have|bonus|preferred/i,
  /ser[aá]\s+um\s+diferencial/i,
  /conhecimentos?\s+desej[aá]ve/i,
];

const IGNORE_PATTERNS = [
  /sobre\s+(a\s+empresa|n[oó]s|o\s+time)/i,
  /quem\s+somos/i,
  /benef[ií]cios/i,
  /o\s+que\s+oferecemos/i,
  /about\s+(us|the\s+company)/i,
  /benefits|perks/i,
  /nosso\s+time/i,
  /cultura\s+(da\s+empresa|organizacional)/i,
  /local\s+de\s+trabalho/i,
  /regime\s+de\s+contrata[çc][ãa]o/i,
  /hor[aá]rio\s+de\s+trabalho/i,
  /faixa\s+salarial|sal[aá]rio|remunera[çc][ãa]o/i,
];

function detectJobSections(text: string): JobSection[] {
  const lines = text.split('\n');
  const sections: JobSection[] = [];
  let currentWeight = 1.5; // default weight for text before any header
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const normalized = trimmed.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Check if this line is a section header
    let detectedWeight: number | null = null;

    for (const pattern of IGNORE_PATTERNS) {
      if (pattern.test(normalized)) { detectedWeight = 0; break; }
    }
    if (detectedWeight === null) {
      for (const pattern of REQUIRED_PATTERNS) {
        if (normalized.length < 80 && pattern.test(normalized)) { detectedWeight = 2; break; }
      }
    }
    if (detectedWeight === null) {
      for (const pattern of DESIRED_PATTERNS) {
        if (normalized.length < 80 && pattern.test(normalized)) { detectedWeight = 1; break; }
      }
    }

    if (detectedWeight !== null) {
      // Save previous section
      if (currentLines.length > 0) {
        sections.push({ weight: currentWeight, text: currentLines.join(' ') });
      }
      currentWeight = detectedWeight;
      currentLines = [];
    } else {
      currentLines.push(trimmed);
    }
  }

  // Save last section
  if (currentLines.length > 0) {
    sections.push({ weight: currentWeight, text: currentLines.join(' ') });
  }

  return sections;
}

// ── Core utilities ───────────────────────────────────────────────────────────

const MIN_WORD_LENGTH = 2;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõúüç\w\s+#.-]/gi, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.\-]+|[.\-]+$/g, ''))
    .filter((w) => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(normalize(w)));
}

function extractBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return freq;
}

// Check if a keyword (or any of its synonyms) appears in the resume
function findInResumeWithSynonyms(keyword: string, resumeNormalized: string): boolean {
  const normalizedKw = normalize(keyword);

  // Direct match
  if (resumeNormalized.includes(normalizedKw)) return true;

  // Check synonyms: get all aliases for this keyword
  const canonical = REVERSE_SYNONYMS.get(normalizedKw) ?? normalizedKw;

  // Get all synonyms for the canonical term
  const allVariants: string[] = [];
  for (const [canon, synonyms] of SYNONYMS) {
    if (normalize(canon) === canonical) {
      allVariants.push(normalize(canon));
      for (const syn of synonyms) {
        allVariants.push(normalize(syn));
      }
      break;
    }
  }

  // Check each variant
  for (const variant of allVariants) {
    if (variant !== normalizedKw && resumeNormalized.includes(variant)) {
      return true;
    }
  }

  return false;
}

// ── Public interface ─────────────────────────────────────────────────────────

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  frequency: number;
}

export interface KeywordAnalysis {
  jobKeywords: string[];
  matched: KeywordMatch[];
  missing: KeywordMatch[];
  matchPercentage: number;
  totalKeywords: number;
}

/**
 * Extracts keywords from job description using TF-IDF with section weighting,
 * then matches against resume text using synonym dictionary.
 *
 * Security: operates on in-memory strings only. No network calls. No storage.
 */
export function analyzeKeywords(
  jobDescription: string,
  resumeText: string,
): KeywordAnalysis {
  // Detect sections in the job description for weighting
  const jobSections = detectJobSections(jobDescription);

  // Build weighted TF across all sections
  const weightedTf = new Map<string, number>();
  const weightedBigramTf = new Map<string, number>();

  for (const section of jobSections) {
    if (section.weight === 0) continue; // skip ignored sections

    const tokens = tokenize(section.text);
    const tf = termFrequency(tokens);
    const bigrams = extractBigrams(tokens);
    const bigramTf = termFrequency(bigrams);

    // Apply section weight to term frequencies
    for (const [term, freq] of tf) {
      weightedTf.set(term, (weightedTf.get(term) ?? 0) + freq * section.weight);
    }
    for (const [bigram, freq] of bigramTf) {
      weightedBigramTf.set(bigram, (weightedBigramTf.get(bigram) ?? 0) + freq * section.weight);
    }
  }

  // Keep significant bigrams
  const significantBigrams = new Set<string>();
  for (const [bigram, score] of weightedBigramTf) {
    if (score >= 2 || /[+#.]/.test(bigram)) {
      significantBigrams.add(bigram);
    }
  }

  // Score all terms
  const scoredTerms: Array<{ term: string; score: number }> = [];

  for (const [term, weightedFreq] of weightedTf) {
    if (/^\d+$/.test(term)) continue;
    const lengthBonus = Math.min(term.length / 6, 1.5);
    scoredTerms.push({ term, score: weightedFreq * lengthBonus });
  }

  for (const bigram of significantBigrams) {
    const score = weightedBigramTf.get(bigram) ?? 1;
    scoredTerms.push({ term: bigram, score: score * 2 });
  }

  // Sort by score, take top N
  scoredTerms.sort((a, b) => b.score - a.score);
  const topKeywords = scoredTerms.slice(0, 30).map((t) => t.term);

  // Deduplicate: prefer bigrams over their constituent unigrams
  const deduped: string[] = [];
  const bigramSet = new Set(topKeywords.filter((k) => k.includes(' ')));
  for (const kw of topKeywords) {
    if (!kw.includes(' ')) {
      const isPartOfBigram = [...bigramSet].some((b) => b.includes(kw));
      if (isPartOfBigram) continue;
    }
    deduped.push(kw);
  }

  const finalKeywords = deduped.slice(0, 25);

  // Match against resume (with synonym support)
  const resumeNormalized = normalize(resumeText);
  const resumeTokens = tokenize(resumeText);
  const resumeTf = termFrequency(resumeTokens);
  const matched: KeywordMatch[] = [];
  const missing: KeywordMatch[] = [];

  for (const keyword of finalKeywords) {
    const found = findInResumeWithSynonyms(keyword, resumeNormalized);
    const frequency = found ? (resumeTf.get(keyword) ?? 1) : 0;

    const match: KeywordMatch = { keyword, found, frequency };
    if (found) {
      matched.push(match);
    } else {
      missing.push(match);
    }
  }

  const total = finalKeywords.length;
  const matchPercentage = total > 0 ? Math.round((matched.length / total) * 100) : 0;

  return {
    jobKeywords: finalKeywords,
    matched,
    missing,
    matchPercentage,
    totalKeywords: total,
  };
}
