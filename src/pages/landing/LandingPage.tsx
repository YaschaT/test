import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LandingNav } from '../../components/landing/LandingNav';
import { LandingHero } from '../../components/landing/LandingHero';
import { ProblemSection } from '../../components/landing/ProblemSection';
import { SolutionSection } from '../../components/landing/SolutionSection';
import { ProductPreview } from '../../components/landing/ProductPreview';
import { JourneySection } from '../../components/landing/JourneySection';
import { MotivationSection } from '../../components/landing/MotivationSection';
import { PricingSection } from '../../components/landing/PricingSection';
import { FinalCTA } from '../../components/landing/FinalCTA';
import { LandingFooter } from '../../components/landing/LandingFooter';

gsap.registerPlugin(ScrollTrigger);

/**
 * The public marketing page at `/` (the app itself lives at /dashboard). All GSAP choreography is set up
 * here in one place, scoped with gsap.context for clean unmount and wrapped in gsap.matchMedia so
 * prefers-reduced-motion users get a fully static page. Everything animates *from* hidden via gsap.from —
 * the default (no-JS / reduced-motion / GSAP failure) state is always the fully visible page, so no
 * content is ever gated behind an animation firing.
 */
export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Scroll reveals for the sections below the hero — fire once, then leave the DOM alone. The hero
        // itself animates via the template's CSS load choreography (hero-anim classes in index.css), and
        // scroll-parallax is deliberately NOT applied there: the spotlight's base and reveal layers hold
        // duplicate scenes that must stay pixel-registered, so nothing may move one without the other.
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, {
            opacity: 0,
            y: 30,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 86%', once: true },
          });
        });
      });
    }, rootRef);

    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    // Geist carries landing body/UI text (headings stay Baloo 2 via the global h1-h3 rule) — a crisper,
    // more editorial voice for the marketing surface; torii-grain adds the same film-grain depth cue as
    // the auth page.
    <div ref={rootRef} className="min-h-screen bg-slate-950 text-white font-geist antialiased torii-grain">
      <LandingNav />
      <main>
        <LandingHero />
        <ProblemSection />
        <SolutionSection />
        <ProductPreview />
        <JourneySection />
        <MotivationSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
