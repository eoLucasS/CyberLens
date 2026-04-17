'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';

type CopyState = 'idle' | 'copied' | 'error';

interface CopyButtonProps {
  /** Text that will be copied to the clipboard. */
  text: string;
  /** Accessible label for screen readers. Defaults to a generic one. */
  ariaLabel?: string;
  /** Optional class name to tweak alignment from the parent. */
  className?: string;
}

/**
 * Copy a plain-text string to the clipboard with visual feedback.
 *
 * Uses navigator.clipboard.writeText as the primary path (W3C standard,
 * HTTPS-only). Falls back to document.execCommand('copy') for older browsers
 * or non-secure contexts. Reports state via an aria-live region so screen
 * readers announce success without stealing focus.
 *
 * Security: only passes the provided string to the clipboard. Never renders
 * the text as HTML. Errors are caught silently and shown as visual feedback.
 */
export function CopyButton({ text, ariaLabel, className }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  const scheduleReset = useCallback(() => {
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setState('idle'), 2000);
  }, []);

  const handleClick = useCallback(async () => {
    // Primary path: modern Clipboard API (HTTPS/localhost required)
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setState('copied');
        scheduleReset();
        return;
      } catch {
        // Permission denied or clipboard unavailable, fall through
      }
    }

    // Fallback: execCommand (deprecated but widely supported)
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.setAttribute('aria-hidden', 'true');
      textarea.style.position = 'fixed';
      textarea.style.top = '-9999px';
      textarea.style.left = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      setState(ok ? 'copied' : 'error');
      scheduleReset();
    } catch {
      setState('error');
      scheduleReset();
    }
  }, [text, scheduleReset]);

  const label = state === 'copied' ? 'Copiado' : state === 'error' ? 'Falhou' : 'Copiar';
  const Icon = state === 'copied' ? Check : state === 'error' ? X : Copy;

  const stateClasses =
    state === 'copied'
      ? 'border-[#00ff88]/30 bg-[#00ff88]/10 text-[#00ff88]'
      : state === 'error'
        ? 'border-[#ff4757]/30 bg-[#ff4757]/10 text-[#ff4757]'
        : 'border-white/[0.08] bg-[#0d0d18] text-[#9ca3af] hover:border-[#00ffd5]/25 hover:text-[#00ffd5]';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel ?? 'Copiar texto para a área de transferência'}
      aria-live="polite"
      className={[
        'inline-flex items-center gap-1.5',
        'rounded-md border px-2.5 py-1.5',
        'text-[11px] font-medium',
        'min-h-[32px]',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00ffd5]/40',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        stateClasses,
        className ?? '',
      ].join(' ')}
    >
      <Icon size={12} className="shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
