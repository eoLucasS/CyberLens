'use client';

import Link from 'next/link';
import { FileText, Briefcase, Clock, Trash2, ArrowRight } from 'lucide-react';
import type { AnalysisHistoryEntry } from '@/types';

interface HistoryCardProps {
  entry: AnalysisHistoryEntry;
  onRemove: (id: string) => void;
}

function scoreColor(score: number): string {
  if (score >= 85) return '#00ffd5';
  if (score >= 70) return '#00ff88';
  if (score >= 40) return '#ffd32a';
  return '#ff4757';
}

function formatRelativeDate(iso: string): string {
  try {
    const saved = new Date(iso);
    if (Number.isNaN(saved.getTime())) return 'data desconhecida';

    const now = new Date();
    const diffMs = now.getTime() - saved.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffH = Math.floor(diffMs / 3_600_000);
    const diffD = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    if (diffH < 24) return `há ${diffH} ${diffH === 1 ? 'hora' : 'horas'}`;
    if (diffD === 1) return 'ontem';
    if (diffD < 7) return `há ${diffD} dias`;

    const day = String(saved.getDate()).padStart(2, '0');
    const month = String(saved.getMonth() + 1).padStart(2, '0');
    const year = saved.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return 'data desconhecida';
  }
}

export function HistoryCard({ entry, onRemove }: HistoryCardProps) {
  const color = scoreColor(entry.score);

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(entry.id);
  };

  return (
    <article
      className="group relative rounded-2xl border border-white/[0.06] bg-[#141420] transition-all duration-200 hover:border-[#00ffd5]/20 hover:bg-[#161626]"
    >
      <Link
        href={`/historico/${entry.id}`}
        className="block p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd5]/40 focus-visible:rounded-2xl"
        aria-label={`Abrir análise salva: ${entry.jobTitle}`}
      >
        {/* Top row: score + classification */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm tabular-nums"
              style={{
                backgroundColor: `${color}15`,
                color,
                border: `1px solid ${color}30`,
              }}
              aria-hidden="true"
            >
              {entry.score}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#e4e4e7]" style={{ color }}>
                {entry.classification}
              </p>
              <p className="text-[10px] text-[#6b7280] tabular-nums">{entry.score}% de aderência</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveClick}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6b7280] hover:text-[#ff4757] hover:bg-[#ff4757]/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4757]/40"
            aria-label={`Remover análise: ${entry.jobTitle}`}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Job title + company */}
        <div className="mb-2.5">
          <div className="flex items-start gap-2">
            <Briefcase size={13} className="shrink-0 text-[#9ca3af] mt-0.5" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[#e4e4e7] line-clamp-2 break-words">
                {entry.jobTitle}
              </h3>
              {entry.jobCompany && (
                <p className="text-[11px] text-[#8b8fa3] mt-0.5 truncate">{entry.jobCompany}</p>
              )}
            </div>
          </div>
        </div>

        {/* Resume file */}
        <div className="flex items-center gap-2 mb-3">
          <FileText size={12} className="shrink-0 text-[#6b7280]" />
          <p className="text-[11px] text-[#9ca3af] truncate">{entry.resumeFileName}</p>
        </div>

        {/* Bottom row: date + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          <p className="text-[11px] text-[#6b7280] inline-flex items-center gap-1">
            <Clock size={11} />
            <time dateTime={entry.savedAt}>{formatRelativeDate(entry.savedAt)}</time>
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#00ffd5] group-hover:translate-x-0.5 transition-transform">
            Abrir
            <ArrowRight size={11} />
          </span>
        </div>
      </Link>
    </article>
  );
}
