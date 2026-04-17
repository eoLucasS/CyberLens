'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  History,
  Settings,
  Trash2,
  Info,
  Sparkles,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { HistoryCard } from '@/components/history/HistoryCard';
import { getHistory, clearHistory, removeFromHistory, MAX_HISTORY_ENTRIES } from '@/lib/history/store';
import { getStorageItem, STORAGE_KEYS } from '@/lib/utils/storage';
import type { AnalysisHistoryEntry, UserSettings } from '@/types';

export default function HistoryListPage() {
  const [hydrated, setHydrated] = useState(false);
  const [entries, setEntries] = useState<AnalysisHistoryEntry[]>([]);
  const [saveEnabled, setSaveEnabled] = useState<boolean>(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setEntries(getHistory());
    const settings = getStorageItem<UserSettings | null>(STORAGE_KEYS.SETTINGS, null);
    setSaveEnabled(settings?.saveHistory === true);
  }, []);

  const handleRemove = useCallback((id: string) => {
    removeFromHistory(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    clearHistory();
    setEntries([]);
    setConfirmClearAll(false);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:py-10 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[#9ca3af] hover:text-[#e4e4e7] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Voltar ao início
      </Link>

      {/* Header */}
      <header className="mb-8 sm:mb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ffd5]/10 text-[#00ffd5] text-xs font-medium mb-3">
              <History size={14} />
              Histórico local
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Suas análises salvas
            </h1>
            <p className="mt-2 text-sm sm:text-[15px] text-[#9ca3af] leading-relaxed max-w-2xl">
              Até {MAX_HISTORY_ENTRIES} análises guardadas no seu próprio navegador. Nada é enviado a
              servidores. Ao atingir o limite, a mais antiga é removida automaticamente.
            </p>
          </div>

          {entries.length > 0 && (
            <div className="shrink-0">
              {!confirmClearAll ? (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#ff4757]/20 bg-[#ff4757]/[0.04] px-4 py-2 text-xs font-medium text-[#ff4757] hover:bg-[#ff4757]/[0.08] transition-colors"
                >
                  <Trash2 size={13} />
                  Limpar tudo
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="rounded-xl bg-[#ff4757] px-3 py-2 text-xs font-semibold text-white hover:bg-[#ff4757]/90 transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="rounded-xl border border-white/10 px-3 py-2 text-xs text-[#9ca3af] hover:text-[#e4e4e7] transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* State: history disabled banner */}
      {!saveEnabled && (
        <div className="mb-6 rounded-2xl border border-[#ffd32a]/20 bg-[#ffd32a]/[0.04] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Info size={18} className="shrink-0 text-[#ffd32a] mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#e4e4e7]">
                O salvamento automático está desativado
              </p>
              <p className="mt-1 text-xs text-[#9ca3af] leading-relaxed">
                Ative em Configurações para salvar suas próximas análises aqui.
                {entries.length > 0 && ' As entradas abaixo já existentes continuam disponíveis.'}
              </p>
              <Link
                href="/configuracoes"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#ffd32a]/10 border border-[#ffd32a]/20 px-3 py-1.5 text-[11px] font-medium text-[#ffd32a] hover:bg-[#ffd32a]/15 transition-colors"
              >
                <Settings size={12} />
                Ativar em Configurações
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* State: empty (no entries) */}
      {entries.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-[#141420] p-8 sm:p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00ffd5]/10 text-[#00ffd5]">
            <History size={24} />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-[#e4e4e7] mb-2">
            Nenhuma análise salva ainda
          </h2>
          <p className="mx-auto max-w-md text-sm text-[#9ca3af] leading-relaxed">
            {saveEnabled
              ? 'Suas próximas análises vão aparecer aqui automaticamente.'
              : 'Ative o salvamento nas Configurações para começar a guardar suas análises.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00ffd5] px-5 py-2.5 text-sm font-semibold text-[#0a0a0f] hover:bg-[#00e6c0] transition-colors"
            >
              <Sparkles size={14} />
              Fazer uma análise
            </Link>
            {!saveEnabled && (
              <Link
                href="/configuracoes"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#141420] px-5 py-2.5 text-sm text-[#e4e4e7] hover:border-[#00ffd5]/20 transition-colors"
              >
                <Settings size={14} />
                Configurações
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Near-limit banner */}
          {entries.length >= MAX_HISTORY_ENTRIES && (
            <div className="mb-4 rounded-xl border border-[#00ffd5]/15 bg-[#00ffd5]/[0.04] px-4 py-3">
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Histórico cheio ({entries.length}/{MAX_HISTORY_ENTRIES}). A próxima análise
                substituirá a entrada mais antiga automaticamente.
              </p>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {entries.map((entry) => (
              <HistoryCard key={entry.id} entry={entry} onRemove={handleRemove} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
