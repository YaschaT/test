import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BookMarked, Ban, Wind, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ModuleHeader } from '../../components/learning/ModuleHeader';
import { ModuleStatsHero } from '../../components/learning/ModuleStatsHero';
import { READINGS, readingStats, TADOKU_LEVEL_INFO } from '../../data/readings';
import { useProgress } from '../../lib/progressStore';
import type { ReadingPassage, TadokuLevel } from '../../types';
import { TADOKU_LEVELS } from '../../types';

/** The three golden rules of extensive reading (tadoku). */
const GOLDEN_RULES = [
  { icon: Ban, en: 'No dictionary', nl: 'Geen woordenboek', ja: '辞書を引かない' },
  { icon: Wind, en: 'Skip what you don’t get', nl: 'Sla over wat je niet snapt', ja: 'わからない所は飛ばす' },
  { icon: BookMarked, en: 'Bored? Pick another', nl: 'Verveeld? Kies een ander', ja: 'つまらなければ別の本へ' },
];

/** Per-level identity: solid accent (badges) + soft cover tint. Each Tadoku shelf gets its own hue. */
const LEVEL_ACCENT: Record<number, string> = {
  0: 'bg-sky-500',
  1: 'bg-emerald-500',
  2: 'bg-indigo-500',
  3: 'bg-amber-500',
  4: 'bg-rose-500',
  5: 'bg-violet-500',
};
const LEVEL_DOT: Record<number, string> = {
  0: 'bg-sky-400',
  1: 'bg-emerald-400',
  2: 'bg-indigo-400',
  3: 'bg-amber-400',
  4: 'bg-rose-400',
  5: 'bg-violet-400',
};
const LEVEL_COVER: Record<number, string> = {
  0: 'bg-sky-100 dark:bg-sky-500/15',
  1: 'bg-emerald-100 dark:bg-emerald-500/15',
  2: 'bg-indigo-100 dark:bg-indigo-500/15',
  3: 'bg-amber-100 dark:bg-amber-500/15',
  4: 'bg-rose-100 dark:bg-rose-500/15',
  5: 'bg-violet-100 dark:bg-violet-500/15',
};

export function ReadingList() {
  const progress = useProgress();
  const completed = progress.completedReadingIds;
  const stats = useMemo(() => readingStats(completed), [completed]);
  const [filter, setFilter] = useState<TadokuLevel | 'all'>('all');

  const doneSet = useMemo(() => new Set(completed), [completed]);
  const totalWords = useMemo(() => READINGS.reduce((n, r) => n + r.wordCount, 0), []);

  // Books grouped by Tadoku level, easiest-first within each shelf.
  const shelves = useMemo(
    () =>
      TADOKU_LEVELS.map((lvl) => ({
        level: lvl,
        books: READINGS.filter((r) => r.tadokuLevel === lvl).sort((a, b) => a.wordCount - b.wordCount),
      })).filter((shelf) => shelf.books.length > 0),
    [],
  );

  const levelReached =
    shelves.filter((s) => s.books.some((b) => doneSet.has(b.id))).map((s) => s.level).pop() ?? 0;

  const visibleShelves = filter === 'all' ? shelves : shelves.filter((s) => s.level === filter);

  return (
    <div className="space-y-6">
      <ModuleHeader skill="reading" title="Reading" subtitle="Read a lot, read easy — the words add up." />
      <ModuleStatsHero
        ringProgress={stats.totalBooks > 0 ? stats.booksRead / stats.totalBooks : 0}
        ringIcon={BookOpen}
        headlineValue={stats.wordsRead}
        headlineTotal={totalWords}
        headlineLabel="Words read"
        mascot="reading"
        facts={[
          { value: stats.booksRead, label: 'Books' },
          { value: levelReached, label: 'Level' },
        ]}
      />

      <GoldenRules />

      {/* Level filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All levels
        </FilterChip>
        {shelves.map((shelf) => (
          <FilterChip key={shelf.level} active={filter === shelf.level} onClick={() => setFilter(shelf.level)}>
            <span className={`inline-block h-2 w-2 rounded-full ${LEVEL_DOT[shelf.level]}`} aria-hidden="true" />
            Level {shelf.level}
          </FilterChip>
        ))}
      </div>

      {/* Shelves — horizontal cover rails */}
      <div className="space-y-9">
        {visibleShelves.map((shelf) => (
          <LevelShelf key={shelf.level} level={shelf.level} books={shelf.books} doneSet={doneSet} />
        ))}
      </div>
    </div>
  );
}

