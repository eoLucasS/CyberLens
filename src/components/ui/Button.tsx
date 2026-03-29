'use client';

import { forwardRef } from 'react';
import { Spinner } from './Spinner';

// Variant and size type definitions
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

// Static class maps for each variant and size
const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#00ffd5] text-black font-semibold hover:bg-[#00ffd5]/90 hover:shadow-[0_0_20px_rgba(0,255,213,0.4)] focus-visible:ring-[#00ffd5]/50',
  secondary:
    'border border-[#00ffd5] bg-transparent text-[#00ffd5] hover:bg-[#00ffd5]/10 focus-visible:ring-[#00ffd5]/50',
  ghost:
    'bg-transparent text-[#9ca3af] hover:bg-white/5 hover:text-[#e4e4e7] focus-visible:ring-white/20',
  danger:
    'bg-[#ff4757] text-white font-semibold hover:bg-[#ff4757]/90 hover:shadow-[0_0_20px_rgba(255,71,87,0.4)] focus-visible:ring-[#ff4757]/50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      children,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          // Base styles
          'inline-flex items-center justify-center',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant + size
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(' ')}
        {...rest}
      >
        {/* Show spinner when loading */}
        {loading && (
          <Spinner
            size="sm"
            className={variant === 'primary' ? 'text-black' : undefined}
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
