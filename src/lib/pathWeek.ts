import { ROADMAP } from '../data/roadmap';
import { evaluateGate, type GateProgress } from './roadmapGate';
import { hasCheckpoint } from './checkpoint';
import { srsKey } from './srs';
import type { ProgressState } from './progressStore';
import type { RoadmapPhase, RoadmapWeek } from '../types';

/**
 * The Learning Path's view of a week: which of its four skills are done, and where the week sits on
 * the route. Kept out of the page so the spine, the "you are here" card and the week panel all read
 * the same numbers instead of each recomputing them slightly differently.
 */

export type PathSkill = 'grammar' | 'vocabulary' | 'kanji' | 'reading';

export const PATH_SKILLS: PathSkill[] = ['grammar', 'vocabulary', 'kanji', 'reading'];

export interface SkillSlice {
  skill: PathSkill;
  ids: string[];
  done: number;
  total: number;
  /** The first item the learner has not finished — what "continue" should open. Null when done. */
  nextId: string | null;
  /** Route for `nextId`, or the module index when the week has nothing left (or nothing at all). */
  to: string;
}

const MODULE_INDEX: Record<PathSkill, string> = {
  grammar: '/grammar',
  vocabulary: '/vocabulary',
  kanji: '/kanji',
  reading: '/reading',
};

export function weekContentIds(week: RoadmapWeek): Record<PathSkill, string[]> {
  const grammar = new Set<string>();
  const vocabulary = new Set<string>();
  const kanji = new Set<string>();
  const reading = new Set<string>();
  for (const unit of week.units) {
    unit.grammarIds.forEach((id) => grammar.add(id));
    unit.vocabIds.forEach((id) => vocabulary.add(id));
    unit.kanjiIds.forEach((id) => kanji.add(id));
    unit.readingIds.forEach((id) => reading.add(id));
  }
  return { grammar: [...grammar], vocabulary: [...vocabulary], kanji: [...kanji], reading: [...reading] };
}

/** A vocab word counts once it has survived one review — the same bar the mastery gate uses. */
function vocabDone(id: string, progress: ProgressState): boolean {
  return (progress.srsCards[srsKey('vocabulary', id)]?.repetitions ?? 0) >= 1;
}

export function weekSkills(week: RoadmapWeek, progress: ProgressState): SkillSlice[] {
  const ids = weekContentIds(week);
  const isDone: Record<PathSkill, (id: string) => boolean> = {
    grammar: (id) => progress.completedGrammarIds.includes(id),
    vocabulary: (id) => vocabDone(id, progress),
    kanji: (id) => progress.learnedKanjiIds.includes(id),
    reading: (id) => progress.completedReadingIds.includes(id),
  };

  return PATH_SKILLS.map((skill) => {
    const list = ids[skill];
    const done = list.filter(isDone[skill]).length;
    const nextId = list.find((id) => !isDone[skill](id)) ?? null;
    return {
      skill,
      ids: list,
      done,
      total: list.length,
      nextId,
      to: nextId ? `${MODULE_INDEX[skill]}/${nextId}` : MODULE_INDEX[skill],
    };
  });
}

export type WeekStatus = 'mastered' | 'current' | 'available' | 'locked';

export interface RouteState {
  statusOf: (week: number) => WeekStatus;
  masteredCount: number;
  /** The one week worth working on. Falls back to the last week once everything is mastered. */
  currentWeek: number;
}

export function gateProgressFrom(progress: ProgressState): GateProgress {
  return {
    completedGrammarIds: progress.completedGrammarIds,
    learnedKanjiIds: progress.learnedKanjiIds,
    completedReadingIds: progress.completedReadingIds,
    srsCards: progress.srsCards,
    checkpointAccuracyByWeek: progress.weeklyCheckpoints,
  };
}

/**
 * Mastery, unchanged from the first version of this page: a week is mastered when its gate passes,
 * except that a week whose gate wants a checkpoint it cannot offer (no grammar points, so no
 * questions) falls back to its measurable criteria — otherwise that gate could never be satisfied.
 */
export function buildRouteState(progress: ProgressState): RouteState {
  const gateProgress = gateProgressFrom(progress);
  const mastered = new Map<number, boolean>();
  for (const week of ROADMAP) {
    const evaluation = evaluateGate(week, gateProgress);
    if (hasCheckpoint(week)) {
      mastered.set(week.week, evaluation.passed);
    } else {
      const measurable = evaluation.criteria.filter((c) => c.key !== 'checkpoint');
      mastered.set(week.week, measurable.length > 0 && measurable.every((c) => c.met));
    }
  }

  const unlocked = (week: RoadmapWeek) => week.prerequisiteWeeks.every((w) => mastered.get(w));
  const current = ROADMAP.find((w) => !mastered.get(w.week) && unlocked(w))?.week
    ?? ROADMAP[ROADMAP.length - 1].week;

  function statusOf(weekNumber: number): WeekStatus {
    const week = ROADMAP.find((w) => w.week === weekNumber);
    if (!week) return 'locked';
    if (mastered.get(week.week)) return 'mastered';
    if (!unlocked(week)) return 'locked';
    return week.week === current ? 'current' : 'available';
  }

  return {
    statusOf,
    masteredCount: ROADMAP.filter((w) => mastered.get(w.week)).length,
    currentWeek: current,
  };
}

export const PHASE_ORDER: RoadmapPhase[] = ['N5', 'N4', 'N3', 'consolidation'];

export interface Station {
  phase: RoadmapPhase;
  name: string;
  blurb: string;
  weeks: RoadmapWeek[];
  firstWeek: number;
  lastWeek: number;
  mastered: number;
  /** The N3 phase is the stretch — the spine draws it on a branch off the main line. */
  optional: boolean;
}

const STATION_COPY: Record<RoadmapPhase, { name: string; blurb: string }> = {
  N5: { name: 'N5 · Foundations', blurb: 'first sentences through the N5 mock' },
  N4: { name: 'N4 · Core', blurb: 'the level this route is built to reach' },
  N3: { name: 'N3 · Stretch', blurb: 'the extra daily time, as weeks of its own · no exam guarantee' },
  consolidation: { name: 'Consolidation', blurb: 'weak-point review and the full mock exams' },
};

export function buildStations(route: RouteState): Station[] {
  return PHASE_ORDER.map((phase) => {
    const weeks = ROADMAP.filter((w) => w.phase === phase);
    return {
      phase,
      ...STATION_COPY[phase],
      weeks,
      firstWeek: weeks[0].week,
      lastWeek: weeks[weeks.length - 1].week,
      mastered: weeks.filter((w) => route.statusOf(w.week) === 'mastered').length,
      optional: phase === 'N3',
    };
  }).filter((s) => s.weeks.length > 0);
}
