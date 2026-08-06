import type { ProgressState } from './progressStore';
import { XP_RULES } from './xp';
import { GRAMMAR_POINTS } from '../data/grammar';
import { VOCABULARY } from '../data/vocabulary';
import { KANJI_LIST } from '../data/kanji';
import { READINGS } from '../data/readings';

export interface Badge {
  id: string;
  label: string;
  description: string;
  /** Illustration filename under public/assets/dashboard/redesign/achievements/ — the supplied
   * achievement artwork, one per skill, shared by every badge in that skill's family. */
  asset: string;
  earned: boolean;
  current: number;
  target: number;
  /** Real page where progress toward this badge is made — used for the featured-badge CTA. */
  route: string;
  /** XP the badge's work is actually worth, derived from XP_RULES rather than a display-only number. */
  xp: number;
}

/** Adds the derived XP total to a badge definition, so no call site has to know the XP rules. */
function withXp(badge: Omit<Badge, 'xp'>, xpPerItem: number): Badge {
  return { ...badge, xp: badge.target * xpPerItem };
}

export function computeBadges(progress: ProgressState): Badge[] {
  const learnedVocab = Object.keys(progress.srsCards).filter((k) => k.startsWith('vocabulary:')).length;
  const listeningSessions = progress.quizResults.filter((r) => r.skill === 'listening').length;

  return [
    withXp(
      {
        id: 'grammar-starter',
        label: 'Grammar Explorer',
        description: 'Complete 5 grammar points',
        asset: 'grammar.webp',
        current: Math.min(progress.completedGrammarIds.length, 5),
        target: 5,
        earned: progress.completedGrammarIds.length >= 5,
        route: '/grammar',
      },
      XP_RULES.grammarPoint,
    ),
    withXp(
      {
        id: 'grammar-master',
        label: 'Grammar Master',
        description: `Complete all ${GRAMMAR_POINTS.length} grammar points`,
        asset: 'grammar.webp',
        current: Math.min(progress.completedGrammarIds.length, GRAMMAR_POINTS.length),
        target: GRAMMAR_POINTS.length,
        earned: progress.completedGrammarIds.length >= GRAMMAR_POINTS.length,
        route: '/grammar',
      },
      XP_RULES.grammarPoint,
    ),
    withXp(
      {
        id: 'vocab-builder',
        label: 'Vocabulary Builder',
        description: 'Learn 25 words',
        asset: 'vocabulary.webp',
        current: Math.min(learnedVocab, 25),
        target: 25,
        earned: learnedVocab >= 25,
        route: '/vocabulary',
      },
      XP_RULES.vocabularyWord,
    ),
    withXp(
      {
        id: 'vocab-master',
        label: 'Vocabulary Master',
        description: `Learn all ${VOCABULARY.length} words`,
        asset: 'vocabulary.webp',
        current: Math.min(learnedVocab, VOCABULARY.length),
        target: VOCABULARY.length,
        earned: learnedVocab >= VOCABULARY.length,
        route: '/vocabulary',
      },
      XP_RULES.vocabularyWord,
    ),
    withXp(
      {
        id: 'kanji-apprentice',
        label: 'Kanji Apprentice',
        description: 'Learn 10 kanji',
        asset: 'kanji.webp',
        current: Math.min(progress.learnedKanjiIds.length, 10),
        target: 10,
        earned: progress.learnedKanjiIds.length >= 10,
        route: '/kanji',
      },
      XP_RULES.kanjiCharacter,
    ),
    withXp(
      {
        id: 'kanji-master',
        label: 'Kanji Master',
        description: `Learn all ${KANJI_LIST.length} kanji`,
        asset: 'kanji.webp',
        current: Math.min(progress.learnedKanjiIds.length, KANJI_LIST.length),
        target: KANJI_LIST.length,
        earned: progress.learnedKanjiIds.length >= KANJI_LIST.length,
        route: '/kanji',
      },
      XP_RULES.kanjiCharacter,
    ),
    withXp(
      {
        id: 'reading-explorer',
        label: 'Reading Explorer',
        description: `Complete all ${READINGS.length} passages`,
        asset: 'reading.webp',
        current: Math.min(progress.completedReadingIds.length, READINGS.length),
        target: READINGS.length,
        earned: progress.completedReadingIds.length >= READINGS.length,
        route: '/reading',
      },
      XP_RULES.readingPassage,
    ),
    withXp(
      {
        id: 'first-listen',
        label: 'First Listen',
        description: 'Complete a listening session',
        asset: 'listening.webp',
        current: Math.min(listeningSessions, 1),
        target: 1,
        earned: listeningSessions >= 1,
        route: '/listening',
      },
      XP_RULES.listeningSession,
    ),
  ];
}

/** The badge to feature: the closest-to-earning one if any are incomplete, otherwise the most recently
 * defined earned one — always a real badge from the list above, never a placeholder. */
export function pickFeaturedBadge(badges: Badge[]): Badge {
  const unearned = badges.filter((b) => !b.earned);
  if (unearned.length > 0) {
    return unearned.reduce((closest, b) => (b.current / b.target > closest.current / closest.target ? b : closest));
  }
  return badges[badges.length - 1];
}
