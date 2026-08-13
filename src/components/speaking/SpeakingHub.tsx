import { useMemo, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { SegmentedTabs } from '../SegmentedTabs';
import { EngineNote, type SpeakingEngine } from './EngineNote';
import { Phrasebook } from './Phrasebook';
import { CategoryBanner } from '../learning/CategoryBanner';
import { DIFFICULTY_LABELS, SCENARIOS, type Scenario } from '../../data/scenarios';
import { type ProgressState, type SpeakingSession } from '../../lib/progressStore';
import {
  agoLabel,
  listOpenSessions,
  pickNextSpeak,
  scenarioState,
  sessionPercent,
  type ScenarioState,
} from '../../lib/speakingProgress';
import type { JlptLevel } from '../../types';
import { JLPT_LEVELS } from '../../types';

interface SpeakingHubProps {
  progress: ProgressState;
  engine: SpeakingEngine;
  tab: 'chat' | 'phrases';
  onTabChange: (tab: 'chat' | 'phrases') => void;
  onPick: (scenario: Scenario) => void;
  speak: (text: string) => void;
}

/** How many scenarios the library shows before asking. */
const INITIAL_VISIBLE = 6;

/**
 * The Speaking landing page: one scenario Kai recommends, whatever was left half-finished, and the
 * library behind it — plus the phrase drill on its own tab.
 */
export function SpeakingHub({ progress, engine, tab, onTabChange, onPick, speak }: SpeakingHubProps) {
  const level = progress.level;
  const next = useMemo(() => pickNextSpeak(progress, level), [progress, level]);
  const open = useMemo(() => listOpenSessions(progress), [progress]);  // Lives here rather than inside Library so the banner can host it, in the same corner every section
  // puts its level control. It filters the scenario grid; it is not the learner's own JLPT level.
  const [filter, setFilter] = useState<JlptLevel | 'all'>('all');

  return (
    <div className="w-full space-y-6">
      <CategoryBanner
        category="speaking"
        title="Speaking"
        subtitle="Speak with confidence, practice out loud."
        levels={
          <SegmentedTabs
            value={filter}
            onChange={setFilter}
            variant="glass"
            size="sm"
            groupLabel="Scenario level"
            options={[
              { value: 'all' as const, label: 'All' },
              ...JLPT_LEVELS.map((lvl) => ({ value: lvl, label: lvl })),
            ]}
          />
        }
        // The one thing the old Kai hero was for: it opens Kai's pick, or whatever conversation was
        // left mid-way.
        action={
          next
            ? {
                label: next.kind === 'resume' ? 'Continue speaking' : 'Start speaking',
                onClick: () => onPick(next.scenario),
              }
            : undefined
        }
      />

      {/* Where Kai runs belongs beside the mode switch: it's a property of the conversation, and the
          banner above is the section's identity, not its settings. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <SegmentedTabs
          value={tab}
          onChange={onTabChange}
          groupLabel="Speaking mode"
          options={[
            { value: 'chat', label: <TabLabel title="Conversations" hint="role-play" /> },
            { value: 'phrases', label: <TabLabel title="Phrases" hint="pronunciation" /> },
          ]}
        />
        <EngineNote engine={engine} />
      </div>

      {tab === 'phrases' ? (
        <Phrasebook progress={progress} scenario={next?.scenario ?? null} speak={speak} />
      ) : (
        <div className="space-y-7">
          {open.length > 0 && <ContinueSection open={open} onPick={onPick} />}
          <Library progress={progress} level={level} filter={filter} onPick={onPick} />
        </div>
      )}
    </div>
  );
}

function TabLabel({ title, hint }: { title: string; hint: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      {title}
      <span className="text-[11.5px] font-semibold opacity-70">{hint}</span>
    </span>
  );
}

// ── Pick up where you stopped ─────────────────────────────────────────────────
function ContinueSection({
  open,
  onPick,
}: {
  open: { scenario: Scenario; session: SpeakingSession }[];
  onPick: (scenario: Scenario) => void;
}) {
  return (
    <section aria-labelledby="speaking-continue">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="speaking-continue" className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Pick up where you stopped
        </h2>
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          {open.length} conversation{open.length === 1 ? '' : 's'} left mid-way
        </p>
      </div>

      <div className="space-y-2.5">
        {open.map(({ scenario, session }) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => onPick(scenario)}
            className="flex w-full items-center gap-4 rounded-[22px] border border-slate-200 bg-white p-3.5 pr-4 text-left transition-colors hover:border-brand-400 sm:gap-5 sm:px-5 dark:border-hairline dark:bg-ink-900 dark:hover:border-iris-800"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl dark:bg-ink-800"
            >
              {scenario.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-slate-900 dark:text-white">
                {scenario.title.en}
              </span>
              <span className="jp-text mt-0.5 block truncate text-[13px] text-slate-500 dark:text-slate-400">
                {session.lastLine || scenario.opening.ja}
              </span>
            </span>
            <span className="hidden w-[170px] shrink-0 flex-col gap-1.5 sm:flex">
              <span className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="tabular-nums">
                  {session.turns} / {session.turnGoal} turns
                </span>
                <span className="font-semibold text-slate-400 dark:text-slate-500">
                  {agoLabel(session.updatedAt)}
                </span>
              </span>
              <span className="block h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-iris-400"
                  style={{ width: `${Math.round(sessionPercent(session) * 100)}%` }}
                />
              </span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2 text-[13.5px] font-bold text-brand-700 dark:border-iris-400/30 dark:bg-iris-500/15 dark:text-brand-200">
              Resume
              <ArrowRight size={14} aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── Library ───────────────────────────────────────────────────────────────────
function Library({
  progress,
  level,
  filter,
  onPick,
}: {
  progress: ProgressState;
  level: JlptLevel;
  /** Owned by the hub, because the control that sets it lives in the banner. */
  filter: JlptLevel | 'all';
  onPick: (scenario: Scenario) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  // Gentlest first, so the six cards shown before "show more" are the six a learner at this level can
  // actually walk into — not whichever six the data file happens to list first.
  const visible = useMemo(
    () =>
      SCENARIOS.filter((s) => filter === 'all' || s.level === filter).sort(
        (a, b) =>
          JLPT_LEVELS.indexOf(a.level) - JLPT_LEVELS.indexOf(b.level) ||
          a.difficulty - b.difficulty ||
          a.minutes - b.minutes,
      ),
    [filter],
  );
  const shown = expanded ? visible : visible.slice(0, INITIAL_VISIBLE);
  const hidden = visible.length - shown.length;

  return (
    <section aria-labelledby="speaking-library">
      <div className="mb-3.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="speaking-library" className="font-display text-lg font-bold text-slate-900 dark:text-white">
          Explore scenarios
        </h2>
        {/* Counts what the banner's level filter is actually showing, not the whole library — the control
            is up in the banner now, so this line is the only thing that confirms it did something. */}
        <p className="text-[13px] text-slate-500 dark:text-slate-400">
          {visible.length} role-play{visible.length === 1 ? '' : 's'} · Kai stays in character
        </p>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fill,minmax(21rem,1fr))]">
        {shown.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            state={scenarioState(scenario, progress, level)}
            session={progress.speakingSessions[scenario.id]}
            onPick={onPick}
          />
        ))}
      </div>

      {hidden > 0 && (
        <div className="mt-4.5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-brand-400 hover:text-slate-900 dark:border-hairline dark:bg-ink-900 dark:text-slate-300 dark:hover:border-iris-800 dark:hover:text-brand-200"
          >
            Show {hidden} more scenario{hidden === 1 ? '' : 's'}
          </button>
        </div>
      )}
    </section>
  );
}

