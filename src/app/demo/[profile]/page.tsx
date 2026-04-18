'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileText,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { KeywordRadar } from '@/components/analysis/KeywordRadar';
import { AnalysisResult as AnalysisResultView } from '@/components/analysis/AnalysisResult';
import { Spinner } from '@/components/ui/Spinner';
import { sanitizeAnalysisResult } from '@/lib/analysis/validators';
import type { AnalysisResult as AnalysisResultType } from '@/types';

const VALID_SLUGS = ['analista-dados', 'analista-cyber', 'dev-fullstack'] as const;
type ValidSlug = (typeof VALID_SLUGS)[number];

interface DemoProfile {
  profile: {
    slug: string;
    title: string;
    subtitle: string;
    narrative: string;
  };
  resume: {
    fileName: string;
    text: string;
  };
  job: {
    title: string;
    company: string;
    location: string;
    text: string;
  };
  keywordRadar: {
    matched: Array<{ keyword: string; found: boolean; frequency: number }>;
    missing: Array<{ keyword: string; found: boolean; frequency: number }>;
    matchPercentage: number;
    totalKeywords: number;
  };
  analysis: AnalysisResultType;
}

interface PageProps {
  params: Promise<{ profile: string }>;
}

export default function DemoViewerPage({ params }: PageProps) {
  const { profile: slug } = use(params);

  if (!VALID_SLUGS.includes(slug as ValidSlug)) {
    notFound();
  }

  const [data, setData] = useState<DemoProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/demo/profiles/${slug}.json`, { cache: 'force-cache' })
      .then((r) => {
        if (!r.ok) throw new Error('Demo indisponível');
        return r.json();
      })
      .then((json: DemoProfile) => {
        if (cancelled) return;
        // Sanitize the static analysis payload defensively: guards against
        // accidental drift between the demo JSON files and the AnalysisResult
        // schema, and keeps the rendering path identical to real analyses.
        setData({ ...json, analysis: sanitizeAnalysisResult(json.analysis) });
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar a demonstração.');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-[#ff4757] mb-3">{error}</p>
          <Link href="/demo" className="text-sm text-[#00ffd5] hover:underline">
            Voltar à seleção de perfis
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-[#9ca3af]">Carregando demonstração...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      {/* Demo persistent banner (sticky visual) */}
      <div className="mb-6 rounded-2xl border border-[#7c3aed]/30 bg-gradient-to-r from-[#7c3aed]/[0.08] via-[#00ffd5]/[0.04] to-[#7c3aed]/[0.08] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7c3aed]/15 text-[#a855f7]">
            <Sparkles size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#e4e4e7]">Você está no modo demonstração</p>
            <p className="mt-0.5 text-xs sm:text-[13px] text-[#9ca3af] leading-relaxed">
              Esta análise foi gerada com dados de exemplo. Para analisar seu currículo real, clique
              no botão ao lado.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl bg-[#00ffd5] text-[#0a0a0f] font-semibold text-sm hover:bg-[#00e6c0] transition-colors"
          >
            Analisar meu currículo
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Navigation row */}
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <Link
          href="/demo"
          className="inline-flex items-center gap-1.5 text-[#9ca3af] hover:text-[#e4e4e7] transition-colors"
        >
          <ArrowLeft size={14} />
          Outros perfis
        </Link>
      </div>

      {/* Profile header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#00ffd5] mb-2">
          {data.profile.subtitle}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {data.profile.title}
        </h1>
        <p className="mt-2 text-sm sm:text-[15px] text-[#9ca3af] leading-relaxed max-w-2xl">
          {data.profile.narrative}
        </p>
      </div>

      {/* Resume + Job panels (collapsible). items-start prevents the other panel from stretching when one expands. */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <CollapsiblePanel
          icon={<FileText size={16} />}
          title="Currículo de exemplo"
          subtitle={data.resume.fileName}
          open={resumeOpen}
          onToggle={() => setResumeOpen((p) => !p)}
          content={data.resume.text}
        />
        <CollapsiblePanel
          icon={<Briefcase size={16} />}
          title="Vaga de exemplo"
          subtitle={`${data.job.title} · ${data.job.company}`}
          open={jobOpen}
          onToggle={() => setJobOpen((p) => !p)}
          content={data.job.text}
        />
      </div>

      {/* Keyword radar */}
      <div className="mb-6">
        <KeywordRadar analysis={data.keywordRadar} />
      </div>

      {/* Full analysis result */}
      <AnalysisResultView result={data.analysis} autoScroll={false} />

      {/* Final CTA */}
      <div className="mt-10 rounded-2xl border border-[#00ffd5]/20 bg-gradient-to-br from-[#00ffd5]/[0.06] via-[#0f0f1a] to-[#7c3aed]/[0.04] p-6 sm:p-8 text-center">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Gostou do que viu?</h2>
        <p className="text-sm text-[#9ca3af] mb-5 max-w-md mx-auto leading-relaxed">
          Agora é sua vez. Configure um provedor de IA em menos de 1 minuto e analise seu próprio
          currículo contra a vaga dos seus sonhos.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00ffd5] text-[#0a0a0f] font-semibold text-sm hover:bg-[#00e6c0] transition-colors"
        >
          Começar análise real
          <ArrowRight size={14} />
        </Link>
        <p className="mt-4 text-[11px] text-[#6b7280]">
          Hugging Face oferece créditos gratuitos para começar sem custo.
        </p>
      </div>
    </div>
  );
}

interface CollapsiblePanelProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  content: string;
  open: boolean;
  onToggle: () => void;
}

function CollapsiblePanel({
  icon,
  title,
  subtitle,
  content,
  open,
  onToggle,
}: CollapsiblePanelProps) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#141420] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#00ffd5]/10 text-[#00ffd5]">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#e4e4e7]">{title}</p>
          <p className="text-[11px] text-[#8b8fa3] truncate">{subtitle}</p>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-[#9ca3af] shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-[#9ca3af] shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-white/[0.06] bg-[#0d0d18] p-4 max-h-64 overflow-y-auto">
          <pre className="font-mono text-[11px] text-[#9ca3af] whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}
