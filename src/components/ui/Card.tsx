// Card: themed surface container for the cyber UI

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** When true, the card border and shadow glow on hover */
  glowOnHover?: boolean;
}

export function Card({ children, className = '', glowOnHover = false }: CardProps) {
  return (
    <div
      className={[
        // Base surface
        'bg-[#1a1a2e] border border-white/10 rounded-xl',
        // Depth effect
        'backdrop-blur-sm',
        // Smooth transitions
        'transition-all duration-300',
        // Optional glow-on-hover
        glowOnHover &&
          'hover:border-[#00ffd5]/30 hover:shadow-[0_0_20px_rgba(0,255,213,0.1)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}
