'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Tag,
  Clock,
  ExternalLink,
  Award,
  Sparkles,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Pencil,
  ChevronDown,
} from 'lucide-react';
import type { AnalysisResult, Gap, StudyPlanItem, MatchedSkill, MissingKeyword } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { Spinner } from '@/components/ui/Spinner';
import { CopyButton } from '@/components/ui/CopyButton';
import { normalizeStudyLink } from '@/lib/analysis/study-links';
import { getAnalysisDisclaimerWithProvider, ANALYSIS_DISCLAIMER } from '@/constants';

// Lazy-load PDF export: never in the initial bundle (~450KB saved)
const PdfExportButton = dynamic(
  () => import('./PdfExport').then((mod) => ({ default: mod.PdfExportButton })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 text-sm text-[#9ca3af]">
        <Spinner size="sm" />
        Carregando exportador...
      </div>
    ),
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisResultProps {
  result: AnalysisResult;
  providerLabel?: string;
  /** When false, disables the auto-scroll-into-view on mount. Defaults to true. */
  autoScroll?: boolean;
}

// ─── Animation hook ───────────────────────────────────────────────────────────

function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

// ─── Shared section wrapper ───────────────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  count?: number;
  delay?: number;
  mounted: boolean;
}

function Section({ title, icon, children, count, delay = 0, mounted }: SectionProps) {
  return (
    <div
      style={{
        transitionDelay: `${delay}ms`,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#1a1a2e] to-[#161625] p-4 sm:p-6 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-[#00ffd5]/10 text-[#00ffd5]">
              {icon}
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-[#e4e4e7]">{title}</h2>
          </div>
          {count !== undefined && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/5 px-2 text-xs font-medium text-[#9ca3af]">
              {count}
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Section 1: Score ─────────────────────────────────────────────────────────

function ScoreSection({
  score,
  classification,
  matchCount,
  gapCount,
  mounted,
}: {
  score: number;
  classification: AnalysisResult['classification'];
  matchCount: number;
  gapCount: number;
  mounted: boolean;
}) {
  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#00ffd5]/10 bg-gradient-to-br from-[#1a1a2e] via-[#161625] to-[#0d1117] p-5 sm:p-8 shadow-xl shadow-[#00ffd5]/5">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-[#00ffd5]/5 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-medium text-[#00ffd5]">
            <Sparkles size={16} />
            Pontuação de Aderência
          </div>

          <ScoreGauge score={score} size={160} />

          <p className="text-sm text-[#9ca3af]">
            Classificação:{' '}
            <span className="font-semibold text-[#e4e4e7]">{classification}</span>
          </p>

          {/* Quick stats row */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={14} className="text-[#00ff88]" />
              <span className="text-[#9ca3af]">
                <span className="font-semibold text-[#e4e4e7]">{matchCount}</span> skills encontradas
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle size={14} className="text-[#ffd32a]" />
              <span className="text-[#9ca3af]">
                <span className="font-semibold text-[#e4e4e7]">{gapCount}</span> lacunas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Executive Summary (rendered ABOVE the score) ────────────────────────────

function ExecutiveSummarySection({
  summary,
  mounted,
}: {
  summary: string;
  mounted: boolean;
}) {
  return (
    <div
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-[#00ffd5]/15 bg-gradient-to-br from-[#00ffd5]/[0.06] via-[#0f0f1a] to-[#7c3aed]/[0.04] p-5 sm:p-6 shadow-lg shadow-black/20">
        {/* Header row */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00ffd5]/10 text-[#00ffd5]">
            <TrendingUp size={16} />
          </div>
          <h2 className="text-sm font-semibold text-[#e4e4e7]">
            Resumo Executivo
          </h2>
        </div>

        {/* Summary text */}
        <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#e4e4e7]">
          {summary}
        </p>
      </div>
    </div>
  );
}

// ─── Section 2: Matched Skills ────────────────────────────────────────────────

function SkillCard({ skill }: { skill: MatchedSkill }) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setOpen((p) => !p)}
      className="group text-left w-full rounded-xl border border-[#00ff88]/15 bg-[#00ff88]/[0.03] px-3 py-2.5 sm:px-4 sm:py-3 hover:border-[#00ff88]/30 hover:bg-[#00ff88]/[0.06] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd5]/50 min-h-[44px]"
      aria-expanded={open}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#00ff88]/10">
          <CheckCircle size={13} className="text-[#00ff88]" />
        </div>
        <span className="text-sm font-medium text-[#e4e4e7] group-hover:text-white transition-colors">
          {skill.skill}
        </span>
      </div>
      {open && skill.context && (
        <p className="mt-2 text-xs text-[#9ca3af] leading-relaxed pl-[34px] border-l-2 border-[#00ff88]/10 ml-3">
          {skill.context}
        </p>
      )}
    </button>
  );
}

function MatchedSkillsSection({ skills, mounted }: { skills: MatchedSkill[]; mounted: boolean }) {
  if (skills.length === 0) return null;

  return (
    <Section
      title="Skills Identificadas"
      icon={<ShieldCheck size={18} />}
      count={skills.length}
      delay={100}
      mounted={mounted}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {skills.map((skill, i) => (
          <SkillCard key={`skill-${i}`} skill={skill} />
        ))}
      </div>
      <p className="mt-4 text-xs text-[#8b8fa3]">
        Clique em uma skill para ver o contexto em que foi encontrada no currículo.
      </p>
    </Section>
  );
}

// ─── Section 3: Gaps ──────────────────────────────────────────────────────────

const GAP_CONFIG: Record<
  Gap['priority'],
  { icon: React.ReactNode; badgeVariant: 'error' | 'warning' | 'default'; color: string }
> = {
  Crítico: {
    icon: <AlertTriangle size={14} />,
    badgeVariant: 'error',
    color: '#ff4757',
  },
  Importante: {
    icon: <AlertCircle size={14} />,
    badgeVariant: 'warning',
    color: '#ffd32a',
  },
  Desejável: {
    icon: <Info size={14} />,
    badgeVariant: 'default',
    color: '#9ca3af',
  },
};

function GapsSection({ gaps, mounted }: { gaps: Gap[]; mounted: boolean }) {
  if (gaps.length === 0) return null;

  const ordered: Gap['priority'][] = ['Crítico', 'Importante', 'Desejável'];
  const grouped = ordered
    .map((p) => ({ priority: p, items: gaps.filter((g) => g.priority === p) }))
    .filter((g) => g.items.length > 0);

  return (
    <Section
      title="Lacunas Identificadas"
      icon={<AlertTriangle size={18} />}
      count={gaps.length}
      delay={200}
      mounted={mounted}
    >
      <div className="flex flex-col gap-6">
        {grouped.map(({ priority, items }) => {
          const config = GAP_CONFIG[priority];
          return (
            <div key={priority}>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <p className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af]">
                  {priority} ({items.length})
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((gap, i) => (
                  <div
                    key={`gap-${priority}-${i}`}
                    className="flex items-start gap-2.5 sm:gap-3 rounded-xl border border-white/[0.04] bg-[#0d1117]/80 px-3 py-2.5 sm:px-4 sm:py-3"
                  >
                    <div
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${config.color}15`, color: config.color }}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-[#e4e4e7]">{gap.skill}</span>
                        <Badge variant={config.badgeVariant}>{priority}</Badge>
                      </div>
                      <p className="text-xs text-[#9ca3af] leading-relaxed">{gap.reason}</p>
                      {gap.rewriteSuggestion && (
                        <details className="mt-3 group rounded-lg border border-white/[0.06] overflow-hidden">
                          <summary className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#00ffd5] cursor-pointer hover:bg-white/[0.02] transition-colors list-none [&::-webkit-details-marker]:hidden select-none">
                            {gap.rewriteSuggestion.type === 'rewrite' ? (
                              <span className="flex items-center gap-1.5">
                                <Pencil size={12} />
                                Sugestão de reescrita
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <BookOpen size={12} />
                                Plano de ação
                              </span>
                            )}
                            <ChevronDown size={12} className="ml-auto transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="border-t border-white/[0.06] bg-[#0d0d18] p-3 sm:p-4 overflow-hidden break-words">
                            {gap.rewriteSuggestion.type === 'rewrite' ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="rounded-lg border border-white/[0.06] bg-[#141420] p-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#ff4757]/70 mb-2">Antes</p>
                                    <p className="text-xs text-[#9ca3af] leading-relaxed">{gap.rewriteSuggestion.before}</p>
                                  </div>
                                  <div className="rounded-lg border border-[#00ffd5]/20 bg-[#141420] p-3">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00ffd5]/70">Sugerido</p>
                                      {gap.rewriteSuggestion.after && (
                                        <CopyButton
                                          text={gap.rewriteSuggestion.after}
                                          ariaLabel={`Copiar sugestão de reescrita para ${gap.skill}`}
                                        />
                                      )}
                                    </div>
                                    <p className="text-xs text-[#e4e4e7] leading-relaxed">{gap.rewriteSuggestion.after}</p>
                                  </div>
                                </div>
                                {gap.rewriteSuggestion.keywords && gap.rewriteSuggestion.keywords.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[10px] text-[#8b8fa3]">Keywords incorporadas:</span>
                                    {gap.rewriteSuggestion.keywords.map((kw, j) => (
                                      <span key={j} className="rounded-md bg-[#00ffd5]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#00ffd5]">{kw}</span>
                                    ))}
                                  </div>
                                )}
                                <p className="text-[10px] text-[#8b8fa3] leading-relaxed">
                                  Esta sugestão reformula o texto existente. Não adiciona experiências fictícias.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {gap.rewriteSuggestion.resource && (
                                  <div className="flex items-start gap-2">
                                    <BookOpen size={13} className="shrink-0 text-[#00ffd5] mt-0.5" />
                                    <div>
                                      <p className="text-xs font-medium text-[#e4e4e7]">{gap.rewriteSuggestion.resource}</p>
                                      {gap.rewriteSuggestion.estimatedTime && (
                                        <p className="text-[11px] text-[#8b8fa3] flex items-center gap-1 mt-0.5">
                                          <Clock size={10} />
                                          Tempo estimado: {gap.rewriteSuggestion.estimatedTime}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                                {gap.rewriteSuggestion.suggestedText && (
                                  <div className="rounded-lg border border-[#00ffd5]/20 bg-[#141420] p-3">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#00ffd5]/60 flex-1">
                                        Após completar este estudo, considere adicionar ao currículo:
                                      </p>
                                      <CopyButton
                                        text={gap.rewriteSuggestion.suggestedText}
                                        ariaLabel={`Copiar texto sugerido para ${gap.skill}`}
                                      />
                                    </div>
                                    <p className="text-xs text-[#e4e4e7] leading-relaxed italic">&quot;{gap.rewriteSuggestion.suggestedText}&quot;</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

// ─── Section 4: Missing Keywords ──────────────────────────────────────────────

function MissingKeywordsSection({
  keywords,
  mounted,
}: {
  keywords: MissingKeyword[];
  mounted: boolean;
}) {
  if (keywords.length === 0) return null;

  return (
    <Section
      title="Palavras-chave Ausentes"
      icon={<Tag size={18} />}
      count={keywords.length}
      delay={300}
      mounted={mounted}
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {keywords.map((kw, i) => (
          <span
            key={`kwbadge-${i}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#7c3aed]/20 bg-[#7c3aed]/5 px-3 py-1.5 text-xs font-medium text-[#a78bfa]"
          >
            <Tag size={11} className="shrink-0" />
            {kw.keyword}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {keywords.map((kw, i) =>
          kw.suggestion ? (
            <div
              key={`kwsug-${i}`}
              className="flex items-start gap-3 rounded-xl bg-[#0d1117]/60 px-4 py-2.5"
            >
              <TrendingUp size={13} className="shrink-0 text-[#7c3aed] mt-0.5" />
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                <span className="font-medium text-[#e4e4e7]">{kw.keyword}:</span> {kw.suggestion}
              </p>
            </div>
          ) : null,
        )}
      </div>
    </Section>
  );
}

// ─── Section 5: Experience Analysis ──────────────────────────────────────────

function ExperienceSection({
  experience,
  mounted,
}: {
  experience: AnalysisResult['experienceAnalysis'];
  mounted: boolean;
}) {
  const { required, found, gap, certifications } = experience;

  return (
    <Section title="Análise de Experiência" icon={<Award size={18} />} delay={400} mounted={mounted}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="rounded-xl border border-white/[0.04] bg-[#0d1117]/80 p-3 sm:p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#ff4757]">
            Exigido pela Vaga
          </p>
          <p className="text-sm text-[#e4e4e7] leading-relaxed">{required}</p>
        </div>
        <div className="rounded-xl border border-white/[0.04] bg-[#0d1117]/80 p-3 sm:p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#00ff88]">
            Encontrado no Currículo
          </p>
          <p className="text-sm text-[#e4e4e7] leading-relaxed">{found}</p>
        </div>
      </div>

      {gap && (
        <div className="mb-4 rounded-xl border border-[#ffd32a]/15 bg-[#ffd32a]/[0.03] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#ffd32a] mb-1">
            Lacuna Identificada
          </p>
          <p className="text-sm text-[#e4e4e7] leading-relaxed">{gap}</p>
        </div>
      )}

      <div>
        <p className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9ca3af]">
          <Award size={12} />
          Certificações
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { label: 'Exigidas', items: certifications.required, variant: 'default' as const },
            { label: 'Encontradas', items: certifications.found, variant: 'success' as const },
            { label: 'Faltando', items: certifications.missing, variant: 'error' as const },
          ].map(({ label, items, variant }) => (
            <div key={label} className="rounded-xl border border-white/[0.04] bg-[#0d1117]/80 p-2.5 sm:p-3">
              <p className="text-xs font-medium text-[#9ca3af] mb-2">{label}</p>
              {items.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {items.map((c, i) => (
                    <Badge key={i} variant={variant}>{c}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8b8fa3]">Nenhuma</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── Section 6: Study Plan ────────────────────────────────────────────────────

const RESOURCE_TYPE_VARIANT: Record<StudyPlanItem['resourceType'], 'info' | 'warning' | 'success' | 'default'> = {
  Curso: 'info',
  Certificação: 'warning',
  'Projeto Prático': 'success',
  Leitura: 'default',
  Laboratório: 'success',
};

const PRIORITY_VARIANT: Record<StudyPlanItem['priority'], 'error' | 'warning' | 'info'> = {
  Alta: 'error',
  Média: 'warning',
  Baixa: 'info',
};

function StudyPlanSection({ plan, mounted }: { plan: StudyPlanItem[]; mounted: boolean }) {
  if (plan.length === 0) return null;

  const sorted = [...plan].sort((a, b) => a.order - b.order);

  return (
    <Section title="Plano de Estudos" icon={<BookOpen size={18} />} delay={500} mounted={mounted}>
      <div className="mb-4 rounded-lg border border-white/[0.04] bg-[#0d0d18] px-3 py-2">
        <p className="text-[11px] text-[#8b8fa3] leading-relaxed">
          Os links abaixo abrem a página de busca da plataforma quando a URL específica
          do curso pode estar desatualizada. Se algum link direto não funcionar,
          procure pelo nome do recurso na própria plataforma.
        </p>
      </div>
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-[13px] sm:left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-[#00ffd5]/30 via-[#00ffd5]/10 to-transparent" />

        <div className="flex flex-col gap-4">
          {sorted.map((item) => (
            <div key={item.order} className="flex gap-3 sm:gap-4 relative">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border border-[#00ffd5]/30 bg-[#00ffd5]/10 text-xs font-bold text-[#00ffd5] z-10">
                {item.order}
              </div>

              <div className="flex-1 min-w-0 rounded-xl border border-white/[0.04] bg-[#0d1117]/80 p-3 sm:p-4">
                <div className="flex flex-wrap items-start gap-1.5 sm:gap-2 mb-2">
                  <h3 className="flex-1 text-sm font-semibold text-[#e4e4e7]">{item.topic}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant={RESOURCE_TYPE_VARIANT[item.resourceType]}>
                      {item.resourceType}
                    </Badge>
                    <Badge variant={PRIORITY_VARIANT[item.priority]}>
                      {item.priority}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-[#9ca3af] leading-relaxed mb-3">{item.description}</p>

                <div className="flex items-center gap-1.5 mb-3 text-xs text-[#8b8fa3]">
                  <Clock size={12} />
                  <span>{item.estimatedTime}</span>
                </div>

                {item.resources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {item.resources.map((resource, i) => {
                      // Normalize the AI-provided URL. If it looks hallucinated,
                      // we get back a safe search URL on a whitelisted platform.
                      const safe = normalizeStudyLink(
                        resource.url,
                        `${resource.name} ${item.topic}`.trim(),
                      );
                      return (
                        <a
                          key={i}
                          href={safe.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={
                            safe.isSearchFallback
                              ? `Abrir busca por "${resource.name}" em ${safe.platformDomain ?? 'plataforma'}`
                              : `Abrir ${resource.name} em ${resource.platform}`
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-[#00ffd5]/15 bg-[#00ffd5]/[0.03] px-2.5 py-1 text-xs text-[#00ffd5] hover:border-[#00ffd5]/30 hover:bg-[#00ffd5]/[0.06] transition-all duration-150"
                        >
                          {safe.isSearchFallback ? `Buscar em ${resource.platform}` : resource.name}
                          <span className="text-[#8b8fa3] text-[10px]">
                            ({safe.isSearchFallback ? resource.name : resource.platform})
                          </span>
                          <ExternalLink size={10} className="opacity-50" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function AnalysisResult({ result, providerLabel, autoScroll = true }: AnalysisResultProps) {
  const mounted = useMounted();

  const topRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (autoScroll) {
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [autoScroll]);

  const disclaimerText = providerLabel
    ? getAnalysisDisclaimerWithProvider(providerLabel)
    : ANALYSIS_DISCLAIMER;

  return (
    <div ref={topRef} className="flex flex-col gap-6">
      {/* Executive Summary (only when present; parser guarantees it, but we guard
          against malformed cached data from before this feature existed) */}
      {result.executiveSummary && result.executiveSummary.trim().length > 0 && (
        <ExecutiveSummarySection summary={result.executiveSummary} mounted={mounted} />
      )}

      {/* Score */}
      <ScoreSection
        score={result.score}
        classification={result.classification}
        matchCount={result.matchedSkills.length}
        gapCount={result.gaps.length}
        mounted={mounted}
      />

      {/* Skills */}
      <MatchedSkillsSection skills={result.matchedSkills} mounted={mounted} />

      {/* Gaps */}
      <GapsSection gaps={result.gaps} mounted={mounted} />

      {/* Keywords */}
      <MissingKeywordsSection keywords={result.missingKeywords} mounted={mounted} />

      {/* Experience */}
      <ExperienceSection experience={result.experienceAnalysis} mounted={mounted} />

      {/* Study Plan */}
      <StudyPlanSection plan={result.studyPlan} mounted={mounted} />

      {/* Disclaimer + Export: single instance at the bottom */}
      <div
        style={{
          transitionDelay: '600ms',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#1a1a2e] to-[#161625] p-4 sm:p-6 shadow-lg shadow-black/20">
          {/* Disclaimer */}
          <div className="rounded-xl border border-[#ffd32a]/10 bg-[#ffd32a]/[0.02] px-3 py-2.5 sm:px-4 sm:py-3 mb-4 sm:mb-5">
            <p className="text-[11px] text-[#ffd32a]/70 leading-relaxed">{disclaimerText}</p>
          </div>

          {/* Export button */}
          <div className="flex justify-center">
            <PdfExportButton result={result} providerLabel={providerLabel} />
          </div>
        </div>
      </div>
    </div>
  );
}
