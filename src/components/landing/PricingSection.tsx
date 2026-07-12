import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { LANDING_PRIMARY_CTA } from './landingCta';

interface Plan {
  name: string;
  badge: string;
  badgeClasses: string;
  price: string;
  priceNote: string;
  features: string[];
  available: boolean;
}

/**
 * Honest pricing: Free is real and lists only shipped features (including account sync, which is live and
 * free today — not held back as future bait). Plus/Pro are clearly labeled "Planned" ideas with genuinely
 * disabled buttons; no waitlist exists, so none is pretended. No payment logic exists anywhere in the app,
 * and the footnote says so in plain words.
 */
const PLANS: Plan[] = [
  {
    name: 'Free',
    badge: 'Available now',
    badgeClasses: 'bg-emerald-400/15 text-emerald-300',
    price: '€0',
    priceNote: 'everything Kotobox does today',
    features: [
      'Daily study plan sized to your time',
      'Vocabulary with spaced-repetition reviews',
      'Guided N5 grammar path',
      'Kanji with stroke-order writing practice',
      'Reading & listening practice',
      'Streaks, XP, levels & achievements',
      'Free account sync across devices',
    ],
    available: true,
  },
  {
    name: 'Plus',
    badge: 'Planned',
    badgeClasses: 'bg-white/10 text-white/50',
    price: 'Planned',
    priceNote: 'an idea for later — not for sale',
    features: [
      'Advanced review analytics',
      'More listening & dictation content',
      'Smarter session recommendations',
      'Progress insights over time',
    ],
    available: false,
  },
  {
    name: 'Pro',
    badge: 'Planned',
    badgeClasses: 'bg-white/10 text-white/50',
    price: 'Planned',
    priceNote: 'an idea for later — not for sale',
    features: [
      'AI conversation & speaking practice',
      'Personal study insights',
      'Early access to new features',
    ],
    available: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-20 sm:py-28 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 data-reveal className="text-3xl sm:text-4xl font-extrabold text-white text-balance max-w-3xl">
          Free today. Honestly.
        </h2>
        <p data-reveal className="mt-4 text-white/60 max-w-2xl">
          Everything Kotobox does right now costs nothing. Paid plans are future ideas, shown here so
          there are no surprises later.
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-5 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              data-reveal
              className={`rounded-3xl border p-6 ${
                plan.available
                  ? 'border-brand-500/50 bg-white/[0.07] backdrop-blur-md shadow-[0_0_40px_-12px_rgba(76,110,240,0.5)]'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-extrabold ${plan.available ? 'text-white' : 'text-white/60'}`}>{plan.name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${plan.badgeClasses}`}>
                  {plan.badge}
                </span>
              </div>
              <p className={`mt-4 text-3xl font-extrabold ${plan.available ? 'text-white' : 'text-white/40'}`}>{plan.price}</p>
              <p className="text-xs text-white/40 mt-1">{plan.priceNote}</p>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.available ? 'text-white/80' : 'text-white/45'}`}>
                    <Check size={15} className={`mt-0.5 shrink-0 ${plan.available ? 'text-emerald-400' : 'text-white/30'}`} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              {plan.available ? (
                <Link to="/register" className={`${LANDING_PRIMARY_CTA} w-full mt-6`}>
                  Start free
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  title={`${plan.name} is a future idea — nothing to join yet`}
                  className="w-full mt-6 min-h-12 rounded-2xl border border-white/10 text-base font-semibold text-white/30 cursor-not-allowed"
                >
                  Coming later
                </button>
              )}
            </div>
          ))}
        </div>

        <p data-reveal className="mt-6 text-sm text-white/40 max-w-2xl">
          No payments exist in Kotobox today — nothing is charged, and there's nothing to accidentally
          subscribe to.
        </p>
      </div>
    </section>
  );
}
