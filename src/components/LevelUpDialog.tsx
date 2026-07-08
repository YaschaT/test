import { useEffect, useRef } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Dialog, DialogPortal, DialogOverlay, DialogTitle, DialogDescription } from './ui/dialog';
import { playMilestone } from '../lib/sound';
import { PRIMARY_BUTTON_CLASSES } from '../lib/buttonStyles';

interface LevelUpDialogProps {
  level: number;
  title: string;
  onDismiss: () => void;
}

const CONFETTI_COLORS = ['#4c6ef0', '#8b7cf6', '#f59e0b', '#10b981', '#f43f5e', '#38bdf8'];
const CONFETTI_COUNT = 50;

/**
 * Builds the confetti pieces as real DOM nodes rather than React-rendered state — this is a one-shot
 * decorative animation nothing else in the app ever needs to read or diff, so an imperative effect (the
 * sanctioned place for this kind of impure, external-system work) is a better fit than routing randomness
 * through render/state, which React's rules disallow.
 */
function spawnConfetti(container: HTMLDivElement): HTMLSpanElement[] {
  const pieces: HTMLSpanElement[] = [];
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const span = document.createElement('span');
    span.className = 'absolute top-0 rounded-sm animate-confetti-fall';
    span.style.left = `${Math.random() * 100}%`;
    span.style.width = `${6 + Math.random() * 6}px`;
    span.style.height = `${4 + Math.random() * 5}px`;
    span.style.backgroundColor = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    span.style.animationDelay = `${Math.random() * 0.5}s`;
    span.style.animationDuration = `${1.6 + Math.random() * 1.1}s`;
    span.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(span);
    pieces.push(span);
  }
  return pieces;
}

/** Shown once per in-session level-up (see useLevelUp) — a real modal built on Radix Dialog (via
 * ui/dialog.tsx) for a genuine focus trap, Escape-to-close, and scroll lock, rather than the hand-rolled
 * overlay this used before. Confetti and sound both respect the app's existing conventions: confetti
 * animation disables entirely under prefers-reduced-motion (same pattern as every other animation in
 * index.css), and the sound goes through the shared sound.ts engine, which already gates on the user's
 * mute preference. */
export function LevelUpDialog({ level, title, onDismiss }: LevelUpDialogProps) {
  const confettiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    playMilestone();
    const container = confettiContainerRef.current;
    if (!container) return;
    const pieces = spawnConfetti(container);
    return () => {
      pieces.forEach((p) => p.remove());
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <>
      <div ref={confettiContainerRef} className="fixed inset-0 z-50 overflow-hidden pointer-events-none" aria-hidden="true" />
      <Dialog open onOpenChange={(open) => !open && onDismiss()}>
        <DialogPortal>
          {/* Overrides the default shadcn overlay (a subtle 10%-black dim) with something more immersive —
              this is a full-screen celebration moment, not a routine form dialog. */}
          <DialogOverlay className="!bg-slate-950/70 backdrop-blur-sm" />
          <DialogPrimitive.Content
            className="fixed top-1/2 left-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-popover p-6 text-center text-popover-foreground shadow-2xl outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
          >
            <img
              src="/assets/dashboard/mascots/mascot-greeting.png"
              alt=""
              aria-hidden="true"
              width={110}
              height={103}
              className="mx-auto drop-shadow-lg"
            />
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300">Level Up!</p>
            <DialogTitle className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 justify-center">
              Level {level}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 mt-1">
              You're now a {title}. Keep up the great work!
            </DialogDescription>
            <button type="button" onClick={onDismiss} className={`${PRIMARY_BUTTON_CLASSES} w-full justify-center mt-5`}>
              Nice!
            </button>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
}
