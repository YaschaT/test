import { Heart } from 'lucide-react';

interface SessionHudProps {
  index: number;
  total: number;
  /** One entry per resolved round, oldest first: whether the learner heard it correctly. */
  log: boolean[];
  accuracy: number;
  hearts: number;
  maxHearts: number;
}

/**
 * The strip across the top of the session card: where you are, how each round behind you went, how
 * accurate you have been, and how many hearts are left.
 *
 * The pips carry information the plain "item 3 of 8" cannot — a glance tells you both your position and
 * the shape of the run so far, which is the thing a learner actually wants to know mid-session.
 */
export function SessionHud({ index, total, log, accuracy, hearts, maxHearts }: SessionHudProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
          Item {index + 1} of {total}
        </p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: total }, (_, n) => (
            <span
              key={n}
              className={`h-[5px] w-6 rounded-full transition-colors ${
                n < log.length
                  ? log[n]
                    ? 'bg-emerald-500'
                    : 'bg-red-400'
                  : n === index
                    ? 'bg-brand-600 dark:bg-iris-500'
                    : 'bg-slate-200 dark:bg-ink-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tabular-nums text-slate-600 dark:text-slate-300">{accuracy}%</span>
          <span className="sr-only">accuracy so far</span>
          <span className="h-1.5 w-[74px] overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700" aria-hidden="true">
            <span
              className="block h-full rounded-full bg-emerald-500 transition-[width] duration-500"
              style={{ width: `${accuracy}%` }}
            />
          </span>
        </div>

        {/* Hearts are announced as one figure rather than three graphics — "2 of 3 hearts left" is the
            fact; which particular hearts are filled is presentation. */}
        <div className="flex items-center gap-1" role="img" aria-label={`${hearts} of ${maxHearts} hearts left`}>
          {Array.from({ length: maxHearts }, (_, n) => (
            <Heart
              key={n}
              size={17}
              aria-hidden="true"
              className={
                n < hearts
                  ? 'fill-red-400 text-red-400'
                  : 'fill-slate-200 text-slate-200 dark:fill-ink-700 dark:text-ink-700'
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
