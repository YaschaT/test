import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PrimaryCta } from './primitives';
import { GoGlyph } from './stage/GoGlyph';

gsap.registerPlugin(ScrollTrigger);

/**
 * §10 Final — the story resolves into the brand: the completed 語 folds down into the Kotobox
 * wordmark, once, on enter. Reduced motion (via CSS) shows the wordmark statically and hides the
 * glyph; the heading and CTAs are ordinary always-visible content either way.
 */
export function FinalSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const root = rootRef.current!;
        const strokes = root.querySelectorAll('.hp-final-glyph path');
        const wordmark = root.querySelector('.hp-final-wordmark');
        if (!strokes.length || !wordmark) return;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.querySelector('.hp-final-stagearea'), start: 'top 75%', once: true },
          defaults: { ease: 'power3.inOut' },
        });
        tl.to(strokes, {
          y: 90,
          scale: 0.25,
          opacity: 0,
          transformOrigin: '50% 100%',
          stagger: 0.028,
          duration: 0.7,
          delay: 0.35,
        });
        tl.fromTo(wordmark, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55 }, '-=0.3');
      });
    }, rootRef);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <section className="hp-section hp-final" aria-labelledby="hp-final-title" ref={rootRef}>
      <div className="hp-container">
        <div className="hp-final-stagearea">
          <GoGlyph className="hp-final-glyph" />
          <span className="hp-final-wordmark" aria-hidden="true">
            Kotobox
          </span>
        </div>
        <h2 className="hp-h2" id="hp-final-title">
          Begin with one word.
        </h2>
        <p className="hp-lede hp-final-line">
          The first one takes about a minute. The system takes it from there.
        </p>
        <div className="hp-final-ctas">
          <PrimaryCta />
          <a href="#system" className="hp-link">
            Explore the platform ↑
          </a>
        </div>

        <footer className="hp-footer">
          <div className="hp-footer-row">
            <span className="hp-footer-tag">
              <strong style={{ color: 'var(--ink)' }}>Kotobox</strong> — JLPT N5→N4, in one piece.
            </span>
            <ul className="hp-footer-links">
              <li>
                <Link to="/login" className="hp-link">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hp-link">
                  Create account
                </Link>
              </li>
              <li>
                <a href="#system" className="hp-link">
                  The system
                </a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
}
