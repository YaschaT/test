# KanjiVG attribution

The authentic stroke-order data in [`src/data/strokeOrder.ts`](../src/data/strokeOrder.ts) is
**derived from KanjiVG**.

- **Source:** KanjiVG — <https://kanjivg.tagaini.net>
- **Copyright:** © Ulrich Apel and the KanjiVG project
- **Licence:** [Creative Commons Attribution-Share Alike 3.0](https://creativecommons.org/licenses/by-sa/3.0/) (CC BY-SA 3.0)

## What we derived

KanjiVG publishes each kanji as an SVG whose `<path>` elements are the individual strokes, in
writing order and direction, on a 109×109 canvas. For the 130 kanji in this app's `KANJI_LIST`,
each stroke path was sampled from its cubic-bezier curve into a polyline, lightly simplified
(Douglas–Peucker), and rescaled to the app's normalized 0–100 grid. Stroke **order, direction and
shape are preserved** from KanjiVG.

## Licence obligations

Because KanjiVG is licensed CC BY-SA 3.0:

1. **Attribution** — this notice, and the header in `strokeOrder.ts`, credit KanjiVG and link to
   its website, as required.
2. **Share-Alike** — the derived stroke data in `strokeOrder.ts` is a derivative work and is
   therefore distributed under the **same CC BY-SA 3.0 licence**. Note that this applies to that
   data file specifically; it does not change the licence of the rest of the application code.

No KanjiVG files are redistributed verbatim; only the transformed polyline data lives in the repo.
