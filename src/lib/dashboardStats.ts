import { addDays } from './date';
import type { ProgressState } from './progressStore';
import { GRAMMAR_POINTS } from '../data/grammar';
import { VOCABULARY } from '../data/vocabulary';
import { KANJI_LIST } from '../data/kanji';
import { READINGS } from '../data/readings';
import type { SkillArea } from '../types';

export const WEEKLY_GOAL_DAYS = 7;

/** Counts real study days (any minutes logged) in the trailing 7-day window ending today, inclusive. */
export function studyDaysInLastWeek(minutesByDate: Record<string, number>, today: string): number {
  let count = 0;
  for (let i = 0; i < WEEKLY_GOAL_DAYS; i++) {
    if ((minutesByDate[addDays(today, -i)] ?? 0) > 0) count++;
  }
  return count;
}

/** Remaining un-learned content for skills with a fixed, countable curriculum. Listening/Speaking have no
 * such fixed "remaining" concept (sessions, not a finite item list), so they're treated as 0 here. */
export function remainingContentForSkill(skill: SkillArea, progress: ProgressState): number {
  const learnedVocab = Object.keys(progress.srsCards).filter((k) => k.startsWith('vocabulary:')).length;
  switch (skill) {
    case 'grammar':
      return Math.max(0, GRAMMAR_POINTS.length - progress.completedGrammarIds.length);
    case 'vocabulary':
      return Math.max(0, VOCABULARY.length - learnedVocab);
    case 'kanji':
      return Math.max(0, KANJI_LIST.length - progress.learnedKanjiIds.length);
    case 'reading':
      return Math.max(0, READINGS.length - progress.completedReadingIds.length);
    default:
      return 0;
  }
}

/** Skills with a fixed, countable curriculum — the only ones "fully mastered" can mean anything for. */
export const CONTENT_SKILLS: SkillArea[] = ['grammar', 'vocabulary', 'kanji', 'reading'];

export function isSkillFullyMastered(skill: SkillArea, progress: ProgressState): boolean {
  return CONTENT_SKILLS.includes(skill) && remainingContentForSkill(skill, progress) === 0;
}

/** Today's Path step subtitle — real remaining-content count for content skills, plain minutes for
 * session-based skills (Listening/Speaking) which have no fixed "remaining" concept. */
export function pathStepSubtitle(skill: SkillArea, minutes: number, progress: ProgressState): string {
  if (!CONTENT_SKILLS.includes(skill)) return `${minutes} min`;
  const remaining = remainingContentForSkill(skill, progress);
  return remaining === 0 ? `${minutes} min · fully mastered` : `${minutes} min · ${remaining} remaining`;
}

