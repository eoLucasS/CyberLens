import type { Match } from '../types';

const CPF_FORMATTED = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g;
const CPF_UNFORMATTED = /\b\d{11}\b/g;

/**
 * Validates a Brazilian CPF via its two check digits (mod-11 algorithm).
 * The validator rejects repeated-digit sequences (000.000.000-00, etc.)
 * which technically pass the math but are universally rejected as invalid.
 */
function isValidCpf(digitsOnly: string): boolean {
  if (digitsOnly.length !== 11) return false;
  if (/^(\d)\1+$/.test(digitsOnly)) return false;

  const d = digitsOnly.split('').map(Number);

  let sumA = 0;
  for (let i = 0; i < 9; i++) sumA += d[i] * (10 - i);
  let check1 = 11 - (sumA % 11);
  if (check1 >= 10) check1 = 0;
  if (check1 !== d[9]) return false;

  let sumB = 0;
  for (let i = 0; i < 10; i++) sumB += d[i] * (11 - i);
  let check2 = 11 - (sumB % 11);
  if (check2 >= 10) check2 = 0;
  return check2 === d[10];
}

/**
 * Detects CPF in two shapes:
 *   1. XXX.XXX.XXX-XX (formatted) — high confidence, validated mathematically.
 *   2. XXXXXXXXXXX (eleven raw digits) — only emitted when check digits pass.
 *
 * The unformatted shape collides with 11-digit phone numbers; the overlap
 * resolver in `anonymize` keeps the CPF match because the math-backed
 * detection has higher confidence than the phone-11-digit heuristic.
 */
export function detectCpf(text: string): Match[] {
  const matches: Match[] = [];

  for (const m of text.matchAll(CPF_FORMATTED)) {
    if (m.index === undefined) continue;
    const digits = m[0].replace(/\D/g, '');
    if (!isValidCpf(digits)) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      original: m[0],
      category: 'cpf',
      detector: 'cpf-formatted',
    });
  }

  for (const m of text.matchAll(CPF_UNFORMATTED)) {
    if (m.index === undefined) continue;
    if (!isValidCpf(m[0])) continue;
    matches.push({
      start: m.index,
      end: m.index + m[0].length,
      original: m[0],
      category: 'cpf',
      detector: 'cpf-unformatted',
    });
  }

  return matches;
}
