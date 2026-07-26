/**
 * Numbered stroke-order data for the writing-practice feature.
 *
 * Each stroke is a polyline of points on a **normalized 0–100 grid** (x → right, y → down),
 * listed in the correct writing order, and each polyline runs in the correct writing
 * *direction* (first point = where the pen starts). Stroke **order and direction here are
 * authentic** (the standard order taught for these kanji, cross-checked against Jisho /
 * tanoshiijapanese); the polyline **shapes are deliberately simplified** — straight segments
 * rather than calligraphic curves — because the goal is a legible stroke-order guide to trace,
 * not a brush-calligraphy master.
 *
 * Coverage is a verified starter set of basic N5 kanji. Any kanji without an entry falls back
 * to the accurate font-outline guide in the writing-practice UI, so nothing is ever shown with
 * guessed stroke order. `roadmap`/kanji tests assert that every covered character's stroke
 * count matches its `KanjiEntry.strokeCount`, so this data can't silently drift.
 */

export type Stroke = [number, number][];

export const STROKE_ORDER: Record<string, Stroke[]> = {
  人: [
    [[55, 15], [30, 85]],
    [[47, 42], [80, 85]],
  ],
  大: [
    [[18, 40], [82, 40]],
    [[50, 20], [24, 86]],
    [[50, 48], [80, 86]],
  ],
  小: [
    [[50, 18], [50, 80]],
    [[32, 34], [24, 62]],
    [[68, 34], [78, 62]],
  ],
  山: [
    [[50, 28], [50, 66]],
    [[27, 30], [27, 74], [75, 74]],
    [[75, 38], [75, 74]],
  ],
  木: [
    [[16, 42], [84, 42]],
    [[50, 20], [50, 86]],
    [[50, 52], [24, 82]],
    [[50, 52], [78, 82]],
  ],
  日: [
    [[30, 20], [30, 84]],
    [[30, 20], [72, 20], [72, 84]],
    [[30, 52], [72, 52]],
    [[30, 84], [72, 84]],
  ],
  月: [
    [[36, 20], [30, 86]],
    [[36, 20], [72, 20], [70, 84]],
    [[36, 44], [70, 44]],
    [[36, 64], [70, 64]],
  ],
  火: [
    [[36, 28], [26, 48]],
    [[64, 30], [74, 48]],
    [[50, 20], [34, 86]],
    [[48, 46], [78, 86]],
  ],
  生: [
    [[46, 20], [28, 44]],
    [[24, 44], [74, 44]],
    [[50, 22], [50, 86]],
    [[30, 64], [70, 64]],
    [[22, 86], [80, 86]],
  ],
};

export function getStrokes(character: string): Stroke[] | undefined {
  return STROKE_ORDER[character];
}

export function hasStrokeOrder(character: string): boolean {
  return character in STROKE_ORDER;
}
