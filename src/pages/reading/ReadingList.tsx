import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ban, BookMarked, Bookmark, Wind } from 'lucide-react';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { BookCover } from '../../components/reading/BookCover';
import { CategoryBanner } from '../../components/learning/CategoryBanner';
import { READINGS, readingMinutes, readingStats, TADOKU_LEVEL_INFO } from '../../data/readings';
import { useProgress } from '../../lib/progressStore';
import { bookPercent, pickNextRead } from '../../lib/readingProgress';
import { getSavedReadingIds, toggleReadingSaved } from '../../lib/savedReadings';
import type { JlptLevel, ReadingPassage, TadokuLevel } from '../../types';
import { JLPT_LEVELS, TADOKU_LEVELS } from '../../types';

/** The three golden rules of extensive reading (tadoku). */
const GOLDEN_RULES = [
  { icon: Ban, en: 'No dictionary', ja: '辞書を引かない' },
  { icon: Wind, en: 'Skip what you don’t get', ja: 'わからない所は飛ばす' },
  { icon: BookMarked, en: 'Bored? Pick another', ja: 'つまらなければ別の本へ' },
];

export function ReadingList() {
  const progress = useProgress();
  const completed = progress.completedReadingIds;
  // Opens on the learner's own level rather than always N5, like every other module page.
  const [level, setLevel] = useState<JlptLevel>(progress.level);

  const doneSet = useMemo(() => new Set(completed), [completed]);
  const next = useMemo(() => pickNextRead(progress, level), [progress, level]);
  const stats = readingStats(completed);

  const booksAtLevel = useMemo(
    () => READINGS.filter((book) => book.level === level),
    [level],
  );

  /**
   * The shelves this level actually has books on. Tadoku level and JLPT level are near-perfectly
   * correlated (N5 books are L0–L1, N4 books are L2…), so an empty shelf would be the normal case if
   * every level rendered all six.
   */
  const shelves = useMemo(
    () =>
      TADOKU_LEVELS.filter((lvl) => booksAtLevel.some((book) => book.tadokuLevel === lvl)).map((lvl) => ({
        level: lvl,
        // Shortest first, so a shelf reads left to right from easiest to hardest.
        books: booksAtLevel
          .filter((book) => book.tadokuLevel === lvl)
          .sort((a, b) => a.wordCount - b.wordCount),
      })),
    [booksAtLevel],
  );

  return (
    <div className="w-full space-y-6">
      <CategoryBanner
        category="reading"
        title="Reading"
        subtitle="Read stories, discover meaning in context."
        levels={
          <SegmentedTabs
            value={level}
            onChange={setLevel}
            variant="glass"
            size="sm"
            groupLabel="Reading level"
            options={JLPT_LEVELS.map((lvl) => ({ value: lvl, label: lvl }))}
          />
        }
        action={
          next
            ? {
                label: next.kind === 'resume' ? 'Continue reading' : 'Start reading',
                to: `/reading/${next.passage.id}`,
              }
            : undefined
        }
      />

      {/* The book you are part-way through, with its own cover — it used to be a bare button label in
          the banner, which is a thin way to represent the one thing you were in the middle of. */}
      {next && (
        <Link
          to={`/reading/${next.passage.id}`}
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 transition-colors hover:border-brand-400/60 sm:gap-5 sm:p-4 dark:border-hairline dark:bg-ink-900 dark:hover:border-brand-400/50"
        >
          <BookCover
            book={next.passage}
            state={next.kind === 'resume' ? 'reading' : 'unread'}
            percent={next.percent}
            className="w-28 shrink-0 sm:w-36"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
              {next.kind === 'resume' ? 'Keep reading' : 'Start here'}
            </span>
            <span className="jp-serif mt-1.5 block text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
              {next.passage.titleJa}
            </span>
            <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
              {next.passage.title.en} · L{next.passage.tadokuLevel} · {next.passage.wordCount} words
            </span>
            {next.kind === 'resume' && (
              <span className="mt-2 block text-[13px] text-slate-600 dark:text-slate-300">
                {Math.round(next.percent * 100)}% through
              </span>
            )}
          </span>
          <span className="hidden shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-[#4c6ef0] to-[#3a54d6] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(58,84,214,0.8)] transition-[filter] group-hover:brightness-110 sm:inline-flex">
            {next.kind === 'resume' ? 'Continue' : 'Open'}
            <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Link>
      )}

      {/* The shelves. Grouping by Tadoku level *is* the filter now — the chip row that used to sit here
          filtered the same axis the shelves already separate, so it was a second control for one job. */}
      <div className="space-y-7">
        {shelves.map(({ level: shelfLevel, books }) => (
          <Shelf
            key={shelfLevel}
            level={shelfLevel}
            books={books}
            doneSet={doneSet}
            percentFor={(book) => bookPercent(progress, book)}
          />
        ))}
      </div>

      <p className="px-1 text-sm text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-700 tabular-nums dark:text-slate-200">
          {stats.booksRead} of {stats.totalBooks} read
        </span>
        {stats.wordsRead > 0 && ` · ${stats.wordsRead.toLocaleString()} Japanese words so far`}
      </p>

      <GoldenRules />
    </div>
  );
}

