import { Check } from 'lucide-react';
import { LEVEL_DOT, LEVEL_WASH } from './levelTint';
import type { ReadingPassage } from '../../types';

export type BookState = 'unread' | 'reading' | 'read';

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
        <div className={`flex aspect-[64/45] w-full items-center justify-center px-3 ${LEVEL_WASH[book.tadokuLevel] ?? LEVEL_WASH[0]}`}>
          {/* keep-all: without it a Japanese title breaks mid-word, e.g. くだものがす / き. */}
          <span
            className={`jp-serif text-center text-[17px] font-semibold leading-[1.5] [word-break:keep-all] ${
              onDark ? 'text-white' : 'text-slate-800 dark:text-white'
            }`}
          >
            {book.titleJa}
          </span>
        </div>
      )}

      <span
        className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${LEVEL_DOT[book.tadokuLevel] ?? LEVEL_DOT[0]}`}
      >
        L{book.tadokuLevel}
      </span>

      {/* A folded corner rather than a floating badge: it belongs to the cover instead of sitting on it. */}
      {state === 'read' && (
        <>
          <span
            aria-hidden="true"
            className="absolute right-0 top-0 h-0 w-0 border-l-[34px] border-t-[34px] border-l-transparent border-t-emerald-500"
          />
          <Check
            size={13}
            strokeWidth={3}
            aria-hidden="true"
            className="absolute right-1.5 top-1 text-white"
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
