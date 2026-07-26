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
  /** Show a replay button that draws each stroke along its path, in order. */
  replayable?: boolean;
  /** Underlay mode: no border, grid or background so it can sit behind a drawing canvas. */
  bare?: boolean;
  /** Auto-play the draw animation once on mount (used by the "See" stage). */
  autoPlay?: boolean;
}

function toPath(stroke: Stroke): string {
  return stroke.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
}

/** Rough polyline length so each stroke's draw takes time proportional to how long it is. */
function strokeLength(stroke: Stroke): number {
  let len = 0;
  for (let i = 1; i < stroke.length; i++) {
    len += Math.hypot(stroke[i][0] - stroke[i - 1][0], stroke[i][1] - stroke[i - 1][1]);
  }
  return Math.max(len, 1);
}

/**
 * Numbered stroke order on a 0–100 grid. Order and direction are authentic; the replay animation
 * draws each stroke along its path in writing order (via an animated stroke-dashoffset), so the
 * learner sees not just the sequence but the direction of every stroke.
 */
export function StrokeOrderDiagram({
  strokes,
  size = 220,
  mode = 'numbered',
  replayable = false,
  bare = false,
  autoPlay = false,
}: StrokeOrderDiagramProps) {
  const [playing, setPlaying] = useState(false);
  // How many strokes have started drawing. When idle this equals strokes.length (all shown).
  const [drawnUpTo, setDrawnUpTo] = useState(strokes.length);
  // Bumped on each play so the paths remount hidden and animate forward (never erase backward).
  const [runId, setRunId] = useState(0);
  const timers = useRef<number[]>([]);

  const lengths = useMemo(() => strokes.map(strokeLength), [strokes]);
  const durationOf = (i: number) => 260 + lengths[i] * 7;

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => () => clearTimers(), []);

  function play() {
    clearTimers();
    setRunId((r) => r + 1);
    setPlaying(true);
    setDrawnUpTo(0);
    let elapsed = 0;
    strokes.forEach((_, i) => {
      const start = window.setTimeout(() => setDrawnUpTo(i + 1), elapsed);
      timers.current.push(start);
      elapsed += durationOf(i);
    });
    const done = window.setTimeout(() => setPlaying(false), elapsed);
    timers.current.push(done);
  }

  useEffect(() => {
    if (!autoPlay) return;
    // Defer out of the synchronous effect commit so the first frame paints before the draw starts.
    const kickoff = window.setTimeout(() => play(), 0);
    return () => window.clearTimeout(kickoff);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {!bare && (
          <>
            <rect x="0.5" y="0.5" width="99" height="99" fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(148,163,184,0.25)" strokeWidth="0.5" strokeDasharray="2 2" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(148,163,184,0.25)" strokeWidth="0.5" strokeDasharray="2 2" />
          </>
        )}

        {strokes.map((stroke, i) => {
          const drawn = i < drawnUpTo;
          return (
            <path
              key={`${runId}-${i}`}
              d={toPath(stroke)}
              fill="none"
              stroke={baseColor}
              strokeWidth={mode === 'faint' ? 5 : 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={drawn ? 0 : 100}
              style={{ transition: `stroke-dashoffset ${durationOf(i)}ms linear` }}
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
          <Play size={13} /> {playing ? 'Drawing…' : 'Animate stroke order'}
        </button>
      )}
    </div>
  );
}
