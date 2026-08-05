import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { ReviewProgress } from './ReviewProgress';

interface ReviewHeaderProps {
  position: number;
  total: number;
  railOpen: boolean;
  onToggleRail: () => void;
  /** Where "Exit review" returns to — the deck this session came from. */
  exitTo: string;
  title: string;
}

/** Quiet session header: exit on the left, centred title, count + minimal progress on the right. */
export function ReviewHeader({ position, total, railOpen, onToggleRail, exitTo, title }: ReviewHeaderProps) {
  const pct = total > 0 ? (position / total) * 100 : 0;

  return (
    <header className="relative flex items-center justify-between gap-3 h-12">
      <Link
        to={exitTo}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Exit review
      </Link>

      <h1 className="absolute left-1/2 -translate-x-1/2 hidden sm:block text-base font-semibold text-slate-700 dark:text-slate-200">
        {title}
      </h1>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold tabular-nums text-slate-500 dark:text-slate-400" aria-live="polite">
          {Math.min(position + 1, total)} / {total}
        </span>
        <ReviewProgress value={pct} className="w-24 hidden xl:block" />
        <button
          type="button"
          onClick={onToggleRail}
          aria-expanded={railOpen}
          className="xl:hidden inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-white/10 px-2.5 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          Session
          <ChevronDown size={14} aria-hidden="true" className={`transition-transform ${railOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </header>
  );
}