// ── A shelf ───────────────────────────────────────────────────────────────────
/**
 * One Tadoku level, as a shelf.
 *
 * The books sit in a case with a heavier bottom edge — the board they are resting on — and the row
 * scrolls sideways when the shelf holds more than fits. That is the honest cost of the metaphor: a grid
 * shows every book at once and a shelf does not, so each one says how many it holds and how many of
 * those you have read, and the count is what tells you there is more to the right.
 */
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
  const read = books.filter((book) => doneSet.has(book.id)).length;

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-1">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          <span className="text-slate-400 tabular-nums dark:text-slate-500">L{level}</span> {info.name.en}
        </h2>
        <p className="text-sm text-slate-500 tabular-nums dark:text-slate-400">
          {books.length} book{books.length === 1 ? '' : 's'}
          {read > 0 && ` · ${read} read`}
        </p>
      </div>
      <p className="mt-0.5 px-1 text-sm text-slate-500 dark:text-slate-400">{info.blurb.en}</p>

      <div className="mt-3 rounded-2xl border border-slate-200 border-b-slate-300 bg-slate-50/70 p-3 [border-bottom-width:3px] sm:p-4 dark:border-hairline dark:border-b-white/25 dark:bg-white/[0.03]">
        {/* Scrolls with the scrollbar visible rather than hidden: on a shelf that overflows, the bar is
            the only thing telling you the row continues. */}
        <ul className="flex gap-3 overflow-x-auto pb-1 sm:gap-4">
          {books.map((book) => (
            <ShelfBook
              key={book.id}
              book={book}
              done={doneSet.has(book.id)}
              percent={percentFor(book)}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ShelfBook({ book, done, percent }: { book: ReadingPassage; done: boolean; percent: number }) {
  const [saved, setSaved] = useState(() => getSavedReadingIds().includes(book.id));
  const started = percent > 0 && percent < 1;

  return (
    <li className="group relative w-[142px] shrink-0 sm:w-[164px]">
      <Link
        to={`/reading/${book.id}`}
        className="block rounded-xl outline-none transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
      >
        {/* The drop shadow is what makes a cover read as standing on the board rather than printed on it. */}
        <BookCover
          book={book}
          state={done ? 'read' : started ? 'reading' : 'unread'}
          percent={percent}
          className="shadow-[0_6px_10px_-6px_rgba(15,23,42,0.45)] dark:shadow-[0_8px_14px_-8px_rgba(0,0,0,0.9)]"
        />
        <p className="jp-serif mt-2.5 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 dark:text-white">
          {book.titleJa}
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{book.title.en}</p>
        <p className="mt-1 text-[11px] text-slate-400 tabular-nums dark:text-slate-500">
          {book.wordCount} words · ~{readingMinutes(book.wordCount)} min
          {started && <span className="text-brand-600 dark:text-brand-300"> · {Math.round(percent * 100)}%</span>}
        </p>
      </Link>

      {/* Outside the Link so saving a book doesn't also open it. */}
      <button
        type="button"
        onClick={() => setSaved(toggleReadingSaved(book.id))}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${book.title.en} from saved` : `Save ${book.title.en}`}
        className={`absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
          saved
            ? 'bg-brand-600 text-white'
            : 'bg-black/35 text-white/80 opacity-0 hover:bg-black/55 hover:text-white focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100'
        }`}
      >
        <Bookmark size={14} className={saved ? 'fill-current' : ''} aria-hidden="true" />
      </button>
    </li>
  );
}

// ── Golden rules ──────────────────────────────────────────────────────────────
// Each rule needs `min-w-0`: its Japanese line is `truncate` (white-space: nowrap), so without it the
// grid column's min-content becomes the full unbreakable string and widens the entire page.
function GoldenRules() {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
      {GOLDEN_RULES.map((rule) => (
        <div key={rule.en} className="flex min-w-0 items-center gap-3 rounded-xl px-2 py-1.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
            <rule.icon size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rule.en}</p>
            <p className="jp-text truncate text-xs text-slate-400 dark:text-slate-500">{rule.ja}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
