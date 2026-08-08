import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Flag, Lock, ChevronDown } from 'lucide-react';
import { Card } from '../../components/Card';
import { SectionBanner } from '../../components/learning/SectionBanner';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { Bilingual } from '../../components/Bilingual';
import { ROADMAP } from '../../data/roadmap';
import { evaluateGate, type GateProgress } from '../../lib/roadmapGate';
import { useProgress } from '../../lib/progressStore';
import { srsKey } from '../../lib/srs';
import { hasCheckpoint } from '../../lib/checkpoint';
import { WeeklyCheckpoint } from '../../components/path/WeeklyCheckpoint';
import type { JlptLevel, RoadmapPhase, RoadmapWeek } from '../../types';
import { JLPT_LEVELS } from '../../types';

type WeekStatus = 'mastered' | 'current' | 'upcoming';

const PHASE_LABEL: Record<RoadmapPhase, string> = {
  N5: 'Weeks 1–6 · N5 foundations',
  N4: 'Weeks 7–14 · N4',
  N3: 'Weeks 15–20 · N3 expansion',
  consolidation: 'Weeks 21–22 · Consolidation & mock assessments',
};

const PHASE_ORDER: RoadmapPhase[] = ['N5', 'N4', 'N3', 'consolidation'];

// Phases use only the app's own working hues (emerald / brand-indigo / amber / slate) — no
// violet or cyan gradients — and the order encodes progress: start → core → stretch → review.
const PHASE_BADGE: Record<RoadmapPhase, string> = {
  N5: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  N4: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  N3: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  consolidation: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

function weekContentIds(week: RoadmapWeek) {
  const g = new Set<string>();
  const v = new Set<string>();
  const k = new Set<string>();
  const r = new Set<string>();
  for (const u of week.units) {
    u.grammarIds.forEach((id) => g.add(id));
    u.vocabIds.forEach((id) => v.add(id));
    u.kanjiIds.forEach((id) => k.add(id));
    u.readingIds.forEach((id) => r.add(id));
  }
  return { grammar: [...g], vocab: [...v], kanji: [...k], reading: [...r] };
}

function countIn(ids: string[], set: Set<string>) {
  return ids.filter((id) => set.has(id)).length;
}

export function LearningPath() {
  const progress = useProgress();
  const [openWeek, setOpenWeek] = useState<number | null>(null);
  const [checkpointOpen, setCheckpointOpen] = useState<number | null>(null);

  const gateProgress: GateProgress = useMemo(
    () => ({
      completedGrammarIds: progress.completedGrammarIds,
      learnedKanjiIds: progress.learnedKanjiIds,
      completedReadingIds: progress.completedReadingIds,
      srsCards: progress.srsCards,
      checkpointAccuracyByWeek: progress.weeklyCheckpoints,
    }),
    [progress],
  );

  // A week is "mastered" when its full mastery gate passes. Weeks whose gate wants a checkpoint but
  // have no checkpoint questions available (e.g. vocab-only weeks) fall back to their measurable
  // content criteria, so the gate can never become impossible to satisfy.
  const masteredMap = useMemo(() => {
    const map = new Map<number, boolean>();
    for (const w of ROADMAP) {
      const evalr = evaluateGate(w, gateProgress);
      if (hasCheckpoint(w)) {
        map.set(w.week, evalr.passed);
      } else {
        const measurable = evalr.criteria.filter((c) => c.key !== 'checkpoint');
        map.set(w.week, measurable.length > 0 && measurable.every((c) => c.met));
      }
    }
    return map;
  }, [gateProgress]);

  function statusOf(week: RoadmapWeek): WeekStatus {
    if (masteredMap.get(week.week)) return 'mastered';
    const prereqsMet = week.prerequisiteWeeks.every((w) => masteredMap.get(w));
    return prereqsMet ? 'current' : 'upcoming';
  }

  const masteredCount = ROADMAP.filter((w) => masteredMap.get(w.week)).length;

  // Where the route actually stands: the first week that's unlocked and not yet shown. Everything
  // mastered means the last week is the one still worth revisiting, not a 23rd that doesn't exist.
  const currentWeek = ROADMAP.find((w) => statusOf(w) === 'current')?.week ?? ROADMAP[ROADMAP.length - 1].week;

  // The route's phases *are* the JLPT levels, so the banner's toggle narrows the page to one of them
  // rather than filtering a list — 22 week cards is a lot to scroll when you only want your own level.
  // Consolidation lives under "All", which is where a whole-route view belongs.
  const [phaseFilter, setPhaseFilter] = useState<JlptLevel | 'all'>('all');

  function openCurrentWeek() {
    setOpenWeek(currentWeek);
    document.getElementById(`roadmap-week-${currentWeek}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="space-y-6">
      <SectionBanner
        title="Learning Path"
        accent="var(--color-iris-500)"
        icon={Flag}
        kanji="道"
        value={currentWeek}
        valuePrefix="Week "
        detail={`of ${ROADMAP.length}`}
        progress={currentWeek / ROADMAP.length}
        levels={
          <SegmentedTabs
            value={phaseFilter}
            onChange={setPhaseFilter}
            variant="glass"
            size="sm"
            groupLabel="Roadmap phase"
            options={[
              { value: 'all' as const, label: 'All' },
              ...JLPT_LEVELS.map((l) => ({ value: l, label: l })),
            ]}
          />
        }
        action={{ label: `Continue week ${currentWeek}`, onClick: openCurrentWeek }}
      />

      {/* Capped at a comfortable measure even though the page itself is full-width — long prose lines are
          the one thing that shouldn't stretch with the viewport. */}
      <p className="max-w-3xl text-slate-500 dark:text-slate-400">
        A 22-week route that starts from <strong>N5 basics</strong> (weeks 1–6), completes <strong>N4</strong>
        (weeks 7–14) for a strong N4, then adds an optional <strong>N3</strong> stretch (weeks 15–20) before
        consolidation. Weeks are guided by mastery — you’re ready to move on once you’ve <em>shown</em> the
        previous week, not after a set number of days.
      </p>

      <Card className="p-5 grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">Core route</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            <strong>75–90 min/day.</strong> Builds N5 foundations first, then completes N4 — grammar, vocabulary, kanji, reading, listening and speaking.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">N3 stretch</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            <strong>+30–60 min/day</strong> of extra reading, listening and review. Reaches into N3 from week 15 — achievable for fast, consistent learners, but no exam guarantee.
          </p>
        </div>
        <p className="sm:col-span-2 text-xs text-slate-400">
          {masteredCount} of {ROADMAP.length} weeks mastered · reviews resurface after 1, 3, 7, 14 and 30 days.
        </p>
      </Card>

      {PHASE_ORDER.filter((p) => phaseFilter === 'all' || p === phaseFilter).map((phase) => (
        <section key={phase} className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{PHASE_LABEL[phase]}</h2>
          {/* Two weeks abreast from xl, three on a very wide display so the cards stay a readable width
              instead of stretching — `items-start` so expanding one week doesn't stretch its neighbour
              to match. */}
          <div className="grid gap-3 xl:grid-cols-2 xl:items-start 2xl:grid-cols-3">
            {ROADMAP.filter((w) => w.phase === phase).map((week) => {
              const status = statusOf(week);
              const ids = weekContentIds(week);
              const open = openWeek === week.week;
              const chips: { label: string; done: number; total: number }[] = [
                { label: 'Grammar', done: countIn(ids.grammar, new Set(progress.completedGrammarIds)), total: ids.grammar.length },
                { label: 'Kanji', done: countIn(ids.kanji, new Set(progress.learnedKanjiIds)), total: ids.kanji.length },
                {
                  label: 'Vocab',
                  done: ids.vocab.filter((id) => (progress.srsCards[srsKey('vocabulary', id)]?.repetitions ?? 0) >= 1).length,
                  total: ids.vocab.length,
                },
                { label: 'Reading', done: countIn(ids.reading, new Set(progress.completedReadingIds)), total: ids.reading.length },
              ].filter((c) => c.total > 0);

              return (
                <Card
                  key={week.week}
                  id={`roadmap-week-${week.week}`}
                  className={`p-0 overflow-hidden ${status === 'upcoming' ? 'opacity-70' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenWeek(open ? null : week.week)}
                    aria-expanded={open}
                    className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="mt-0.5 shrink-0">
                      {status === 'mastered' ? (
                        <CheckCircle2 size={22} className="text-emerald-500" />
                      ) : status === 'current' ? (
                        <Circle size={22} className="text-brand-500" />
                      ) : (
                        <Lock size={20} className="text-slate-400" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-400">WEEK {week.week}</span>
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${PHASE_BADGE[week.phase]}`}>{week.level}</span>
                        {week.mixedReview && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Mixed review
                          </span>
                        )}
                      </div>
                      <Bilingual text={week.theme} className="mt-1 font-semibold" />
                      <div className="flex gap-2 flex-wrap mt-2">
                        {chips.map((c) => (
                          <span
                            key={c.label}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              c.done >= c.total
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {c.label} {c.done}/{c.total}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronDown size={18} className={`mt-1 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {open && (
                    <div className="px-4 pb-4 pl-[3.25rem] space-y-3 text-sm">
                      <p className="text-slate-500 dark:text-slate-400">{week.focus.en}</p>
                      {week.units.map((u) => (
                        <div key={u.id}>
                          <p className="font-medium text-slate-700 dark:text-slate-200">{u.title.en}</p>
                          <ul className="list-disc list-inside text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
                            {u.objectives.map((o, i) => (
                              <li key={i}>{o.en}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Mastery gate</p>
                        <p className="text-slate-600 dark:text-slate-300">{week.gate.summary.en}</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        Checkpoint: {week.checkpoint.en} · Reviews after {week.reviewDaysAfter.join(', ')} days.
                      </p>

                      {hasCheckpoint(week) &&
                        (() => {
                          const best = progress.weeklyCheckpoints[week.week];
                          const showing = checkpointOpen === week.week;
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => setCheckpointOpen(showing ? null : week.week)}
                                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
                                >
                                  {showing ? 'Hide checkpoint' : best != null ? 'Retake checkpoint' : 'Take the checkpoint'}
                                </button>
                                {best != null && (
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Best: {Math.round(best * 100)}%
                                  </span>
                                )}
                              </div>
                              {showing && <WeeklyCheckpoint week={week} />}
                            </div>
                          );
                        })()}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
