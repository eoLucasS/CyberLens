export type AIProviderName = 'anthropic' | 'openai' | 'google' | 'huggingface';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export interface AIProviderConfig {
  name: AIProviderName;
  label: string;
  models: ModelOption[];
  requiresProxy: boolean;
  apiKeyPlaceholder: string;
  docsUrl: string;
}

/**
 * User-controlled anonymization preferences. The master `enabled` toggle
 * short-circuits the entire pipeline; when false, no PII is redacted even
 * if individual categories are on. Category-level flags only take effect
 * when the master switch is true.
 */
export interface AnonymizationPrefs {
  enabled: boolean;
  categories: {
    email: boolean;
    phone: boolean;
    cpf: boolean;
    cep: boolean;
    birthdate: boolean;
    linkedin: boolean;
    github: boolean;
  };
}

export interface UserSettings {
  provider: AIProviderName;
  model: string;
  apiKey: string;
  hasAcceptedTerms: boolean;
  /**
   * When true, each successful analysis is persisted in the local history
   * (up to 10 entries, FIFO). Defaults to false so nothing is ever saved
   * without explicit user consent.
   */
  saveHistory?: boolean;
  /**
   * PII anonymization preferences. Optional for backward compatibility with
   * older localStorage entries; readers should use sanitizePrefs from
   * @/lib/anonymizer/preferences to get a safe normalized object.
   */
  anonymization?: AnonymizationPrefs;
}
