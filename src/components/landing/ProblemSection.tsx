import { Shuffle, CalendarX, TrendingDown } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

/** The pain, stated plainly — three reasons learners actually stall, mirrored later by the solution section. */
export function ProblemSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2
          data-reveal
          className="text-3xl sm:text-4xl font-extrabold text-white text-balance max-w-3xl"
        >
          Japanese learners don't quit because they're lazy. They quit because the path is unclear.
        </h2>
        <div className="mt-10 grid sm:grid-cols-3 gap-5">
          <FeatureCard
            icon={Shuffle}
            iconClasses="bg-accent-500/15 text-accent-500"
            title="Too many scattered resources"
            copy="Apps, textbooks, flashcard decks, videos — and none of them agree on what today's session should be."
          />
          <FeatureCard
            icon={CalendarX}
            iconClasses="bg-accent-500/15 text-accent-500"
            title="No clear daily plan"
            copy="You studied yesterday. Great. So what exactly should you do today — and how much is enough?"
          />
          <FeatureCard
            icon={TrendingDown}
            iconClasses="bg-accent-500/15 text-accent-500"
            title="Reviews pile up, motivation drops"
            copy="Skip three days and the review mountain is taller than your motivation. Most people never dig out."
          />
        </div>
      </div>
    </section>
  );
}
