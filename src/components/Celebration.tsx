import { useEffect } from 'react';
import { Mascot, type MascotMood } from './Mascot';
import { getEncouragement } from '../lib/encouragement';
import { playComplete } from '../lib/sound';

interface CelebrationProps {
  correct: number;
  total: number;
  onRetry?: () => void;
  retryLabel?: string;
  extraNote?: string;
}

function moodFor(correct: number, total: number): MascotMood {
  if (total === 0) return 'neutral';
  const ratio = correct / total;
  if (ratio >= 0.7) return 'happy';
  if (ratio >= 0.4) return 'neutral';
  return 'sleepy';
}

/** Shared "you're done" screen for quizzes/reviews so scoring, copy, and motion stay consistent everywhere. */
export function Celebration({ correct, total, onRetry, retryLabel = 'Retry', extraNote }: CelebrationProps) {
  useEffect(() => {
    playComplete();
  }, []);

  return (
    <div className="text-center py-4 animate-celebrate">
      <Mascot size={40} mood={moodFor(correct, total)} className="mx-auto mb-2" />
      <p className="text-2xl font-semibold text-slate-900 dark:text-white">
        {correct} / {total}
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{getEncouragement(correct, total)}</p>
      {extraNote && <p className="text-xs text-slate-400 mt-1">{extraNote}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-300 hover:underline">
          {retryLabel}
        </button>
      )}
    </div>
  );
}
