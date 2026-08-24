import { ArrowRight, X } from 'lucide-react';
import { ChangeList } from './releaseTheme';
import { releaseDateLabel, type Release } from '../../data/releases';

interface WhatsNewCardProps {
  release: Release;
  onDismiss: () => void;
  onOpenAll: () => void;
}

/**
 * A feature release, announced in the corner.
 *
 * Deliberately not a modal: the learner opened the app to study, and a release note is not worth
 * blocking that. It sits out of the way, says what changed, and goes when dismissed — the sidebar entry
 * is what keeps the information reachable afterwards.
 *
 * Lifted clear of the mobile tab bar (bottom-20) the same way the practice footers are.
 */
export function WhatsNewCard({ release, onDismiss, onOpenAll }: WhatsNewCardProps) {
  return (
    <section
      aria-labelledby="whats-new-card-title"
      className="animate-review-reveal-in fixed right-4 bottom-20 z-40 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.35)] md:right-6 md:bottom-6 dark:border-hairline dark:bg-ink-900 dark:shadow-[0_24px_48px_-20px_rgba(2,6,23,0.95)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
          New in Kotobox · {releaseDateLabel(release.id)}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss what's new"
          className="-mt-1 -mr-1 shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <h2
        id="whats-new-card-title"
        className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white"
      >
        {release.title.en}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">{release.title.nl}</p>

      {/* Two changes is the most a corner card can carry without turning into reading homework. */}
      <div className="mt-3.5">
        <ChangeList changes={release.changes.slice(0, 2)} compact />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-white/[0.07]">
        <button
          type="button"
          onClick={onOpenAll}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline dark:text-brand-300"
        >
          See everything that changed
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
