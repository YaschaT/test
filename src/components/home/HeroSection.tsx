import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Eyebrow, PrimaryCta, SecondaryCta } from './primitives';

/**
 * §2 Opening. Copy loads via pure CSS (hp-hero-anim / hp-hero-line, delays via --d) so first paint
 * needs no JS. The stage — the stone-block sculpture, its four skill annotations, and the plan
 * card — is choreographed with GSAP inside matchMedia: entrance timeline, idle float, scroll
 * parallax, and pointer parallax (fine pointers only). Reduced motion serves the finished page.
 */

/** The four skills, pinned to points on the sculpture (fractions of the image box). */
const ANNOTATIONS = [
  { jp: '語彙', en: 'Vocabulary', x: '73%', y: '-3%', len: 104, dir: 'down' },
  { jp: '漢字', en: 'Kanji', x: '10%', y: '9%', len: 96, dir: 'down' },
  { jp: '文法', en: 'Grammar', x: '100%', y: '32%', len: 76, dir: 'down' },
  { jp: '聴解', en: 'Listening', x: '13%', y: '75%', len: 58, dir: 'up' },
] as const;

function ProofItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="hp-proof-item">
      <span className="hp-proof-icon" aria-hidden="true">
        {icon}
      </span>
      {children}
    </li>
  );
}

const proofIconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entrance — starts as the copy's second line lands (CSS side runs 80–560ms).
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.from('.hp-hero-visual', { opacity: 0, scale: 0.955, y: 36, duration: 1.35 }, 0.3)
          .from('.hp-hero-shadow', { opacity: 0, scaleX: 0.7, duration: 1.1 }, 0.45)
          .from(
            '.hp-anno-line',
            { scaleY: 0, duration: 0.55, stagger: 0.11, ease: 'power3.out' },
            1.0
          )
          .from('.hp-anno-text', { opacity: 0, y: 8, duration: 0.5, stagger: 0.11 }, 1.12)
          .from('.hp-plan', { opacity: 0, y: 28, duration: 0.75 }, 1.3);

        // Background tabs get no rAF ticks, which would freeze the stage at opacity 0; land the
        // entrance immediately so a tab opened later shows the finished hero, not a stale replay.
        if (document.visibilityState === 'hidden') tl.progress(1);

        // Idle — the sculpture breathes; its contact shadow answers in counterphase.
        gsap.to('.hp-hero-float', {
          y: -9,
          duration: 4.4,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: 1.8,
        });
        gsap.to('.hp-hero-shadow', {
          scaleX: 1.05,
          opacity: 0.72,
          duration: 4.4,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
          delay: 1.8,
        });

      });

      // Scroll parallax is desktop-only: on stacked layouts the shifted stage would trail
      // into the section below it.
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 1025px)', () => {
        const st = {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.7,
        } as const;
        gsap.to('.hp-hero-parallax', { y: 72, ease: 'none', scrollTrigger: { ...st } });
        gsap.to('.hp-plan', { y: 42, ease: 'none', scrollTrigger: { ...st } });
      });

      mm.add(
        '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)',
        () => {
          const section = sectionRef.current;
          if (!section) return;
          const toX = gsap.quickTo('.hp-hero-parallax', 'x', { duration: 1.1, ease: 'power3.out' });
          const toR = gsap.quickTo('.hp-hero-parallax', 'rotation', {
            duration: 1.4,
            ease: 'power3.out',
          });
          const toPlanX = gsap.quickTo('.hp-plan', 'x', { duration: 0.9, ease: 'power3.out' });
          const onMove = (e: MouseEvent) => {
            const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1 … 1
            toX(nx * 14);
            toR(nx * 0.7);
            toPlanX(nx * -12);
          };
          section.addEventListener('mousemove', onMove);
          return () => section.removeEventListener('mousemove', onMove);
        }
      );
    }, sectionRef);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <section className="hp-hero" aria-labelledby="hp-hero-title" ref={sectionRef}>
      <div className="hp-container hp-container--wide hp-hero-layout">
        <div className="hp-hero-copy">
          {/* display:block so the rise transform actually applies (inline boxes ignore it) */}
          <span className="hp-hero-anim" style={{ '--d': '0ms', display: 'block' } as React.CSSProperties}>
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
          <ul className="hp-hero-proof hp-hero-anim" style={{ '--d': '560ms' } as React.CSSProperties}>
            <ProofItem
              icon={
                <svg {...proofIconProps}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9 7.5l3 4.5 3-4.5M12 12v5M9.5 13.5h5M9.5 16h5" strokeWidth={1.4} />
                </svg>
              }
            >
              100% free
            </ProofItem>
            <ProofItem
              icon={
                <svg {...proofIconProps}>
                  <rect x="3" y="6" width="18" height="13" rx="2" />
                  <path d="M3 10.5h18" />
                </svg>
              }
            >
              No credit card
            </ProofItem>
            <ProofItem
              icon={
                <svg {...proofIconProps}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5V12l3 2" />
                </svg>
              }
            >
              Built for short daily sessions
            </ProofItem>
          </ul>
        </div>

        <div className="hp-hero-stage">
          <div className="hp-hero-parallax">
            <div className="hp-hero-visual">
              <div className="hp-hero-float">
                <img
                  className="hp-hero-img"
                  src="/assets/home/hero-sculpture.webp"
                  srcSet="/assets/home/hero-sculpture-760.webp 760w, /assets/home/hero-sculpture.webp 1317w"
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 60vw, 44vw"
                  width={1317}
                  height={1121}
                  alt="Stone blocks — one carved with the kanji 学, to study — interlocked into a single sculpture, circled by one ink brushstroke."
                  fetchPriority="high"
                  decoding="async"
                />
                {/* Skill call-outs are illustrative; the lede already names all five skills. */}
                <div aria-hidden="true">
                  {ANNOTATIONS.map((a) => (
                    <div
                      key={a.en}
                      className="hp-anno"
                      data-dir={a.dir}
                      style={{ '--x': a.x, '--y': a.y, '--len': `${a.len}px` } as React.CSSProperties}
                    >
                      {a.dir === 'up' && <i className="hp-anno-line" />}
                      <span className="hp-anno-text">
                        <span className="hp-jp hp-anno-jp">{a.jp}</span>
                        <span className="hp-anno-en">{a.en}</span>
                      </span>
                      {a.dir === 'down' && <i className="hp-anno-line" />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="hp-hero-shadow" aria-hidden="true" />
            </div>
          </div>

          {/* A glimpse of the daily plan the app actually builds — illustrative numbers. */}
          <div className="hp-plan" aria-hidden="true">
            <p className="hp-plan-title">Today’s plan</p>
            <div className="hp-plan-rail">
              {[
                { label: 'New', value: '12', done: true },
                { label: 'Review', value: '28', done: true },
                { label: 'Minutes', value: '20', done: false },
              ].map((stop) => (
                <div className={`hp-plan-stop${stop.done ? ' is-done' : ''}`} key={stop.label}>
                  <span className="hp-plan-node">
                    {stop.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M2 5.2 4.2 7.4 8 2.8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="hp-plan-label">{stop.label}</span>
                  <span className="hp-plan-value">{stop.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
