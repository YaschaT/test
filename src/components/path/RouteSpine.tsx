import { ChevronDown, ChevronRight, Flag, Lock, Repeat } from 'lucide-react';
import { WeekMeter, WeekMeterLegend } from './WeekMeter';
import { weekSkills, type RouteState, type Station, type WeekStatus } from '../../lib/pathWeek';
import type { ProgressState } from '../../lib/progressStore';
import type { BudgetChoice } from '../../lib/pathBudget';
import type { RoadmapWeek } from '../../types';

interface RouteSpineProps {
  stations: Station[];
  route: RouteState;
  progress: ProgressState;
  choice: BudgetChoice;
  onChoiceChange: (choice: BudgetChoice) => void;
  expanded: Set<string>;
  onToggleStation: (phase: string) => void;
  onOpenWeek: (week: RoadmapWeek) => void;
  totalWeeks: number;
}

/**
 * The route as one line rather than a grid of cards.
 *
 * A grid breaks the only thing this screen is about — 1 → 22 in order — because the eye reads across
 * columns. So weeks are rows on a single spine: the line is lit behind everything mastered and hairline
 * ahead of it, phases are stations on that line, and the N3 stretch leaves the line on a dashed branch
 * and rejoins it before consolidation, because that is what "optional" actually means here.
 *
 * Only the station holding the current week is open by default; the rest collapse to a station bar, so
 * the page rests at a handful of rows instead of twenty-two.
 */
export function RouteSpine({
  stations,
  route,
  progress,
  choice,
  onChoiceChange,
  expanded,
  onToggleStation,
  onOpenWeek,
  totalWeeks,
}: RouteSpineProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-hairline dark:bg-ink-900">
      <div className="flex flex-col gap-4 px-1 pb-3.5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-fluid-section-title font-bold text-slate-900 dark:text-white">The route</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {route.masteredCount} of {totalWeeks} weeks mastered · reviews resurface after 1, 3, 7, 14 and 30 days.
          </p>
        </div>
        <div className="shrink-0">
          <p className="mb-1.5 text-[11px] font-bold tracking-[0.12em] text-slate-400 uppercase sm:text-right dark:text-slate-500">
            Your day
          </p>
          <div className="inline-flex gap-0.5 rounded-xl border border-slate-200 bg-white p-1 dark:border-hairline dark:bg-slate-900">
            <RouteButton active={choice === 'core'} onClick={() => onChoiceChange('core')}>
              Core · 75–90 min
            </RouteButton>
            <RouteButton active={choice === 'stretch'} onClick={() => onChoiceChange('stretch')}>
              + stretch · 105–150 min
            </RouteButton>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100 px-1 pb-3 dark:border-white/7">
        <WeekMeterLegend />
      </div>

      {stations.map((station, i) => {
        const open = expanded.has(station.phase);
        const previous = stations[i - 1];
        return (
          <div key={station.phase}>
            {/* The branch out of the main line, and the rejoin after the stretch. */}
            {station.optional && <BranchOut />}
            {previous?.optional && <BranchIn />}

            <StationRow station={station} open={open} onToggle={() => onToggleStation(station.phase)} />

            {open &&
              station.weeks.map((week) => (
                <WeekRow
                  key={week.week}
                  week={week}
                  status={route.statusOf(week.week)}
                  progress={progress}
                  branch={station.optional}
                  onOpen={() => onOpenWeek(week)}
                />
              ))}
          </div>
        );
      })}
    </section>
  );
}

function RouteButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
        active
          ? 'bg-brand-600 text-white shadow-[0_0_0_1px_rgba(58,84,214,0.3),0_0_16px_-2px_rgba(58,84,214,0.7)]'
          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

