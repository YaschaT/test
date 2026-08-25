import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark } from 'lucide-react';
import { CategoryBanner } from '../../components/learning/CategoryBanner';
import { BookCover } from '../../components/reading/BookCover';
import { LEVEL_DOT } from '../../components/reading/levelTint';
import { READINGS, readingStats, TADOKU_LEVEL_INFO } from '../../data/readings';
import { useProgress } from '../../lib/progressStore';
import { bookPercent, pickNextRead } from '../../lib/readingProgress';
import { getSavedReadingIds, toggleReadingSaved } from '../../lib/savedReadings';
import type { ProgressState, ReadingPosition } from '../../lib/progressStore';
import type { ReadingPassage, TadokuLevel } from '../../types';
import { TADOKU_LEVELS } from '../../types';

/**
 * The library.
 *
 * Grouped by Tadoku level rather than JLPT, because for reading, Tadoku *is* the difficulty axis — the
 * two used to sit on this page as separate controls filtering nearly the same thing. The whole library
 * is on the page now, which is also what makes "2 of 32 read" mean something.
 *
 * The three rules of extensive reading are the page's subtitle instead of three cards at the bottom:
 * they are the instruction for the whole screen, and they were being read last.
 */
export function ReadingList() {
  const progress = useProgress();
  const completed = progress.completedReadingIds;
  const doneSet = useMemo(() => new Set(completed), [completed]);
  const stats = readingStats(completed);
  const next = useMemo(() => pickNextRead(progress, progress.level), [progress]);

  const shelves = useMemo(
    () =>
      TADOKU_LEVELS.map((level) => ({
        level,
        // Shortest first, so a shelf reads left to right from easiest to hardest.
        books: READINGS.filter((book) => book.tadokuLevel === level).sort(
          (a, b) => a.wordCount - b.wordCount,
        ),
      })).filter((shelf) => shelf.books.length > 0),
    [],
  );

  return (
    <div className="w-full">
      {/* The same banner every category wears, in the same place — this page is not the exception. */}
      <CategoryBanner
        category="reading"
        title="Reading"
        subtitle="Read stories, discover meaning in context."
        action={
          next
            ? {
                label: next.kind === 'resume' ? 'Continue reading' : 'Start reading',
                to: `/reading/${next.passage.id}`,
              }
            : undefined
        }
      />

      {next && <KeepReading pick={next} progress={progress} />}

      <header className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h2 className="font-display text-[30px] font-bold leading-none tracking-[-0.01em] text-slate-900 dark:text-slate-100">
            Your library
          </h2>
          <p className="mt-1.5 text-[15px] text-slate-500 dark:text-slate-400">
            No dictionary. Guess from context. Bored? Pick another.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-[26px] font-bold leading-none text-slate-900 tabular-nums dark:text-white">
            {stats.booksRead}{' '}
            <span className="text-[15px] font-bold text-slate-500">of {stats.totalBooks} read</span>
          </p>
          <p className="mt-0.5 text-[12.5px] text-slate-500 tabular-nums">
            {stats.wordsRead.toLocaleString()} Japanese words so far
          </p>
        </div>
      </header>

      <div className="mt-6 space-y-[34px]">
        {shelves.map(({ level, books }) => (
          <Shelf
            key={level}
            level={level}
            books={books}
            doneSet={doneSet}
            percentFor={(book) => bookPercent(progress, book)}
          />
        ))}
      </div>
    </div>
  );
}

// ── Keep reading ──────────────────────────────────────────────────────────────
/**
 * The one book you are in the middle of.
 *
 * It says which line you stopped on rather than a percentage: "line 3 of 7" is a place you can picture
 * going back to, and a percentage is not.
 */
