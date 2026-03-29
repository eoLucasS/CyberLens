/**
 * Input validation and sanitization utilities for CyberLens.
 */

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MIN_JOB_DESCRIPTION_CHARS = 100;
const MAX_JOB_DESCRIPTION_CHARS = 10_000;
const MIN_API_KEY_LENGTH = 8;
const MAX_API_KEY_LENGTH = 512;

/** Validation result returned by all validator functions. */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Synchronously validates MIME type, file extension and size for a PDF file.
 * For full validation including magic-bytes verification, use validatePdfFileAsync.
 */
export function validatePdfFile(file: File): ValidationResult {
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'O arquivo deve estar no formato PDF.' };
  }

  const nameLower = file.name.toLowerCase();
  if (!nameLower.endsWith('.pdf')) {
    return { valid: false, error: 'O arquivo deve ter extensão .pdf.' };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return { valid: false, error: 'O arquivo PDF deve ter no máximo 10 MB.' };
  }

  return { valid: true };
}

/**
 * Async variant that additionally reads the first 4 bytes of the file and
 * confirms the PDF magic number (%PDF). Rejects files that merely carry a
 * .pdf extension/MIME type but contain a different binary format.
 */
export async function validatePdfFileAsync(file: File): Promise<ValidationResult> {
  const sync = validatePdfFile(file);
  if (!sync.valid) return sync;

  const header = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(header);
  // %PDF → 0x25 0x50 0x44 0x46
  if (bytes[0] !== 0x25 || bytes[1] !== 0x50 || bytes[2] !== 0x44 || bytes[3] !== 0x46) {
    return { valid: false, error: 'O arquivo não é um PDF válido.' };
  }

  return { valid: true };
}

/**
 * Validates that a job description string meets the minimum and maximum
 * character requirements.
 */
export function validateJobDescription(text: string): ValidationResult {
  const trimmed = text.trim();
  if (trimmed.length < MIN_JOB_DESCRIPTION_CHARS) {
    return {
      valid: false,
      error: `A descrição da vaga deve ter pelo menos ${MIN_JOB_DESCRIPTION_CHARS} caracteres.`,
    };
  }
  if (trimmed.length > MAX_JOB_DESCRIPTION_CHARS) {
    return {
      valid: false,
      error: `A descrição da vaga deve ter no máximo ${MAX_JOB_DESCRIPTION_CHARS} caracteres.`,
    };
  }
  return { valid: true };
}

/**
 * Performs basic format validation on an AI provider API key.
 * Checks that the key is non-empty, within a reasonable length range,
 * and does not contain obvious injection payloads (script tags, SQL keywords).
 */
export function validateApiKey(key: string, provider: string): ValidationResult {
  const trimmed = key.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: `A chave de API do ${provider} não pode estar vazia.` };
  }

  if (trimmed.length < MIN_API_KEY_LENGTH) {
    return {
      valid: false,
      error: `A chave de API do ${provider} parece muito curta (mínimo ${MIN_API_KEY_LENGTH} caracteres).`,
    };
  }

  if (trimmed.length > MAX_API_KEY_LENGTH) {
    return {
      valid: false,
      error: `A chave de API do ${provider} parece muito longa (máximo ${MAX_API_KEY_LENGTH} caracteres).`,
    };
  }

  // Reject obvious script-injection patterns.
  if (/<script[\s>]/i.test(trimmed)) {
    return { valid: false, error: 'A chave de API contém conteúdo inválido.' };
  }

  // Reject common SQL injection patterns.
  if (/('|--|;)\s*(DROP|SELECT|INSERT|UPDATE|DELETE|UNION)\b/i.test(trimmed)) {
    return { valid: false, error: 'A chave de API contém conteúdo inválido.' };
  }

  return { valid: true };
}

/**
 * Strips potential XSS vectors from a plain-text string using regex replacement.
 * Removes script tags (with their content), inline event handlers (on*="…"),
 * and javascript: URI schemes. Normal text content is preserved.
 *
 * NOTE: Does NOT use innerHTML or DOMParser. Safe for server and client environments.
 */
export function sanitizeText(text: string): string {
  return text
    // Remove <script>…</script> blocks (including content).
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove inline event handlers like onclick="…" or onmouseover='…'.
    .replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Remove javascript: URI schemes.
    .replace(/javascript\s*:/gi, '')
    // Remove remaining HTML tags (preserves their text content).
    .replace(/<[^>]+>/g, '');
}
