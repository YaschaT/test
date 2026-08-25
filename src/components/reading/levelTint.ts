/**
 * One hue per Tadoku level, shared by a shelf's heading dot and the field a typographic cover sits on,
 * so a book is placeable at a glance and the shelf it belongs to is obvious from the cover alone.
 */
export const LEVEL_DOT: Record<number, string> = {
  0: 'bg-sky-500',
  1: 'bg-emerald-500',
  2: 'bg-indigo-500',
  3: 'bg-amber-500',
  4: 'bg-rose-500',
  5: 'bg-violet-500',
};

/** The field a generated cover's title sits on: the level's hue at 20%, per the design. */
export const LEVEL_WASH: Record<number, string> = {
  0: 'bg-sky-500/20',
  1: 'bg-emerald-500/20',
  2: 'bg-indigo-500/20',
  3: 'bg-amber-500/20',
  4: 'bg-rose-500/20',
  5: 'bg-violet-500/20',
};
