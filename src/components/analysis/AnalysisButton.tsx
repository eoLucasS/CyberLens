'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalysisButtonProps {
  onAnalyze: () => void;
  disabled: boolean;
  loading: boolean;
  loadingMessage: string;
  hasApiKey: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AnalysisButton({
  onAnalyze,
  disabled,
  loading,
  loadingMessage,
  hasApiKey,
}: AnalysisButtonProps) {
  // Show the "configure API key first" inline message when the user presses
  // Analyze without having an API key configured
  const [showApiKeyHint, setShowApiKeyHint] = useState(false);

  const handleClick = () => {
    if (!hasApiKey) {
      setShowApiKeyHint(true);
      return;
    }
    setShowApiKeyHint(false);
    onAnalyze();
  };

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Card className="p-5 overflow-hidden">
        {/* Pulsing cyberpunk-style background overlay */}
        <div className="relative rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00ffd5]/10 via-[#7c3aed]/10 to-[#00ffd5]/10 animate-pulse" />

          <div className="relative flex flex-col items-center gap-4 py-6 px-4">
            {/* Spinner with glow */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#00ffd5]/20 blur-xl animate-pulse" />
              <Spinner size="lg" />
            </div>

            {/* Rotating loading message */}
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-sm font-medium text-[#00ffd5]">
                {loadingMessage}
              </p>
              {/* Animated dots */}
              <span className="flex gap-1 mt-1" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#00ffd5]/60"
                    style={{
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </span>
            </div>

            {/* Progress flavour text */}
            <p className="text-xs text-[#8b8fa3] text-center max-w-xs">
              A análise pode levar alguns segundos dependendo do tamanho do
              currículo e da velocidade da API.
            </p>
          </div>
        </div>

        {/* Inline keyframe definition: avoids adding a global CSS rule */}
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
            40%            { transform: translateY(-6px); opacity: 1; }
          }
        `}</style>
      </Card>
    );
  }

  // ── Default / idle state ─────────────────────────────────────────────────

  return (
    <Card className="p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#00ffd5]">
        Passo 3: Analisar
      </p>

      <p className="mb-5 text-sm text-[#9ca3af]">
        Com o currículo e a descrição da vaga prontos, inicie a análise de
        aderência com inteligência artificial.
      </p>

      {/* Primary CTA button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleClick}
        disabled={disabled && hasApiKey}
        className="w-full"
        aria-label="Analisar aderência do currículo à vaga"
      >
        <Sparkles size={18} />
        Analisar Aderência
      </Button>

      {/* Inline "configure API key first" hint: only shown after a failed attempt */}
      {showApiKeyHint && !hasApiKey && (
        <p className="mt-3 text-sm text-[#ffd32a]" role="alert">
          Configure sua API key primeiro em{' '}
          <Link
            href="/configuracoes"
            className="text-[#00ffd5] underline underline-offset-2 hover:text-[#00ffd5]/80 transition-colors"
          >
            Configurações
          </Link>
          .
        </p>
      )}

      {/* Passive hint when disabled because upstream steps aren't done */}
      {disabled && hasApiKey && (
        <p className="mt-3 text-xs text-[#8b8fa3]">
          Complete o envio do currículo e a descrição da vaga para habilitar a
          análise.
        </p>
      )}
    </Card>
  );
}
