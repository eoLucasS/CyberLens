'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FileText, Briefcase, Clock, Trash2, ArrowRight, Check, X, Pencil } from 'lucide-react';
import { updateHistoryEntryTitle, MAX_EDITABLE_TITLE_LENGTH } from '@/lib/history/store';
import type { AnalysisHistoryEntry } from '@/types';

interface HistoryCardProps {
  entry: AnalysisHistoryEntry;
  onRemove: (id: string) => void;
  onUpdate?: (updated: AnalysisHistoryEntry) => void;
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

export function HistoryCard({ entry, onRemove, onUpdate }: HistoryCardProps) {
  const color = scoreColor(entry.score);

  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(entry.jobTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(entry.id);
  };

  const handleStartEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDraftTitle(entry.jobTitle);
    setEditing(true);
  };

  const commitEdit = () => {
    const trimmed = draftTitle.trim();
    if (trimmed.length === 0 || trimmed === entry.jobTitle) {
      setEditing(false);
      setDraftTitle(entry.jobTitle);
      return;
    }
    const updated = updateHistoryEntryTitle(entry.id, trimmed, entry.jobCompany);
    setEditing(false);
    if (updated && onUpdate) {
      onUpdate(updated);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraftTitle(entry.jobTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    <article className="group relative rounded-2xl border border-white/[0.06] bg-[#141420] transition-all duration-200 hover:border-[#00ffd5]/20 hover:bg-[#161626]">
      {/* Top row: score + remove button (outside link to avoid nested interactive issues) */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
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
            <p className="text-xs font-medium" style={{ color }}>
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

      {/* Editable job title area (NOT a link, so it's clearly interactive) */}
      <div className="px-5">
        <div className="flex items-start gap-2">
          <Briefcase size={13} className="shrink-0 text-[#9ca3af] mt-1" />
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-1.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value.slice(0, MAX_EDITABLE_TITLE_LENGTH))}
                  onKeyDown={handleKeyDown}
                  onBlur={commitEdit}
                  maxLength={MAX_EDITABLE_TITLE_LENGTH}
                  className="flex-1 min-w-0 rounded-md border border-[#00ffd5]/30 bg-[#0d0d18] px-2 py-1 text-sm font-semibold text-[#e4e4e7] focus:outline-none focus:border-[#00ffd5]/60"
                  aria-label="Editar título da vaga"
                />
                <button
                  type="button"
                  onMouseDown={(e) => {
                    // Prevent blur (which would also commit) from firing first
                    e.preventDefault();
                    commitEdit();
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#00ffd5]/10 text-[#00ffd5] hover:bg-[#00ffd5]/20 transition-colors"
                  aria-label="Salvar título"
                >
                  <Check size={12} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    cancelEdit();
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#ff4757]/10 text-[#ff4757] hover:bg-[#ff4757]/20 transition-colors"
                  aria-label="Cancelar edição"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-1.5">
                <h3 className="text-sm font-semibold text-[#e4e4e7] line-clamp-2 break-words flex-1">
                  {entry.jobTitle}
                </h3>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#6b7280] hover:text-[#00ffd5] hover:bg-[#00ffd5]/5 transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd5]/40"
                  aria-label="Editar título da vaga"
                >
                  <Pencil size={11} />
                </button>
              </div>
            )}
            {!editing && entry.jobCompany && (
              <p className="text-[11px] text-[#8b8fa3] mt-0.5 truncate">{entry.jobCompany}</p>
            )}
          </div>
        </div>
      </div>

      {/* Resume file + date + open CTA (link wraps the bottom clickable area) */}
      <Link
        href={`/historico/${entry.id}`}
        className="block px-5 pt-2.5 pb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd5]/40 focus-visible:rounded-2xl"
        aria-label={`Abrir análise salva: ${entry.jobTitle}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <FileText size={12} className="shrink-0 text-[#6b7280]" />
          <p className="text-[11px] text-[#9ca3af] truncate">{entry.resumeFileName}</p>
        </div>

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
