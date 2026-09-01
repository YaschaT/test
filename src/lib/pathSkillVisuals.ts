import type { PathSkill } from './pathWeek';

/**
 * How the four path skills look on the Learning Path's meter.
 *
 * Each is that skill's own gradient from `skillTheme.ts`: the deep end in light mode, the light end in
 * dark, because brand-600 at 6px tall disappears against ink-900. Class strings rather than values so
 * Tailwind can see them, and kept out of the component file so it only exports components.
 */
export const SKILL_FILL_CLASS: Record<PathSkill, string> = {
  grammar: 'bg-[#3a54d6] dark:bg-[#6f8ffc]',
  vocabulary: 'bg-[#0c9463] dark:bg-[#3ddc9b]',
  kanji: 'bg-[#d97706] dark:bg-[#fbbf5a]',
  reading: 'bg-[#0284c7] dark:bg-[#4fc3f7]',
};

export const SKILL_LABEL: Record<PathSkill, string> = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  kanji: 'Kanji',
  reading: 'Reading',
};
