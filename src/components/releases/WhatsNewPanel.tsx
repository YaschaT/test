import { Dialog as DialogPrimitive } from 'radix-ui';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { Dialog, DialogPortal, DialogOverlay, DialogTitle, DialogDescription } from '../ui/dialog';
import { ChangeList } from './releaseTheme';
import { RELEASES, releaseDateLabel } from '../../data/releases';

/**
 * The full history — where the sidebar entry, the corner card and the release dialog all lead.
 *
 * A real Radix dialog rather than a route, so it opens over whatever the learner was doing and closes
 * back to it: reading the changelog should never cost you your place in a lesson.
 */
export function WhatsNewPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPortal>
        <DialogOverlay className="!bg-slate-950/60 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[min(46rem,calc(100dvh-3rem))] w-[min(44rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl outline-none dark:border-hairline dark:bg-ink-900 dark:text-slate-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-white/[0.07]">
            <div className="min-w-0">
              <DialogTitle className="font-display text-2xl font-bold tracking-[-0.01em]">
                What's new
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Everything that has changed in Kotobox, newest first.
              </DialogDescription>
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="-mr-1 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X size={18} aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <ol className="flex flex-col">
              {RELEASES.map((release, i) => (
                <li
                  key={release.id}
                  className={i > 0 ? 'mt-7 border-t border-slate-100 pt-7 dark:border-white/[0.07]' : ''}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-lg font-bold">{release.title.en}</h3>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{release.title.nl}</span>
                    <span className="ml-auto shrink-0 text-[13px] font-semibold text-slate-400 dark:text-slate-500">
                      {releaseDateLabel(release.id)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <ChangeList changes={release.changes} />
                  </div>
                  {release.cta && (
                    <Link
                      to={release.cta.to}
                      onClick={onClose}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:underline dark:text-brand-300"
                    >
                      {release.cta.label.en}
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
