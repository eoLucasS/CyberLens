'use client';

import { useState, useRef, useCallback } from 'react';
import type { AnalysisResult } from '@/types';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/constants';
import { getStorageItem, STORAGE_KEYS } from '@/lib/utils';
import { analyzeKeywords } from '@/lib/nlp/keywords';
import { parseResumeSections } from '@/lib/nlp/sections';
import { cleanJobDescription } from '@/lib/nlp/cleaner';
import { analyzeWithAI } from '@/lib/ai';
import { addToHistory } from '@/lib/history/store';
import { extractJobMeta } from '@/lib/history/job-extractor';
import { AI_PROVIDERS } from '@/constants/providers';
import type { UserSettings } from '@/types';
import type { KeywordAnalysis } from '@/lib/nlp/keywords';

type AnalysisState = 'idle' | 'loading' | 'success' | 'error';

export interface AnalyzeOptions {
  /** Optional original resume file name. Used to label the history entry. */
  resumeFileName?: string;
  /** Set when the resume text came from OCR. Influences the AI prompt. */
  isOcr?: boolean;
}

export interface UseAnalysisReturn {
  state: AnalysisState;
  result: AnalysisResult | null;
  error: string | null;
  loadingMessage: string;
  /** Pre-analysis keyword data (available after NLP runs, before AI call) */
  keywordAnalysis: KeywordAnalysis | null;
  analyze: (
    resumeText: string,
    jobDescription: string,
    options?: AnalyzeOptions,
  ) => Promise<void>;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<AnalysisState>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysis | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageIndexRef = useRef<number>(0);

  const stopMessageRotation = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startMessageRotation = useCallback(() => {
    messageIndexRef.current = 0;
    setLoadingMessage(LOADING_MESSAGES[0]);

    intervalRef.current = setInterval(() => {
      messageIndexRef.current =
        (messageIndexRef.current + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndexRef.current]);
    }, 3_000);
  }, []);

  const analyze = useCallback(
    async (
      resumeText: string,
      jobDescription: string,
      options?: AnalyzeOptions,
    ): Promise<void> => {
      const isOcr = options?.isOcr ?? false;
      const defaultSettings: UserSettings = {
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: '',
        hasAcceptedTerms: false,
        saveHistory: false,
      };
      const settings = getStorageItem<UserSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);

      if (!settings.apiKey || settings.apiKey.trim() === '') {
        setState('error');
        setError(ERROR_MESSAGES.noApiKey);
        return;
      }

      setState('loading');
      setError(null);
      setResult(null);
      startMessageRotation();

      try {
        // Step 1: Clean job description (remove company info, benefits, noise)
        const cleanedJob = cleanJobDescription(jobDescription);

        // Step 2: Client-side NLP pre-processing (runs in browser, no API call)
        const kwAnalysis = analyzeKeywords(cleanedJob, resumeText);
        setKeywordAnalysis(kwAnalysis);

        const parsed = parseResumeSections(resumeText, isOcr);

        // Step 3: Call AI with structured data + pre-analysis
        const analysisResult = await analyzeWithAI({
          provider: settings.provider,
          model: settings.model,
          apiKey: settings.apiKey,
          resumeText,
          jobDescription: cleanedJob,
          preAnalysis: {
            structuredResume: parsed.structured,
            matchedKeywords: kwAnalysis.matched.map((k) => k.keyword),
            missingKeywords: kwAnalysis.missing.map((k) => k.keyword),
            matchPercentage: kwAnalysis.matchPercentage,
            isOcr,
          },
        });

        stopMessageRotation();
        setResult(analysisResult);
        setState('success');

        // Step 4: Persist to history if the user opted in. Any failure
        // here is silent so the main flow is never blocked by storage issues.
        if (settings.saveHistory === true) {
          try {
            const providerLabel =
              AI_PROVIDERS.find((p) => p.name === settings.provider)?.label ?? settings.provider;
            const { title: jobTitle, company: jobCompany } = extractJobMeta(cleanedJob);

            addToHistory({
              jobTitle,
              jobCompany,
              resumeFileName: options?.resumeFileName?.trim() || 'Currículo sem nome',
              score: analysisResult.score,
              classification: analysisResult.classification,
              provider: providerLabel,
              result: analysisResult,
            });
          } catch {
            // Ignore history persistence errors.
          }
        }
      } catch (err: unknown) {
        stopMessageRotation();
        const message =
          err instanceof Error ? err.message : ERROR_MESSAGES.genericError;
        setError(message);
        setState('error');
      }
    },
    [startMessageRotation, stopMessageRotation],
  );

  const reset = useCallback(() => {
    stopMessageRotation();
    setState('idle');
    setResult(null);
    setError(null);
    setKeywordAnalysis(null);
    setLoadingMessage(LOADING_MESSAGES[0]);
  }, [stopMessageRotation]);

  return { state, result, error, loadingMessage, keywordAnalysis, analyze, reset };
}
