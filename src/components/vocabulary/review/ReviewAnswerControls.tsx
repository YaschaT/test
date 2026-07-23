import { createInitialSrsCard, reviewSrsCard } from '../../../lib/srs';
import { GRADE_META, GRADE_ORDER } from './gradeTheme';
import type { SrsCardState, SrsRating } from '../../../types';

interface ReviewAnswerControlsProps {
  /** Current SRS state of the active word — undefined for words never reviewed before. */
  card: SrsCardState | undefined;
  onRate: (rating: SrsRating) => void;
  disabled: boolean;
  /** Rating just pressed, held during the card's exit transition for feedback + double-submit lockout. */
  pressedRating: SrsRating | null;
}

/** Real interval preview: simulate the actual SM-2 scheduler rather than showing invented minutes. */
function intervalLabel(card: SrsCardState | undefined, rating: SrsRating): string {
  const base = card ?? createInitialSrsCard('preview', 'vocabulary');
  const days = reviewSrsCard(base, rating).intervalDays;
  return days === 1 ? '1 day' : `${days} days`;
}

export function ReviewAnswerControls({ card, onRate, disabled, pressedRating }: ReviewAnswerControlsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full">
      {GRADE_ORDER.map((rating) => {
        const meta = GRADE_META[rating];
        const pressed = pressedRating === rating;
        return (
          <button
            key={rating}
            type="button"
            disabled={disabled}
            onClick={() => onRate(rating)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 transition-all duration-150 active:translate-y-px disabled:opacity-50 disabled:pointer-events-none border-slate-200 bg-white dark:border-white/[0.08] dark:bg-slate-900/70 ${meta.hoverClass} ${
              pressed ? meta.pressedClass : ''
            } ${pressed && rating === 'again' ? 'animate-shake' : ''}`}
          >
            <span className="flex items-center gap-2">
              <kbd
                className={`flex items-center justify-center w-6 h-6 rounded-md border text-sm font-bold font-sans ${meta.keycapClass} ${
                  pressed && (rating === 'good' || rating === 'easy') ? 'animate-pop' : ''
                }`}
              >
                {meta.key}
              </kbd>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{meta.label}</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {intervalLabel(card, rating)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