const STATE_LABELS: Record<ScenarioState, string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  'above-level': 'Above your level',
  'not-started': 'Not started',
};

const STATE_TEXT: Record<ScenarioState, string> = {
  completed: 'text-emerald-600 dark:text-emerald-400',
  'in-progress': 'text-brand-600 dark:text-brand-300',
  'above-level': 'text-slate-400 dark:text-slate-500',
  'not-started': 'text-slate-400 dark:text-slate-500',
};

/** Finished and in-flight scenarios carry their state in the border, so a full grid is still scannable. */
const STATE_FRAME: Record<ScenarioState, string> = {
  completed: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-[#0b1524]',
  'in-progress': 'border-brand-200 bg-white dark:border-iris-800/70 dark:bg-ink-900',
  'above-level': 'border-slate-200 bg-white dark:border-hairline dark:bg-ink-900',
  'not-started': 'border-slate-200 bg-white dark:border-hairline dark:bg-ink-900',
};

function ScenarioCard({
  scenario,
  state,
  session,
  onPick,
}: {
  scenario: Scenario;
  state: ScenarioState;
  session?: SpeakingSession;
  onPick: (scenario: Scenario) => void;
}) {
  const inProgress = state === 'in-progress' && session;

  return (
    <button
      type="button"
      onClick={() => onPick(scenario)}
      // Above-level scenarios are dimmed, not disabled: it's a warning about difficulty, and the
      // learner who wants to try one anyway is exactly the learner who should.
      className={`flex flex-col gap-3.5 rounded-3xl border p-4 pb-3.5 text-left transition-colors hover:border-brand-400 sm:px-5 dark:hover:border-iris-400/60 ${STATE_FRAME[state]} ${
        state === 'above-level' ? 'opacity-65 hover:opacity-100' : ''
      }`}
    >
      <span className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xl dark:bg-ink-800"
        >
          {scenario.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">{scenario.title.en}</span>
            {state === 'completed' && (
              <span
                title="Completed"
                className="inline-flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              >
                <Check size={11} strokeWidth={3.5} aria-hidden="true" />
              </span>
            )}
          </span>
          <span className="mt-1 block text-[13.5px] leading-relaxed text-pretty text-slate-500 dark:text-slate-400">
            {scenario.blurb.en}
          </span>
        </span>
      </span>

      {inProgress && (
        <span className="flex items-center gap-2.5">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-iris-400"
              style={{ width: `${Math.round(sessionPercent(session) * 100)}%` }}
            />
          </span>
          <span className="text-[11.5px] font-bold text-brand-600 tabular-nums dark:text-brand-300">
            {session.turns} / {session.turnGoal} turns
          </span>
        </span>
      )}

      <span className="mt-auto flex items-center gap-3 border-t border-slate-100 pt-3 text-xs font-bold text-slate-500 dark:border-white/[0.07] dark:text-slate-400">
        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 tracking-wide text-slate-600 dark:bg-ink-800 dark:text-brand-300">
          {scenario.level}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="flex gap-[3px]" aria-hidden="true">
            {[1, 2, 3].map((dot) => (
              <span
                key={dot}
                className={`h-1.5 w-1.5 rounded-full ${
                  dot <= scenario.difficulty ? 'bg-iris-400' : 'bg-slate-200 dark:bg-ink-700'
                }`}
              />
            ))}
          </span>
          {DIFFICULTY_LABELS[scenario.difficulty]}
        </span>
        <span className="font-semibold text-slate-400 tabular-nums dark:text-slate-500">
          {scenario.minutes} min
        </span>
        <span className={`ml-auto font-bold ${STATE_TEXT[state]}`}>{STATE_LABELS[state]}</span>
      </span>
    </button>
  );
}
