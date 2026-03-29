/**
 * Client-side TF-IDF keyword extraction and matching.
 * Zero dependencies. Runs entirely in the browser.
 * No data leaves the device during this step.
 */

// Common Portuguese and English stop words to filter out
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

// Minimum word length to consider
const MIN_WORD_LENGTH = 2;

// Normalize a string: lowercase, remove accents, trim
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Tokenize text into meaningful words
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-záàâãéèêíïóôõúüç\w\s+#.-]/gi, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.\-]+|[.\-]+$/g, ''))
    .filter((w) => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(normalize(w)));
}

// Extract bigrams (two-word phrases) for compound terms
function extractBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

// Count term frequency
function termFrequency(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) ?? 0) + 1);
  }
  return freq;
}

export interface KeywordMatch {
  keyword: string;
  found: boolean;
  frequency: number; // how many times it appears in the resume
}

export interface KeywordAnalysis {
  /** All significant keywords extracted from the job description */
  jobKeywords: string[];
  /** Keywords found in the resume */
  matched: KeywordMatch[];
  /** Keywords NOT found in the resume */
  missing: KeywordMatch[];
  /** Match percentage (0-100) */
  matchPercentage: number;
  /** Total keywords analyzed */
  totalKeywords: number;
}

/**
 * Extracts the most significant keywords from the job description using TF-IDF
 * scoring, then checks which ones appear in the resume text.
 *
 * Security: operates on in-memory strings only. No network calls. No storage.
 */
export function analyzeKeywords(
  jobDescription: string,
  resumeText: string,
): KeywordAnalysis {
  const jobTokens = tokenize(jobDescription);
  const resumeTokens = tokenize(resumeText);

  // Build TF map for job description
  const jobTf = termFrequency(jobTokens);
  const resumeTf = termFrequency(resumeTokens);

  // Also check bigrams for compound terms (e.g. "machine learning", "power bi")
  const jobBigrams = extractBigrams(jobTokens);
  const jobBigramTf = termFrequency(jobBigrams);

  // Combine unigrams and significant bigrams
  // Keep bigrams that appear more than once OR contain technical-looking terms
  const significantBigrams = new Set<string>();
  for (const [bigram, count] of jobBigramTf) {
    if (count >= 2 || /[+#.]/.test(bigram)) {
      significantBigrams.add(bigram);
    }
  }

  // Score unigrams by TF (in job desc). Higher = more relevant to the job.
  const scoredTerms: Array<{ term: string; score: number }> = [];

  for (const [term, freq] of jobTf) {
    // Skip very common single-char or numeric-only terms
    if (/^\d+$/.test(term)) continue;

    // Score = frequency * length bonus (longer terms are usually more specific)
    const lengthBonus = Math.min(term.length / 6, 1.5);
    scoredTerms.push({ term, score: freq * lengthBonus });
  }

  // Add bigrams with a bonus
  for (const bigram of significantBigrams) {
    const freq = jobBigramTf.get(bigram) ?? 1;
    scoredTerms.push({ term: bigram, score: freq * 2 });
  }

  // Sort by score descending, take top N
  scoredTerms.sort((a, b) => b.score - a.score);
  const topKeywords = scoredTerms.slice(0, 30).map((t) => t.term);

  // Deduplicate: if a bigram contains a unigram, prefer the bigram
  const deduped: string[] = [];
  const bigramSet = new Set(topKeywords.filter((k) => k.includes(' ')));
  for (const kw of topKeywords) {
    if (!kw.includes(' ')) {
      // Check if this unigram is part of a selected bigram
      const isPartOfBigram = [...bigramSet].some((b) => b.includes(kw));
      if (isPartOfBigram) continue;
    }
    deduped.push(kw);
  }

  const finalKeywords = deduped.slice(0, 25);

  // Check each keyword against the resume
  const resumeNormalized = normalize(resumeText);
  const matched: KeywordMatch[] = [];
  const missing: KeywordMatch[] = [];

  for (const keyword of finalKeywords) {
    const normalizedKw = normalize(keyword);
    const found = resumeNormalized.includes(normalizedKw);
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
