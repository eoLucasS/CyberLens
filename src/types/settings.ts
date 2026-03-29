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
}
