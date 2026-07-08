import type { ProgressState } from './progressStore';
import { GRAMMAR_POINTS } from '../data/grammar';
import { VOCABULARY } from '../data/vocabulary';
import { KANJI_LIST } from '../data/kanji';
import { READINGS } from '../data/readings';

export interface Badge {
  id: string;
  label: string;
  description: string;
  /** Asset filename under public/assets/dashboard/badges/ (kotobox_dashboard_claude_ready_assets pack). */
  asset: string;
  earned: boolean;
  current: number;
  target: number;
  /** Real page where progress toward this badge is made — used for the featured-badge CTA. */
  route: string;
}

export function computeBadges(progress: ProgressState): Badge[] {
  const learnedVocab = Object.keys(progress.srsCards).filter((k) => k.startsWith('vocabulary:')).length;
  const listeningSessions = progress.quizResults.filter((r) => r.skill === 'listening').length;

  return [
    {
      id: 'grammar-starter',
      label: 'Grammar Explorer',
      description: 'Complete 5 grammar points',
      asset: 'grammar-explorer.svg',
      current: Math.min(progress.completedGrammarIds.length, 5),
      target: 5,
      earned: progress.completedGrammarIds.length >= 5,
      route: '/grammar',
    },
    {
      id: 'grammar-master',
      label: 'Grammar Master',
      description: `Complete all ${GRAMMAR_POINTS.length} grammar points`,
      asset: 'grammar-master.svg',
      current: Math.min(progress.completedGrammarIds.length, GRAMMAR_POINTS.length),
      target: GRAMMAR_POINTS.length,
      earned: progress.completedGrammarIds.length >= GRAMMAR_POINTS.length,
      route: '/grammar',
    },
    {
      id: 'vocab-builder',
      label: 'Vocabulary Builder',
      description: 'Learn 25 words',
      asset: 'vocabulary-builder.svg',
      current: Math.min(learnedVocab, 25),
      target: 25,
      earned: learnedVocab >= 25,
      route: '/vocabulary',
    },
    {
      id: 'vocab-master',
      label: 'Vocabulary Master',
      description: `Learn all ${VOCABULARY.length} words`,
      asset: 'vocabulary-master.svg',
      current: Math.min(learnedVocab, VOCABULARY.length),
      target: VOCABULARY.length,
      earned: learnedVocab >= VOCABULARY.length,
      route: '/vocabulary',
    },
    {
      id: 'kanji-apprentice',
      label: 'Kanji Apprentice',
      description: 'Learn 10 kanji',
      asset: 'kanji-apprentice.svg',
      current: Math.min(progress.learnedKanjiIds.length, 10),
      target: 10,
      earned: progress.learnedKanjiIds.length >= 10,
      route: '/kanji',
    },
    {
      id: 'kanji-master',
      label: 'Kanji Master',
      description: `Learn all ${KANJI_LIST.length} kanji`,
      asset: 'kanji-master.svg',
      current: Math.min(progress.learnedKanjiIds.length, KANJI_LIST.length),
      target: KANJI_LIST.length,
      earned: progress.learnedKanjiIds.length >= KANJI_LIST.length,
      route: '/kanji',
    },
    {
      id: 'reading-explorer',
      label: 'Reading Explorer',
      description: `Complete all ${READINGS.length} passages`,
      asset: 'reading-explorer.svg',
      current: Math.min(progress.completedReadingIds.length, READINGS.length),
      target: READINGS.length,
      earned: progress.completedReadingIds.length >= READINGS.length,
      route: '/reading',
    },
    {
      id: 'first-listen',
      label: 'First Listen',
      description: 'Complete a listening session',
      asset: 'first-listen.svg',
      current: Math.min(listeningSessions, 1),
      target: 1,
      earned: listeningSessions >= 1,
      route: '/listening',
    },
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
