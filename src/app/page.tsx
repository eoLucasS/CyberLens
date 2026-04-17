'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ResumeUpload } from '@/components/analysis/ResumeUpload';
import { JobDescriptionInput } from '@/components/analysis/JobDescriptionInput';
import { AnalysisButton } from '@/components/analysis/AnalysisButton';
import { AnalysisResult } from '@/components/analysis/AnalysisResult';
import { KeywordRadar } from '@/components/analysis/KeywordRadar';
import { useAnalysis } from '@/hooks/useAnalysis';
import { analyzeKeywords } from '@/lib/nlp/keywords';
import { cleanJobDescription } from '@/lib/nlp/cleaner';
import type { KeywordAnalysis } from '@/lib/nlp/keywords';
import { getStorageItem, STORAGE_KEYS } from '@/lib/utils/storage';
import { APP_NAME, APP_DESCRIPTION, STEP_TITLES } from '@/constants/ui';
import { AI_PROVIDERS } from '@/constants/providers';
import type { UserSettings } from '@/types';
import { Shield, FileText, Briefcase, Sparkles, BarChart3, KeyRound, ArrowRight, PlayCircle } from 'lucide-react';

const STEP_ICONS = [FileText, Briefcase, Sparkles, BarChart3];

export default function HomePage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [keywordPreview, setKeywordPreview] = useState<KeywordAnalysis | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>('');

  // Ref to scroll into view when the Raio-X appears after Step 2.
  const keywordRadarRef = useRef<HTMLElement | null>(null);

  const { state, result, error, loadingMessage, analyze, reset } = useAnalysis();

  // Smoothly scroll the Raio-X into view the first time it becomes visible.
  // Respects the user's reduced-motion preference.
  useEffect(() => {
    if (!keywordPreview || !keywordRadarRef.current) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

    // Small delay so the component's own fade-in animation starts first.
    const timer = setTimeout(() => {
      keywordRadarRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [keywordPreview]);

  const handleFileAccepted = useCallback((file: File | null, text: string) => {
    setResumeText(text);
    setResumeFileName(file?.name ?? 'Currículo em cache');
    setCurrentStep((prev) => Math.max(prev, 1));
  }, []);

  const handleJobSubmit = useCallback((text: string) => {
    setJobDescription(text);
    setCurrentStep((prev) => Math.max(prev, 2));
    if (resumeText) {
      const cleaned = cleanJobDescription(text);
      const preview = analyzeKeywords(cleaned, resumeText);
      setKeywordPreview(preview);
    }
  }, [resumeText]);

  const handleAnalyze = useCallback(async () => {
    await analyze(resumeText, jobDescription, { resumeFileName });
    setCurrentStep(3);
  }, [analyze, resumeText, jobDescription, resumeFileName]);

  const handleReset = useCallback(() => {
    reset();
    setResumeText('');
    setResumeFileName('');
    setJobDescription('');
    setCurrentStep(0);
    setKeywordPreview(null);
  }, [reset]);

  const [settings, setSettings] = useState<UserSettings | null>(null);

  // Read settings from localStorage after mount to keep state in sync with
  // any changes made on the settings page during the session.
  useEffect(() => {
    setSettings(getStorageItem<UserSettings | null>(STORAGE_KEYS.SETTINGS, null));
  }, []);

  const hasApiKey = Boolean(settings?.apiKey);
  const providerLabel =
    AI_PROVIDERS.find((p) => p.name === settings?.provider)?.label ?? undefined;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-8 sm:mb-12 text-center">
        <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-[#00ffd5]/20 bg-[#00ffd5]/5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-[#00ffd5]">
          <Shield className="h-4 w-4" />
          {APP_NAME}
        </div>
        <h1 className="mb-3 sm:mb-4 text-2xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Analise a aderência do seu currículo
          <br />
          <span className="text-[#00ffd5]">a qualquer vaga de emprego</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm sm:text-lg text-[#9ca3af]">{APP_DESCRIPTION}</p>

        {/* Hero CTA: demo link as secondary action */}
        <div className="mt-5 sm:mt-6 flex items-center justify-center">
          <Link
            href="/demo"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#141420] px-4 py-2.5 text-xs sm:text-sm font-medium text-[#e4e4e7] hover:border-[#00ffd5]/25 hover:text-white transition-all duration-200"
          >
            <PlayCircle size={16} className="text-[#00ffd5]" />
            Ver demonstração em 5 segundos
            <ArrowRight
              size={14}
              className="text-[#00ffd5] opacity-60 group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </div>
      </section>

      {/* Step indicators */}
      <nav className="mb-6 sm:mb-10" aria-label="Progresso da análise">
        <ol className="flex items-center justify-center gap-1 sm:gap-4">
          {STEP_TITLES.map((title, index) => {
            const Icon = STEP_ICONS[index];
            const isActive = index === currentStep && state !== 'success';
            const isComplete = index < currentStep || (index === 3 && state === 'success');
            return (
              <li key={title} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-all duration-300 sm:h-10 sm:w-10 ${
                    isComplete
                      ? 'border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]'
                      : isActive
                        ? 'border-[#00ffd5]/50 bg-[#00ffd5]/10 text-[#00ffd5]'
                        : 'border-white/10 bg-white/5 text-[#8b8fa3]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span
                  className={`hidden text-sm sm:inline ${
                    isComplete
                      ? 'text-[#00ff88]'
                      : isActive
                        ? 'text-[#00ffd5]'
                        : 'text-[#8b8fa3]'
                  }`}
                >
                  {title}
                </span>
                {index < STEP_TITLES.length - 1 && (
                  <div
                    className={`mx-1 hidden h-px w-8 sm:block lg:w-16 ${
                      index < currentStep ? 'bg-[#00ff88]/30' : 'bg-white/10'
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Steps content */}
      <div className="space-y-6 sm:space-y-8">
        {/* Step 1: Resume Upload */}
        <section aria-label={STEP_TITLES[0]}>
          {/* API key setup prompt */}
          {!hasApiKey && (
            <Link
              href="/configuracoes"
              className="group mb-4 block relative overflow-hidden rounded-2xl border border-[#00ffd5]/15 bg-gradient-to-br from-[#00ffd5]/[0.06] via-[#0f0f1a] to-[#7c3aed]/[0.04] p-5 sm:p-6 transition-all duration-300 hover:border-[#00ffd5]/30 hover:shadow-[0_0_30px_rgba(0,255,213,0.06)]"
            >
              {/* Decorative grid */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #00ffd5 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              <div className="relative flex items-center gap-4 sm:gap-5">
                {/* Animated icon */}
                <div className="shrink-0 relative">
                  <div className="absolute inset-0 rounded-2xl bg-[#00ffd5]/20 blur-xl group-hover:bg-[#00ffd5]/30 transition-all duration-500" />
                  <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl border border-[#00ffd5]/20 bg-[#0a0a0f]/80 text-[#00ffd5]">
                    <KeyRound className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm sm:text-base font-semibold text-[#e4e4e7] group-hover:text-white transition-colors">
                      Configure seu provedor de IA
                    </p>
                    <ArrowRight className="h-4 w-4 text-[#00ffd5] opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                  <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
                    Leva menos de 1 minuto. O <span className="text-[#00ffd5] font-medium">Hugging Face oferece créditos gratuitos</span> para você começar sem custo.
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Secondary nudge: offer demo path when no API key */}
          {!hasApiKey && (
            <div className="mb-4 -mt-2 text-center">
              <Link
                href="/demo"
                className="text-xs text-[#9ca3af] hover:text-[#00ffd5] transition-colors inline-flex items-center gap-1"
              >
                Ou veja uma demonstração primeiro
                <ArrowRight size={11} />
              </Link>
            </div>
          )}

          <ResumeUpload
            onFileAccepted={handleFileAccepted}
            isComplete={currentStep > 0}
            disabled={!hasApiKey}
          />
        </section>

        {/* Step 2: Job Description */}
        {currentStep >= 1 && (
          <section aria-label={STEP_TITLES[1]}>
            <JobDescriptionInput onSubmit={handleJobSubmit} isComplete={currentStep > 1} />
          </section>
        )}

        {/* Keyword Radar (instant preview) */}
        {currentStep >= 2 && keywordPreview && state !== 'success' && (
          <section ref={keywordRadarRef}>
            <KeywordRadar analysis={keywordPreview} />
          </section>
        )}

        {/* Step 3: Analyze */}
        {currentStep >= 2 && state !== 'success' && (
          <section aria-label={STEP_TITLES[2]}>
            <AnalysisButton
              onAnalyze={handleAnalyze}
              disabled={!resumeText || !jobDescription}
              loading={state === 'loading'}
              loadingMessage={loadingMessage}
              hasApiKey={hasApiKey}
            />
          </section>
        )}

        {/* Error state */}
        {state === 'error' && error && (
          <div
            className="rounded-xl border border-[#ff4757]/20 bg-[#ff4757]/5 p-4 text-center text-[#ff4757]"
            role="alert"
          >
            <p className="mb-2 font-medium">Erro na análise</p>
            <p className="text-sm text-[#ff4757]/80">{error}</p>
            <button
              onClick={handleReset}
              className="mt-3 text-sm text-[#00ffd5] underline underline-offset-4 hover:text-[#00ffd5]/80"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Step 4: Results */}
        {state === 'success' && result && (
          <section aria-label={STEP_TITLES[3]}>
            <AnalysisResult result={result} providerLabel={providerLabel} />
            <div className="mt-8 text-center">
              <button
                onClick={handleReset}
                className="text-sm text-[#9ca3af] underline underline-offset-4 hover:text-white"
              >
                Fazer nova análise
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
