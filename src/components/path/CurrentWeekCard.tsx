import { Link } from 'react-router-dom';
import { Check, ChevronRight, Target } from 'lucide-react';
import { SKILL_THEME } from '../../lib/skillTheme';
import { SKILL_LABEL } from '../../lib/pathSkillVisuals';
import type { SkillSlice } from '../../lib/pathWeek';
import type { GateEvaluation } from '../../lib/roadmapGate';
import type { RoadmapWeek } from '../../types';

interface CurrentWeekCardProps {
  week: RoadmapWeek;
  slices: SkillSlice[];
  gate: GateEvaluation;
  /** Best checkpoint accuracy recorded for this week, or undefined when it has never been taken. */
  best?: number;
  hasCheckpoint: boolean;
  /** The week's daily target for the chosen budget, e.g. "75–90". */
  dailyTarget: string;
  onOpenWeek: () => void;
}

/**
 * "You are here" — the one card on the page carrying a week at full detail, and the only violet button
 * on the screen (the design system allows exactly one primary action per view).
 *
 * The skill rows are the point: each one links to the *next unfinished item* the mastery gate is asking
 * for, so the page can start the work instead of only reporting on it. Everything else about the week —
 * objectives, thresholds, the Dutch reading, the checkpoint quiz — lives one click away in the panel.
 */
export function CurrentWeekCard({ week, slices, gate, best, hasCheckpoint, dailyTarget, onOpenWeek }: CurrentWeekCardProps) {
  const present = slices.filter((s) => s.total > 0);
  const metCount = gate.criteria.filter((c) => c.met).length;
  const nextUp = present.find((s) => s.done < s.total);

  return (
    <section
      aria-labelledby="path-current-week"
      className="rounded-2xl border border-brand-200 bg-white p-5 shadow-[0_18px_44px_-26px_rgba(88,87,231,0.6)] sm:p-6 dark:border-iris-400/35 dark:bg-ink-900 dark:shadow-[0_22px_52px_-26px_rgba(88,87,231,0.85)]"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.14em] text-brand-600 uppercase dark:text-iris-400">
            You are here
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-brand-700 tabular-nums dark:bg-brand-900/60 dark:text-brand-300">
              WEEK {week.week}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-emerald-700 dark:bg-emerald-900/55 dark:text-emerald-300">
              {week.level}
            </span>
            <h2 id="path-current-week" className="text-fluid-section-title font-bold text-slate-900 dark:text-white">
              {week.theme.en}
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {week.focus.en} <span className="whitespace-nowrap text-slate-400 dark:text-slate-500">· {dailyTarget} min/day</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold tracking-[0.1em] text-slate-400 uppercase dark:text-slate-500">
              Mastery gate
            </span>
            <span className="text-[13px] font-bold text-slate-700 tabular-nums dark:text-slate-300">
              {metCount} of {gate.criteria.length}
            </span>
            <span className="flex gap-1.5" aria-hidden="true">
              {gate.criteria.map((c) => (
                <span
                  key={c.key}
                  className={`h-2.5 w-2.5 rounded-full ${c.met ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-ink-700'}`}
                />
              ))}
            </span>
          </div>

          {nextUp ? (
            <Link
              to={nextUp.to}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-gradient-to-b from-[#6b78ff] to-iris-600 px-6 text-[15px] font-extrabold text-white shadow-[0_12px_28px_-14px_var(--color-iris-500)] transition-transform hover:-translate-y-px active:translate-y-0"
            >
              Continue week {week.week}
              <ChevronRight size={17} aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onOpenWeek}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-gradient-to-b from-[#6b78ff] to-iris-600 px-6 text-[15px] font-extrabold text-white shadow-[0_12px_28px_-14px_var(--color-iris-500)] transition-transform hover:-translate-y-px active:translate-y-0"
            >
              {hasCheckpoint ? 'Take the checkpoint' : `Open week ${week.week}`}
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {present.map((slice) => (
          <SkillRow key={slice.skill} slice={slice} />
        ))}
      </div>

      {hasCheckpoint && (
        <div className="mt-2.5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-hairline dark:bg-ink-800">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-brand-100 dark:bg-iris-400/15">
            <Target size={19} className="text-brand-600 dark:text-iris-400" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-slate-900 dark:text-white">
              Week {week.week} checkpoint
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Pass mark {Math.round((week.gate.minCheckpointAccuracy ?? 0.8) * 100)}% ·{' '}
              {best == null ? 'not taken yet' : `best ${Math.round(best * 100)}%`}
            </span>
          </span>
          <button
            type="button"
            onClick={onOpenWeek}
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/16 dark:text-slate-200 dark:hover:bg-ink-700"
          >
            {best == null ? 'Take the checkpoint' : 'Retake it'}
          </button>
        </div>
      )}
    </section>
  );
}

/** One skill of the current week, linking to the next item it still needs. */
function SkillRow({ slice }: { slice: SkillSlice }) {
  const theme = SKILL_THEME[slice.skill];
  const Icon = theme.icon;
  const complete = slice.done >= slice.total;
  const percent = slice.total > 0 ? (slice.done / slice.total) * 100 : 0;

  return (
    <Link
      to={slice.to}
      className={`flex min-h-11 items-center gap-3 rounded-xl border p-3 transition-colors ${
        complete
          ? 'border-emerald-500/40 bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-500/12 dark:hover:bg-emerald-500/18'
          : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-hairline dark:bg-ink-800 dark:hover:bg-ink-700'
      }`}
    >
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
      >
        <Icon size={20} className="text-white" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-slate-900 dark:text-white">{SKILL_LABEL[slice.skill]}</span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">
          {complete ? 'Done for this week' : `${slice.total - slice.done} to go`}
        </span>
      </span>
      {complete ? (
        <span className="flex items-center gap-2">
          <span className="text-[13px] font-extrabold text-emerald-700 tabular-nums dark:text-emerald-300">
            {slice.done} / {slice.total}
          </span>
          <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-emerald-500">
            <Check size={13} strokeWidth={3.2} className="text-white" aria-hidden="true" />
          </span>
        </span>
      ) : (
        <span className="flex items-center gap-2.5">
          <span className="text-[13px] font-extrabold text-slate-700 tabular-nums dark:text-slate-200">
            {slice.done} / {slice.total}
          </span>
          <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-slate-100 sm:block dark:bg-ink-700">
            <span
              className="block h-full rounded-full"
              style={{ width: `${percent}%`, background: theme.to }}
            />
          </span>
          <ChevronRight size={16} className="text-slate-400 dark:text-slate-500" aria-hidden="true" />
        </span>
      )}
    </Link>
  );
}
