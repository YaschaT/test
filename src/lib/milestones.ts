import type { ProgressState } from './progressStore';
import type { Translatable } from '../types';

/**
 * The "next milestone" each category carries — a small, repeating target that always has one more rung.
 *
 * Every milestone counts something the app already records, so none of them need their own storage and
 * none can drift out of step with real progress. They repeat rather than run out: learn thirteen kanji
 * and the milestone reads 3 / 10 toward the next ten, which is what keeps a category banner from going
 * blank the moment you're good at it.
 *
 * XP follows the same rule as the rest of the app — derived, never stored (see xp.ts). The reward is
 * paid per completed rung, so it can be recomputed from scratch at any time and lands on the same
 * number.
 */

export type MilestoneCategory =
  | 'dashboard'
  | 'learning-path'
  | 'grammar'
  | 'vocabulary'
  | 'kanji'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'mock';

export interface MilestoneDef {
  label: Translatable;
  /** Rung size: how many of the counted thing make one completion. */
  target: number;
  /** XP paid each time a rung is completed. */
  xp: number;
  /** Lifetime total of the thing being counted, read straight off recorded progress. */
  count: (progress: ProgressState) => number;
}

function srsCount(progress: ProgressState, prefix: string): number {
  return Object.keys(progress.srsCards).filter((key) => key.startsWith(`${prefix}:`)).length;
}

export const MILESTONES: Record<MilestoneCategory, MilestoneDef> = {
  dashboard: {
    label: { en: 'Study on 3 separate days', nl: 'Studeer op 3 losse dagen' },
    target: 3,
    xp: 50,
    // Days with recorded study minutes — the one "daily goal" that survives past today, since only the
    // current session is stored in full.
    count: (p) => Object.values(p.minutesByDate).filter((m) => m > 0).length,
  },
  'learning-path': {
    label: { en: 'Master 3 path weeks', nl: 'Beheers 3 weken van je pad' },
    target: 3,
    xp: 75,
    count: (p) => Object.keys(p.weeklyCheckpoints).length,
  },
  grammar: {
    label: { en: 'Learn 10 new grammar points', nl: 'Leer 10 nieuwe grammaticapunten' },
    target: 10,
    xp: 50,
    count: (p) => p.completedGrammarIds.length,
  },
  vocabulary: {
    label: { en: 'Learn 10 new words', nl: 'Leer 10 nieuwe woorden' },
    target: 10,
    xp: 50,
    count: (p) => srsCount(p, 'vocabulary'),
  },
  kanji: {
    label: { en: 'Learn 10 new kanji', nl: 'Leer 10 nieuwe kanji' },
    target: 10,
    xp: 50,
    count: (p) => p.learnedKanjiIds.length,
  },
  reading: {
    label: { en: 'Finish 5 readers', nl: 'Lees 5 boekjes uit' },
    target: 5,
    xp: 50,
    count: (p) => p.completedReadingIds.length,
  },
  listening: {
    label: { en: 'Complete 5 listening sessions', nl: 'Rond 5 luistersessies af' },
    target: 5,
    xp: 50,
    // Abandoned sessions don't count, matching how the listening completion bonus is paid in xp.ts.
    count: (p) => p.quizResults.filter((r) => r.skill === 'listening' && r.completed !== false).length,
  },
  speaking: {
    label: { en: 'Play through 5 role-plays', nl: 'Speel 5 rollenspellen uit' },
    target: 5,
    xp: 50,
    count: (p) => Object.values(p.speakingSessions).filter((s) => s.completed).length,
  },
  mock: {
    label: { en: 'Sit 1 mock exam', nl: 'Doe 1 proefexamen' },
    target: 1,
    xp: 100,
    count: (p) => Object.values(p.mockExams).reduce((n, r) => n + r.attempts, 0),
  },
};

export interface MilestoneProgress {
  label: Translatable;
  /** Progress toward the *next* rung, 0..target-1 once at least one rung is done. */
  done: number;
  target: number;
  xp: number;
  /** How many rungs have been completed so far. */
  completed: number;
  /** 0..100 toward the next rung. */
  percent: number;
}

export function milestoneFor(category: MilestoneCategory, progress: ProgressState): MilestoneProgress {
  const def = MILESTONES[category];
  const count = def.count(progress);
  const completed = Math.floor(count / def.target);
  const done = count % def.target;
  return {
    label: def.label,
    done,
    target: def.target,
    xp: def.xp,
    completed,
    percent: Math.round((done / def.target) * 100),
  };
}

/** Total XP earned from every completed rung across every category. Folded into `calculateXp`. */
export function milestoneXpEarned(progress: ProgressState): number {
  return (Object.keys(MILESTONES) as MilestoneCategory[]).reduce((sum, category) => {
    const def = MILESTONES[category];
    return sum + Math.floor(def.count(progress) / def.target) * def.xp;
  }, 0);
}
