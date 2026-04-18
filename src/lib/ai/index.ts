import type { AnalysisResult, AIProviderName, Classification } from '@/types';
import { ANALYSIS_SYSTEM_PROMPT, USER_PROMPT_TEMPLATE } from '@/constants/prompts';
import { sanitizeAnalysisResult } from '@/lib/analysis/validators';

/**
 * Derives the classification label from the score using the canonical
 * thresholds. This is used to overwrite whatever the AI returned, so we
 * always render a label that is consistent with the numeric score.
 *
 * Thresholds match the prompt and the Classification union type exactly.
 */
export function deriveClassification(score: number): Classification {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped >= 85) return 'Aderência Excelente';
  if (clamped >= 70) return 'Alta Aderência';
  if (clamped >= 40) return 'Aderência Parcial';
  return 'Baixa Aderência';
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface PreAnalysis {
  structuredResume?: string;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  matchPercentage?: number;
  isOcr?: boolean;
}

interface AnalyzeParams {
  provider: AIProviderName;
  model: string;
  apiKey: string;
  resumeText: string;
  jobDescription: string;
  preAnalysis?: PreAnalysis;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
}

// ─── Error message helpers ────────────────────────────────────────────────────

/**
 * Maps an HTTP status code to an actionable pt-BR message.
 * The raw message from the provider is intentionally NOT included to avoid
 * leaking internal URLs or partial credentials in error text.
 */
function getHttpErrorMessage(status: number): string {
  if (status === 400) {
    return 'A requisição foi rejeitada pelo provedor. Tente reduzir o tamanho do currículo ou da descrição da vaga.';
  }
  if (status === 401) {
    return 'Sua chave de API parece inválida ou expirada. Verifique a chave em Configurações.';
  }
  if (status === 403) {
    return 'Sua chave não tem permissão para o modelo selecionado. Tente outro modelo em Configurações.';
  }
  if (status === 404) {
    return 'O modelo selecionado não foi encontrado no provedor. Escolha outro modelo em Configurações.';
  }
  if (status === 408) {
    return 'O provedor demorou demais para responder. Tente de novo em alguns segundos.';
  }
  if (status === 413) {
    return 'O texto enviado é maior do que o modelo aceita. Reduza o currículo ou a descrição da vaga.';
  }
  if (status === 422) {
    return 'O provedor rejeitou o formato da requisição. Tente de novo e, se persistir, troque de modelo.';
  }
  if (status === 429) {
    return 'Muitas requisições em pouco tempo. Aguarde cerca de 1 minuto e tente de novo.';
  }
  if (status === 500 || status === 502 || status === 503) {
    return 'O provedor de IA está instável no momento. Tente outro provedor em Configurações ou aguarde alguns minutos.';
  }
  if (status === 504) {
    return 'O provedor excedeu o tempo de resposta. Se o currículo for grande, edite o texto para reduzi-lo antes de analisar.';
  }
  if (status >= 500) {
    return 'O provedor retornou um erro interno. Tente outro provedor ou aguarde alguns minutos.';
  }
  if (status >= 400) {
    return 'O provedor rejeitou a requisição. Verifique sua chave e o modelo selecionado em Configurações.';
  }
  return `Erro inesperado na API (HTTP ${status}).`;
}

function getNetworkErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === 'AbortError') {
      return 'A análise excedeu 60 segundos. Tente um modelo mais rápido ou reduza o tamanho do texto enviado.';
    }
    if (err instanceof TypeError) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
      }
      return 'Não foi possível conectar ao provedor de IA. Verifique sua conexão ou tente outro provedor.';
    }
  }
  return err instanceof Error ? err.message : 'Erro desconhecido. Tente novamente.';
}

/** Test-connection uses the same mapping as the analysis flow. */
function getTestHttpErrorMessage(status: number): string {
  return getHttpErrorMessage(status);
}

// ─── Retry logic ─────────────────────────────────────────────────────────────

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503]);
const MAX_RETRIES = 2; // 3 total attempts

function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUSES.has(status);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── JSON parsing with fallback ──────────────────────────────────────────────

function tryFixJson(raw: string): string {
  // Remove trailing commas before } or ]
  let fixed = raw.replace(/,\s*([}\]])/g, '$1');
  // Replace single-quoted strings with double-quoted (simple heuristic)
  fixed = fixed.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
  return fixed;
}

