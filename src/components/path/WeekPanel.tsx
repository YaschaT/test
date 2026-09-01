import { useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Check, ChevronRight, Target, X } from 'lucide-react';
import { WeeklyCheckpoint } from './WeeklyCheckpoint';
import { SKILL_LABEL } from '../../lib/pathSkillVisuals';
import { SKILL_THEME } from '../../lib/skillTheme';
import { evaluateGate, type GateCriterion } from '../../lib/roadmapGate';
import { gateProgressFrom, weekSkills } from '../../lib/pathWeek';
import { hasCheckpoint } from '../../lib/checkpoint';
import type { ProgressState } from '../../lib/progressStore';
import type { RoadmapWeek } from '../../types';
import type { WeekStatus } from '../../lib/pathWeek';

const CRITERION_LABEL: Record<GateCriterion['key'], string> = {
  grammar: 'Grammar complete',
  kanji: 'Kanji learned',
  vocab: 'Vocabulary retained',
  reading: 'Reading finished',
  checkpoint: 'Checkpoint passed',
};

const STATUS_LABEL: Record<WeekStatus, string> = {
  mastered: 'MASTERED',
  current: 'IN PROGRESS',
  available: 'OPEN',
  locked: 'LOCKED',
};

interface WeekPanelProps {
  week: RoadmapWeek | null;
  status: WeekStatus;
  progress: ProgressState;
  onClose: () => void;
}

/**
 * A week, opened on purpose.
 *
 * Everything the old in-place accordion carried — objectives, the mastery gate, the checkpoint quiz,
 * the review cadence — moved here, where it has room and is not competing with twenty-one siblings.
 * This is also the only place the page prints both languages: on the spine that doubled every line.
 */
