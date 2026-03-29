<div align="center">

# CyberLens

**Analise a aderencia do seu curriculo a qualquer vaga de emprego com IA**

[![License: MIT](https://img.shields.io/badge/License-MIT-00ffd5.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8.svg)](https://tailwindcss.com)

[Demo](#) · [Documentação](#funcionalidades) · [Contribuir](CONTRIBUTING.md)

</div>

---

## Sobre

CyberLens e uma ferramenta open-source que utiliza inteligencia artificial para analisar a aderencia do seu curriculo a qualquer vaga de emprego, em qualquer area profissional. Nasceu com foco em ciberseguranca, mas funciona para TI, dados, DevOps, suporte, gestao de projetos e qualquer outra area. Em segundos, voce descobre sua pontuacao de compatibilidade, quais habilidades ja possui, quais lacunas precisam ser preenchidas e recebe um plano de estudos personalizado.

**Privacidade em primeiro lugar:** o PDF do currículo é processado inteiramente no navegador (via pdfjs-dist), nenhum dado é enviado a servidores próprios, e as chaves de API ficam armazenadas apenas no localStorage do usuário. O projeto é aderente à Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).

---

## Funcionalidades

- **Upload de currículo em PDF** com parsing 100% client-side: seu arquivo nunca sai do navegador
- **Análise multi-provedor de IA**: suporte a Anthropic (Claude), OpenAI (GPT), Google (Gemini) e Hugging Face
- **Score gauge animado**: pontuação de 0 a 100 com classificação visual
- **Identificação de gaps** classificados por prioridade: Crítico, Importante e Desejável
- **Skills encontradas** com contexto extraído do próprio currículo
- **Palavras-chave ausentes** com sugestões de como incorporá-las
- **Análise de experiência e certificações** relevantes à vaga
- **Plano de estudos personalizado** com recursos recomendados e estimativas de tempo
- **Exportação de resultado em PDF** para guardar ou compartilhar a análise
- **Página de configurações** com gerenciamento de chave de API e teste de conexão real
- **Modal de consentimento LGPD** com bloqueio de interação até aceite
- **Política de Privacidade** completa em conformidade com a Lei 13.709/2018
- **Termos de Uso** detalhados
- **Página Sobre** com informações do projeto

---

## Stack Tecnológica

| Tecnologia | Versão | Uso |
|---|---|---|
| [Next.js](https://nextjs.org) | 16 | Framework React com App Router e API Routes |
| [React](https://react.dev) | 19 | Biblioteca de interface |
| [TypeScript](https://www.typescriptlang.org) | 5 | Tipagem estática (modo strict) |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Estilização utility-first |
| [pdfjs-dist](https://mozilla.github.io/pdf.js/) | 5 | Parsing de PDF client-side |
| [@react-pdf/renderer](https://react-pdf.org) | 4 | Geração de PDF para exportação |
| [Lucide React](https://lucide.dev) | 1 | Ícones |
| [react-dropzone](https://react-dropzone.js.org) | 15 | Área de upload drag-and-drop |

---

## Quick Start

> **Pré-requisito:** Node.js 18 ou superior instalado.

```bash
git clone https://github.com/eoLucasS/CyberLens.git
cd cyberlens && npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador. Antes de realizar a primeira análise, vá até **Configurações** (ícone de engrenagem no header) e adicione a chave de API do provedor de IA de sua preferência.

---

## Configuração de API Keys

| Provedor | Onde obter a chave | Modelos disponíveis |
|---|---|---|
| **Anthropic (Claude)** | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) | Claude Sonnet 4, Claude Haiku 4.5 |
| **OpenAI (GPT)** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | GPT-4o, GPT-4o Mini |
| **Google (Gemini)** | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | Gemini 2.0 Flash, Gemini 1.5 Flash |
| **Hugging Face** | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | Llama 3.1 8B Instruct (gratuito) |

> As chaves são armazenadas exclusivamente no `localStorage` do seu navegador. Nenhuma chave trafega ou é armazenada em servidores.

---

## Deploy na Vercel

1. Faça fork deste repositório
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório
3. Clique em **Deploy**. Nenhuma variável de ambiente é necessária

As chaves de API são configuradas pelo próprio usuário na interface, portanto não há segredos a definir no painel da Vercel.

---

## Estrutura do Projeto

```
src/
├── app/                        # App Router (Next.js)
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts        # Proxy CORS para a API Anthropic
│   ├── configuracoes/
│   │   └── page.tsx            # Página de configurações
│   ├── privacidade/
│   │   └── page.tsx            # Política de Privacidade
│   ├── sobre/
│   │   └── page.tsx            # Página Sobre
│   ├── termos/
│   │   └── page.tsx            # Termos de Uso
│   ├── globals.css             # Estilos globais e tema cyber dark
│   ├── layout.tsx              # Layout raiz com header/footer
│   └── page.tsx                # Página principal (análise)
├── components/
│   ├── analysis/               # Componentes de análise
│   │   ├── AnalysisButton.tsx
│   │   ├── AnalysisResult.tsx
│   │   ├── JobDescriptionInput.tsx
│   │   └── ResumeUpload.tsx
│   ├── layout/                 # Header e Footer
│   ├── legal/                  # Modal de consentimento LGPD
│   ├── settings/               # Formulário de configurações
│   └── ui/                     # Componentes base (Button, Card, Badge, etc.)
├── constants/
│   ├── providers.ts            # Configuração dos provedores de IA
│   ├── prompts.ts              # Prompt de análise
│   └── ui.ts                   # Constantes de UI (mensagens de loading, etc.)
├── hooks/
│   ├── useAnalysis.ts          # Lógica central de análise
│   └── useLocalStorage.ts      # Hook de persistência
├── lib/
│   ├── ai/
│   │   └── index.ts            # Clientes de IA (chamadas, retry, fallback)
│   ├── pdf/
│   │   └── parse.ts            # Parser de PDF client-side
│   └── utils/                  # cn(), storage, validators, sanitizers
└── types/
    ├── analysis.ts             # Tipos do resultado de análise
    ├── settings.ts             # Tipos de configurações e provedores
    └── index.ts                # Re-exports
```

---

## Conformidade LGPD

O CyberLens foi projetado com privacidade por padrão:

- **Sem cookies** de rastreamento ou analytics
- **Sem coleta de dados**: nenhuma informação do usuário é enviada a servidores próprios
- **Parsing client-side**: o PDF é processado inteiramente no navegador e nunca trafega pela rede
- **localStorage apenas**: as configurações (chave de API e preferências) ficam no dispositivo do usuário
- **Consentimento explícito**: modal LGPD exibido na primeira visita, bloqueando interação até aceite
- **Transparência**: Política de Privacidade e Termos de Uso completos e acessíveis

---

## Contribuindo

Contribuições são muito bem-vindas! Leia o [CONTRIBUTING.md](CONTRIBUTING.md) para entender como configurar o ambiente, os padrões de código e o processo de pull request.

---

## Licença

MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## Disclaimer

> As análises geradas pelo CyberLens são produzidas por modelos de inteligência artificial e têm caráter **exclusivamente informativo**. Os resultados não constituem avaliação profissional, consultoria de carreira ou garantia de empregabilidade. A pontuação e as recomendações são estimativas baseadas na comparação textual entre currículo e vaga, podendo conter imprecisões.
>
> O uso das APIs de terceiros (Anthropic, OpenAI, Google, Hugging Face) está sujeito aos respectivos Termos de Serviço e Políticas de Uso de cada provedor. O usuário é o único responsável pelo uso de sua chave de API e pelos custos associados.
>
> Este projeto não possui qualquer vínculo com os provedores de IA mencionados.
