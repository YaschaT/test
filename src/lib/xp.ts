import type { ProgressState } from './progressStore';

const XP_PER_LEVEL = 100;

export const XP_RULES = {
  grammarPoint: 20,
  vocabularyWord: 10,
  kanjiCharacter: 15,
  readingPassage: 25,
  listeningSession: 15,
  quizCorrectAnswer: 2,
} as const;

const LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: 'Beginner' },
  { minLevel: 5, title: 'Learner' },
  { minLevel: 10, title: 'Explorer' },
  { minLevel: 15, title: 'Adept' },
  { minLevel: 20, title: 'Scholar' },
  { minLevel: 30, title: 'Master' },
];

export interface LevelInfo {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  title: string;
}

/**
 * XP is a pure derived score from real progress — never stored, never a separate schema field — so it
 * can never drift out of sync with actual completions and needs no migration if the formula changes.
 */
export function calculateXp(progress: ProgressState): number {
  const learnedVocab = Object.keys(progress.srsCards).filter((k) => k.startsWith('vocabulary:')).length;
  const listeningSessions = progress.quizResults.filter((r) => r.skill === 'listening').length;
  const quizCorrectTotal = progress.quizResults.reduce((sum, r) => sum + r.correct, 0);

  return (
    progress.completedGrammarIds.length * XP_RULES.grammarPoint +
    learnedVocab * XP_RULES.vocabularyWord +
    progress.learnedKanjiIds.length * XP_RULES.kanjiCharacter +
    progress.completedReadingIds.length * XP_RULES.readingPassage +
    listeningSessions * XP_RULES.listeningSession +
    quizCorrectTotal * XP_RULES.quizCorrectAnswer
  );
}

function levelTitle(level: number): string {
  return LEVEL_TITLES.reduce((title, tier) => (level >= tier.minLevel ? tier.title : title), LEVEL_TITLES[0].title);
}

export function getLevelInfo(progress: ProgressState): LevelInfo {
  const xp = calculateXp(progress);
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  return { xp, level, xpIntoLevel, xpForNextLevel: XP_PER_LEVEL, title: levelTitle(level) };
}
