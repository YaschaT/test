import { useEffect, useState, type ReactNode } from 'react';

interface RingStatProps {
  /** 0–1. A ring with no real bounded ratio (e.g. a raw count) should pass a fixed presentational value. */
  progress: number;
  color: string;
  trackColor?: string;
  /** The viewBox size the ring/stroke math is computed against — effectively the "desktop" size. */
  size?: number;
  strokeWidth?: number;
  /** A CSS width/height value (e.g. a clamp()) for the rendered box — the SVG's viewBox scaling handles
   * the rest, so stroke width and icon both shrink/grow proportionally with no distortion. Defaults to a
   * fixed `${size}px` if omitted. */
  displaySize?: string;
  children: ReactNode;
}

/**
 * A circular progress ring with centered content — used to visualize a real, bounded ratio (streak vs
 * best, minutes vs goal, due vs deck size) rather than a decorative flourish.
 *
 * The fill draws in on mount (0 → real value) rather than snapping straight to its final state, so
 * opening any stat panel visibly shows the progress landing. Implemented as a `stroke-dashoffset`
 * transition (a single interpolatable number) rather than animating `stroke-dasharray` directly — the
 * dasharray stays constant at the full circumference; only the offset moves. Automatically respects
 * `prefers-reduced-motion` via the app's existing global transition-duration override, no extra code
 * needed here.
 */
export function RingStat({ progress, color, trackColor = 'currentColor', size = 56, strokeWidth = 5, displaySize, children }: RingStatProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const dash = clamped * circumference;
  const boxSize = displaySize ?? `${size}px`;

  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative shrink-0" style={{ width: boxSize, height: boxSize }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90 w-full h-full block">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" opacity={0.12} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={drawn ? circumference - dash : circumference}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
