import { Link } from 'react-router-dom';
import { JapaneseScene } from './JapaneseScene';
import { LanternScene } from './LanternScene';
import { SpotlightLayers } from './SpotlightLayers';
import { SakuraParticles } from './SakuraParticles';

/**
 * The hero, rebuilt to the user's spotlight-reveal template: full-viewport dark scene, a cursor-following
 * lantern of light that uncovers the warm layer beneath (see SpotlightLayers/LanternScene), a centered
 * two-line display headline — Playfair italic over tight Inter, per the template's exact sizes, tracking,
 * and stagger delays — and the two bottom corner paragraphs. Layout, z-order (10/30/50), 100dvh, and the
 * load choreography (blur-rise headline, fade-up paragraphs, Ken Burns on the base scene) all follow the
 * template; the content is Kotobox's own. The CTA keeps the brand's lantern-violet, not the template's
 * orange — the user's standing rule ("no random orange/red CTA") outranks template fidelity.
 */
export function LandingHero() {
  return (
    <header
      id="top"
      data-hero
      className="relative w-full overflow-hidden h-screen bg-black"
      style={{ height: '100dvh' }}
    >
      <SpotlightLayers
        base={
          <div className="absolute inset-0 hero-zoom">
            <JapaneseScene />
          </div>
        }
        reveal={<LanternScene />}
      />
      <div className="absolute inset-0 z-40 pointer-events-none">
        <SakuraParticles />
      </div>

      {/* headline */}
      <div className="absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none">
        <h1 className="text-white leading-[0.95]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Your path appears
          </span>
          <span
            className="block font-inter font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            one word at a time
          </span>
        </h1>
      </div>

      {/* bottom-left: what Kotobox is */}
      <div
        className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.7s' }}
      >
        <p className="font-inter text-sm text-white/80 leading-relaxed">
          Kotobox turns Japanese into a daily path — vocabulary, grammar, kanji, and listening, sequenced
          so you always know the next step from N5 to N4.
        </p>
      </div>

      {/* bottom-right: the mechanic's meaning + the real CTA */}
      <div
        className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="font-inter text-xs sm:text-sm text-white/80 leading-relaxed">
          {/* the imperative only makes sense with a cursor; touch devices get a fixed lantern glow instead */}
          <span className="hidden sm:inline">Move the light. </span>The night above Mt. Fuji hides the
          words you'll learn — start uncovering them today, free.
        </p>
        <Link
          to="/register"
          className="font-inter bg-gradient-to-b from-[#6460e5] to-[#5050d5] hover:brightness-110 text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#6460e5]/30"
        >
          Start learning free
        </Link>
      </div>
    </header>
  );
}
