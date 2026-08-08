import { useMemo, useState } from 'react';
import { ArrowRight, Check, Volume2 } from 'lucide-react';
import { SegmentedTabs } from '../SegmentedTabs';
import { EngineNote, type SpeakingEngine } from './EngineNote';
import { Phrasebook } from './Phrasebook';
import { SectionBanner } from '../learning/SectionBanner';
import { DIFFICULTY_LABELS, SCENARIOS, type Scenario } from '../../data/scenarios';
import { getSpeakingDays, type ProgressState, type SpeakingSession } from '../../lib/progressStore';
import {
  agoLabel,
  listOpenSessions,
  phrasesForScenario,
  pickNextSpeak,
  scenarioState,
  sessionPercent,
  speakingTotals,
  weakestPhrase,
  type ScenarioState,
} from '../../lib/speakingProgress';
import { MASCOTS } from '../../lib/mascots';
import { SKILL_THEME } from '../../lib/skillTheme';
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
  const open = useMemo(() => listOpenSessions(progress), [progress]);
  const totals = useMemo(() => speakingTotals(progress), [progress]);
  // Lives here rather than inside Library so the banner can host it, in the same corner every section
  // puts its level control. It filters the scenario grid; it is not the learner's own JLPT level.
  const [filter, setFilter] = useState<JlptLevel | 'all'>('all');

  return (
    <div className="w-full space-y-6">
      <SectionBanner
        title="Speaking"
        accent={SKILL_THEME.speaking.from}
        icon={SKILL_THEME.speaking.icon}
        kanji="話"
        value={totals.conversations}
        detail={`conversation${totals.conversations === 1 ? '' : 's'} with Kai${
          totals.completed > 0 ? ` · ${totals.completed} played through` : ''
        }`}
        progress={totals.completed / totals.total}
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
        // The only banner of the six without a CTA. Kai's pick sits a few hundred pixels below with the
        // same action attached to a named scenario and its opening line — two violet buttons doing the
        // identical thing is worse than one, and the richer one wins.
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
          {next && <RecommendedHero next={next} level={level} progress={progress} onPick={onPick} speak={speak} onDrill={() => onTabChange('phrases')} />}
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

// ── Kai's pick ────────────────────────────────────────────────────────────────
interface RecommendedHeroProps {
  next: NonNullable<ReturnType<typeof pickNextSpeak>>;
  level: JlptLevel;
  progress: ProgressState;
  onPick: (scenario: Scenario) => void;
  speak: (text: string) => void;
  onDrill: () => void;
}

/**
 * The banner leads with the line Kai will actually open on, not a description of the scenario. You can
 * hear it before you commit, which is the difference between "start a conversation" being a leap and
 * being the obvious next click — and it's the same night-sky treatment the Dashboard and Reading
 * banners use, dark in both themes.
 */
function RecommendedHero({ next, level, progress, onPick, speak, onDrill }: RecommendedHeroProps) {
  const { scenario, kind, session } = next;
  const resuming = kind === 'resume';
  const percent = session ? Math.round(sessionPercent(session) * 100) : 0;

  return (
    <section
      aria-label="Recommended by Kai"
      className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-[#0a1024]"
    >
      <img
        src="/assets/kotobox-dashboard/generated/hero-background.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(8,12,30,0.95)_0%,rgba(8,12,30,0.78)_46%,rgba(8,12,30,0.35)_100%)]"
      />

      <div className="flex items-start gap-8 p-6 sm:p-7">
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2.5 text-[11px] font-extrabold tracking-[0.16em] text-iris-400">
            KAI · YOUR SPEAKING COACH
            <span className="h-1 w-1 rounded-full bg-white/25" aria-hidden="true" />
            <span className="font-bold tracking-[0.08em] text-slate-400">
              {resuming ? 'WHERE YOU STOPPED' : `PICKED FOR ${level} · TODAY`}
            </span>
          </p>

          <div className="relative mt-4 max-w-2xl rounded-[22px] rounded-tl-lg border border-brand-300/15 bg-white/[0.06] p-4 pr-14 sm:p-5 sm:pr-16">
            <p className="jp-text text-xl leading-relaxed text-white sm:text-[23px]">{scenario.opening.ja}</p>
            <p className="mt-2 text-[13px] italic text-slate-400">{scenario.opening.romaji}</p>
            <p className="mt-1.5 text-sm text-slate-300">{scenario.opening.en}</p>
            <button
              type="button"
              onClick={() => speak(scenario.opening.ja)}
              aria-label="Hear Kai’s opening line"
              className="absolute right-3.5 top-3.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.07] text-brand-300 transition-colors hover:bg-iris-500/35 hover:text-white"
            >
              <Volume2 size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{scenario.title.en}</h2>
            <p className="text-sm text-slate-400">{scenario.blurb.en}</p>
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[13px] text-slate-400">
            <span className="font-semibold text-slate-300">{scenario.level}</span>
            <Dot />
            <span>{DIFFICULTY_LABELS[scenario.difficulty]}</span>
            <Dot />
            <span className="tabular-nums">about {scenario.minutes} min</span>
            {resuming && session && (
              <>
                <Dot />
                <span className="tabular-nums">
                  {session.turns} of {session.turnGoal} turns · {percent}%
                </span>
              </>
            )}
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => onPick(scenario)}
              className="inline-flex items-center gap-3 rounded-[20px] bg-gradient-to-r from-iris-500 to-iris-600 px-6 py-3.5 text-base font-extrabold text-white shadow-[0_10px_28px_-10px_rgba(88,87,231,0.9)] transition-[filter,transform] hover:brightness-110 active:scale-[0.985]"
            >
              <Waveform />
              {resuming ? 'Continue speaking' : 'Start speaking'}
            </button>
          </div>
        </div>

        <img
          src={MASCOTS.speaking}
          alt=""
          aria-hidden="true"
          width={176}
          height={176}
          className="hidden h-44 w-44 shrink-0 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] lg:block"
        />
      </div>

      <HeroFooter scenario={scenario} progress={progress} onDrill={onDrill} />
    </section>
  );
}

/**
 * The strip under the banner: one thing worth fixing on the left, the week's speaking on the right.
 *
 * Both only appear once they mean something — the coaching line needs a recorded attempt to point at,
 * and the week strip needs a week with speaking in it. An empty strip is dropped entirely rather than
 * padded with a row of grey squares.
 */
function HeroFooter({
  scenario,
  progress,
  onDrill,
}: {
  scenario: Scenario;
  progress: ProgressState;
  onDrill: () => void;
}) {
  const weak = useMemo(() => weakestPhrase(progress), [progress]);
  const days = useMemo(() => getSpeakingDays(progress), [progress]);
  const spokenDays = days.filter((d) => d.spoke).length;
  const phraseCount = phrasesForScenario(scenario).length;

  const note = weak ? (
    <>
      <p className="min-w-0 text-sm text-slate-300">
        Your weakest line so far is{' '}
        <span className="jp-text text-white">{weak.phrase.ja}</span> — the mic heard {weak.score}% of it
        back.
      </p>
      <button
        type="button"
        onClick={onDrill}
        className="shrink-0 text-[13.5px] font-bold text-brand-300 transition-colors hover:text-brand-200"
      >
        Drill it →
      </button>
    </>
  ) : phraseCount > 0 ? (
    <>
      <p className="min-w-0 text-sm text-slate-300">
        Kai will use {phraseCount} set phrases here — shadow them first and the conversation gets a lot
        easier.
      </p>
      <button
        type="button"
        onClick={onDrill}
        className="shrink-0 text-[13.5px] font-bold text-brand-300 transition-colors hover:text-brand-200"
      >
        Practise them →
      </button>
    </>
  ) : null;

  if (!note && spokenDays === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/10 bg-black/30 px-6 py-3.5 sm:px-7">
      {note && (
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-accent-500/30 bg-accent-500/15 text-sm font-bold text-accent-500"
          >
            !
          </span>
          {note}
        </div>
      )}
      {spokenDays > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-[12.5px] font-semibold text-slate-400">
            Spoke {spokenDays} of the last 7 days
          </span>
          <span className="flex gap-1.5" aria-hidden="true">
            {days.map((day) => (
              <span
                key={day.date}
                title={`${day.date} — ${day.spoke ? 'spoke with Kai' : 'no speaking'}`}
                className={`h-2.5 w-2.5 rounded-[3px] ${day.spoke ? 'bg-iris-500' : 'bg-white/12'}`}
              />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}

function Waveform() {
  // Five bars rather than a mic glyph: it reads as *your* voice going in, and it's the one mark the
  // Speaking page owns.
  const bars = [7, 14, 10, 16, 6];
  return (
    <span className="flex h-4 items-end gap-[2.5px]" aria-hidden="true">
      {bars.map((height, i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm bg-white/85 first:bg-white/80 even:bg-white"
          style={{ height }}
        />
      ))}
    </span>
  );
}

function Dot() {
  return (
    <span className="text-white/25" aria-hidden="true">
      ·
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