function extractFieldsManually(raw: string): Partial<AnalysisResult> {
  const partial: Partial<AnalysisResult> = {};

  const scoreMatch = raw.match(/"score"\s*:\s*(\d+)/);
  if (scoreMatch) {
    partial.score = parseInt(scoreMatch[1], 10);
  }

  const classificationMatch = raw.match(
    /"classification"\s*:\s*"(Baixa Aderência|Aderência Parcial|Alta Aderência|Aderência Excelente)"/,
  );
  if (classificationMatch) {
    partial.classification = classificationMatch[1] as AnalysisResult['classification'];
  }

  // Best-effort executive summary extraction (handles escaped quotes inside the string)
  const summaryMatch = raw.match(/"executiveSummary"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (summaryMatch) {
    try {
      partial.executiveSummary = JSON.parse(`"${summaryMatch[1]}"`) as string;
    } catch {
      partial.executiveSummary = summaryMatch[1];
    }
  }

  // Try to extract matchedSkills array as empty fallback if not parseable
  const matchedSkillsMatch = raw.match(/"matchedSkills"\s*:\s*\[/);
  if (matchedSkillsMatch) {
    partial.matchedSkills = [];
  }

  partial.gaps = partial.gaps ?? [];
  partial.missingKeywords = partial.missingKeywords ?? [];
  partial.matchedSkills = partial.matchedSkills ?? [];

  return partial;
}

function parseAIResponse(raw: string): AnalysisResult {
  // Step 1: Extract the outermost JSON object
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error(
      'A resposta da IA veio em formato inesperado. Tente novamente ou escolha outro modelo em Configurações.',
    );
  }

  const extracted = raw.slice(firstBrace, lastBrace + 1);

  // Step 2: Try direct parse
  let parsed: Partial<AnalysisResult> | null = null;
  try {
    parsed = JSON.parse(extracted) as Partial<AnalysisResult>;
  } catch {
    // Step 3: Try with fixes applied
    try {
      parsed = JSON.parse(tryFixJson(extracted)) as Partial<AnalysisResult>;
    } catch {
      // Step 4: Extract individual known fields as last resort
      parsed = extractFieldsManually(raw);
    }
  }

  // Fail loud on severely broken responses: no score at all, or matchedSkills
  // absent. Anything less catastrophic is repaired by the sanitizer below.
  if (typeof parsed?.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
    throw new Error(
      'A IA não retornou uma pontuação válida. Tente novamente ou escolha outro modelo em Configurações.',
    );
  }
  if (!Array.isArray(parsed?.matchedSkills)) {
    throw new Error(
      'A IA retornou um formato inesperado para as skills. Tente novamente ou escolha outro modelo.',
    );
  }

  // Single source of truth for output validation, coercion, caps, deduping,
  // URL safety, enum whitelisting, and deterministic summary fallback.
  return sanitizeAnalysisResult(parsed);
}

// ─── Provider callers (with timeout + retry) ─────────────────────────────────

async function callWithRetry(
  fn: (signal: AbortSignal) => Promise<string>,
  timeoutMs: number,
): Promise<string> {
  let lastError: Error = new Error('Erro desconhecido.');

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const result = await fn(controller.signal);
      clearTimeout(timeoutId);
      return result;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error) {
        lastError = err;

        // Do not retry on abort (timeout)
        if (err.name === 'AbortError') break;

        // Do not retry on network TypeError
        if (err instanceof TypeError) break;

        // Check if this error carries a retryable HTTP status embedded in its message
        const statusMatch = err.message.match(/HTTP_STATUS:(\d+)/);
        if (statusMatch) {
          const status = parseInt(statusMatch[1], 10);
          if (!isRetryableStatus(status)) break;
          // Replace with user-friendly message
          lastError = new Error(getHttpErrorMessage(status));
        }
      }

      // If more retries remain, wait with exponential backoff
      if (attempt < MAX_RETRIES) {
        await sleep(1000 * Math.pow(2, attempt)); // 1s, 2s
      }
    }
  }

  throw lastError;
}

