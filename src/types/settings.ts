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
}
