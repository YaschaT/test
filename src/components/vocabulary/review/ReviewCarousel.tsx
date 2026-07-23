import { useEffect, useState, type ReactNode } from 'react';
import { ReviewCard } from './ReviewCard';
import type { DisplayPrefs } from '../../DisplayToggles';
import type { VocabWord } from '../../../types';

interface ReviewCarouselProps {
  word: VocabWord;
  prevWord?: VocabWord;
  nextWord?: VocabWord;
  revealed: boolean;
  prefs: DisplayPrefs;
  onReveal: () => void;
  /** True while the graded card is sliding out and the next card is stepping in. */
  exiting: boolean;
  className?: string;
}

/**
 * Stacked-card carousel. At rest the active card is centred with the previous/next cards peeking behind
 * it as blurred silhouettes. On grade it advances like a filmstrip: the active card slides off to the
 * left while the next card simultaneously steps forward from the right silhouette slot into the centre —
 * the two move at once, so it reads as a slide, not a crossfade. Adjacent cards are visual context only.
 */
export function ReviewCarousel({
  word,
  prevWord,
  nextWord,
  revealed,
  prefs,
  onReveal,
  exiting,
  className,
}: ReviewCarouselProps) {
  return (
    <div className={`relative isolate w-full max-w-[760px] mx-auto ${className ?? ''}`} style={{ perspective: '1600px' }}>
      <div
        aria-hidden="true"
        className="absolute -inset-x-24 -inset-y-12 -z-10 pointer-events-none blur-2xl bg-[radial-gradient(ellipse_at_center,rgba(76,110,240,0.10),transparent_62%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(76,110,240,0.16),transparent_62%)]"
      />

      {/* Silhouettes are hidden while advancing so the incoming card owns the right slot. */}
      {!exiting && prevWord && <GhostCard word={prevWord} side="left" />}
      {!exiting && nextWord && <GhostCard word={nextWord} side="right" />}

      <OutgoingCard key={word.id} exiting={exiting}>
        <ReviewCard word={word} revealed={revealed} prefs={prefs} onReveal={onReveal} />
      </OutgoingCard>

      {exiting && nextWord && (
        <IncomingCard key={`in-${nextWord.id}`}>
          <ReviewCard word={nextWord} revealed={false} prefs={prefs} onReveal={() => {}} />
        </IncomingCard>
      )}
    </div>
  );
}

/**
 * Active card. Keyed by word id in the parent so it remounts fresh (centred, no animation) on commit —
 * which lines up exactly with where the incoming card just arrived, making the swap seamless. The
 * transition is always present, so it never fires on that fresh mount, only when `exiting` flips true.
 */
function OutgoingCard({ exiting, children }: { exiting: boolean; children: ReactNode }) {
  return (
    <div
      className="review-card-motion relative z-10 xl:h-full"
      style={{
        transition: 'transform 380ms cubic-bezier(0.4, 0, 1, 1), opacity 260ms ease-in 140ms',
        transform: exiting ? 'translateX(-104%) rotate(-5deg) scale(0.9)' : 'none',
        opacity: exiting ? 0 : 1,
      }}
    >
      {children}
    </div>
  );
}

/** Next card: steps forward from the right silhouette slot (tilted, small, dim) into the centre. */
function IncomingCard({ children }: { children: ReactNode }) {
  const [arrived, setArrived] = useState(false);

  useEffect(() => {
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setArrived(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 xl:h-full"
      style={{
        transition: 'transform 380ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms ease-out',
        transform: arrived ? 'translateX(0) scale(1) rotateY(0deg)' : 'translateX(42%) scale(0.9) rotateY(-9deg)',
        opacity: arrived ? 1 : 0.55,
      }}
    >
      {children}
    </div>
  );
}

function GhostCard({ word, side }: { word: VocabWord; side: 'left' | 'right' }) {
  return (
    <div
      aria-hidden="true"
      className={`review-card-ghost absolute top-1/2 hidden lg:flex flex-col items-center justify-center gap-2 w-[300px] h-[360px] rounded-3xl px-6 blur-[1.5px] opacity-60 dark:opacity-45 pointer-events-none select-none ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
      style={{
        transform: `translateY(-50%) translateX(${side === 'left' ? '-42%' : '42%'}) scale(0.9) rotateY(${
          side === 'left' ? '9deg' : '-9deg'
        })`,
      }}
    >
      <p className="jp-text text-4xl font-semibold text-slate-500/80 dark:text-slate-400/60 truncate max-w-full">
        {word.japanese}
      </p>
      {word.kana !== word.japanese && (
        <p className="jp-text text-base text-slate-400/80 dark:text-slate-500/70 truncate max-w-full">{word.kana}</p>
      )}
    </div>
  );
}
