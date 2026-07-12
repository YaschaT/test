import { Link } from 'react-router-dom';
import { LANDING_PRIMARY_CTA, LANDING_SECONDARY_CTA } from './landingCta';
import { SakuraParticles } from './SakuraParticles';

/**
 * The closing ask — calm night panel (same starfield as the app's own heroes), the level-card mascot pose,
 * and the two real actions. The copy names exactly what an account protects: streak, reviews, and N5→N4
 * progress. Guest mode stays one small honest link away.
 */
export function FinalCTA() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div data-reveal className="relative overflow-hidden rounded-3xl bg-slate-950 border border-brand-500/25 px-6 py-14 sm:px-14 text-center">
          <div className="absolute inset-0 star-field" aria-hidden="true" />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(76,110,240,0.18),transparent_65%)]"
          />
          <SakuraParticles />

          <div className="relative">
            <img
              src="/assets/dashboard/mascots/mascot-level-card.png"
              alt="The Kotobox mascot cheering"
              width={132}
              height={124}
              loading="lazy"
              decoding="async"
              className="mx-auto w-28 h-auto drop-shadow-[0_14px_28px_rgba(0,0,0,0.5)]"
            />
            <h2 className="mt-6 text-3xl sm:text-4xl font-extrabold text-white text-balance">
              Start your Japanese path today.
            </h2>
            <p className="mt-3 text-white/60 max-w-md mx-auto">
              Create an account to save your streak, reviews, and N5→N4 progress.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className={LANDING_PRIMARY_CTA}>
                Start learning free
              </Link>
              <Link to="/login" className={LANDING_SECONDARY_CTA}>
                Log in
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/40">
              or{' '}
              <Link to="/dashboard" className="font-semibold text-white/60 hover:text-white/85 underline underline-offset-4 transition-colors">
                continue without an account
              </Link>{' '}
              — progress stays on this device
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
