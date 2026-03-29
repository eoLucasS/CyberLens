// Badge: small pill tag for status indicators

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

// Color sets per variant
const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-500/10 text-green-400 border border-green-500/20',
  error:   'bg-red-500/10   text-red-400   border border-red-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  info:    'bg-cyan-500/10  text-cyan-400   border border-cyan-500/20',
  default: 'bg-white/5      text-[#9ca3af]  border border-white/10',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        // Pill shape
        'inline-flex items-center px-2.5 py-0.5 rounded-full',
        // Typography
        'text-xs font-medium',
        // Variant colors
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
