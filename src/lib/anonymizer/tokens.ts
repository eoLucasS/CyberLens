import type { Category } from './types';

/**
 * Categorical tokens used as replacement text. The brackets-plus-uppercase
 * format mirrors common industry standards (AWS Macie, Google DLP) and is
 * idempotent: none of the detectors can re-match these strings, so running
 * `anonymize` twice produces the same output as running it once.
 */
export const TOKENS: Record<Category, string> = {
  email: '[EMAIL]',
  phone: '[TELEFONE]',
  cpf: '[CPF]',
  cep: '[CEP]',
  birthdate: '[DATA_NASCIMENTO]',
  linkedin: '[LINKEDIN]',
  github: '[GITHUB]',
};

/** Human-readable labels in pt-BR for UI surfaces (settings, preview). */
export const CATEGORY_LABELS: Record<Category, string> = {
  email: 'E-mail',
  phone: 'Telefone',
  cpf: 'CPF',
  cep: 'CEP',
  birthdate: 'Data de nascimento',
  linkedin: 'URL do LinkedIn',
  github: 'URL do GitHub',
};

/** Canonical category order (used by Object.keys traversal and UI lists). */
export const CATEGORIES: readonly Category[] = [
  'email',
  'phone',
  'cpf',
  'cep',
  'birthdate',
  'linkedin',
  'github',
];

/** Default per-category state when no preferences are stored yet. */
export const DEFAULT_CATEGORY_STATE: Record<Category, boolean> = {
  email: true,
  phone: true,
  cpf: true,
  cep: true,
  birthdate: true,
  linkedin: true,
  github: true,
};
