import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HomeNav } from '../../components/home/HomeNav';
import { HeroSection } from '../../components/home/HeroSection';
import { ProblemSection } from '../../components/home/ProblemSection';
import { SystemSection } from '../../components/home/SystemSection';
import { SessionSection } from '../../components/home/SessionSection';
import { InsideSection } from '../../components/home/InsideSection';
import { PhilosophySection } from '../../components/home/PhilosophySection';
import { MotivationSection } from '../../components/home/MotivationSection';
import { AccessSection } from '../../components/home/AccessSection';
import { FinalSection } from '../../components/home/FinalSection';
import { HomeFooter } from '../../components/home/HomeFooter';
import '../../components/home/home.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * The public homepage — "Living Ink" (docs/kotobox-homepage-brief.md). Code-split at the route so
 * GSAP and this page's CSS never enter the app bundle. Design tokens are scoped under
 * [data-surface="paper"], never :root.
 *
 * Motion tiers (brief Part 7): Tier A narrative scrubs live inside SystemSection / SessionSection /
 * FinalSection; this file owns Tier B — the shared enter-once reveals, in three deliberate variants
 * (mask = headings, rise = copy, settle = §6's paper plates) — and the §3 scrap drift. Everything
 * animates FROM hidden inside matchMedia, so reduced-motion and no-JS read the finished page.
 */
export function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Tier B — one reveal system, three variants keyed by role.
        gsap.utils.toArray<HTMLElement>('[data-hp-reveal]').forEach((el) => {
          const variant = el.dataset.hpReveal;
          const trigger = { trigger: el, start: 'top 86%', once: true } as const;
          if (variant === 'mask') {
            gsap.from(el, {
              clipPath: 'inset(0 0 110% 0)',
              y: '0.35em',
              duration: 0.85,
              ease: 'power4.out',
              scrollTrigger: trigger,
            });
          } else if (variant === 'settle') {
            gsap.from(el, {
              opacity: 0,
              y: 24,
              rotation: () => gsap.utils.random(-1.6, 1.6),
              transformOrigin: '50% 100%',
              duration: 0.65,
              ease: 'power2.out',
              scrollTrigger: trigger,
            });
          } else {
            gsap.from(el, {
              opacity: 0,
              y: 24,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: trigger,
            });
          }
        });

        // §3 — scraps drift apart at three rates as the section scrolls through.
        const field = rootRef.current?.querySelector('.hp-scrapfield');
        if (field) {
          gsap.utils.toArray<HTMLElement>('[data-hp-drift]').forEach((el) => {
            const rate = Number(el.dataset.hpDrift);
            gsap.to(el, {
              y: rate * -34,
              x: (rate - 2) * 26,
              rotation: (rate - 2) * 2,
              ease: 'none',
              scrollTrigger: { trigger: field, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
            });
          });
        }
      });
    }, rootRef);
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <div ref={rootRef} data-surface="paper">
      <a href="#hp-main" className="hp-skip">
        Skip to content
      </a>
      <HomeNav />
      <main id="hp-main">
        <HeroSection />
        <ProblemSection />
        <SystemSection />
        <SessionSection />
        <InsideSection />
        <PhilosophySection />
        <MotivationSection />
        <AccessSection />
        <FinalSection />
      </main>
      <HomeFooter />
    </div>
  );
}
