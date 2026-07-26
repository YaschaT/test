import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Lock, ChevronDown } from 'lucide-react';
import { Card } from '../../components/Card';
import { Bilingual } from '../../components/Bilingual';
import { ROADMAP } from '../../data/roadmap';
import { evaluateGate, type GateProgress } from '../../lib/roadmapGate';
import { useProgress } from '../../lib/progressStore';
import { srsKey } from '../../lib/srs';
import type { RoadmapPhase, RoadmapWeek } from '../../types';

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

  const gateProgress: GateProgress = useMemo(
    () => ({
      completedGrammarIds: progress.completedGrammarIds,
      learnedKanjiIds: progress.learnedKanjiIds,
      completedReadingIds: progress.completedReadingIds,
      srsCards: progress.srsCards,
      checkpointAccuracyByWeek: {}, // weekly checkpoint quizzes are not wired to the store yet
    }),
    [progress],
  );

  // "Content readiness" ignores the checkpoint criterion (not yet trackable) so the guide stays useful
  // today: a week counts as mastered once its measurable content criteria are met.
  const contentMet = useMemo(() => {
    const map = new Map<number, boolean>();
    for (const w of ROADMAP) {
      const measurable = evaluateGate(w, gateProgress).criteria.filter((c) => c.key !== 'checkpoint');
      map.set(w.week, measurable.length > 0 && measurable.every((c) => c.met));
    }
    return map;
  }, [gateProgress]);

  function statusOf(week: RoadmapWeek): WeekStatus {
    if (contentMet.get(week.week)) return 'mastered';
    const prereqsMet = week.prerequisiteWeeks.every((w) => contentMet.get(w));
    return prereqsMet ? 'current' : 'upcoming';
  }

  const masteredCount = ROADMAP.filter((w) => contentMet.get(w.week)).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Learning Path</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          A 22-week route to a strong N4, with an optional N3 stretch. Weeks are guided by mastery — you’re
          ready to move on once you’ve <em>shown</em> the previous week, not after a set number of days.
        </p>
      </header>

      <Card className="p-5 grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-400">Core route</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            <strong>75–90 min/day.</strong> Grammar, vocabulary, kanji, reading, listening and speaking — the full path to a strong N4.
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

      {PHASE_ORDER.map((phase) => (
        <section key={phase} className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">{PHASE_LABEL[phase]}</h2>
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
              <Card key={week.week} className={`p-0 overflow-hidden ${status === 'upcoming' ? 'opacity-70' : ''}`}>
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
                  </div>
                )}
              </Card>
            );
          })}
        </section>
      ))}
    </div>
  );
}