/** The spine's own gutter: the vertical line plus whatever marker sits on it. */
function Gutter({
  children,
  line,
  branch = false,
}: {
  children: React.ReactNode;
  line: 'lit' | 'ahead' | 'half' | 'none';
  branch?: boolean;
}) {
  return (
    <div className={`relative h-full w-11 shrink-0 ${branch ? 'ml-10' : ''}`}>
      {branch ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-5 w-[3px] rounded-full bg-[repeating-linear-gradient(180deg,#fbbf5a_0_7px,transparent_7px_14px)]"
        />
      ) : (
        <>
          {line === 'lit' && (
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-5 w-[3px] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
            />
          )}
          {line === 'half' && (
            <>
              <span
                aria-hidden="true"
                className="absolute top-0 bottom-1/2 left-5 w-[3px] rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
              />
              <span aria-hidden="true" className="absolute top-1/2 bottom-0 left-5 w-[3px] rounded-full bg-slate-200 dark:bg-ink-700" />
            </>
          )}
          {line === 'ahead' && (
            <span aria-hidden="true" className="absolute inset-y-0 left-5 w-[3px] rounded-full bg-slate-200 dark:bg-ink-700" />
          )}
        </>
      )}
      {children}
    </div>
  );
}

function StationRow({ station, open, onToggle }: { station: Station; open: boolean; onToggle: () => void }) {
  const complete = station.mastered === station.weeks.length;
  const Icon = station.phase === 'consolidation' ? Repeat : Flag;

  return (
    <div className="relative flex min-h-[70px] items-center gap-3.5">
      <Gutter line={complete ? 'lit' : 'ahead'} branch={station.optional}>
        <span
          className={`absolute top-1/2 left-2 grid h-[27px] w-[27px] -translate-y-1/2 place-items-center rounded-[9px] ${
            complete
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]'
              : station.optional
                ? 'border-2 border-amber-400 bg-amber-50 dark:bg-amber-900/40'
                : 'border-2 border-slate-300 bg-white dark:border-white/30 dark:bg-ink-900'
          }`}
        >
          <Icon
            size={14}
            strokeWidth={2.4}
            className={
              complete
                ? 'text-white'
                : station.optional
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-slate-400 dark:text-slate-500'
            }
            aria-hidden="true"
          />
        </span>
      </Gutter>

      <div className="min-w-0 flex-1">
        <p className={`font-bold ${complete ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
          {station.name}
        </p>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          Weeks {station.firstWeek}–{station.lastWeek} · {station.blurb}
        </p>
      </div>

      {complete && (
        <span className="hidden text-[13px] font-bold text-emerald-600 tabular-nums sm:inline dark:text-emerald-400">
          {station.mastered} / {station.weeks.length} mastered
        </span>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/12 dark:text-slate-300 dark:hover:bg-ink-800"
      >
        {open ? 'Hide' : `Show ${station.weeks.length} weeks`}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
    </div>
  );
}

function WeekRow({
  week,
  status,
  progress,
  branch,
  onOpen,
}: {
  week: RoadmapWeek;
  status: WeekStatus;
  progress: ProgressState;
  branch: boolean;
  onOpen: () => void;
}) {
  const slices = weekSkills(week, progress);
  const locked = status === 'locked';
  const current = status === 'current';

  return (
    <button
      type="button"
      onClick={onOpen}
      id={`path-week-${week.week}`}
      className={`relative flex w-full min-h-14 items-center gap-3.5 rounded-xl px-1 text-left transition-colors ${
        current
          ? 'bg-gradient-to-r from-brand-500/10 via-brand-500/[0.03] to-transparent dark:from-iris-400/16 dark:via-iris-400/5'
          : 'hover:bg-slate-50 dark:hover:bg-ink-800'
      }`}
    >
      <Gutter line={status === 'mastered' ? 'lit' : current ? 'half' : 'ahead'} branch={branch}>
        {status === 'mastered' ? (
          <span className="absolute top-1/2 left-[10px] grid h-[23px] w-[23px] -translate-y-1/2 place-items-center rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden="true">
              <path d="m5 12.5 4.5 4.5L19 7" />
            </svg>
          </span>
        ) : current ? (
          <span className="absolute top-1/2 left-2 h-[27px] w-[27px] -translate-y-1/2 rounded-full border-[3px] border-brand-600 bg-white shadow-[0_0_0_6px_rgba(88,87,231,0.13)] dark:border-iris-400 dark:bg-ink-900 dark:shadow-[0_0_0_6px_rgba(125,122,242,0.16)]" />
        ) : locked ? (
          <span className="absolute top-1/2 left-4 h-[11px] w-[11px] -translate-y-1/2 rounded-full bg-slate-200 dark:bg-ink-700" />
        ) : (
          <span className="absolute top-1/2 left-[10px] h-[23px] w-[23px] -translate-y-1/2 rounded-full border-2 border-slate-300 bg-white dark:border-white/25 dark:bg-ink-900" />
        )}
      </Gutter>

      <span className={`w-6 shrink-0 text-xs font-bold tabular-nums ${
        current ? 'text-brand-600 dark:text-iris-400' : locked ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'
      }`}>
        {String(week.week).padStart(2, '0')}
      </span>

      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[15px] ${
          current ? 'font-extrabold text-slate-900 dark:text-white' : locked ? 'font-medium text-slate-400 dark:text-slate-500' : 'font-semibold text-slate-700 dark:text-slate-200'
        }`}>
          {week.theme.en}
        </span>
        {current && (
          <span className="block text-[11px] font-bold tracking-[0.08em] text-brand-600 uppercase dark:text-iris-400">
            You are here
          </span>
        )}
      </span>

      {locked ? (
        <span className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex dark:text-slate-500">
          <Lock size={13} aria-hidden="true" />
          Opens when week {week.prerequisiteWeeks[week.prerequisiteWeeks.length - 1]} is shown
        </span>
      ) : (
        <WeekMeter slices={slices} />
      )}

      <span className="flex w-20 shrink-0 justify-end">
        {status === 'mastered' ? (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Mastered</span>
        ) : (
          <ChevronRight
            size={17}
            className={current ? 'text-brand-600 dark:text-iris-400' : 'text-slate-400 dark:text-slate-500'}
            aria-hidden="true"
          />
        )}
      </span>
    </button>
  );
}

/** The core line carrying on while the stretch curves away to the right. */
function BranchOut() {
  return (
    <div className="relative h-16" aria-hidden="true">
      <svg width="120" height="64" viewBox="0 0 120 64" className="absolute top-0 left-0">
        <path d="M21.5 0 V64" strokeWidth="3" fill="none" strokeLinecap="round" className="stroke-slate-200 dark:stroke-ink-700" />
        <path d="M21.5 4 C21.5 30, 61.5 26, 61.5 50 V64" stroke="#fbbf5a" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="7 7" />
      </svg>
      <p className="absolute top-1/2 left-32 -translate-y-1/2 pr-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="mr-2 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] text-amber-700 uppercase dark:bg-amber-900/60 dark:text-amber-300">
          Stretch
        </span>
        From here the extra 30–60 minutes a day become weeks of their own.
      </p>
    </div>
  );
}

/** The stretch rejoining the core line before consolidation. */
function BranchIn() {
  return (
    <div className="relative h-11" aria-hidden="true">
      <svg width="120" height="44" viewBox="0 0 120 44" className="absolute top-0 left-0">
        <path d="M21.5 0 V44" strokeWidth="3" fill="none" strokeLinecap="round" className="stroke-slate-200 dark:stroke-ink-700" />
        <path d="M61.5 0 C61.5 18, 21.5 14, 21.5 34" stroke="#fbbf5a" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="7 7" />
      </svg>
    </div>
  );
}
