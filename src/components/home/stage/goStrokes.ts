/**
 * 語 (go — "language, word") hand-traced as 14 ordered stroke paths on a 1024×1024 canvas.
 * Real stroke order: 言 radical (indices 0–6) → 五 (7–10) → 口 (11–13). Shared by GoGlyph and
 * the problem section's displaced strokes; kept out of the component file for fast refresh.
 */
export const GO_STROKES: string[] = [
  // 言 (speech radical, left)
  'M235 88 C252 106 262 124 268 148',
  'M96 218 C210 206 330 204 424 212',
  'M150 322 C238 314 320 314 378 318',
  'M150 424 C238 416 320 416 378 420',
  'M166 536 C164 606 164 676 166 754',
  'M166 542 C240 536 320 536 388 542 L390 752',
  'M170 756 C240 750 320 750 386 752',
  // 五 (upper right)
  'M498 170 C640 158 800 158 948 168',
  'M690 178 C676 300 650 430 618 540',
  'M560 356 C650 348 740 348 846 354 C850 420 844 484 838 546',
  'M496 560 C640 550 810 550 950 558',
  // 口 (lower right)
  'M604 646 C602 716 602 790 604 872',
  'M604 652 C688 646 776 646 856 652 L858 870',
  'M608 874 C688 868 776 868 852 870',
];
