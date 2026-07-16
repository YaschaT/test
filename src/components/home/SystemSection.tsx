import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eyebrow } from './primitives';
import { GoGlyph } from './stage/GoGlyph';

gsap.registerPlugin(ScrollTrigger);

/* Real N5 content from the product's own data (src/data/vocabulary.ts) — never invented. */
const TILES = [
  { jp: '水', en: 'water', style: { top: '14%', left: '4%' } },
  { jp: '友達', en: 'friend', style: { top: '38%', left: '20%' } },
  { jp: '食べる', en: 'to eat', style: { top: '8%', left: '34%' } },
];

const MODULES = [
  { jp: '私は', joint: 'tab' },
  { jp: '水を', joint: 'both' },
  { jp: '飲みます', joint: 'notch' },
];

const CHAPTERS = [
  {
    kicker: 'Vocabulary',
    title: 'Tiles that keep their place.',
    body: 'Every word is a card with kana, romaji and meaning — in English and Dutch. Words you know step back; words due for review step forward. Nothing gets lost in a deck you’ll never reopen.',
  },
  {
    kicker: 'Kanji',
    title: 'Characters built stroke by stroke.',
    body: 'Learn each character the way it’s written: stroke order, readings, and practice drawing it yourself, right in the app.',
  },
  {
    kicker: 'Grammar',
    title: 'Patterns that click together.',
    body: 'A guided path of grammar points, one unlocking the next. Each pattern comes apart into pieces you can see — and snaps into sentences you can build.',
  },
  {
    kicker: 'Listening',
    title: 'The thread through everything.',
    body: 'Hear the words and sentences you’ve just learned, at your speed. Type what you hear, or pick what you heard — both count toward the same memory.',
  },
];

/* Thread path through tiles → glyph → sentence, ending at the waveform (stage coords 0–660 × 0–560). */
const THREAD_D =
  'M70 120 C140 180 160 250 210 260 C300 280 360 120 440 150 C500 170 480 300 380 380 C280 460 200 480 240 490 C320 505 420 480 470 470';
const WAVEFORM_D =
  'M490 470 l14 0 l6 -16 l8 30 l8 -42 l8 34 l6 -18 l14 0';

/**
 * The full assembled tableau. Its *static* markup is the finished state, so no-JS, reduced-motion
 * and mobile all read the complete world; the desktop GSAP timeline animates INTO this state.
 * `mini` renders the compact tablet/mobile per-chapter version showing `upTo` layers.
 */
function StageTableau({ mini = false, upTo = 4 }: { mini?: boolean; upTo?: 1 | 2 | 3 | 4 }) {
  return (
    <div className={mini ? 'hp-tableau' : 'hp-stage-inner'} aria-hidden="true">
      {TILES.map((t) => (
        <div key={t.jp} className="hp-tile" style={t.style}>
          <span className="hp-jp">{t.jp}</span>
          <span className="hp-tile-en">{t.en}</span>
        </div>
      ))}
      <GoGlyph
        drawn={upTo >= 2 ? 14 : 7}
        ghost={upTo < 2}
        scrubReady={!mini}
        className="hp-stage-glyph"
      />
      {upTo >= 3 && (
        <div className="hp-module-row">
          {MODULES.map((m) => (
            <div key={m.jp} className={`hp-module hp-module--${m.joint}`}>
              <span className="hp-jp">{m.jp}</span>
            </div>
          ))}
          <span className="hp-module-gloss">私は水を飲みます — I drink water</span>
        </div>
      )}
      {upTo >= 4 && (
        <svg className="hp-thread" viewBox="0 0 660 560" preserveAspectRatio="xMidYMid meet">
          <path className="hp-thread-main" d={THREAD_D} pathLength={1} />
          <path className="hp-thread-wave" d={WAVEFORM_D} pathLength={1} />
          <polygon className="hp-thread-play hp-thread-mark" points="562,458 562,482 582,470" />
        </svg>
      )}
    </div>
  );
}

/**
 * §4 The system — sticky stage on desktop, scrubbed by the chapters scrolling past. Everything
 * animates from-hidden inside gsap.matchMedia, so tablets, phones, reduced-motion and no-JS all
 * get the finished tableau with zero configuration.
 */
export function SystemSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
        const root = rootRef.current!;
        const stage = root.querySelector('.hp-stage-inner');
        if (!stage) return;
        const tiles = stage.querySelectorAll('.hp-tile');
        const strokes = Array.from(stage.querySelectorAll<SVGPathElement>('[data-stroke]')).filter(
          (p) => Number(p.dataset.stroke) >= 7,
        );
        const modules = stage.querySelectorAll('.hp-module');
        const gloss = stage.querySelector('.hp-module-gloss');
        const threadMain = stage.querySelector('.hp-thread-main');
        const threadWave = stage.querySelector('.hp-thread-wave');
        const threadMark = stage.querySelector('.hp-thread-mark');

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.querySelector('.hp-system-track'),
            start: 'top 60%',
            end: 'bottom 55%',
            scrub: 0.6,
            snap: { snapTo: [0.11, 0.37, 0.63, 1], duration: 0.25, ease: 'power1.inOut' },
          },
        });

        // Ch.1 — tiles snap in and settle flat (0 → 0.22)
        tl.from(tiles, {
          y: -46,
          opacity: 0,
          rotateX: 14,
          transformPerspective: 1200,
          stagger: 0.035,
          duration: 0.16,
        }, 0.02);
        // Ch.2 — strokes 8–14 fly home (0.26 → 0.48)
        tl.fromTo(
          strokes,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, stagger: 0.028, duration: 0.05 },
          0.26,
        );
        // Ch.3 — sentence modules slide in and join (0.52 → 0.74)
        tl.from(modules, { x: (i) => 36 + i * 28, opacity: 0, stagger: 0.03, duration: 0.14 }, 0.52);
        tl.from(gloss, { opacity: 0, duration: 0.06 }, 0.68);
        // Ch.4 — the listening thread stitches through, waveform + play mark resolve (0.78 → 1)
        tl.fromTo(threadMain, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.16 }, 0.78);
        tl.fromTo(threadWave, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.05 }, 0.94);
        tl.from(threadMark, { opacity: 0, scale: 0.6, transformOrigin: 'center', duration: 0.04 }, 0.96);
      });
    }, rootRef);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <section className="hp-section" id="system" aria-labelledby="hp-system-title" ref={rootRef}>
      <div className="hp-container">
        <div className="hp-grid">
          <header className="hp-system-head">
            <Eyebrow>The Kotobox system</Eyebrow>
            <h2 className="hp-h2" id="hp-system-title" data-hp-reveal="mask">
              Everything you learn becomes part of one world.
            </h2>
            <p className="hp-lede" data-hp-reveal="rise" style={{ marginTop: 24 }}>
              Kotobox isn’t five tools taped together. Words, characters, grammar and listening
              feed one spaced-repetition memory and one daily plan — learn a word once, and every
              part of the system knows.
            </p>
          </header>
        </div>
        <div className="hp-grid hp-system-track">
          <div className="hp-stage-col">
            <div className="hp-stage">
              <StageTableau />
            </div>
          </div>
          <ol className="hp-chapters hp-chapters-col">
            {CHAPTERS.map((c, i) => (
              <li key={c.kicker} className="hp-chapter">
                <span className="hp-chapter-kicker">{c.kicker}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <div className="hp-tableau-slot">
                  <StageTableau mini upTo={(i + 1) as 1 | 2 | 3 | 4} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
