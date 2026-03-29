'use client';

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message displayed below the input */
  error?: string;
  /** Optional label rendered above the input */
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className = '', id, ...rest }, ref) => {
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

        <input
          ref={ref}
          id={id}
          className={[
            // Base layout
            'w-full px-3 py-2 rounded-xl text-sm',
            // Colors
            'bg-[#0d1117] text-[#f4f4f5]',
            'placeholder:text-[#8b8fa3]',
            // Border: error takes priority over normal/focus
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

        {/* Mensagem de erro */}
        {error && (
          <span className="text-xs text-[#ff4757]" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
