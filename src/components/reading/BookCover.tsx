import { Check } from 'lucide-react';
import type { ReadingPassage } from '../../types';

export type BookState = 'unread' | 'reading' | 'read';

/** The shelf tint per Tadoku level — the same six the list has always used. */
const TINT: Record<number, { accent: string; wash: string }> = {
  0: { accent: 'bg-sky-500', wash: 'bg-sky-500/15 dark:bg-sky-500/20' },
  1: { accent: 'bg-emerald-500', wash: 'bg-emerald-500/15 dark:bg-emerald-500/20' },
  2: { accent: 'bg-indigo-500', wash: 'bg-indigo-500/15 dark:bg-indigo-500/20' },
  3: { accent: 'bg-amber-500', wash: 'bg-amber-500/15 dark:bg-amber-500/20' },
  4: { accent: 'bg-rose-500', wash: 'bg-rose-500/15 dark:bg-rose-500/20' },
  5: { accent: 'bg-violet-500', wash: 'bg-violet-500/15 dark:bg-violet-500/20' },
};

interface BookCoverProps {
  book: ReadingPassage;
  state?: BookState;
  /** 0–1, only used when state is 'reading'. */
  percent?: number;
  /** Set on the always-dark reader card, where the light theme's dark title would vanish. */
  onDark?: boolean;
  className?: string;
}

/**
 * A book's cover.
 *
 * Four of the thirty-two books have painted art. The rest used to show an emoji floating in a tinted
 * box, which is what made a shelf read as half-finished. The fallback here is a real cover instead: the
 * book's own Japanese title, set in the book face on its level's tint. Every book looks deliberate, and
 * painted art can replace a typographic cover one at a time without the shelf ever looking mixed.
 */
export function BookCover({
  book,
  state = 'unread',
  percent = 0,
  onDark = false,
  className = '',
}: BookCoverProps) {
  const tint = TINT[book.tadokuLevel] ?? TINT[0];

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {book.cover ? (
        <img
          src={book.cover}
          alt=""
          aria-hidden="true"
          width={640}
          height={450}
          loading="lazy"
          className="aspect-[64/45] w-full bg-slate-100 object-cover dark:bg-slate-800"
        />
      ) : (
        <div className={`flex aspect-[64/45] w-full items-center justify-center px-3 ${tint.wash}`}>
          {/* keep-all: without it a Japanese title breaks mid-word, e.g. くだものがす / き. */}
          <span
            className={`jp-serif text-center text-base font-semibold leading-snug [word-break:keep-all] ${
              onDark ? 'text-white' : 'text-slate-800 dark:text-white'
            }`}
          >
            {book.titleJa}
          </span>
        </div>
      )}

      <span
        className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${tint.accent}`}
      >
        L{book.tadokuLevel}
      </span>

      {/* A folded corner rather than a floating badge: it belongs to the cover instead of sitting on it. */}
      {state === 'read' && (
        <>
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 h-0 w-0 border-y-[17px] border-l-[17px] border-r-[17px] border-transparent border-r-emerald-500 border-t-emerald-500"
          />
          <Check
            size={12}
            strokeWidth={3}
            aria-hidden="true"
            className="absolute right-1 top-1 text-white"
          />
          <span className="sr-only">Read</span>
        </>
      )}

      {state === 'reading' && (
        <span className="absolute inset-x-0 bottom-0 block h-1 bg-black/40">
          <span
            className="block h-full bg-brand-500"
            style={{ width: `${Math.max(4, Math.round(percent * 100))}%` }}
          />
          <span className="sr-only">{Math.round(percent * 100)}% read</span>
        </span>
      )}
    </div>
  );
}
