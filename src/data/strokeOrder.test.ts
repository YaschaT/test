import { describe, it, expect } from 'vitest';
import { STROKE_ORDER } from './strokeOrder';
import { KANJI_LIST } from './kanji';

describe('stroke-order data', () => {
  const byChar = new Map(KANJI_LIST.map((k) => [k.character, k]));

  it('only covers characters that exist in the kanji list', () => {
    for (const char of Object.keys(STROKE_ORDER)) {
      expect(byChar.has(char), `${char} not in KANJI_LIST`).toBe(true);
    }
  });

  it('has a stroke count that matches each kanji’s declared strokeCount', () => {
    for (const [char, strokes] of Object.entries(STROKE_ORDER)) {
      const entry = byChar.get(char)!;
      expect(strokes.length, `${char}: ${strokes.length} strokes vs strokeCount ${entry.strokeCount}`).toBe(entry.strokeCount);
    }
  });

  it('gives every stroke at least two points, all within the 0–100 grid', () => {
    for (const [char, strokes] of Object.entries(STROKE_ORDER)) {
      for (const stroke of strokes) {
        expect(stroke.length, `${char}: a stroke has < 2 points`).toBeGreaterThanOrEqual(2);
        for (const [x, y] of stroke) {
          expect(x, `${char}: x out of range`).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(100);
          expect(y, `${char}: y out of range`).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(100);
        }
      }
    }
  });
});
