import type { SrsRating } from '../../../types';

export const GRADE_ORDER: SrsRating[] = ['again', 'hard', 'good', 'easy'];

/**
 * Shared color story for the four SRS grades across the review workspace (answer buttons, session-rail
 * counts, completion summary). Colored text sits on a tinted chip rather than white-on-solid-fill — the
 * mock's solid coral/amber fills can't reach 4.5:1 for the small interval text, and WCAG AA is a hard
 * requirement here.
 */
export const GRADE_META: Record<
  SrsRating,
  {
    label: string;
    key: string;
    dotClass: string;
    keycapClass: string;
    hoverClass: string;
    pressedClass: string;
  }
> = {
  again: {
    label: 'Again',
    key: '1',
    dotClass: 'bg-[#e8735c]',
    keycapClass: 'bg-[#e8735c]/15 text-[#b0452e] dark:text-[#f2a08c] border-[#e8735c]/30',
    hoverClass: 'hover:border-[#e8735c]/50 hover:bg-[#e8735c]/10',
    pressedClass: 'ring-2 ring-[#e8735c]/40 border-[#e8735c]/50 bg-[#e8735c]/10',
  },
  hard: {
    label: 'Hard',
    key: '2',
    dotClass: 'bg-amber-400',
    keycapClass: 'bg-amber-400/15 text-amber-700 dark:text-amber-300 border-amber-400/30',
    hoverClass: 'hover:border-amber-400/50 hover:bg-amber-400/10',
    pressedClass: 'ring-2 ring-amber-400/40 border-amber-400/50 bg-amber-400/10',
  },
  good: {
    label: 'Good',
    key: '3',
    dotClass: 'bg-brand-500',
    keycapClass: 'bg-brand-500/15 text-brand-700 dark:text-brand-300 border-brand-500/30',
    hoverClass: 'hover:border-brand-500/50 hover:bg-brand-500/10',
    pressedClass: 'ring-2 ring-brand-500/40 border-brand-500/50 bg-brand-500/10',
  },
  easy: {
    label: 'Easy',
    key: '4',
    dotClass: 'bg-emerald-500',
    keycapClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    hoverClass: 'hover:border-emerald-500/50 hover:bg-emerald-500/10',
    pressedClass: 'ring-2 ring-emerald-500/40 border-emerald-500/50 bg-emerald-500/10',
  },
};