async function callAnthropic(params: AnalyzeParams): Promise<string> {
  return callWithRetry(async (signal) => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        apiKey: params.apiKey,
        model: params.model,
        systemPrompt: ANALYSIS_SYSTEM_PROMPT,
        userPrompt: USER_PROMPT_TEMPLATE(
          params.resumeText,
          params.jobDescription,
          params.preAnalysis,
        ),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP_STATUS:${response.status}`);
    }

    const data = (await response.json()) as { content: string };
    return data.content;
  }, 60_000);
}

async function callOpenAI(params: AnalyzeParams): Promise<string> {
  return callWithRetry(async (signal) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.apiKey}`,
      },
      signal,
      body: JSON.stringify({
        model: params.model,
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          {
            role: 'user',
            content: USER_PROMPT_TEMPLATE(
              params.resumeText,
              params.jobDescription,
              params.preAnalysis,
            ),
          },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP_STATUS:${response.status}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0].message.content;
  }, 60_000);
}

async function callGoogle(params: AnalyzeParams): Promise<string> {
  return callWithRetry(async (signal) => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${params.model}:generateContent?key=${params.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ANALYSIS_SYSTEM_PROMPT }] },
          contents: [
            {
              parts: [
                {
                  text: USER_PROMPT_TEMPLATE(
                    params.resumeText,
                    params.jobDescription,
                    params.preAnalysis,
                  ),
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP_STATUS:${response.status}`);
    }

    const data = (await response.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };
    return data.candidates[0].content.parts[0].text;
  }, 60_000);
}

async function callHuggingFace(params: AnalyzeParams): Promise<string> {
  return callWithRetry(async (signal) => {
    const response = await fetch('/api/proxy/huggingface', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        apiKey: params.apiKey,
        model: params.model,
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          {
            role: 'user',
            content: USER_PROMPT_TEMPLATE(
              params.resumeText,
              params.jobDescription,
              params.preAnalysis,
            ),
          },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP_STATUS:${response.status}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0].message.content;
  }, 60_000);
}

// ─── Provider map ─────────────────────────────────────────────────────────────

const providerCallers: Record<AIProviderName, (params: AnalyzeParams) => Promise<string>> = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  google: callGoogle,
  huggingface: callHuggingFace,
};

// ─── Public: analyzeWithAI ────────────────────────────────────────────────────

export async function analyzeWithAI(params: AnalyzeParams): Promise<AnalysisResult> {
  const caller = providerCallers[params.provider];
  if (!caller) {
    throw new Error(`Provedor "${params.provider}" não é suportado.`);
  }

  let raw: string;
  try {
    raw = await caller(params);
  } catch (err) {
    // Convert any raw HTTP_STATUS errors that bubbled up without being caught inside retry
    if (err instanceof Error) {
      const statusMatch = err.message.match(/HTTP_STATUS:(\d+)/);
      if (statusMatch) {
        throw new Error(getHttpErrorMessage(parseInt(statusMatch[1], 10)));
      }
      // TypeError / AbortError
      throw new Error(getNetworkErrorMessage(err));
    }
    throw err;
  }

  return parseAIResponse(raw);
}

// ─── Public: testConnection ───────────────────────────────────────────────────

export async function testConnection(
  provider: AIProviderName,
  model: string,
  apiKey: string,
): Promise<TestConnectionResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    let response: Response;

    if (provider === 'anthropic') {
      response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          apiKey,
          model,
          systemPrompt: 'You are a test assistant.',
          userPrompt: 'Respond with: ok',
          maxTokens: 5,
        }),
      });
    } else if (provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Respond with: ok' }],
          max_tokens: 5,
        }),
      });
    } else if (provider === 'google') {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Respond with: ok' }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        },
      );
    } else {
      // huggingface: routed through CORS proxy
      response = await fetch('/api/proxy/huggingface', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          apiKey,
          model,
          messages: [{ role: 'user', content: 'Respond with: ok' }],
          max_tokens: 5,
        }),
      });
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, message: getTestHttpErrorMessage(response.status) };
    }

    return { success: true, message: 'Conexão estabelecida com sucesso!' };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          message:
            'O teste excedeu o tempo limite de 15 segundos. Verifique sua conexão e tente novamente.',
        };
      }
      if (err instanceof TypeError) {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          return {
            success: false,
            message: 'Sem conexão com a internet. Verifique sua rede e tente novamente.',
          };
        }
        return {
          success: false,
          message:
            'Erro de conexão com o provedor de IA. Verifique sua internet e tente novamente.',
        };
      }
    }

    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erro desconhecido ao testar conexão.',
    };
  }
}
