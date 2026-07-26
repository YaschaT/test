import { useEffect, useMemo, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import type { Stroke } from '../../data/strokeOrder';

interface StrokeOrderDiagramProps {
  strokes: Stroke[];
  size?: number;
  /**
   * - `numbered`: all strokes solid with order numbers (the "See" reference).
   * - `faint`: all strokes shown faint with no numbers (a trace underlay).
   */
  mode?: 'numbered' | 'faint';
  /** Show a replay button that draws the strokes one-by-one in order. */
  replayable?: boolean;
  /** Underlay mode: no border, grid or background so it can sit behind a drawing canvas. */
  bare?: boolean;
}

function toPath(stroke: Stroke): string {
  return stroke.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
}

/** Rough polyline length so the draw animation runs at a roughly even speed per stroke. */
function strokeLength(stroke: Stroke): number {
  let len = 0;
  for (let i = 1; i < stroke.length; i++) {
    len += Math.hypot(stroke[i][0] - stroke[i - 1][0], stroke[i][1] - stroke[i - 1][1]);
  }
  return Math.max(len, 1);
}

/** Renders numbered stroke order as an SVG on a 0–100 grid. Order and direction are authentic. */
export function StrokeOrderDiagram({ strokes, size = 220, mode = 'numbered', replayable = false, bare = false }: StrokeOrderDiagramProps) {
  const [playing, setPlaying] = useState(false);
  const [visibleCount, setVisibleCount] = useState(strokes.length);
  const timers = useRef<number[]>([]);

  const lengths = useMemo(() => strokes.map(strokeLength), [strokes]);

  useEffect(() => {
    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  function play() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPlaying(true);
    setVisibleCount(0);
    let elapsed = 0;
    strokes.forEach((_, i) => {
      const dur = 250 + lengths[i] * 6; // ms, longer strokes take a bit longer
      const t = window.setTimeout(() => {
        setVisibleCount(i + 1);
        if (i === strokes.length - 1) setPlaying(false);
      }, elapsed);
      timers.current.push(t);
      elapsed += dur;
    });
  }

  const showNumbers = mode === 'numbered' && !playing;
  const baseColor = mode === 'faint' ? 'rgba(148,163,184,0.35)' : 'currentColor';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={
          bare
            ? 'text-brand-600 dark:text-brand-400'
            : 'rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-brand-600 dark:text-brand-400'
        }
        style={{ maxWidth: '100%' }}
        role="img"
        aria-label={`Stroke order diagram, ${strokes.length} strokes`}
      >
        {/* practice grid */}
        {!bare && (
          <>
            <rect x="0.5" y="0.5" width="99" height="99" fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(148,163,184,0.25)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(148,163,184,0.25)" strokeWidth="0.5" strokeDasharray="2 2" />
          </>
        )}

        {strokes.map((stroke, i) => {
          const shown = i < visibleCount;
          return (
            <path
              key={i}
              d={toPath(stroke)}
              fill="none"
              stroke={baseColor}
              strokeWidth={mode === 'faint' ? 5 : 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: shown ? 1 : 0, transition: 'opacity 120ms ease-out' }}
            />
          );
        })}

        {showNumbers &&
          strokes.map((stroke, i) => (
            <g key={`n${i}`}>
              <circle cx={stroke[0][0]} cy={stroke[0][1]} r="7" fill="var(--stroke-num-bg, #3a54d6)" />
              <text x={stroke[0][0]} y={stroke[0][1]} dy="2.6" textAnchor="middle" fontSize="8" fill="#fff" fontWeight="700">
                {i + 1}
              </text>
            </g>
          ))}
      </svg>
      {replayable && (
        <button
          type="button"
          onClick={play}
          disabled={playing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
        >
          <Play size={13} /> {playing ? 'Playing…' : 'Replay stroke order'}
        </button>
      )}
    </div>
  );
}
