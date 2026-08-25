/**
 * The generated cover's composition.
 *
 * 28 of the 32 books have no painted art, and buying or drawing one per book does not scale — every new
 * book would be blocked on an illustration. So the generated cover has to be a real cover rather than a
 * fallback: a ground in the book's level hue, one soft disc for a horizon, and the title in the book
 * face. The disc's placement and size come from the book's own id, so a shelf has rhythm instead of
 * reading as the same rectangle 28 times, and the same book always looks the same.
 */

export interface CoverComposition {
  /** Percentages, relative to the cover box. */
  discX: number;
  discY: number;
  discSize: number;
  /** Whether the title sits at the foot of the cover rather than the head. */
  titleLow: boolean;
}

const DISC_X = [18, 50, 82, 96];
const DISC_SIZE = [56, 68, 82];

/** FNV-1a: small, stable, and dependency-free — the same id always lands on the same composition. */
function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function coverComposition(id: string): CoverComposition {
  const h = hash(id);
  const titleLow = h % 2 === 1;
  return {
    discX: DISC_X[Math.floor(h / 2) % DISC_X.length],
    // Always the half the title is not in. Variety is worth having, but not at the cost of setting the
    // title over the one shape on the cover.
    discY: titleLow ? 20 : 82,
    discSize: DISC_SIZE[Math.floor(h / 8) % DISC_SIZE.length],
    titleLow,
  };
}