export function WeekPanel({ week, status, progress, onClose }: WeekPanelProps) {
  const [checkpointOpen, setCheckpointOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogPrimitive.Root
      open={week !== null}
      onOpenChange={(open) => {
        if (!open) {
          setCheckpointOpen(false);
          onClose();
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px] duration-200 data-open:animate-in data-open:fade-in-0" />
        <DialogPrimitive.Content
          // Focus still moves into the panel, but without the browser scrolling the page underneath it
          // to reach the newly-focused node — otherwise closing the panel leaves you somewhere else.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            closeRef.current?.focus({ preventScroll: true });
          }}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[560px] flex-col overflow-y-auto border-l border-slate-200 bg-white shadow-[-24px_0_60px_-30px_rgba(15,23,42,0.35)] outline-none duration-200 data-open:animate-in data-open:slide-in-from-right data-open:fade-in-0 dark:border-hairline dark:bg-ink-900">
          {week && (
            <PanelBody
              week={week}
              status={status}
              progress={progress}
              checkpointOpen={checkpointOpen}
              setCheckpointOpen={setCheckpointOpen}
              closeRef={closeRef}
            />
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function PanelBody({
  week,
  status,
  progress,
  checkpointOpen,
  setCheckpointOpen,
  closeRef,
}: {
  week: RoadmapWeek;
  status: WeekStatus;
  progress: ProgressState;
  checkpointOpen: boolean;
  setCheckpointOpen: (open: boolean) => void;
  closeRef: RefObject<HTMLButtonElement | null>;
}) {
  const gate = evaluateGate(week, gateProgressFrom(progress));
  const slices = weekSkills(week, progress).filter((s) => s.total > 0);
  const best = progress.weeklyCheckpoints[week.week];
  const canCheckpoint = hasCheckpoint(week);
  const threshold = week.gate.minCheckpointAccuracy ?? 0.8;

  return (
    <>
      <div className="border-b border-slate-100 p-5 sm:p-6 dark:border-white/7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-brand-700 tabular-nums dark:bg-brand-900/60 dark:text-brand-300">
              WEEK {week.week}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-emerald-700 dark:bg-emerald-900/55 dark:text-emerald-300">
              {week.level}
            </span>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-brand-600 dark:bg-iris-400/16 dark:text-iris-400">
              {STATUS_LABEL[status]}
            </span>
          </div>
          <DialogPrimitive.Close ref={closeRef} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 dark:border-white/14 dark:text-slate-400 dark:hover:bg-ink-800">
            <X size={16} aria-hidden="true" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>

        <DialogPrimitive.Title className="mt-3 font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {week.theme.en}
        </DialogPrimitive.Title>
        <p className="mt-0.5 text-sm font-medium text-slate-400 dark:text-slate-500">{week.theme.nl}</p>
        <DialogPrimitive.Description className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {week.focus.en}
        </DialogPrimitive.Description>
      </div>

      <div className="flex flex-col gap-6 p-5 sm:p-6">
        <section>
          <h3 className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase dark:text-slate-500">
            By the end of the week
          </h3>
          <div className="flex flex-col gap-3">
            {week.units.map((unit) => (
              <div key={unit.id}>
                {week.units.length > 1 && (
                  <p className="mb-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200">{unit.title.en}</p>
                )}
                <ul className="flex flex-col gap-2">
                  {unit.objectives.map((objective, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-snug text-slate-700 dark:text-slate-200">
                      <Check size={17} strokeWidth={2.6} className="mt-0.5 shrink-0 text-brand-600 dark:text-iris-400" aria-hidden="true" />
                      {objective.en}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-2.5 flex items-baseline justify-between gap-3">
            <h3 className="text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase dark:text-slate-500">
              Mastery gate
            </h3>
            <p className="text-xs font-bold text-slate-700 tabular-nums dark:text-slate-300">
              {gate.criteria.filter((c) => c.met).length} of {gate.criteria.length} met
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-hairline">
            {gate.criteria.map((criterion) => (
              <div
                key={criterion.key}
                className={`flex items-center gap-3 border-b border-slate-100 p-3 last:border-b-0 dark:border-white/7 ${
                  criterion.met ? 'bg-emerald-50/60 dark:bg-emerald-500/10' : ''
                }`}
              >
                {criterion.met ? (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500">
                    <Check size={12} strokeWidth={3.4} className="text-white" aria-hidden="true" />
                  </span>
                ) : (
                  <span className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300 dark:border-white/25" />
                )}
                <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {CRITERION_LABEL[criterion.key]}
                </span>
                <span
                  className={`text-[13px] font-bold tabular-nums ${
                    criterion.met ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {criterion.key === 'checkpoint' && best == null
                    ? 'not taken'
                    : `${Math.round(criterion.actual * 100)}%`}{' '}
                  · needs {Math.round(criterion.required * 100)}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 px-0.5 text-xs leading-snug text-slate-400 dark:text-slate-500">{week.gate.summary.en}</p>
        </section>

        {slices.length > 0 && (
          <section>
            <h3 className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-slate-400 uppercase dark:text-slate-500">
              This week’s material
            </h3>
            <div className="flex flex-col gap-2">
              {slices.map((slice) => {
                const theme = SKILL_THEME[slice.skill];
                const Icon = theme.icon;
                const complete = slice.done >= slice.total;
                return (
                  <Link
                    key={slice.skill}
                    to={slice.to}
                    className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 p-2.5 transition-colors hover:bg-slate-50 dark:border-hairline dark:bg-ink-800 dark:hover:bg-ink-700"
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]"
                      style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}
                    >
                      <Icon size={17} className="text-white" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">
                        {slice.total} {slice.total === 1 ? SKILL_LABEL[slice.skill].toLowerCase().replace(/s$/, '') : SKILL_LABEL[slice.skill].toLowerCase()}
                      </span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {complete ? 'Finished' : `${slice.total - slice.done} still to do`}
                      </span>
                    </span>
                    <span
                      className={`text-xs font-extrabold tabular-nums ${
                        complete ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {slice.done} / {slice.total}
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {canCheckpoint && (
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-hairline dark:bg-ink-800">
            <div className="flex items-center gap-2.5">
              <Target size={18} className="text-brand-600 dark:text-iris-400" aria-hidden="true" />
              <h3 className="font-display font-bold text-slate-900 dark:text-white">Week {week.week} checkpoint</h3>
            </div>
            <p className="mt-2 text-sm leading-snug text-slate-600 dark:text-slate-300">{week.checkpoint.en}</p>
            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCheckpointOpen(!checkpointOpen)}
                className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 transition-colors hover:bg-white dark:border-white/16 dark:text-slate-200 dark:hover:bg-ink-700"
              >
                {checkpointOpen ? 'Hide checkpoint' : best != null ? 'Retake the checkpoint' : 'Take the checkpoint'}
              </button>
              <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
                Pass mark {Math.round(threshold * 100)}% ·{' '}
                {best == null ? 'not taken yet' : `best ${Math.round(best * 100)}%`}
              </span>
            </div>
            {checkpointOpen && (
              <div className="mt-3">
                <WeeklyCheckpoint week={week} />
              </div>
            )}
          </section>
        )}

        <p className="text-xs leading-snug text-slate-400 dark:text-slate-500">
          Everything you finish here comes back for review after {week.reviewDaysAfter.join(', ')} days.
        </p>
      </div>
    </>
  );
}
