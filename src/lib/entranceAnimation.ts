const STAGGER_STEP_MS = 35;
const STAGGER_MAX_STEPS = 12;

/** Applied to each card in the Vocabulary/Kanji grids so switching level/category replays a quick,
 * bounded entrance rather than the list popping in instantly. Respects prefers-reduced-motion via the
 * app-wide blanket override in index.css. */
export const ENTRANCE_ANIMATION_CLASSES = 'animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-300 ease-out';

/** Staggers by list position, capped so a long list (70+ words) doesn't take seconds to finish settling. */
export function getEntranceDelayMs(index: number): number {
  return Math.min(index, STAGGER_MAX_STEPS) * STAGGER_STEP_MS;
}
