// Documentation page: static Server Component, zero client-side JavaScript.

import {
  BookOpen,
  FileUp,
  FileText,
  Brain,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  GitBranch,
  Cpu,
  Code2,
  Layers,
  FolderTree,
} from 'lucide-react';

export const metadata = {
  title: 'Documentação - CyberLens',
  description:
    'Documentação do CyberLens: como funciona o pipeline de análise, tecnologias utilizadas e guia para desenvolvedores.',
};

/* ───── Pipeline steps data ───── */

const PIPELINE_STEPS = [
  {
    icon: <FileUp size={22} />,
    title: 'Upload do PDF',
    description: 'O usuário envia seu currículo em formato PDF.',
  },
  {
    icon: <FileText size={22} />,
    title: 'Extração de Texto',
    description: 'O texto é extraído diretamente no navegador.',
  },
  {
    icon: <Brain size={22} />,
    title: 'Pré-processamento NLP',
    description: 'Palavras-chave e seções são identificadas via TF-IDF.',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'Análise com IA',
    description: 'O texto otimizado é enviado ao provedor de IA escolhido.',
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: 'Resultado',
    description: 'Um relatório completo com score, gaps e plano de estudos.',
  },
];

/* ───── Tech stack data ───── */

const TECH_CATEGORIES = [
  {
    category: 'Frontend',
    items: [
      { name: 'Next.js', description: 'Framework React com SSR e API Routes' },
      { name: 'React', description: 'Biblioteca de UI com Server Components' },
      { name: 'TypeScript', description: 'Tipagem estática para segurança em tempo de compilação' },
      { name: 'Tailwind CSS', description: 'Estilização utility-first com design responsivo' },
      { name: 'Lucide React', description: 'Ícones SVG leves e tree-shakeable' },
    ],
  },
  {
    category: 'PDF / OCR',
    items: [
      { name: 'pdfjs-dist', description: 'Extração de texto de PDFs digitais no navegador' },
      { name: 'Tesseract.js', description: 'OCR para PDFs escaneados ou baseados em imagem' },
      { name: '@react-pdf/renderer', description: 'Geração de PDFs vetoriais para exportação' },
    ],
  },
  {
    category: 'Inteligência Artificial',
    items: [
      { name: 'OpenAI (GPT)', description: 'Análise de currículo via modelos GPT' },
      { name: 'Anthropic (Claude)', description: 'Análise via modelos Claude' },
      { name: 'Google (Gemini)', description: 'Análise via modelos Gemini' },
      { name: 'TF-IDF (natural)', description: 'Redução de tokens antes do envio à IA' },
    ],
  },
  {
    category: 'Infraestrutura',
    items: [
      { name: 'Vercel', description: 'Deploy automático com edge network global' },
      { name: 'Zod', description: 'Validação de schemas em runtime' },
      { name: 'API Routes', description: 'Proxy CORS para comunicação segura com provedores de IA' },
    ],
  },
];

/* ───── Nav items ───── */

const NAV_ITEMS = [
  { href: '#como-funciona', label: 'Como Funciona', icon: <Cpu size={14} /> },
  { href: '#tecnologias', label: 'Tecnologias', icon: <Layers size={14} /> },
  { href: '#desenvolvedores', label: 'Para Desenvolvedores', icon: <Code2 size={14} /> },
];

/* ───── Sub-components ───── */

function PipelineStep({
  step,
  index,
  isLast,
}: {
  step: (typeof PIPELINE_STEPS)[number];
  index: number;
  isLast: boolean;
}) {
  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-0 sm:gap-0">
      {/* Card */}
      <div className="relative flex flex-col items-center text-center w-full max-w-[180px] sm:max-w-[160px] lg:max-w-[180px]">
        {/* Step number badge */}
        <div className="absolute -top-2.5 -left-1 sm:-top-2.5 sm:-left-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#00ffd5] text-[#0a0a0f] text-[10px] font-bold">
          {index + 1}
        </div>

        {/* Icon container */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ffd5]/10 border border-[#00ffd5]/20 text-[#00ffd5] mb-3 transition-colors">
          {step.icon}
        </div>

        <h4 className="text-sm font-semibold text-[#e4e4e7] mb-1">
          {step.title}
        </h4>
        <p className="text-[11px] sm:text-xs text-[#9ca3af] leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Connector arrow */}
      {!isLast && (
        <>
          {/* Desktop: horizontal arrow */}
          <div className="hidden sm:flex items-center px-2 lg:px-3 pt-6 shrink-0">
            <div className="w-6 lg:w-10 h-px bg-gradient-to-r from-[#00ffd5]/40 to-[#00ffd5]/10" />
            <ArrowRight size={14} className="text-[#00ffd5]/50 -ml-1" />
          </div>
          {/* Mobile: vertical arrow */}
          <div className="flex sm:hidden flex-col items-center py-2 shrink-0">
            <div className="w-px h-5 bg-gradient-to-b from-[#00ffd5]/40 to-[#00ffd5]/10" />
            <ArrowRight size={14} className="text-[#00ffd5]/50 rotate-90 -mt-1" />
          </div>
        </>
      )}
    </div>
  );
}

