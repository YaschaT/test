import { CalendarDays, Check, ChevronRight } from 'lucide-react';
import { CardAction, DashboardCard } from './DashboardCard';
import { StatValue } from './StatValue';
import type { WeekDay } from '../../lib/dashboardStats';

interface WeeklyProgressCardProps {
  days: WeekDay[];
  studyDays: number;
  goalDays: number;
  onViewFullPath: () => void;
  className?: string;
}

export function WeeklyProgressCard({
  days,
  studyDays,
  goalDays,
  onViewFullPath,
  className = '',
}: WeeklyProgressCardProps) {
  const remaining = Math.max(0, goalDays - studyDays);
  const pct = goalDays > 0 ? Math.min(100, (studyDays / goalDays) * 100) : 0;

  return (
    <DashboardCard
      title="Weekly Progress"
      icon={<CalendarDays size={20} className="text-brand-500 dark:text-iris-400" aria-hidden="true" />}
      action={
        <CardAction onClick={onViewFullPath}>
          View full path
          <ChevronRight size={16} aria-hidden="true" />
        </CardAction>
      }
      className={`flex flex-col ${className}`}
    >
      <div className="flex flex-1 flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div>
          {/* The sub-line here used to read "Goal reached!" / "Keep it up!" — praise inflation and
              exclamation marks, both of which the voice section bans outright. It's gone rather than
              reworded: the bar below already states what's left, and the number carries the rest. */}
          <StatValue unit="days">
            {studyDays} / {goalDays}
          </StatValue>
        </div>

        <ol className="flex items-start gap-2">
          {days.map((day) => (
            <li key={day.date} className="flex w-8 flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                  day.studied
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : day.isToday
                      ? 'border-brand-500 dark:border-iris-400'
                      : 'border-slate-200 dark:border-ink-700'
                }`}
              >
                {day.studied && <Check size={16} strokeWidth={3} aria-hidden="true" />}
                <span className="sr-only">
                  {day.name}: {day.studied ? 'studied' : day.isFuture ? 'upcoming' : 'not studied'}
                </span>
              </span>
              <span aria-hidden="true" className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {day.letter}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex items-center gap-4">
        <div
          role="progressbar"
          aria-valuenow={studyDays}
          aria-valuemin={0}
          aria-valuemax={goalDays}
          aria-label="Weekly goal progress"
          className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700"
        >
          <div className="h-full rounded-full bg-emerald-500 transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
          {remaining === 0 ? 'Goal reached' : `${remaining} ${remaining === 1 ? 'day' : 'days'} to go`}
        </p>
      </div>
    </DashboardCard>
  );
}
