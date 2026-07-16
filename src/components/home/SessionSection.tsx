import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eyebrow } from './primitives';
import { GoGlyph } from './stage/GoGlyph';

gsap.registerPlugin(ScrollTrigger);

/* The four durations are the study-plan calculator's real options (src/lib/studyDurationPref.ts). */
const DURATIONS = ['10 min', '30 min', '1 hr', '2 hrs'];

const STEPS = [
  {
    title: 'Choose your time.',
    body: '10 minutes, 30, an hour, two — the plan reshapes to fit.',
    durations: true,
  },
  {
    title: 'Warm up with what’s due.',
    body: 'Reviews come first: the words and kanji your memory is about to let go of, resurfaced at exactly the right moment.',
  },
  {
    title: 'Learn what’s next.',
    body: 'Your remaining minutes go to new material across grammar, vocabulary, kanji, reading and listening — weighted, not random.',
  },
  {
    title: 'Close the loop.',
    body: 'Finish and your streak, level and weekly goal move — real numbers from real work, nothing decorative.',
  },
];

/**
 * §5 A study day — the page's one horizontal-scroll moment. Desktop pins briefly while the strip
 * pans and the small 語 ink seal tracks progress along the rail; tablet/mobile and reduced-motion
 * get the plain vertical list (the CSS default).
 */
export function SessionSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
        const root = rootRef.current!;
        const viewport = root.querySelector<HTMLElement>('.hp-session-viewport');
        const track = root.querySelector<HTMLElement>('.hp-session-track');
        const seal = root.querySelector<HTMLElement>('.hp-session-seal');
        if (!viewport || !track) return;
        const pan = () => -(track.scrollWidth - viewport.clientWidth);
        if (pan() >= 0) return; // everything already fits — nothing to pan

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: viewport,
            start: 'center center',
            end: '+=150%',
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track, { x: pan });
        if (seal) tl.to(seal, { left: () => viewport.clientWidth - 48 }, 0);
      });
    }, rootRef);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <section className="hp-section" id="session" aria-labelledby="hp-session-title" ref={rootRef}>
      <div className="hp-container">
        <div className="hp-grid">
          <header className="hp-session-head">
            <Eyebrow>A study day</Eyebrow>
            <h2 className="hp-h2" id="hp-session-title" data-hp-reveal="mask">
              Tell it your time. It plans the rest.
            </h2>
            <p className="hp-lede" data-hp-reveal="rise" style={{ marginTop: 24 }}>
              Pick ten minutes or two hours. Kotobox splits your session across what’s due and
              what’s next — so the plan is done before you’ve opened a textbook.
            </p>
          </header>
        </div>
        <div className="hp-session-viewport">
          <div className="hp-session-rail" aria-hidden="true" />
          <div className="hp-session-seal" aria-hidden="true">
            <GoGlyph className="hp-seal" />
          </div>
          <ol className="hp-session-track">
            {STEPS.map((s, i) => (
              <li key={s.title} className="hp-step hp-plate">
                <span className="hp-step-num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                {s.durations && (
                  <>
                    <div className="hp-durations" aria-hidden="true">
                      {DURATIONS.map((d) => (
                        <span key={d} className={`hp-duration${d === '30 min' ? ' is-active' : ''}`}>
                          {d}
                        </span>
                      ))}
                    </div>
                    <span className="hp-from-app">From the app — the real duration picker</span>
                  </>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
