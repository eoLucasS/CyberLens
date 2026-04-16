// Demo landing page: Server Component, zero client-side JavaScript.
// Designed for SEO (rich metadata + social sharing) and as a conversion funnel.

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Shield,
  Code,
  Clock,
  CheckCircle2,
  Sparkles,
  Zap,
  Gauge,
  Target,
  BookOpen,
} from 'lucide-react';

export const metadata = {
  title: 'Demonstração do CyberLens | Análise de currículo em tempo real',
  description:
    'Veja o CyberLens em ação com 3 exemplos reais de análise de currículo vs vaga. Sem cadastro, sem API key, resultado em 5 segundos.',
  openGraph: {
    title: 'Demonstração do CyberLens',
    description:
      'Descubra como a IA do CyberLens compara currículo e vaga em segundos. 3 perfis reais, zero cadastro.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Demonstração do CyberLens',
    description: '3 análises reais de currículo vs vaga. Sem cadastro.',
  },
};

interface ProfileCard {
  slug: string;
  title: string;
  subtitle: string;
  score: number;
  classification: string;
  iconName: 'BarChart3' | 'Shield' | 'Code';
  description: string;
  highlights: string[];
}

// Static list of demo profiles (also available as JSON in public/demo/profiles/).
const PROFILES: ProfileCard[] = [
  {
    slug: 'analista-dados',
    title: 'Analista de Dados',
    subtitle: 'De Pleno para Sênior',
    score: 62,
    classification: 'Aderência Parcial',
    iconName: 'BarChart3',
    description:
      'Marina tem 3 anos de BI e Power BI, mas a vaga sênior pede stack cloud (AWS, Snowflake, Airflow) e Python avançado.',
    highlights: [
      'Match de 41% em keywords',
      '7 gaps identificados com sugestões',
      'Plano de estudos com 5 trilhas',
    ],
  },
  {
    slug: 'analista-cyber',
    title: 'Analista de Segurança',
    subtitle: 'De Júnior para Pleno',
    score: 48,
    classification: 'Aderência Parcial',
    iconName: 'Shield',
    description:
      'Rafael trabalha em SOC há 1.5 anos consumindo alertas. A vaga Pleno exige postura proativa (threat hunting, MITRE) e forense.',
    highlights: [
      'Match de 43% em keywords',
      '8 gaps com priorização',
      'Reescritas que mostram a transição Jr → Pleno',
    ],
  },
  {
    slug: 'dev-fullstack',
    title: 'Dev Full Stack',
    subtitle: 'De Pleno para Sênior',
    score: 76,
    classification: 'Alta Aderência',
    iconName: 'Code',
    description:
      'Camila tem stack sólida (TS, React, Node, AWS) e mentora júniors. Falta Kubernetes em produção, observability e event-driven.',
    highlights: [
      'Match de 67% em keywords',
      '7 gaps com reescritas pontuais',
      'Candidatura já madura com ajustes cirúrgicos',
    ],
  },
];

const ICONS = { BarChart3, Shield, Code };

function ExplainerCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#141420] p-4 sm:p-5 transition-colors hover:border-[#00ffd5]/15">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00ffd5]/10 text-[#00ffd5]">
          {icon}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#e4e4e7] mb-1">{title}</p>
          <p className="text-[12px] text-[#9ca3af] leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}

function scoreColor(score: number): string {
  if (score >= 85) return '#00ffd5';
  if (score >= 70) return '#00ff88';
  if (score >= 40) return '#ffd32a';
  return '#ff4757';
}

export default function DemoLandingPage() {
  return (
    <div className="min-h-screen py-8 sm:py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#e4e4e7] transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar ao início
        </Link>

        {/* Header */}
        <div className="mb-10 sm:mb-14 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ffd5]/10 text-[#00ffd5] text-xs font-medium mb-4">
            <Sparkles size={14} />
            Modo demonstração
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Veja o CyberLens em ação
            <br className="hidden sm:inline" />
            <span className="text-[#00ffd5]"> em 5 segundos</span>
          </h1>
          <p className="mt-4 text-sm sm:text-[15px] text-[#9ca3af] leading-relaxed">
            Escolha um dos três perfis abaixo e veja uma análise completa,
            sem cadastro, sem API key, sem compromisso.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#8b8fa3]">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#00ff88]" />
              Grátis
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#00ff88]" />
              Sem cadastro
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} className="text-[#00ffd5]" />
              Menos de 5 segundos
            </span>
          </div>
        </div>

        {/* Profile cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {PROFILES.map((p) => {
            const Icon = ICONS[p.iconName];
            return (
              <Link
                key={p.slug}
                href={`/demo/${p.slug}`}
                className="group relative flex flex-col rounded-2xl border border-white/[0.06] bg-[#141420] p-5 sm:p-6 transition-all duration-300 hover:border-[#00ffd5]/25 hover:shadow-[0_0_30px_rgba(0,255,213,0.04)]"
              >
                {/* Score badge (top right) */}
                <div
                  className="absolute top-4 right-4 rounded-lg border px-2.5 py-1 text-xs font-bold tabular-nums"
                  style={{
                    borderColor: `${scoreColor(p.score)}30`,
                    backgroundColor: `${scoreColor(p.score)}10`,
                    color: scoreColor(p.score),
                  }}
                >
                  {p.score}%
                </div>

                {/* Icon */}
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#00ffd5]/10 text-[#00ffd5]">
                  <Icon size={20} />
                </div>

                {/* Title */}
                <h2 className="text-base font-semibold text-[#e4e4e7] group-hover:text-white transition-colors">
                  {p.title}
                </h2>
                <p className="mt-0.5 text-xs text-[#8b8fa3]">{p.subtitle}</p>

                {/* Description */}
                <p className="mt-3 text-[13px] text-[#9ca3af] leading-relaxed min-h-[4.5em]">
                  {p.description}
                </p>

                {/* Highlights */}
                <ul className="mt-4 space-y-1.5">
                  {p.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2 text-[11px] text-[#8b8fa3]"
                    >
                      <CheckCircle2
                        size={11}
                        className="mt-0.5 shrink-0 text-[#00ffd5]"
                      />
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Classification chip (bottom) */}
                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-[#6b7280]">
                    {p.classification}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#00ffd5] group-hover:translate-x-0.5 transition-transform">
                    Ver análise
                    <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom explainer */}
        <div className="mt-10 sm:mt-14">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#00ffd5] mb-2">
              O que cada demonstração mostra
            </p>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Tudo que o CyberLens entrega, em 4 blocos
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ExplainerCard
              icon={<Zap size={16} />}
              title="Raio-X instantâneo"
              description="Palavras-chave encontradas e ausentes, calculadas no seu navegador antes mesmo da IA ser chamada."
            />
            <ExplainerCard
              icon={<Gauge size={16} />}
              title="Score de aderência"
              description="Pontuação de 0 a 100 com classificação visual por cor e contexto do porquê da nota."
            />
            <ExplainerCard
              icon={<Target size={16} />}
              title="Gaps com sugestões"
              description="Lacunas classificadas por prioridade, cada uma com sugestão de reescrita ou plano de ação."
            />
            <ExplainerCard
              icon={<BookOpen size={16} />}
              title="Plano de estudos"
              description="Roadmap personalizado com recursos reais (cursos, certificações) e tempo estimado por tópico."
            />
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-sm text-[#9ca3af] mb-4">
            Pronto para analisar seu próprio currículo?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00ffd5] text-[#0a0a0f] font-semibold text-sm hover:bg-[#00e6c0] transition-colors"
          >
            Começar análise real
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