function TechCard({ name, description }: { name: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0a0a0f] px-4 py-3 hover:border-[#00ffd5]/20 transition-colors">
      <p className="text-sm font-medium text-[#e4e4e7] mb-0.5">{name}</p>
      <p className="text-xs text-[#9ca3af] leading-relaxed">{description}</p>
    </div>
  );
}

/* ───── Page ───── */

export default function DocumentacaoPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#00ffd5]/10 border border-[#00ffd5]/20 mb-4">
            <BookOpen size={22} className="text-[#00ffd5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e4e4e7] mb-2">
            Documentação
          </h1>
          <p className="text-sm sm:text-base text-[#9ca3af] max-w-xl mx-auto">
            Como o CyberLens funciona, quais tecnologias utiliza e como
            contribuir com o projeto.
          </p>
        </div>

        {/* Section navigation */}
        <nav className="mb-10 sm:mb-14 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/[0.08] bg-[#141420] text-[12px] sm:text-[13px] text-[#9ca3af] hover:text-[#00ffd5] hover:border-[#00ffd5]/30 transition-colors"
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </nav>

        <div className="space-y-8 sm:space-y-12">
          {/* ──────── Section 1: Como Funciona ──────── */}
          <section id="como-funciona" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00ffd5]/10 text-[#00ffd5]">
                <Cpu size={16} />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#e4e4e7]">
                Como Funciona
              </h2>
            </div>

            {/* Pipeline diagram */}
            <div className="rounded-2xl border border-white/[0.06] bg-[#141420] p-5 sm:p-8 mb-6">
              <p className="text-xs text-[#9ca3af] uppercase tracking-wider font-semibold mb-6 text-center">
                Pipeline de Análise
              </p>

              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-0 sm:gap-0">
                {PIPELINE_STEPS.map((step, i) => (
                  <PipelineStep
                    key={step.title}
                    step={step}
                    index={i}
                    isLast={i === PIPELINE_STEPS.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Detailed explanations */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-white/[0.06] bg-[#141420] p-5">
                <h4 className="text-sm font-semibold text-[#00ffd5] mb-2">
                  Extração de texto
                </h4>
                <p className="text-[13px] text-[#9ca3af] leading-relaxed">
                  O PDF é processado inteiramente no seu navegador usando
                  pdfjs-dist. Nenhum arquivo é enviado para servidores do
                  CyberLens. Quando o PDF é escaneado (imagem), o sistema ativa
                  o OCR via Tesseract.js como fallback automático. O texto
                  extraído é salvo no localStorage para que você possa
                  comparar o mesmo currículo contra várias vagas sem novo upload.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#141420] p-5">
                <h4 className="text-sm font-semibold text-[#00ffd5] mb-2">
                  Pré-processamento NLP
                </h4>
                <p className="text-[13px] text-[#9ca3af] leading-relaxed">
                  Antes de enviar o texto para a IA, o sistema aplica TF-IDF
                  para extrair os termos mais relevantes do currículo e da vaga.
                  Isso reduz o número de tokens enviados, diminuindo o custo da
                  análise e melhorando a precisão dos resultados. Os resultados
                  dessa pré-análise são exibidos ao usuário como um "Raio-X de
                  Compatibilidade" instantâneo antes de chamar a IA.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#141420] p-5 sm:col-span-2 lg:col-span-1">
                <h4 className="text-sm font-semibold text-[#00ffd5] mb-2">
                  Análise com IA
                </h4>
                <p className="text-[13px] text-[#9ca3af] leading-relaxed">
                  O texto otimizado é enviado ao provedor de IA escolhido
                  (OpenAI, Anthropic ou Google) via proxy CORS do Next.js. A IA
                  retorna um relatório estruturado com score de aderência,
                  habilidades, lacunas, palavras-chave e plano de estudos. Para
                  cada lacuna identificada, a IA também sugere como reescrever
                  trechos do currículo para incorporar os termos faltantes.
                </p>
              </div>
            </div>
          </section>

          {/* ──────── Section 2: Tecnologias ──────── */}
          <section id="tecnologias" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00ffd5]/10 text-[#00ffd5]">
                <Layers size={16} />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#e4e4e7]">
                Tecnologias
              </h2>
            </div>

            <div className="space-y-6">
              {TECH_CATEGORIES.map((cat) => (
                <div key={cat.category}>
                  <h3 className="text-xs text-[#00ffd5] uppercase tracking-wider font-semibold mb-3 pl-1">
                    {cat.category}
                  </h3>
                  <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.items.map((item) => (
                      <TechCard
                        key={item.name}
                        name={item.name}
                        description={item.description}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ──────── Section 3: Para Desenvolvedores ──────── */}
          <section id="desenvolvedores" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00ffd5]/10 text-[#00ffd5]">
                <Code2 size={16} />
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#e4e4e7]">
                Para Desenvolvedores
              </h2>
            </div>

            <div className="space-y-4">
              {/* Project structure */}
              <details className="group rounded-2xl border border-white/[0.06] bg-[#141420] overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-[#e4e4e7] hover:text-white transition-colors list-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2.5">
                    <FolderTree size={15} className="text-[#00ffd5]" />
                    Estrutura do Projeto
                  </span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 ml-3 text-[#9ca3af] transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div className="px-5 pb-5 border-t border-white/[0.04] pt-4">
                  <pre className="rounded-lg bg-[#0a0a0f] border border-white/[0.06] p-4 overflow-x-auto text-[12px] text-[#9ca3af] font-mono leading-relaxed">
                    <code>{`src/
  app/
    api/              # API Routes (proxy CORS)
    configuracoes/    # Página de configurações
    documentacao/     # Esta página
    privacidade/      # Política de privacidade
    sobre/            # Sobre o projeto
    termos/           # Termos de uso
    layout.tsx        # Layout raiz
    page.tsx          # Página principal (análise)
  components/         # Componentes React reutilizáveis
  constants/          # Constantes e configurações
  hooks/              # Custom hooks
  lib/                # Lógica de negócio (IA, PDF, NLP)
  types/              # Definições de tipos TypeScript`}</code>
                  </pre>
                </div>
              </details>

              {/* Adding a new AI provider */}
              <details className="group rounded-2xl border border-white/[0.06] bg-[#141420] overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-[#e4e4e7] hover:text-white transition-colors list-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2.5">
                    <Sparkles size={15} className="text-[#00ffd5]" />
                    Como adicionar um novo provedor de IA
                  </span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 ml-3 text-[#9ca3af] transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div className="px-5 pb-5 border-t border-white/[0.04] pt-4 space-y-2.5">
                  {[
                    'Crie o adaptador em src/lib/ai/ seguindo a interface existente',
                    'Registre o provedor no mapa em src/lib/ai/providers.ts',
                    'Adicione a API Route correspondente em src/app/api/',
                    'Atualize a página de configurações com o novo provedor',
                    'Adicione os tipos necessários em src/types/',
                  ].map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-[13px] text-[#9ca3af]"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#00ffd5]/10 text-[#00ffd5] text-[10px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </details>

              {/* Commit convention */}
              <details className="group rounded-2xl border border-white/[0.06] bg-[#141420] overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-semibold text-[#e4e4e7] hover:text-white transition-colors list-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2.5">
                    <GitBranch size={15} className="text-[#00ffd5]" />
                    Convenção de commits
                  </span>
                  <ChevronDown
                    size={16}
                    className="shrink-0 ml-3 text-[#9ca3af] transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <div className="px-5 pb-5 border-t border-white/[0.04] pt-4">
                  <div className="grid gap-1.5 text-[13px]">
                    {[
                      ['feat:', 'Nova funcionalidade'],
                      ['fix:', 'Correção de bug'],
                      ['docs:', 'Alteração em documentação'],
                      ['style:', 'Formatação (sem mudança de lógica)'],
                      ['refactor:', 'Refatoração de código'],
                      ['test:', 'Adição ou alteração de testes'],
                      ['chore:', 'Tarefas auxiliares (build, CI, deps)'],
                    ].map(([prefix, desc]) => (
                      <div key={prefix} className="flex gap-2">
                        <code className="text-[#00ffd5] font-mono w-24 shrink-0">
                          {prefix}
                        </code>
                        <span className="text-[#9ca3af]">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#9ca3af] mt-4">
                    Para o guia completo de contribuição, consulte o{' '}
                    <a
                      href="https://github.com/eoLucasS/CyberLens/blob/main/CONTRIBUTING.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00ffd5] hover:underline"
                    >
                      CONTRIBUTING.md
                    </a>
                    .
                  </p>
                </div>
              </details>
            </div>
          </section>
        </div>

        {/* Footer note */}
        <div className="mt-10 sm:mt-14 text-center">
          <p className="text-[11px] sm:text-xs text-[#9ca3af]">
            Esta documentação é atualizada junto com o código-fonte do projeto.
          </p>
        </div>
      </div>
    </main>
  );
}
