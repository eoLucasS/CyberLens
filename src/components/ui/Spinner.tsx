// Spinner: animated loading indicator (SVG-based, cyan accent)

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

// Pixel dimensions per size
const sizeMap: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 40,
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const px = sizeMap[size];
  const strokeWidth = size === 'lg' ? 3 : 2.5;
  // Calculate the circumference for the dasharray gap
  const r = (px - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <svg
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      fill="none"
      className={['animate-spin shrink-0', className].join(' ')}
      role="status"
      aria-label="Carregando"
    >
      {/* Background track ring */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-20 text-[#00ffd5]"
      />
      {/* Animated arc: ~75% of the circumference */}
      <circle
        cx={px / 2}
        cy={px / 2}
        r={r}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
        strokeDashoffset={0}
        className="text-[#00ffd5]"
      />
    </svg>
  );
}
