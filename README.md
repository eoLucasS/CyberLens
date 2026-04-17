<div align="center">

<img src="https://img.shields.io/badge/CyberLens-v1.0.0-00ffd5?style=for-the-badge&labelColor=0a0a0f" alt="CyberLens v1.0.0" />

# CyberLens

**Analise a aderência do seu currículo a qualquer vaga de emprego com IA**

[![License: MIT](https://img.shields.io/badge/License-MIT-00ffd5.svg?style=flat-square)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg?style=flat-square)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg?style=flat-square)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg?style=flat-square)](https://tailwindcss.com)
[![LGPD](https://img.shields.io/badge/LGPD-Compliant-00ff88.svg?style=flat-square)](#conformidade-lgpd)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-00ffd5.svg?style=flat-square)](CONTRIBUTING.md)

[Funcionalidades](#funcionalidades) · [Quick Start](#quick-start) · [Como Funciona](#como-funciona) · [Contribuir](CONTRIBUTING.md)

</div>

---

## Sobre

O CyberLens é uma ferramenta open-source que usa inteligência artificial para analisar o quanto seu currículo combina com uma vaga de emprego. Funciona para **qualquer área profissional**: TI, dados, cibersegurança, DevOps, suporte, gestão, desenvolvimento, ou qualquer outra.

Em segundos, você recebe um diagnóstico completo: nota de compatibilidade, habilidades encontradas, lacunas, palavras-chave ausentes e um plano de estudos personalizado com recursos reais.

> [!IMPORTANT]
> **Privacidade em primeiro lugar.** Seu currículo é processado inteiramente no navegador. Nenhum dado é enviado a servidores do CyberLens. As chaves de API ficam apenas no localStorage do seu navegador. Conforme LGPD (Lei 13.709/2018).

---

## Funcionalidades

<details>
<summary><strong>Análise Completa com IA</strong></summary>

- Resumo executivo no topo: diagnóstico, gap principal e próxima ação em 3 frases
- Score de aderência (0-100%) com gauge animado e classificação visual
- Identificação de skills encontradas com contexto do currículo
- Gaps classificados por prioridade: Crítico, Importante, Desejável
- Palavras-chave ausentes com sugestões de incorporação
- Análise de experiência e certificações
- Plano de estudos personalizado com cursos, certificações e recursos reais
- Raio-X instantâneo de palavras-chave (grátis, antes da IA, milissegundos)
- Sugestões de reescrita do currículo para cada lacuna identificada
- Cópia com um clique das sugestões de reescrita, com feedback visual

</details>

<details>
<summary><strong>Pré-processamento Inteligente (NLP Local)</strong></summary>

- Extração de keywords por TF-IDF antes de chamar a IA
- Parser de seções do currículo (experiência, formação, skills, certificações)
- Matching automático de palavras-chave da vaga vs currículo
- Prompt otimizado: a IA recebe dados estruturados, reduzindo tokens e melhorando precisão
- Resultado do NLP exibido como "Raio-X de Compatibilidade" antes da análise com IA

</details>

<details>
<summary><strong>PDF e OCR</strong></summary>

- PDF parsing 100% client-side via pdfjs-dist (Mozilla)
- Detecção automática de layout multi-coluna com reordenação de leitura
- Normalização de texto (bullets unificados, hifenização corrigida, caracteres invisíveis removidos)
- Detecção automática de PDFs escaneados (baseados em imagem)
- OCR local via Tesseract.js com score de confiança por página
- Correção manual opcional do texto extraído antes da análise
- Validação de magic bytes (%PDF), extensão e tamanho (max 10MB)
- Cache local do texto extraído para analisar o mesmo currículo contra várias vagas sem novo upload
- Exportação do resultado em PDF profissional

</details>

<details>
<summary><strong>Multi-Provedor de IA</strong></summary>

| Provedor | Modelos | Custo |
|----------|---------|-------|
| **Hugging Face** | Llama 3.3 70B, Qwen 2.5 72B, Llama 3.1 8B | Créditos gratuitos mensais |
| **OpenAI** | GPT-4o, GPT-4o Mini | Pago por uso |
| **Anthropic** | Claude Sonnet 4.6, Claude Haiku 4.5 | Pago por uso |
| **Google** | Gemini 2.5 Flash, Gemini 2.5 Pro | Pago por uso |

</details>

<details>
<summary><strong>Privacidade e Segurança</strong></summary>

- Zero dados em servidor próprio
- Zero cookies de rastreamento
- Zero analytics
- API keys armazenadas apenas no localStorage
- Modal de consentimento LGPD bloqueante
- Política de Privacidade e Termos de Uso completos

</details>

<details>
<summary><strong>Modo Demonstração</strong></summary>

- 3 perfis pré-gerados (Analista de Dados, Analista de Segurança, Dev Full Stack)
- Análises completas sem necessidade de API key ou cadastro
- Dados fictícios estáticos, zero coleta, zero processamento externo
- Acessível em [`/demo`](https://cyberlens-ai.vercel.app/demo)

</details>

---

## Como Funciona

```mermaid
flowchart LR
    A[PDF Upload] --> B[pdfjs-dist]
    B --> C{Tem texto?}
    C -->|Sim| D[Section Parser]
    C -->|Nao| E[Tesseract.js OCR]
    E --> D
    D --> F[TF-IDF Keywords]
    F --> G[Prompt Otimizado]
    G --> H[IA Provider]
    H --> I[Resultado]
    I --> J[PDF Export]

    style A fill:#1a1a2e,stroke:#00ffd5,color:#e4e4e7
    style B fill:#1a1a2e,stroke:#00ffd5,color:#e4e4e7
    style C fill:#1a1a2e,stroke:#ffd32a,color:#e4e4e7
    style D fill:#1a1a2e,stroke:#00ffd5,color:#e4e4e7
    style E fill:#1a1a2e,stroke:#a855f7,color:#e4e4e7
    style F fill:#1a1a2e,stroke:#00ffd5,color:#e4e4e7
    style G fill:#1a1a2e,stroke:#00ffd5,color:#e4e4e7
    style H fill:#1a1a2e,stroke:#00ff88,color:#e4e4e7
    style I fill:#1a1a2e,stroke:#00ff88,color:#e4e4e7
    style J fill:#1a1a2e,stroke:#00ffd5,color:#e4e4e7
```

<details>
<summary><strong>Fluxo detalhado</strong></summary>

1. **Upload do PDF** - O arquivo é processado no navegador via pdfjs-dist (Web Worker)
2. **Detecção de tipo** - Se o PDF não tem texto selecionável, oferece OCR via Tesseract.js
3. **Section Parser** - Detecta automaticamente seções do currículo (experiência, formação, skills, etc.)
4. **TF-IDF** - Extrai os termos mais relevantes da vaga e compara com o currículo
5. **Prompt otimizado** - Envia currículo estruturado + pré-análise de keywords para a IA
6. **Análise com IA** - A IA foca em análise semântica e de contexto (não em match textual)
7. **Resultado** - Score, skills, gaps, plano de estudos. Tudo exportável em PDF

**Nota:** Todo o processamento dos passos 1-5 acontece no navegador. A única comunicação externa é com o provedor de IA escolhido pelo usuário no passo 6.

</details>

---

## Quick Start

> [!TIP]
> Pré-requisito: [Node.js](https://nodejs.org) 18 ou superior.

```bash
# 1. Clone o repositório
git clone https://github.com/eoLucasS/CyberLens.git

# 2. Instale as dependências
cd CyberLens && npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Vá até **Configurações** e adicione sua chave de API. O Hugging Face já vem pré-selecionado como padrão (oferece créditos gratuitos).

---

## Configuração de API Keys

> [!NOTE]
> As chaves são armazenadas **exclusivamente no localStorage** do seu navegador. Nenhuma chave é enviada a servidores do CyberLens.

| Provedor | Onde obter | Observação |
|----------|-----------|------------|
| **Hugging Face** | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) | Créditos gratuitos mensais |
| **OpenAI** | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | Pago por uso |
| **Anthropic** | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) | Pago por uso |
| **Google** | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) | Pago por uso |

---

## Stack Técnica

<details>
<summary><strong>Ver stack completa</strong></summary>

| Tecnologia | Uso |
|-----------|-----|
| [Next.js 16](https://nextjs.org) | Framework React, App Router, API Routes (proxy CORS) |
| [React 19](https://react.dev) | Interface de usuário |
| [TypeScript](https://www.typescriptlang.org) | Tipagem estática (strict, zero `any`) |
| [Tailwind CSS v4](https://tailwindcss.com) | Estilização utility-first, tema cyber |
| [pdfjs-dist](https://mozilla.github.io/pdf.js/) | PDF parsing client-side (Web Worker) |
| [Tesseract.js](https://tesseract.projectnaptha.com/) | OCR para PDFs escaneados (WASM, client-side) |
| TF-IDF | Extração de keywords (JS puro, zero deps) |
| [@react-pdf/renderer](https://react-pdf.org) | Geração de PDF para exportação |
| [Lucide React](https://lucide.dev) | Ícones |
| [react-dropzone](https://react-dropzone.js.org) | Upload drag-and-drop |

</details>

---

## Estrutura do Projeto

<details>
<summary><strong>Ver árvore de arquivos</strong></summary>

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts          # Proxy CORS - Anthropic
│   │   └── proxy/huggingface/route.ts # Proxy CORS - HuggingFace
│   ├── configuracoes/page.tsx
│   ├── privacidade/page.tsx
│   ├── sobre/page.tsx
│   ├── termos/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── analysis/     # Upload, input de vaga, resultado, export PDF
│   ├── layout/       # Header, Footer
│   ├── legal/        # Modal de consentimento LGPD
│   ├── settings/     # Formulário de configurações
│   └── ui/           # Button, Card, Badge, ScoreGauge, etc.
├── constants/        # Providers, prompts, UI strings
├── hooks/            # useAnalysis, useLocalStorage
├── lib/
│   ├── ai/           # Clientes IA (retry, timeout, fallback)
│   ├── nlp/          # TF-IDF keywords, section parser
│   ├── pdf/          # PDF extraction + OCR
│   └── utils/        # Storage, validators
└── types/            # TypeScript interfaces
```

</details>

---

## Contribuindo

Contribuições são bem-vindas! Veja o [CONTRIBUTING.md](CONTRIBUTING.md) para:

- Como configurar o ambiente
- Padrões de código
- Como adicionar um novo provedor de IA
- Convenção de commits

---

## Licença

MIT. Veja [LICENSE](LICENSE) para detalhes.

---

<details>
<summary><strong>Disclaimer</strong></summary>

<br>

As análises geradas pelo CyberLens são produzidas por modelos de inteligência artificial e têm caráter **exclusivamente informativo**. Os resultados não constituem avaliação profissional, consultoria de carreira ou garantia de empregabilidade. A pontuação e as recomendações são estimativas baseadas na comparação entre currículo e vaga, podendo conter imprecisões.

O uso das APIs de terceiros (Anthropic, OpenAI, Google, Hugging Face) está sujeito aos respectivos Termos de Serviço de cada provedor. O usuário é o único responsável pelo uso de sua chave de API e pelos custos associados.

Este projeto não possui qualquer vínculo com os provedores de IA mencionados.

</details>

---

<div align="center">

Feito por [Lucas Silva](https://github.com/eoLucasS)

</div>
