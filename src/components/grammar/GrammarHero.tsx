import { ArrowRight, BookOpenText, CheckCircle2 } from 'lucide-react';
import { GrammarMascotImage } from './GrammarMascotImage';
import { PrimaryButton } from '../PrimaryButton';
import { RingStat } from '../dashboard/RingStat';
import { useCountUp } from '../../lib/useCountUp';

interface GrammarHeroProps {
  completedCount: number;
  totalCount: number;
  nextPoint: { id: string; title: string } | null;
  onContinue: (id: string) => void;
  onReview: () => void;
}

/**
 * Grammar's hero — icon/title/subtitle now live inside the dark panel itself (matching the Dashboard's
 * own hero shape) rather than a separate plain header row above it, so this reads as one cohesive,
 * premium panel instead of "header + a second, different-looking box."
 */
export function GrammarHero({ completedCount, totalCount, nextPoint, onContinue, onReview }: GrammarHeroProps) {
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const displayCompletedCount = useCountUp(completedCount);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8">
      <div className="absolute inset-0 star-field" aria-hidden="true" />
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 shrink-0">
            <BookOpenText size={22} className="text-white" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">Grammar</h1>
            <p className="text-sm sm:text-base text-white/60 mt-0.5">Master Japanese sentence patterns step by step.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          <div className="flex items-center gap-4 shrink-0">
            <RingStat progress={progress} color="#6f8ffc" trackColor="#ffffff" size={64} strokeWidth={6}>
              <BookOpenText size={20} className="text-white/80" aria-hidden="true" />
            </RingStat>
            <div>
              <p className="text-2xl font-bold text-white leading-tight">
                {displayCompletedCount} <span className="text-sm font-medium text-white/40">/ {totalCount}</span>
              </p>
              <p className="text-xs font-semibold text-white/70 leading-tight">Grammar points completed</p>
            </div>
          </div>

          <GrammarMascotImage size={68} className="shrink-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] hidden sm:block" />

          <div className="flex flex-1 min-w-[220px] items-center justify-between gap-4 flex-wrap sm:pl-6 sm:border-l sm:border-white/10">
            {nextPoint ? (
              <>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-white/40 font-semibold">Up next</p>
                  <p className="jp-text text-lg font-bold text-white truncate">{nextPoint.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={onReview}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Review grammar
                  </button>
                  <PrimaryButton onClick={() => onContinue(nextPoint.id)}>
                    Continue <ArrowRight size={16} aria-hidden="true" />
                  </PrimaryButton>
                </div>
              </>
            ) : (
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 size={18} aria-hidden="true" />
                All grammar points completed — great work!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
