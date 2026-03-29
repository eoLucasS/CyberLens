'use client';

import { useEffect, useRef, useState } from 'react';

interface ScoreGaugeProps {
  /** Score value from 0 to 100 */
  score: number;
  /** Diameter of the SVG circle in pixels (default 160) */
  size?: number;
}

// Color thresholds matching the cyber theme
function getScoreColor(value: number): string {
  if (value <= 40) return '#ff4757'; // red
  if (value <= 70) return '#ffd32a'; // yellow
  if (value <= 90) return '#00ff88'; // green
  return '#00ffd5';                  // cyan
}

// Human-readable classification labels in Brazilian Portuguese
function getClassification(value: number): string {
  if (value <= 40) return 'Baixa Aderência';
  if (value <= 70) return 'Aderência Parcial';
  if (value <= 90) return 'Alta Aderência';
  return 'Aderência Excelente';
}

export function ScoreGauge({ score, size = 160 }: ScoreGaugeProps) {
  // Animated display value (counts up from 0 to score)
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Stroke geometry
  const strokeWidth = size * 0.075; // ~12 px at default size
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Count-up animation over ~1.5 s using requestAnimationFrame
  useEffect(() => {
    const duration = 1500; // ms
    const startTime = performance.now();
    const startValue = 0;
    const endValue = Math.min(100, Math.max(0, score));

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for a smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(startValue + (endValue - startValue) * eased));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [score]);

  const color = getScoreColor(displayed);
  const clampedScore = Math.min(100, Math.max(0, score));

  // The filled arc length is proportional to the final score (not the animated value)
  // so the arc and the counter arrive together
  const filledLength = (clampedScore / 100) * circumference;
  const gapLength = circumference - filledLength;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* SVG gauge */}
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          // Glow effect that matches the score colour
          filter: `drop-shadow(0 0 ${size * 0.1}px ${color}55)`,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          aria-label={`Pontuação: ${score} de 100`}
          role="img"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="white"
            strokeWidth={strokeWidth}
            strokeOpacity={0.08}
          />

          {/* Foreground arc: starts from 12 o'clock (-90deg) */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${gapLength}`}
            // Rotate so the arc starts at the top
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.33,1,0.68,1), stroke 0.4s ease' }}
          />
        </svg>

        {/* Centre text overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center select-none"
        >
          <span
            className="font-bold leading-none tabular-nums"
            style={{
              fontSize: size * 0.28,
              color,
              transition: 'color 0.4s ease',
            }}
          >
            {displayed}
            <span style={{ fontSize: size * 0.14 }}>%</span>
          </span>
        </div>
      </div>

      {/* Classification label */}
      <span
        className="text-sm font-medium tracking-wide"
        style={{ color, transition: 'color 0.4s ease' }}
      >
        {getClassification(displayed)}
      </span>
    </div>
  );
}
