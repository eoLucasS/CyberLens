// Application identity
export const APP_NAME = 'CyberLens';
export const APP_DESCRIPTION = 'Análise inteligente de aderência de currículo para qualquer vaga de emprego, em qualquer área profissional';

// Labels for each step of the multi-step form flow
export const STEP_TITLES: string[] = [
  'Currículo',
  'Vaga',
  'Análise',
  'Resultado',
];

// Maps score ranges to their human-readable classification label
export const SCORE_LABELS: Array<{ min: number; max: number; label: string }> = [
  { min: 0, max: 39, label: 'Baixa Aderência' },
  { min: 40, max: 69, label: 'Aderência Parcial' },
  { min: 70, max: 84, label: 'Alta Aderência' },
  { min: 85, max: 100, label: 'Aderência Excelente' },
];

// User-facing error messages in pt-BR
export const ERROR_MESSAGES: Record<string, string> = {
  invalidFile:
    'Formato de arquivo inválido. Por favor, envie um arquivo PDF.',
  fileTooLarge:
    'O arquivo é muito grande. O tamanho máximo permitido é 10 MB.',
  minChars:
    'O texto é muito curto. Insira pelo menos 100 caracteres para uma análise precisa.',
  maxChars:
    'O texto é muito longo. O limite máximo é de 10.000 caracteres.',
  noApiKey:
    'Chave de API não informada. Configure sua chave nas configurações antes de prosseguir.',
  invalidApiKey:
    'Chave de API inválida ou sem permissão. Verifique se a chave está correta e ativa.',
  rateLimit:
    'Limite de requisições atingido. Aguarde alguns instantes e tente novamente.',
  timeout:
    'A requisição demorou muito para responder. Verifique sua conexão e tente novamente.',
  networkError:
    'Erro de conexão. Verifique sua internet e tente novamente.',
  parseError:
    'Não foi possível interpretar a resposta da IA. Tente novamente ou escolha outro modelo.',
  genericError:
    'Ocorreu um erro inesperado. Por favor, tente novamente.',
};

// Rotating loading messages displayed during analysis
export const LOADING_MESSAGES: string[] = [
  'Extraindo informações do currículo...',
  'Comparando com requisitos da vaga...',
  'Identificando gaps de competência...',
  'Analisando certificações e experiência...',
  'Verificando palavras-chave ausentes...',
  'Montando plano de estudos personalizado...',
  'Calculando pontuação de aderência...',
  'Finalizando análise...',
];

// LGPD disclaimer shown alongside every analysis result
export const DISCLAIMER =
  'Seus dados são processados localmente e enviados diretamente à API do provedor de IA escolhido. ' +
  'O CyberLens não armazena, transmite nem compartilha seu currículo ou qualquer informação pessoal com terceiros. ' +
  'Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018), você tem total controle sobre seus dados.';

// Disclaimer about AI-generated content accuracy
export const ANALYSIS_DISCLAIMER =
  'Esta análise foi gerada por inteligência artificial e tem caráter orientativo. ' +
  'Os resultados podem conter imprecisões e não substituem a avaliação de um recrutador ou especialista em RH. ' +
  'Use as informações como referência para seu desenvolvimento profissional.';

// Dynamic disclaimer function that includes provider name
export function getAnalysisDisclaimerWithProvider(providerLabel: string): string {
  return (
    'Esta análise foi gerada por inteligência artificial e tem caráter exclusivamente informativo. ' +
    'O CyberLens não garante precisão absoluta dos resultados. ' +
    `Ao realizar esta análise, o texto do seu currículo foi enviado para ${providerLabel} para processamento. ` +
    'Nenhum dado é retido pelo CyberLens. ' +
    'Os dados do seu currículo são processados localmente e enviados apenas ao provedor de IA configurado por você. ' +
    'Nenhum dado é armazenado em nossos servidores.'
  );
}
