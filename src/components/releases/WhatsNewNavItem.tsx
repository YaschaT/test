import { Sparkles } from 'lucide-react';

/**
 * The permanent home for release notes, pinned above the account row rather than dropped into the
 * scrolling nav — with nine destinations above it, a tenth would fall below the fold on a laptop, and
 * this is a utility the learner reaches for rather than a place to study.
 *
 * The dot is the whole announcement for a patch release: it costs nothing to ignore.
 */
export function WhatsNewNavItem({ unreadCount, onOpen }: { unreadCount: number; onOpen: () => void }) {
  const unread = unreadCount > 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-base font-medium transition-colors ${
        unread
          ? 'text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800/60'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
      }`}
    >
      <Sparkles
        size={22}
        aria-hidden="true"
        className={`shrink-0 ${unread ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400 dark:text-slate-500'}`}
      />
      <span>What's new</span>
      {unread && (
        <>
          <span
            aria-hidden="true"
            className="ml-auto h-2 w-2 shrink-0 rounded-full bg-brand-500"
          />
          {/* The dot alone is colour-only meaning; this is the same fact in words. */}
          <span className="sr-only">
            {unreadCount} unread {unreadCount === 1 ? 'update' : 'updates'}
          </span>
        </>
      )}
    </button>
  );
}
