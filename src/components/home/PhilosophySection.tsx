import { Eyebrow } from './primitives';
import { GoGlyph } from './stage/GoGlyph';

/** §7 Philosophy — the page's single inversion: warm near-black ink, never the app's navy. */
export function PhilosophySection() {
  return (
    <section className="hp-section hp-philosophy" aria-labelledby="hp-philosophy-title">
      <div className="hp-container hp-grid">
        <div className="hp-philosophy-copy">
          <Eyebrow>Why it works</Eyebrow>
          <h2 className="hp-display" id="hp-philosophy-title" data-hp-reveal="mask">
            Memory has a schedule. Kotobox keeps it.
          </h2>
          <p data-hp-reveal="rise" style={{ marginTop: 36 }}>
            Every word, kanji and grammar point you study enters one spaced-repetition system. Rate
            yourself honestly — again, hard, good, easy — and it schedules the next encounter right
            before you’d forget.
          </p>
          <p data-hp-reveal="rise">
            Nothing here is called <em className="hp-mastered">mastered</em> until you’ve held it
            for three weeks. Progress you can trust beats progress that flatters.
          </p>
          <p data-hp-reveal="rise">
            And everything is bilingual — English and Dutch, side by side, on every card.
          </p>
        </div>
        <div className="hp-philosophy-glyph" aria-hidden="true">
          <GoGlyph />
        </div>
      </div>
    </section>
  );
}
