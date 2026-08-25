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
  const [shelf, setShelf] = useState<TadokuLevel | 'all'>('all');

  const doneSet = useMemo(() => new Set(completed), [completed]);
  const next = useMemo(() => pickNextRead(progress, level), [progress, level]);
  const stats = readingStats(completed);

  const booksAtLevel = useMemo(
    () => READINGS.filter((book) => book.level === level),
    [level],
  );

  /**
   * Only the shelves that actually hold a book at this JLPT level get a chip. The two filters are
   * near-perfectly correlated (N5 books are L0–L1, N4 books are L2…), so offering every shelf at every
   * level would mostly offer combinations that resolve to an empty page.
   */
  const shelves = useMemo(
    () => TADOKU_LEVELS.filter((lvl) => booksAtLevel.some((book) => book.tadokuLevel === lvl)),
    [booksAtLevel],
  );

  // Switching JLPT level can strand the chip on a shelf that doesn't exist there. Resolved during
  // render rather than corrected in an effect, so the page never paints an empty shelf for a frame.
  const activeShelf = shelf !== 'all' && shelves.includes(shelf) ? shelf : 'all';

  const visible = useMemo(
    () =>
      booksAtLevel
        .filter((book) => activeShelf === 'all' || book.tadokuLevel === activeShelf)
        .sort((a, b) => a.tadokuLevel - b.tadokuLevel || a.wordCount - b.wordCount),
    [booksAtLevel, activeShelf],
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

      {/* Shelf filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={activeShelf === 'all'} onClick={() => setShelf('all')}>
          All
        </FilterChip>
        {shelves.map((lvl) => (
          <FilterChip key={lvl} active={activeShelf === lvl} onClick={() => setShelf(lvl)}>
            L{lvl} {TADOKU_LEVEL_INFO[lvl].short}
          </FilterChip>
        ))}
      </div>

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {activeShelf === 'all'
            ? `${level} books`
            : `Level ${activeShelf} — ${TADOKU_LEVEL_INFO[activeShelf].name.en}`}
        </h2>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          {activeShelf === 'all'
            ? `${visible.length} book${visible.length === 1 ? '' : 's'} graded for ${level}, shortest first.`
            : TADOKU_LEVEL_INFO[activeShelf].blurb.en}
          {' · '}
          <span className="font-semibold text-slate-700 tabular-nums dark:text-slate-200">
            {stats.booksRead} of {stats.totalBooks} read
          </span>
          {stats.wordsRead > 0 && `, ${stats.wordsRead.toLocaleString()} words`}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {visible.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              done={doneSet.has(book.id)}
              percent={bookPercent(progress, book)}
            />
          ))}
        </div>
      </section>

      <GoldenRules />
    </div>
  );
}

// ── Book card ─────────────────────────────────────────────────────────────────
function BookCard({ book, done, percent }: { book: ReadingPassage; done: boolean; percent: number }) {
  const [saved, setSaved] = useState(() => getSavedReadingIds().includes(book.id));
  const started = percent > 0 && percent < 1;

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <Link
        to={`/reading/${book.id}`}
        className="flex flex-1 flex-col rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
      >
        {/* One cover treatment for the whole shelf: painted art where a book has it, the book's own
            title set on its level tint where it doesn't. See BookCover. */}
        <BookCover book={book} state={done ? 'read' : started ? 'reading' : 'unread'} percent={percent} />

        <div className="flex flex-1 flex-col px-1 pt-2.5">
          <p className="jp-serif line-clamp-2 font-semibold leading-snug text-slate-900 dark:text-white">
            {book.titleJa}
          </p>
          <p className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{book.title.en}</p>
          <p className="mt-auto pt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="tabular-nums">{book.wordCount} words</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="tabular-nums">~{readingMinutes(book.wordCount)} min</span>
          </p>
          {started && (
            <p className="mt-1.5 text-[11px] font-semibold text-brand-600 tabular-nums dark:text-brand-300">
              {Math.round(percent * 100)}% read
            </p>
          )}
        </div>
      </Link>

      {/* Outside the Link so saving a book doesn't also open it. */}
      <button
        type="button"
        onClick={() => setSaved(toggleReadingSaved(book.id))}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${book.title.en} from saved` : `Save ${book.title.en}`}
        className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors ${
          saved
            ? 'bg-brand-600 text-white'
            : 'bg-black/35 text-white/80 opacity-0 hover:bg-black/55 hover:text-white focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100'
        }`}
      >
        <Bookmark size={15} className={saved ? 'fill-current' : ''} aria-hidden="true" />
      </button>
    </div>
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? 'bg-brand-600 text-white shadow-sm'
          : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}
