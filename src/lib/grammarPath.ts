import { GRAMMAR_POINTS } from '../data/grammar';
import type { GrammarPoint, JlptLevel } from '../types';

/** How many points beyond the current one are previewable before the path locks. */
export const LOOKAHEAD = 2;

export type GrammarLessonState = 'completed' | 'current' | 'available' | 'locked';

/**
 * Position of the learner's next lesson in the course sequence, or -1 once everything is done.
 *
 * GRAMMAR_POINTS is ordered by level, so walking it finds the first unfinished N5 point before any N4
 * one — the frontier is level-coherent by construction rather than by coincidence.
 */
export function currentPointIndex(completedIds: string[]): number {
  return GRAMMAR_POINTS.findIndex((p) => !completedIds.includes(p.id));
}

/** The point the learner should do next — the last one when the whole course is complete. */
export function currentPoint(completedIds: string[]): GrammarPoint {
  const index = currentPointIndex(completedIds);
  return index >= 0 ? GRAMMAR_POINTS[index] : GRAMMAR_POINTS[GRAMMAR_POINTS.length - 1];
}

export function lessonState(index: number, id: string, currentIndex: number, completedIds: string[]): GrammarLessonState {
  if (completedIds.includes(id)) return 'completed';
  if (currentIndex === -1) return 'completed';
  if (index === currentIndex) return 'current';
  if (index > currentIndex && index <= currentIndex + LOOKAHEAD) return 'available';
  return 'locked';
}

export function levelPoints(level: JlptLevel): GrammarPoint[] {
  return GRAMMAR_POINTS.filter((p) => p.level === level);
}

/**
 * Lessons are numbered within their own level — "N5 · 11 of 18", not their position in the combined
 * course. A learner thinks in levels, and a level whose numbering jumps from 10 to 31 reads as broken.
 */
export function lessonNumberInLevel(point: GrammarPoint): number {
  return levelPoints(point.level).findIndex((p) => p.id === point.id) + 1;
}

/**
 * Why a level has nothing open yet, or null when at least one of its lessons is reachable.
 *
 * A level the learner has not arrived at yet is entirely locked, and a screen of dimmed rows with no
 * explanation is indistinguishable from a broken page — so the list needs something to say.
 */
export function levelLockedNotice(
  level: JlptLevel,
  completedIds: string[],
): { blockingLevel: JlptLevel; done: number; total: number } | null {
  const currentIndex = currentPointIndex(completedIds);
  if (currentIndex === -1) return null;

  const points = levelPoints(level);
  const anyOpen = points.some((p) => {
    const index = GRAMMAR_POINTS.indexOf(p);
    return lessonState(index, p.id, currentIndex, completedIds) !== 'locked';
  });
  if (anyOpen) return null;

  const blockingLevel = GRAMMAR_POINTS[currentIndex].level;
  const blocking = levelPoints(blockingLevel);
  return {
    blockingLevel,
    done: blocking.filter((p) => completedIds.includes(p.id)).length,
    total: blocking.length,
  };
}
