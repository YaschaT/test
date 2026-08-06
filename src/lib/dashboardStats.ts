import { addDays } from './date';
import { srsKey } from './srs';
import type { ProgressState } from './progressStore';
import { GRAMMAR_POINTS } from '../data/grammar';
import { VOCABULARY } from '../data/vocabulary';
import { KANJI_LIST } from '../data/kanji';
import { READINGS } from '../data/readings';
import type { SkillArea } from '../types';

export const WEEKLY_GOAL_DAYS = 7;

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export interface WeekDay {
  /** yyyy-mm-dd, so React keys stay stable across a week boundary. */
  date: string;
  /** Single-letter column header, as in the reference's M T W T F S S strip. */
  letter: string;
  /** Full weekday name — the accessible label behind that ambiguous letter. */
  name: string;
  studied: boolean;
  isToday: boolean;
  isFuture: boolean;
}

/** The current Monday–Sunday calendar week, each day marked with whether any minutes were logged.
 * Calendar-week rather than a trailing 7-day window so the weekday strip and the "n / 7 days" count in
 * the Weekly Progress card describe the same thing the learner sees. */
export function currentWeekDays(minutesByDate: Record<string, number>, today: string): WeekDay[] {
  const [y, m, d] = today.split('-').map(Number);
  // getDay() is 0=Sunday; shift so Monday is the first column.
  const mondayOffset = (new Date(y, m - 1, d).getDay() + 6) % 7;
  const monday = addDays(today, -mondayOffset);

  return WEEKDAY_LETTERS.map((letter, i) => {
    const date = addDays(monday, i);
    return {
      date,
      letter,
      name: WEEKDAY_NAMES[i],
      studied: (minutesByDate[date] ?? 0) > 0,
      isToday: date === today,
      isFuture: i > mondayOffset,
    };
  });
}

/** Days studied so far in the current calendar week. */
export function studyDaysThisWeek(minutesByDate: Record<string, number>, today: string): number {
  return currentWeekDays(minutesByDate, today).filter((day) => day.studied).length;
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

/** How much of the *current* JLPT level's fixed curriculum is done, 0–100 — the single figure behind the
 * sidebar's "N5 Progress" card. Counts grammar points, vocabulary, kanji and reading passages tagged with
 * that level only, so switching N5 → N4 genuinely re-scores rather than reusing one global total. */
export function levelProgressPercent(progress: ProgressState): number {
  const level = progress.level;
  const grammar = GRAMMAR_POINTS.filter((g) => g.level === level);
  const vocab = VOCABULARY.filter((v) => v.level === level);
  const kanji = KANJI_LIST.filter((k) => k.level === level);
  const readings = READINGS.filter((r) => r.level === level);

  const total = grammar.length + vocab.length + kanji.length + readings.length;
  if (total === 0) return 0;

  const completedGrammar = new Set(progress.completedGrammarIds);
  const learnedKanji = new Set(progress.learnedKanjiIds);
  const completedReadings = new Set(progress.completedReadingIds);
  const done =
    grammar.filter((g) => completedGrammar.has(g.id)).length +
    vocab.filter((v) => progress.srsCards[srsKey('vocabulary', v.id)] !== undefined).length +
    kanji.filter((k) => learnedKanji.has(k.id)).length +
    readings.filter((r) => completedReadings.has(r.id)).length;

  return Math.round((done / total) * 100);
}

/** Today's Path step subtitle — real remaining-content count for content skills, plain minutes for
 * session-based skills (Listening/Speaking) which have no fixed "remaining" concept. */
export function pathStepSubtitle(skill: SkillArea, minutes: number, progress: ProgressState): string {
  if (!CONTENT_SKILLS.includes(skill)) return `${minutes} min`;
  const remaining = remainingContentForSkill(skill, progress);
  return remaining === 0 ? `${minutes} min · fully mastered` : `${minutes} min · ${remaining} remaining`;
}

