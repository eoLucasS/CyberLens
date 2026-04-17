'use client';

import { useEffect, useState, use, useCallback } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Clock,
  FileText,
  History,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { AnalysisResult as AnalysisResultView } from '@/components/analysis/AnalysisResult';
import { getHistoryEntry, removeFromHistory } from '@/lib/history/store';
import type { AnalysisHistoryEntry } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatFullDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'data desconhecida';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return 'data desconhecida';
  }
}

export default function HistoryEntryPage({ params }: PageProps) {
  const { id } = use(params);

  const [hydrated, setHydrated] = useState(false);
  const [entry, setEntry] = useState<AnalysisHistoryEntry | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const found = getHistoryEntry(id);
    setEntry(found);
  }, [id]);

  const handleRemove = useCallback(() => {
    removeFromHistory(id);
    setEntry(null);
    setRemoved(true);
  }, [id]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Spinner size="lg" />
      </div>
    );
  }

  if (removed) {
    return (
      <div className="mx-auto w-full max-w-[800px] px-4 py-12 sm:px-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ff88]/10 text-[#00ff88]">
          <Trash2 size={22} />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Entrada removida
        </h1>
        <p className="text-sm text-[#9ca3af] mb-6">
          A análise foi apagada do seu histórico local.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/historico"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#141420] px-5 py-2.5 text-sm text-[#e4e4e7] hover:border-[#00ffd5]/20 transition-colors"
          >
            <ArrowLeft size={14} />
            Voltar ao histórico
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00ffd5] px-5 py-2.5 text-sm font-semibold text-[#0a0a0f] hover:bg-[#00e6c0] transition-colors"
          >
            <Sparkles size={14} />
            Nova análise
          </Link>
        </div>
      </div>
    );
  }

  if (!entry) {
    // Use Next notFound helper to render the 404 page consistently
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/historico"
        className="inline-flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#e4e4e7] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Voltar ao histórico
      </Link>

      {/* Context banner */}
      <div className="mb-6 rounded-2xl border border-white/[0.06] bg-[#141420] p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00ffd5]/10 text-[#00ffd5]">
              <History size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#00ffd5] mb-0.5">
                Análise salva
              </p>
              <h1 className="text-sm sm:text-base font-semibold text-[#e4e4e7] flex items-center gap-1.5 break-words">
                <Briefcase size={13} className="shrink-0 text-[#9ca3af]" />
                {entry.jobTitle}
              </h1>
              {entry.jobCompany && (
                <p className="text-xs text-[#8b8fa3] truncate">{entry.jobCompany}</p>
              )}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6b7280]">
                <span className="inline-flex items-center gap-1">
                  <FileText size={11} />
                  {entry.resumeFileName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} />
                  <time dateTime={entry.savedAt}>{formatFullDate(entry.savedAt)}</time>
                </span>
                {entry.provider && <span>· {entry.provider}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!confirmRemove ? (
              <button
                type="button"
                onClick={() => setConfirmRemove(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ff4757]/15 bg-[#ff4757]/[0.04] px-3 py-2 text-xs text-[#ff4757] hover:bg-[#ff4757]/[0.08] transition-colors"
                aria-label="Remover esta análise"
              >
                <Trash2 size={12} />
                Remover
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-xl bg-[#ff4757] px-3 py-2 text-xs font-semibold text-white hover:bg-[#ff4757]/90 transition-colors"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRemove(false)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs text-[#9ca3af] hover:text-[#e4e4e7] transition-colors"
                >
                  Cancelar
                </button>
              </>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#00ffd5] px-3 py-2 text-xs font-semibold text-[#0a0a0f] hover:bg-[#00e6c0] transition-colors"
            >
              Nova análise
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Full analysis view */}
      <AnalysisResultView
        result={entry.result}
        providerLabel={entry.provider}
        autoScroll={false}
      />
    </div>
  );
}
