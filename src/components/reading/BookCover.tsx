import { Check } from 'lucide-react';
import { coverComposition } from './coverArt';
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
 * Four of the thirty-two books have painted art; the rest are generated (see coverArt.ts). Both are
 * pulled into the same family here: the generated cover is composed from the book's level hue, and the
 * painted ones get a wash of that same hue so a shelf reads as one set rather than four illustrations
 * sitting next to twenty-eight typographic cards.
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
        <div className="relative">
          <img
            src={book.cover}
            alt=""
            aria-hidden="true"
            width={640}
            height={450}
            loading="lazy"
            className="aspect-[64/45] w-full bg-slate-100 object-cover saturate-[0.85] dark:bg-slate-800 dark:brightness-[0.88]"
          />
          {/* Pulls the painted art toward its shelf's hue, and takes the brightness down in dark mode so
              four illustrations do not glare out of a shelf of twenty-eight quiet covers. Soft-light
              shifts the colour cast rather than flattening the art into a duotone. */}
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light ${
              LEVEL_DOT[book.tadokuLevel] ?? LEVEL_DOT[0]
            }`}
          />
        </div>
      ) : (
        <GeneratedCover book={book} onDark={onDark} />
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

/**
 * A cover drawn from the book itself: its level's hue as the ground, one soft disc placed by its id, and
 * its Japanese title in the book face. Sized in container units so the same cover works at every scale
 * it is used — 150px on a shelf, 224px on the keep-reading card.
 */
function GeneratedCover({ book, onDark }: { book: ReadingPassage; onDark: boolean }) {
  const { discX, discY, discSize, titleLow } = coverComposition(book.id);
  const accent = LEVEL_DOT[book.tadokuLevel] ?? LEVEL_DOT[0];

  return (
    <div
      className={`relative aspect-[64/45] w-full overflow-hidden [container-type:inline-size] ${
        LEVEL_WASH[book.tadokuLevel] ?? LEVEL_WASH[0]
      }`}
    >
      {/* The horizon disc — the app's night-sky moon, reduced to one shape. */}
      <span
        aria-hidden="true"
        className={`absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 ${accent}`}
        style={{ left: `${discX}%`, top: `${discY}%`, width: `${discSize}%` }}
      />
      {/* Head-set titles start below the level badge rather than under it. */}
      <div
        className={`absolute inset-0 flex flex-col px-[8cqw] ${
          titleLow ? 'justify-end pb-[8cqw] pt-[7cqw]' : 'justify-start pb-[7cqw] pt-[18cqw]'
        }`}
      >
        <p
          className={`jp-serif line-clamp-3 max-w-[86%] text-[10cqw] font-semibold leading-[1.45] [word-break:keep-all] ${
            onDark ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}
        >
          {book.titleJa}
        </p>
        <span
          aria-hidden="true"
          className={`mt-[4cqw] h-[1.5cqw] w-[16cqw] shrink-0 rounded-full opacity-70 ${accent}`}
        />
      </div>
    </div>
  );
}
