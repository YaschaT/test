import { Dialog as DialogPrimitive } from 'radix-ui';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Dialog, DialogPortal, DialogOverlay, DialogTitle, DialogDescription } from '../ui/dialog';
import { ChangeList } from './releaseTheme';
import { PRIMARY_BUTTON_CLASSES } from '../../lib/buttonStyles';
import { releaseDateLabel, type Release } from '../../data/releases';

interface WhatsNewDialogProps {
  release: Release;
  /** Escape, the backdrop, the close button — the announcement is over, but nothing is acknowledged. */
  onClose: () => void;
  /** They followed the release somewhere. That counts as read. */
  onEngage: () => void;
  onOpenAll: () => void;
}

/**
 * A major release, announced properly.
 *
 * This is the only release surface that interrupts, and it earns that by doing something the corner card
 * cannot: taking the learner straight to the thing that changed. Reserved for `tier: 'major'` — a dialog
 * on every patch would train people to close it unread, which costs you the one time it mattered.
 *
 * Closing it is not the same as reading it: Escape and the backdrop only end the announcement, and the
 * sidebar's dot stays until the learner opens the full panel or follows the release somewhere. Modals
 * get dismissed reflexively, and losing the release to a reflex is the failure worth designing out.
 */
export function WhatsNewDialog({ release, onClose, onEngage, onOpenAll }: WhatsNewDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="!bg-slate-950/70 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed top-1/2 left-1/2 z-50 w-[min(30rem,calc(100vw-2rem))] max-h-[calc(100dvh-3rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl outline-none dark:border-hairline dark:bg-ink-900 dark:text-slate-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
        >
          <img
            src="/assets/dashboard/mascots/mascot-greeting.png"
            alt=""
            aria-hidden="true"
            width={110}
            height={103}
            className="mx-auto drop-shadow-lg"
          />
          <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
            New in Kotobox · {releaseDateLabel(release.id)}
          </p>
          <DialogTitle className="mt-1.5 justify-center text-center font-display text-2xl font-extrabold tracking-[-0.01em]">
            {release.title.en}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400">
            {release.title.nl}
          </DialogDescription>

          <div className="mt-5 text-left">
            <ChangeList changes={release.changes} />
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            {release.cta && (
              <button
                type="button"
                onClick={() => {
                  onEngage();
                  navigate(release.cta!.to);
                }}
                className={`${PRIMARY_BUTTON_CLASSES} w-full justify-center py-3.5 text-[15px]`}
              >
                {release.cta.label.en}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenAll}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              See all updates
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
