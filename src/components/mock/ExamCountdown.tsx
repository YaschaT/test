import { useEffect, useRef, useState } from 'react';
import type { JlptLevel } from '../../types';

interface ExamCountdownProps {
  level: JlptLevel;
  /** Fired once the count reaches zero — the clock starts on the screen after this one. */
  onDone: () => void;
  onCancel: () => void;
}

const FROM = 3;
const STEP_MS = 900;
const RING_LENGTH = 2 * Math.PI * 128;

/**
 * Three seconds between deciding to sit the exam and the clock starting.
 *
 * It exists because the timer does not stop once it starts: the pause is there to put a pen down and
 * look up, and to make leaving free right up until the last moment — cancelling here costs nothing,
 * which is not true a second later.
 */
export function ExamCountdown({ level, onDone, onCancel }: ExamCountdownProps) {
  const [count, setCount] = useState(FROM);
  // Kept in a ref so the interval never restarts and re-runs its first tick late. Synced in an effect
  // rather than during render — a ref written mid-render can hold a value the commit never used.
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    // The tick is counted outside React rather than inside a `setCount` updater: updaters run during
    // render, and calling the parent's setState from one is a setState-during-render (React warns, and
    // the phase change lands in the wrong commit).
    let remaining = FROM;
    const id = setInterval(() => {
      remaining -= 1;
      setCount(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        doneRef.current();
      }
    }, STEP_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="flex min-h-[70vh] flex-1 flex-col items-center justify-center gap-8 rounded-3xl bg-slate-950 bg-[radial-gradient(620px_620px_at_50%_46%,color-mix(in_oklab,var(--color-iris-500)_13%,transparent),transparent_70%)] p-8"
      role="status"
      aria-live="assertive"
    >
      <p className="text-xs font-extrabold tracking-[0.28em] text-slate-500 uppercase">JLPT {level} · Beginning</p>

      <div className="relative grid h-70 w-70 place-items-center">
        {/* Re-keyed each second so the ring of light is thrown off once per digit. */}
        <span
          key={`halo-${count}`}
          aria-hidden="true"
          className="exam-halo absolute h-70 w-70 rounded-full border border-iris-500/50"
        />

        <svg width="280" height="280" viewBox="0 0 280 280" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="140" cy="140" r="128" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="3" />
          <circle
            cx="140"
            cy="140"
            r="128"
            fill="none"
            stroke="var(--color-iris-500)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - count / FROM)}
            className="transition-[stroke-dashoffset] duration-[850ms] ease-out"
          />
        </svg>

        <span
          aria-hidden="true"
          className="jp-text absolute leading-none select-none"
          style={{ fontSize: 200, color: 'color-mix(in oklab, var(--color-iris-500) 7%, transparent)' }}
        >
          試
        </span>

        <span key={count} className="exam-pop relative font-display text-[150px] leading-none font-semibold tracking-tighter text-white">
          {count}
        </span>
      </div>

      <div className="text-center">
        <p className="text-[17px] font-semibold text-slate-400">Pens down. The timer will not stop.</p>
        <p className="mt-1 text-sm text-slate-500">Pen neer. De timer stopt niet.</p>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="text-sm font-bold text-slate-600 transition-colors hover:text-slate-300"
      >
        Cancel · Annuleren
      </button>
    </div>
  );
}
