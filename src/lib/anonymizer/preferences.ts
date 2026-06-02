/**
 * Anonymization preferences: defaults, sanitizer and a helper to turn the
 * stored shape into the per-category map that `anonymize()` expects.
 *
 * Why a dedicated module: the preferences object lives in localStorage and
 * therefore inherits the same trust posture as the rest of the user-settings
 * payload: malformed, tampered or legacy entries must not crash the UI nor
 * silently disable redaction. Every consumer reads through `sanitizePrefs`.
 */

import type { AnonymizationPrefs } from '@/types';
import type { Category, CategoryOptions } from './types';

/**
 * Defaults applied when no preference is stored yet. Master switch is on so
 * the privacy guarantee holds for users that never visit /configuracoes, and
 * every category is enabled by default to match the conservative "redact
 * everything we can detect" stance documented in /privacidade.
 */
export const DEFAULT_PREFS: AnonymizationPrefs = {
  enabled: true,
  categories: {
    email: true,
    phone: true,
    cpf: true,
    cep: true,
    birthdate: true,
    linkedin: true,
    github: true,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function coerceBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Normalises an unknown value into a fully populated AnonymizationPrefs.
 * Never throws and never returns partial objects.
 */
export function sanitizePrefs(value: unknown): AnonymizationPrefs {
  if (!isRecord(value)) return { ...DEFAULT_PREFS, categories: { ...DEFAULT_PREFS.categories } };

  const enabled = coerceBoolean(value.enabled, DEFAULT_PREFS.enabled);
  const rawCategories = isRecord(value.categories) ? value.categories : {};

  return {
    enabled,
    categories: {
      email: coerceBoolean(rawCategories.email, DEFAULT_PREFS.categories.email),
      phone: coerceBoolean(rawCategories.phone, DEFAULT_PREFS.categories.phone),
      cpf: coerceBoolean(rawCategories.cpf, DEFAULT_PREFS.categories.cpf),
      cep: coerceBoolean(rawCategories.cep, DEFAULT_PREFS.categories.cep),
      birthdate: coerceBoolean(rawCategories.birthdate, DEFAULT_PREFS.categories.birthdate),
      linkedin: coerceBoolean(rawCategories.linkedin, DEFAULT_PREFS.categories.linkedin),
      github: coerceBoolean(rawCategories.github, DEFAULT_PREFS.categories.github),
    },
  };
}

/**
 * Translates the stored preferences into the per-category enablement map
 * expected by `anonymize()`. Honours the master switch: when `enabled` is
 * false every category is forced off, so the AI receives the raw text.
 */
export function toEnabledMap(prefs: AnonymizationPrefs): Record<Category, boolean> {
  if (!prefs.enabled) {
    return {
      email: false,
      phone: false,
      cpf: false,
      cep: false,
      birthdate: false,
      linkedin: false,
      github: false,
    };
  }
  return { ...prefs.categories };
}

/**
 * Counts the categories whose toggle is off while the master switch is on.
 * Used by the settings card to surface a "X categorias desativadas" hint.
 */
export function countDisabledCategories(prefs: AnonymizationPrefs): number {
  if (!prefs.enabled) return 0;
  let n = 0;
  for (const v of Object.values(prefs.categories)) if (v === false) n++;
  return n;
}

export type { CategoryOptions };
