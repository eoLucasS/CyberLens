import type { AIProviderConfig } from '../types/settings';

export const AI_PROVIDERS: AIProviderConfig[] = [
  {
    name: 'anthropic',
    label: 'Anthropic (Claude)',
    requiresProxy: true,
    apiKeyPlaceholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      {
        id: 'claude-sonnet-4-6',
        name: 'Claude Sonnet 4.6',
        description: 'Modelo mais recente da Anthropic. Alta precisão em análises complexas.',
      },
      {
        id: 'claude-haiku-4-5-20251001',
        name: 'Claude Haiku 4.5',
        description: 'Modelo rápido e eficiente. Ótimo custo-benefício para análises do dia a dia.',
      },
    ],
  },
  {
    name: 'openai',
    label: 'OpenAI (GPT)',
    requiresProxy: false,
    apiKeyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Modelo multimodal topo de linha da OpenAI. Alta precisão em análises detalhadas.',
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Versão mais leve e econômica do GPT-4o. Boa velocidade e custo reduzido.',
      },
    ],
  },
  {
    name: 'google',
    label: 'Google (Gemini)',
    requiresProxy: false,
    apiKeyPlaceholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Modelo mais recente do Google. Rápido, inteligente e com contexto extenso.',
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Modelo avançado com capacidade máxima. Ideal para análises detalhadas.',
      },
    ],
  },
  {
    name: 'huggingface',
    label: 'Hugging Face (Gratuito)',
    requiresProxy: true,
    apiKeyPlaceholder: 'hf_...',
    docsUrl: 'https://huggingface.co/settings/tokens',
    models: [
      {
        id: 'meta-llama/Llama-3.3-70B-Instruct',
        name: 'Llama 3.3 70B Instruct',
        description: 'Modelo open-source da Meta, 70B parâmetros. Alta capacidade via Hugging Face Inference Providers.',
      },
      {
        id: 'Qwen/Qwen2.5-72B-Instruct',
        name: 'Qwen 2.5 72B Instruct',
        description: 'Modelo open-source da Alibaba. Excelente para análises detalhadas e instruções complexas.',
      },
      {
        id: 'meta-llama/Llama-3.1-8B-Instruct',
        name: 'Llama 3.1 8B Instruct',
        description: 'Modelo leve e econômico. Ideal para testes e análises rápidas com menor consumo de créditos.',
      },
    ],
  },
];

export const DEFAULT_PROVIDER: AIProviderConfig = AI_PROVIDERS[3]; // HuggingFace
export const DEFAULT_MODEL = 'meta-llama/Llama-3.3-70B-Instruct';
