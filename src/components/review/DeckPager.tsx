import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DeckPagerProps {
  position: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Previous / position / next for a browsed deck. Shared so the kanji and vocabulary sessions page
 * identically — same control, same wording, same disabled edges.
 */
export function DeckPager({ position, total, onPrev, onNext }: DeckPagerProps) {
  return (
    <div className="w-full max-w-[760px] mx-auto mt-6 flex items-center justify-between gap-3">
      <PagerButton dir="prev" onClick={onPrev} disabled={position === 0} />
      <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400">
        {position + 1} of {total}
      </span>
      <PagerButton dir="next" onClick={onNext} disabled={position >= total - 1} />
    </div>
  );
}

function PagerButton({ dir, onClick, disabled }: { dir: 'prev' | 'next'; onClick: () => void; disabled: boolean }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-white/5"
    >
      {dir === 'prev' && <Icon size={16} aria-hidden="true" />}
      {dir === 'prev' ? 'Previous' : 'Next'}
      {dir === 'next' && <Icon size={16} aria-hidden="true" />}
    </button>
  );
}
