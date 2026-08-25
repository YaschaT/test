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
 * Every book currently uses a generated cover (see coverArt.ts). Four books used to carry painted
 * illustrations, and they were retired rather than filtered: the artwork is a bright, soft-3D direction
 * and the shelf is flat and typographic, so four of them among twenty-eight generated covers read as two
 * products. The files are still in `public/assets/reading/covers/`.
 *
 * The `cover` branch below is kept, because art *should* be able to come back — but only art drawn for
 * this system: flat, in the level's hue family, and made for the whole library rather than a handful of
 * books. The wash and the dark-mode dimming here are what a stray cover would need to sit in the shelf
 * at all, not a licence to mix directions again.
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
        <span className="absolute inset-x-0 bottom-0 block h-[3px] bg-black/35">
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
 * The generated cover, exactly as drawn: the title centred on its level's hue at 20%, and nothing else.
 * An earlier pass added a horizon disc placed by a hash of the book id; the design had already solved
 * the same problem more quietly, and with the painted covers retired there is no incoherence left for a
 * graphic to fix.
 */
function GeneratedCover({ book, onDark }: { book: ReadingPassage; onDark: boolean }) {
  return (
    <div
      className={`flex aspect-[64/45] w-full items-center justify-center p-3.5 ${
        LEVEL_WASH[book.tadokuLevel] ?? LEVEL_WASH[0]
      }`}
    >
      <span
        className={`jp-serif text-center text-[17px] font-semibold leading-[1.5] [word-break:keep-all] [overflow-wrap:normal] ${
          onDark ? 'text-slate-100' : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        {book.titleJa}
      </span>
    </div>
  );
}
