import { CalendarCheck, RotateCcw, Map, Brush, Headphones, Trophy } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

/**
 * Six benefit-led cards, one per real module — every claim here is a shipped feature (study-duration
 * planner, SRS reviews, guided grammar path, kanji writing canvas, TTS listening, streak/XP/achievements),
 * nothing aspirational. Icon colors reuse the same skill colors the app itself uses.
 */
export function SolutionSection() {
  return (
    <section id="features" className="relative py-20 sm:py-28 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 data-reveal className="text-3xl sm:text-4xl font-extrabold text-white text-balance max-w-3xl">
          Kotobox gives every study session a clear next step.
        </h2>
        <p data-reveal className="mt-4 text-white/60 max-w-2xl">
          Tell it how much time you have, and it builds the session — new material when you're fresh,
          reviews before things fade, and progress you can actually see.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard
            icon={CalendarCheck}
            iconClasses="bg-brand-500/15 text-brand-300"
            title="Daily study plan"
            copy="Pick 10 minutes or 3 hours — Kotobox builds a session that fits, across all five skills."
          />
          <FeatureCard
            icon={RotateCcw}
            iconClasses="bg-violet-500/15 text-violet-300"
            title="Smart vocabulary reviews"
            copy="Learn words today. Review them right before they'd slip away — spaced repetition does the scheduling."
          />
          <FeatureCard
            icon={Map}
            iconClasses="bg-sky-500/15 text-sky-300"
            title="Grammar path"
            copy="N5 grammar in a guided order with original example sentences, common mistakes, and quick checks."
          />
          <FeatureCard
            icon={Brush}
            iconClasses="bg-emerald-500/15 text-emerald-300"
            title="Kanji mastery"
            copy="Readings, meanings, and a real writing canvas — draw every kanji stroke by stroke."
          />
          <FeatureCard
            icon={Headphones}
            iconClasses="bg-indigo-500/15 text-indigo-300"
            title="Listening practice"
            copy="Train your ear with spoken Japanese at your own speed — comprehension and dictation modes."
          />
          <FeatureCard
            icon={Trophy}
            iconClasses="bg-amber-500/15 text-amber-300"
            title="Streaks, XP & achievements"
            copy="Every session feeds your streak, level, and badge collection — earned from real progress only."
          />
        </div>
      </div>
    </section>
  );
}