function KeepReading({
  pick,
  progress,
}: {
  pick: NonNullable<ReturnType<typeof pickNextRead>>;
  progress: ProgressState;
}) {
  const position: ReadingPosition | undefined = progress.readingPositions[pick.passage.id];
  const resuming = pick.kind === 'resume' && position;

  return (
    <Link
      to={`/reading/${pick.passage.id}`}
      className="group mt-6 flex items-center gap-5 rounded-[20px] border border-slate-200 bg-white p-[18px] transition-colors hover:border-brand-400/60 sm:gap-[22px] dark:border-white/[0.08] dark:bg-ink-900 dark:hover:border-brand-400/50"
    >
      <BookCover
        book={pick.passage}
        state={pick.kind === 'resume' ? 'reading' : 'unread'}
        percent={pick.percent}
        className="w-36 shrink-0 sm:w-[190px]"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
          {resuming ? 'Keep reading' : 'Start here'}
        </span>
        <span className="jp-serif mt-2 block text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">
          {pick.passage.titleJa}
        </span>
        <span className="mt-1 block text-sm text-slate-500 dark:text-slate-400">
          {pick.passage.title.en} · L{pick.passage.tadokuLevel} · {pick.passage.wordCount} words
        </span>
        {resuming && (
          <span className="mt-3 block text-[13px] text-slate-600 dark:text-slate-300">
            You stopped on line {position.sentencesRead} of {position.totalSentences}.
          </span>
        )}
      </span>
      <span className="hidden shrink-0 items-center gap-[9px] rounded-xl bg-gradient-to-r from-[#4c6ef0] to-[#3a54d6] px-[22px] py-3.5 text-[15px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(58,84,214,0.8)] transition-[filter] group-hover:brightness-110 sm:inline-flex">
        {resuming ? 'Continue' : 'Open'}
        <ArrowRight size={17} aria-hidden="true" />
      </span>
    </Link>
  );
}

// ── A shelf ───────────────────────────────────────────────────────────────────
function Shelf({
  level,
  books,
  doneSet,
  percentFor,
}: {
  level: TadokuLevel;
  books: ReadingPassage[];
  doneSet: Set<string>;
  percentFor: (book: ReadingPassage) => number;
}) {
  const info = TADOKU_LEVEL_INFO[level];

  return (
    <section>
      {/* The rule runs from the label to the count, which is what makes the row read as one shelf. */}
      <div className="flex items-baseline gap-3">
        <span aria-hidden="true" className={`h-[9px] w-[9px] shrink-0 rounded-[2px] ${LEVEL_DOT[level]}`} />
        <h2 className="font-display shrink-0 text-[17px] font-bold text-slate-900 dark:text-slate-100">
          Level {level}
        </h2>
        <span className="shrink-0 text-[13px] text-slate-500">{info.short}</span>
        <span aria-hidden="true" className="h-px min-w-6 flex-1 bg-slate-200 dark:bg-white/[0.07]" />
        <span className="shrink-0 text-[12.5px] text-slate-500 tabular-nums">
          {books.length} book{books.length === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="mt-3.5 flex gap-[18px] overflow-x-auto pb-1">
        {books.map((book) => (
          <ShelfBook
            key={book.id}
            book={book}
            done={doneSet.has(book.id)}
            percent={percentFor(book)}
          />
        ))}
      </ul>
    </section>
  );
}

function ShelfBook({ book, done, percent }: { book: ReadingPassage; done: boolean; percent: number }) {
  const [saved, setSaved] = useState(() => getSavedReadingIds().includes(book.id));
  const started = percent > 0 && percent < 1;

  return (
    <li className="group relative w-[150px] shrink-0">
      <Link
        to={`/reading/${book.id}`}
        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
      >
        <BookCover
          book={book}
          state={done ? 'read' : started ? 'reading' : 'unread'}
          percent={percent}
          className="transition-transform duration-200 ease-out group-hover:-translate-y-1"
        />
        <p className="jp-serif mt-[9px] line-clamp-2 text-sm font-semibold leading-[1.45] text-slate-900 dark:text-slate-100">
          {book.titleJa}
        </p>
        <p className="mt-0.5 line-clamp-1 text-[12.5px] text-slate-500 dark:text-slate-400">
          {book.title.en}
        </p>
        {/* Word count only: how far in you are is the bar across the cover, and saying it twice made the
            caption busier than every other book's without telling you anything new. */}
        <p className="mt-1 text-[11px] text-slate-400 tabular-nums dark:text-slate-500">
          {book.wordCount} words
        </p>
      </Link>

      {/* Outside the Link so saving a book doesn't also open it. */}
      <button
        type="button"
        onClick={() => setSaved(toggleReadingSaved(book.id))}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${book.title.en} from saved` : `Save ${book.title.en}`}
        className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
          saved
            ? 'bg-brand-600 text-white'
            : 'bg-black/35 text-white/80 opacity-0 hover:bg-black/55 hover:text-white focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100'
        } ${done ? 'right-11' : ''}`}
      >
        <Bookmark size={14} className={saved ? 'fill-current' : ''} aria-hidden="true" />
      </button>
    </li>
  );
}
