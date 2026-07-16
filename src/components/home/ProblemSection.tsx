import { Eyebrow } from './primitives';
import { GlyphStroke } from './stage/GoGlyph';

interface Scrap {
  tag: string;
  body: React.ReactNode;
  style: React.CSSProperties;
  drift: number; // parallax rate class, 1–3
}

/** Typographic artifacts of fragmented studying — typeset paper scraps, not illustrations. */
const SCRAPS: Scrap[] = [
  {
    tag: 'Flashcard app',
    body: (
      <>
        <span className="hp-jp">水</span> — water
        <br />
        again ×4
      </>
    ),
    style: { top: '2%', left: '4%', rotate: '-2deg' },
    drift: 1,
  },
  {
    tag: 'Notebook',
    body: (
      <>
        <span className="hp-jp">は</span> vs <span className="hp-jp">が</span> ???
      </>
    ),
    style: { top: '8%', right: '8%', rotate: '1.5deg' },
    drift: 2,
  },
  {
    tag: 'Browser',
    body: <>14 dictionary tabs, all of them “just for a second”</>,
    style: { top: '38%', left: '16%', rotate: '1deg' },
    drift: 3,
  },
  {
    tag: 'Bookmark',
    body: <>grammar-guide.example — “read later” (three months ago)</>,
    style: { top: '52%', right: '2%', rotate: '-1.5deg' },
    drift: 1,
  },
  {
    tag: 'Stroke practice',
    body: <>page of half-finished squares, order unknown</>,
    style: { bottom: '10%', left: '0%', rotate: '2deg' },
    drift: 2,
  },
  {
    tag: 'Video queue',
    body: <>“Listening practice ep. 41” — 12 min watched, 0 remembered</>,
    style: { bottom: '0%', right: '4%', rotate: '-1deg' },
    drift: 3,
  },
];

/** Three displaced strokes of 語 drifting among the scraps — the glyph has come apart here. */
const LOOSE_STROKES = [
  { index: 7, style: { top: '24%', left: '46%', rotate: '9deg' } },
  { index: 11, style: { top: '68%', left: '40%', rotate: '-12deg' } },
  { index: 8, style: { top: '4%', left: '60%', rotate: '4deg' } },
];

export function ProblemSection() {
  return (
    <section className="hp-section" aria-labelledby="hp-problem-title">
      <div className="hp-container hp-grid">
        <div className="hp-problem-copy">
          <Eyebrow>The problem</Eyebrow>
          <h2 className="hp-h2" id="hp-problem-title" data-hp-reveal="mask">
            Five apps deep, and still not sure what to study next.
          </h2>
          <p className="hp-body" data-hp-reveal="rise" style={{ marginTop: 24 }}>
            A flashcard app for vocabulary. A website for grammar. A dictionary in fourteen browser
            tabs. Videos for listening, a notebook for kanji. Each one fine on its own — and none of
            them talking to each other. So every evening starts with the hardest question in
            language learning: <em>what now?</em>
          </p>
        </div>
        <div className="hp-scrapfield" aria-hidden="true">
          <div className="hp-scrapfield-inner">
            {SCRAPS.map((s, i) => (
              <div key={i} className="hp-scrap" data-hp-drift={s.drift} style={s.style}>
                <span className="hp-scrap-tag">{s.tag}</span>
                {s.body}
              </div>
            ))}
            {LOOSE_STROKES.map((s, i) => (
              <GlyphStroke key={i} index={s.index} className="hp-scrap-stroke" style={s.style} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