// ── Golden rules ────────────────────────────────────────────────────────────
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

// ── Shelf (horizontal cover rail) ─────────────────────────────────────────────
function LevelShelf({
  level,
  books,
  doneSet,
}: {
  level: TadokuLevel;
  books: ReadingPassage[];
  doneSet: Set<string>;
}) {
  const info = TADOKU_LEVEL_INFO[level];
  const railRef = useRef<HTMLDivElement>(null);
  const readCount = books.filter((b) => doneSet.has(b.id)).length;

  function scrollBy(dir: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollBy({ left: dir * Math.min(rail.clientWidth * 0.8, 520), behavior: reduce ? 'auto' : 'smooth' });
  }

  return (
    <section className="group/shelf">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-bold text-white ${LEVEL_ACCENT[level]}`}>
            L{level}
          </span>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">{info.name.en}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{info.blurb.en}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tabular-nums text-slate-400 dark:text-slate-500">
            {readCount}/{books.length}
          </span>
          {/* Scroll controls — desktop only; touch users swipe. Gone from 2xl, where the shelf stops
              being a rail and lays every cover out at once. */}
          <div className="hidden items-center gap-1 md:flex 2xl:hidden">
            <RailButton dir={-1} onClick={() => scrollBy(-1)} />
            <RailButton dir={1} onClick={() => scrollBy(1)} />
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        /* A scrolling rail up to xl. From 2xl the whole shelf fits across the frame, so it becomes a
           wrapping grid instead — a half-empty rail of five covers next to 900px of background was the
           worst use of a wide display on this page. */
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,#000_calc(100%-24px),transparent)] 2xl:grid 2xl:grid-cols-[repeat(auto-fill,minmax(10.25rem,1fr))] 2xl:overflow-visible 2xl:[mask-image:none]"
      >
        {books.map((book) => (
          <CoverCard key={book.id} book={book} done={doneSet.has(book.id)} />
        ))}
        {/* trailing spacer so the last card can snap clear of the mask fade */}
        <span className="shrink-0 basis-1" aria-hidden="true" />
      </div>
    </section>
  );
}

function RailButton({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 1 ? 'Scroll shelf right' : 'Scroll shelf left'}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {dir === 1 ? <ChevronRight size={16} aria-hidden="true" /> : <ChevronLeft size={16} aria-hidden="true" />}
    </button>
  );
}

// ── Cover card ────────────────────────────────────────────────────────────────
function CoverCard({ book, done }: { book: ReadingPassage; done: boolean }) {
  return (
    <Link
      to={`/reading/${book.id}`}
      className="group/card w-[164px] shrink-0 snap-start 2xl:w-auto rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
    >
      {/* Cover */}
      <div
        className={`relative flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-black/5 shadow-sm transition-all duration-200 ease-out group-hover/card:-translate-y-1 group-hover/card:shadow-lg dark:border-white/10 ${LEVEL_COVER[book.tadokuLevel]}`}
      >
        {/* faux book spine */}
        <span className="absolute inset-y-0 left-0 w-1.5 bg-black/10 dark:bg-black/30" aria-hidden="true" />
        <span className="text-5xl transition-transform duration-200 ease-out group-hover/card:scale-110" aria-hidden="true">
          {book.coverEmoji}
        </span>
        <span className={`absolute left-2.5 top-2.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white ${LEVEL_ACCENT[book.tadokuLevel]}`}>
          L{book.tadokuLevel}
        </span>
        {done && (
          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white dark:ring-slate-950" aria-label="Read">
            <Check size={13} strokeWidth={3} aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="px-0.5 pt-2.5">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 text-balance dark:text-white">
          {book.title.en}
        </p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <BookOpen size={12} aria-hidden="true" />
          <span className="tabular-nums">{book.wordCount} words</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span className="font-semibold uppercase tracking-wide">{book.level}</span>
        </div>
      </div>
    </Link>
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
          ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
}
