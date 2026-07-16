import { GoGlyph } from './stage/GoGlyph';
import { Eyebrow, PrimaryCta, SecondaryCta } from './primitives';

/**
 * §2 Opening. The load sequence is pure CSS (hp-hero-anim / hp-hero-line, delays via --d) so first
 * paint needs no JS; 語 draws its first seven strokes (言 radical), latest two in vermilion, the
 * rest ghosted — the glyph is visibly unfinished until §4 completes it.
 */
export function HeroSection() {
  return (
    <section className="hp-hero" aria-labelledby="hp-hero-title">
      <div className="hp-container hp-grid">
        <div className="hp-hero-copy">
          <span className="hp-hero-anim" style={{ '--d': '0ms' } as React.CSSProperties}>
            <Eyebrow>JLPT N5 → N4</Eyebrow>
          </span>
          <h1 className="hp-h1" id="hp-hero-title">
            <span className="hp-hero-line" style={{ '--d': '80ms' } as React.CSSProperties}>
              Japanese,
            </span>
            <span className="hp-hero-line" style={{ '--d': '170ms' } as React.CSSProperties}>
              in <em>one piece.</em>
            </span>
          </h1>
          <p className="hp-lede hp-hero-anim" style={{ '--d': '340ms' } as React.CSSProperties}>
            Vocabulary, kanji, grammar, reading and listening — one connected practice instead of
            five scattered apps. Kotobox decides what you study next, so you can just study.
          </p>
          <div className="hp-hero-ctas hp-hero-anim" style={{ '--d': '460ms' } as React.CSSProperties}>
            <PrimaryCta />
            <SecondaryCta />
          </div>
          <p className="hp-hero-note hp-hero-anim" style={{ '--d': '560ms' } as React.CSSProperties}>
            Free · works without an account · built for short daily sessions
          </p>
        </div>
        <div className="hp-hero-glyph">
          <GoGlyph drawn={7} accent={2} ghost animate />
        </div>
      </div>
    </section>
  );
}
