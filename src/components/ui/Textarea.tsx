'use client';

import { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error message displayed below the textarea */
  error?: string;
  /** Optional label rendered above the textarea */
  label?: string;
  /** Current character count (for the counter display) */
  charCount?: number;
  /** Maximum allowed characters (triggers red counter when exceeded) */
  maxChars?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, label, charCount, maxChars, className = '', id, ...rest }, ref) => {
    const showCounter = charCount !== undefined && maxChars !== undefined;
    const isOverLimit = showCounter && charCount > maxChars;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Optional label */}
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[#e4e4e7]"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          className={[
            // Base layout
            'w-full px-3 py-2 rounded-xl text-sm resize-y min-h-[100px]',
            // Colors
            'bg-[#0d1117] text-[#f4f4f5]',
            'placeholder:text-[#8b8fa3]',
            // Border: error takes priority
            error
              ? 'border border-[#ff4757] focus:outline-none focus:ring-2 focus:ring-[#ff4757]/30'
              : 'border border-white/10 focus:outline-none focus:border-[#00ffd5]/50 focus:ring-2 focus:ring-[#00ffd5]/20',
            // Transitions
            'transition-all duration-200',
            // Disabled state
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          ].join(' ')}
          {...rest}
        />

        {/* Bottom row: error message (left) + character counter (right) */}
        {(error || showCounter) && (
          <div className="flex items-start justify-between gap-2">
            {/* Mensagem de erro */}
            {error ? (
              <span className="text-xs text-[#ff4757]" role="alert">
                {error}
              </span>
            ) : (
              // Spacer so the counter stays on the right even without an error
              <span />
            )}

            {/* Contador de caracteres */}
            {showCounter && (
              <span
                className={[
                  'text-xs tabular-nums shrink-0',
                  isOverLimit ? 'text-[#ff4757]' : 'text-[#8b8fa3]',
                ].join(' ')}
              >
                {charCount}/{maxChars}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
