import { useState } from 'react';
import { Eyebrow } from './primitives';

/**
 * §6 Inside the app — five real screenshots of the running product (captured with genuine seeded
 * progress; see docs/kotobox-homepage-state.md for the capture pipeline). Dimensions are the real
 * encoded pixel sizes so the browser reserves space (zero CLS).
 */
const SHOTS = [
  {
    key: 'a',
    base: '/assets/home/app-dashboard',
    width: 1600,
    height: 1000,
    alt: 'The Kotobox dashboard: a night-sky greeting panel with the mascot, stat cards for study streak, minutes studied today, reviews due and weekly goal, plus a study plan and today’s path.',
    caption: 'Dashboard — your streak, today’s plan, reviews due, and this week’s goal. Every number real.',
  },
  {
    key: 'b',
    base: '/assets/home/app-vocabulary',
    width: 1600,
    height: 1000,
    alt: 'The vocabulary page: a grid of word cards with Japanese, kana and meaning, each glowing by learning state — new, practicing, due for review, or mastered.',
    caption: 'Vocabulary — word cards that show their state at a glance: new, practicing, due, or mastered.',
  },
  {
    key: 'c',
    base: '/assets/home/app-kanji',
    width: 1600,
    height: 1000,
    alt: 'A kanji detail page with readings, example words, and a drawing canvas for practicing the character stroke by stroke.',
    caption: 'Kanji practice — draw each character yourself, stroke by stroke.',
  },
  {
    key: 'd',
    base: '/assets/home/app-grammar',
    width: 1600,
    height: 1000,
    alt: 'The grammar path: a night-constellation list of grammar points where completed points lead to the current one and later points wait locked.',
    caption: 'Grammar path — one point unlocks the next. A path, not a pile.',
  },
  {
    key: 'e',
    base: '/assets/home/app-listening',
    width: 1600,
    height: 1000,
    alt: 'The listening trainer with a large play button, select and dictation modes, voice options and playback speed controls.',
    caption: 'Listening — choose select or dictation, set the speed, and train your ear on the same sentences you study.',
  },
];

export function InsideSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="hp-section" id="inside" aria-labelledby="hp-inside-title">
      <div className="hp-container">
        <div className="hp-grid">
          <header className="hp-inside-head">
            <Eyebrow>Inside the app</Eyebrow>
            <h2 className="hp-h2" id="hp-inside-title" data-hp-reveal="mask">
              Daylight out here. A quiet night room in there.
            </h2>
            <p className="hp-lede" data-hp-reveal="rise" style={{ marginTop: 24 }}>
              The app has its own atmosphere — a calm, dark study space with one small light on
              what matters next. These are real screens, not mockups.
            </p>
          </header>
        </div>
        <div className={`hp-shots${expanded ? ' is-expanded' : ''}`}>
          {SHOTS.map((s) => (
            <figure key={s.key} className={`hp-shot hp-shot--${s.key}`} data-hp-reveal="settle">
              <picture>
                <source srcSet={`${s.base}.avif`} type="image/avif" />
                <img
                  src={`${s.base}.webp`}
                  width={s.width}
                  height={s.height}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <figcaption>{s.caption}</figcaption>
            </figure>
          ))}
        </div>
        {!expanded && (
          <button type="button" className="hp-btn hp-btn--secondary hp-shots-more" onClick={() => setExpanded(true)}>
            Show two more screens
          </button>
        )}
      </div>
    </section>
  );
}
