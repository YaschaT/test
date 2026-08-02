import { useEffect, useState } from 'react';

interface ScoreRingProps {
  /** 0..1 score. */
  percent: number;
  /** Ring stroke color (hex). */
  color: string;
  /** Pass-line marker position 0..1, drawn as a tick on the track. */
  threshold?: number;
  size?: number;
  children?: React.ReactNode;
}

/**
 * Animated circular score gauge: the arc sweeps from 0 to the score on mount (stroke-dashoffset
 * transition, which the app's reduced-motion block collapses to instant), with a small tick on the
 * track marking the pass line. Center is a slot for the big number.
 */
export function ScoreRing({ percent, color, threshold, size = 200, children }: ScoreRingProps) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [draw, setDraw] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDraw(percent));
    return () => cancelAnimationFrame(id);
  }, [percent]);

  const cx = size / 2;
  const tickAngle = threshold != null ? threshold * 360 - 90 : null;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={cx} cy={cx} r={r} fill="none" strokeWidth={stroke} className="stroke-slate-100 dark:stroke-slate-800" />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - draw)}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
        {tickAngle != null && (
          <line
            x1={cx + (r - stroke / 2) * Math.cos((tickAngle * Math.PI) / 180)}
            y1={cx + (r - stroke / 2) * Math.sin((tickAngle * Math.PI) / 180)}
            x2={cx + (r + stroke / 2) * Math.cos((tickAngle * Math.PI) / 180)}
            y2={cx + (r + stroke / 2) * Math.sin((tickAngle * Math.PI) / 180)}
            className="stroke-slate-400 dark:stroke-slate-500"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
