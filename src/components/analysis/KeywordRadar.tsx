'use client';

import { useEffect, useState } from 'react';
import { Zap, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

interface KeywordRadarProps {
  analysis: {
    matched: Array<{ keyword: string; found: boolean; frequency: number }>;
    missing: Array<{ keyword: string; found: boolean; frequency: number }>;
    matchPercentage: number;
    totalKeywords: number;
  };
}

function getVerdict(pct: number): string {
  if (pct >= 80) return 'Excelente compatibilidade textual! A análise com IA confirmará se a experiência descrita é relevante ao contexto da vaga.';
  if (pct >= 60) return 'Boa compatibilidade! Seu currículo cobre a maioria dos termos da vaga. A análise com IA mostrará o contexto e sugerirá melhorias pontuais.';
  if (pct >= 30) return 'Seu currículo cobre parte dos requisitos. A análise com IA revelará quais gaps são mais críticos e como abordá-los.';
  return 'A análise com IA pode identificar experiências transferíveis que não aparecem como palavras-chave diretas.';
}

function getBarColor(pct: number): string {
  if (pct >= 70) return '#00ff88';
  if (pct >= 40) return '#ffd32a';
  return '#ff4757';
}

const MAX_VISIBLE_CHIPS = 8;

export function KeywordRadar({ analysis }: KeywordRadarProps) {
  const { matched, missing, matchPercentage, totalKeywords } = analysis;

  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [showAllMissing, setShowAllMissing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(matchPercentage), 100);
    return () => clearTimeout(timer);
  }, [matchPercentage]);

  const barColor = getBarColor(matchPercentage);
  const visibleMissing = showAllMissing ? missing : missing.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenCount = missing.length - MAX_VISIBLE_CHIPS;

  return (
    <div className="animate-[fadeSlideUp_0.5s_ease-out_both] rounded-2xl border border-white/[0.06] bg-[#141420] p-4 sm:p-5">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00ffd5]/10">
          <Zap className="h-4 w-4 text-[#00ffd5]" />
        </div>
        <h3 className="text-sm font-semibold text-white">Raio-X de Compatibilidade</h3>
        <span className="ml-auto rounded-md bg-[#00ffd5]/10 px-2 py-0.5 text-[10px] font-semibold text-[#00ffd5] uppercase tracking-wider">
          Instantâneo
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-1">
        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[#0d0d18]">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${animatedPercent}%`, backgroundColor: barColor }}
          />
        </div>
        <span className="min-w-[3ch] text-right text-sm font-bold tabular-nums" style={{ color: barColor }}>
          {animatedPercent}%
        </span>
      </div>

      <p className="mb-4 text-xs text-[#9ca3af]">
        {matched.length} de {totalKeywords} palavras-chave da vaga encontradas no seu currículo
      </p>

      {/* Keywords */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Found */}
        {matched.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#00ff88]" />
              <span className="text-xs font-medium text-[#00ff88]">Encontradas ({matched.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matched.map((m) => (
                <span
                  key={m.keyword}
                  className="inline-flex items-center gap-1 rounded-md border border-[#00ff88]/15 bg-[#00ff88]/5 px-2 py-1 text-[11px] text-[#00ff88]"
                >
                  <CheckCircle className="h-2.5 w-2.5 shrink-0" />
                  {m.keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing */}
        {missing.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-[#ffd32a]" />
              <span className="text-xs font-medium text-[#ffd32a]">Para melhorar ({missing.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleMissing.map((m) => (
                <span
                  key={m.keyword}
                  className="inline-flex items-center gap-1 rounded-md border border-[#ffd32a]/15 bg-[#ffd32a]/5 px-2 py-1 text-[11px] text-[#ffd32a]/80"
                >
                  {m.keyword}
                </span>
              ))}
            </div>
            {hiddenCount > 0 && !showAllMissing && (
              <button
                type="button"
                onClick={() => setShowAllMissing(true)}
                className="mt-2 flex items-center gap-1 text-[11px] text-[#9ca3af] hover:text-[#e4e4e7] transition-colors"
              >
                <ChevronDown className="h-3 w-3" />
                Mostrar mais {hiddenCount} termos
              </button>
            )}
          </div>
        )}
      </div>

      {/* Verdict */}
      <p className="text-xs italic text-[#8b8fa3] leading-relaxed">
        {getVerdict(matchPercentage)}
      </p>

      <p className="mt-3 text-center text-[10px] text-[#6b7280]">
        Este raio-X é instantâneo e gratuito. Para a análise completa, clique em Analisar abaixo.
      </p>
    </div>
  );
}
