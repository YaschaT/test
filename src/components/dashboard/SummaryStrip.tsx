import type { ReactNode } from 'react';
import { BookOpen, CalendarDays, CircleCheck } from 'lucide-react';
import { RingStat } from './RingStat';

interface SummaryStripProps {
  minutesToday: number;
  goalMinutes: number;
  dueCount: number;
  totalSrsCards: number;
  studyDays: number;
  weeklyGoalDays: number;
}

/** The three headline numbers as one horizontal card, split by hairline dividers — deliberately a single
 * surface rather than three floating cards, so the hero above it keeps all the visual weight. */
export function SummaryStrip({
  minutesToday,
  goalMinutes,
  dueCount,
  totalSrsCards,
  studyDays,
  weeklyGoalDays,
}: SummaryStripProps) {
  return (
    // Splits into three columns only from `lg`: between `md` and `lg` the fixed sidebar leaves too little
    // width for "3 / 7 days" to sit beside its ring without wrapping mid-value.
    <div className="grid grid-cols-1 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-2 py-2 shadow-sm lg:grid-cols-3 lg:divide-y-0 dark:divide-ink-line dark:border-ink-line dark:bg-ink-900">
      <SummaryMetric
        icon={<BookOpen size={22} className="text-iris-400" aria-hidden="true" />}
        ringColor="var(--color-iris-500)"
        ringProgress={goalMinutes > 0 ? minutesToday / goalMinutes : 0}
        value={`${minutesToday} min`}
        label="Studied today"
      />
      <SummaryMetric
        icon={<CircleCheck size={22} className="text-emerald-400" aria-hidden="true" />}
        ringColor="var(--color-emerald-400)"
        ringProgress={totalSrsCards > 0 ? dueCount / totalSrsCards : 0}
        value={String(dueCount)}
        label="Reviews due"
      />
      <SummaryMetric
        icon={<CalendarDays size={22} className="text-amber-400" aria-hidden="true" />}
        ringColor="var(--color-amber-500)"
        ringProgress={studyDays / weeklyGoalDays}
        value={`${studyDays} / ${weeklyGoalDays} days`}
        label="Weekly goal"
      />
    </div>
  );
}

function SummaryMetric({
  icon,
  ringColor,
  ringProgress,
  value,
  label,
}: {
  icon: ReactNode;
  ringColor: string;
  ringProgress: number;
  value: string;
  label: string;
}) {
  return (
    // From `lg` the columns sit side by side and the separator becomes a short vertical hairline inset
    // from the card's top and bottom edges, rather than a full-height rule cutting the strip into thirds.
    <div className="relative flex items-center gap-4 px-5 py-4 lg:[&:not(:first-child)]:before:absolute lg:[&:not(:first-child)]:before:inset-y-4 lg:[&:not(:first-child)]:before:left-0 lg:[&:not(:first-child)]:before:w-px lg:[&:not(:first-child)]:before:bg-slate-200 dark:lg:[&:not(:first-child)]:before:bg-ink-line">
      <RingStat progress={ringProgress} color={ringColor} size={48} strokeWidth={4}>
        {icon}
      </RingStat>
      <div className="min-w-0">
        <p className="text-[1.625rem] font-extrabold leading-tight text-slate-900 dark:text-white">{value}</p>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );
}
