import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  Ban,
  Wind,
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { RingStat } from '../../components/dashboard/RingStat';
import { LearningStatItem } from '../../components/learning/LearningStatItem';
import { useCountUp } from '../../lib/useCountUp';
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

  const shelvesCleared = shelves.filter((s) => s.books.every((b) => doneSet.has(b.id))).length;
  const levelReached =
    shelves.filter((s) => s.books.some((b) => doneSet.has(b.id))).map((s) => s.level).pop() ?? 0;

  const visibleShelves = filter === 'all' ? shelves : shelves.filter((s) => s.level === filter);
  const wordsPct = totalWords > 0 ? Math.round((stats.wordsRead / totalWords) * 100) : 0;

  return (
    <div className="space-y-6">
      <ReadingHero
        wordsRead={stats.wordsRead}
        totalWords={totalWords}
        wordsPct={wordsPct}
        booksRead={stats.booksRead}
        totalBooks={stats.totalBooks}
        shelvesCleared={shelvesCleared}
        shelfCount={shelves.length}
        levelReached={levelReached}
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

// ── Hero ──────────────────────────────────────────────────────────────────────
interface HeroProps {
  wordsRead: number;
  totalWords: number;
  wordsPct: number;
  booksRead: number;
  totalBooks: number;
  shelvesCleared: number;
  shelfCount: number;
  levelReached: number;
}

function ReadingHero({
  wordsRead,
  totalWords,
  wordsPct,
  booksRead,
  totalBooks,
  shelvesCleared,
  shelfCount,
  levelReached,
}: HeroProps) {
  const displayWords = useCountUp(wordsRead);
  const nextMilestone = Math.max(1000, Math.ceil((wordsRead + 1) / 1000) * 1000);
  const milestonePct = Math.min(100, Math.round((wordsRead / nextMilestone) * 100));

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950">
      <img
        src="/assets/kotobox-dashboard/generated/hero-background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/55 to-slate-950/30" aria-hidden="true" />

      <div className="relative z-10 flex flex-wrap items-center gap-x-8 gap-y-6 p-5 sm:p-6">
        {/* Ring + headline */}
        <div className="flex shrink-0 items-center gap-4">
          <RingStat progress={totalWords > 0 ? wordsRead / totalWords : 0} color="#38bdf8" trackColor="#ffffff" size={80} strokeWidth={7}>
            <BookOpen size={22} className="text-white/85" aria-hidden="true" />
          </RingStat>
          <div>
            <p className="text-3xl font-bold leading-tight text-white tabular-nums">
              {displayWords.toLocaleString()}
              <span className="text-base font-medium text-slate-400"> / {totalWords.toLocaleString()}</span>
            </p>
            <p className="text-sm font-semibold leading-tight text-slate-200">Words read</p>
            {/* Milestone bar */}
            <div className="mt-2 w-[180px] max-w-full">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-sky-400 transition-[width] duration-700 ease-out"
                  style={{ width: `${milestonePct}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400 tabular-nums">
                {(nextMilestone - wordsRead).toLocaleString()} to {nextMilestone.toLocaleString()} · {wordsPct}% of library
              </p>
            </div>
          </div>
        </div>

        <img
          src="/assets/dashboard/mascots/mascot-reading-map.png"
          alt=""
          aria-hidden="true"
          width={78}
          height={94}
          className="hidden shrink-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] sm:block"
        />

        {/* Stat chips */}
        <div className="grid basis-full grid-cols-2 gap-x-4 gap-y-5 sm:flex sm:basis-auto sm:flex-1 sm:flex-wrap sm:gap-x-8 sm:border-l sm:border-white/10 sm:pl-6">
          <LearningStatItem icon={BookOpen} iconBg="bg-sky-500/20" iconColor="text-sky-300" value={booksRead} label="Books read" helper={`of ${totalBooks}`} />
          <LearningStatItem icon={Trophy} iconBg="bg-amber-500/20" iconColor="text-amber-300" value={shelvesCleared} label="Shelves cleared" helper={`of ${shelfCount}`} />
          <LearningStatItem icon={Sparkles} iconBg="bg-violet-500/20" iconColor="text-violet-300" value={levelReached} label="Level reached" helper="keep climbing" />
        </div>
      </div>
    </section>
  );
}

// ── Golden rules ────────────────────────────────────────────────────────────
function GoldenRules() {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
      {GOLDEN_RULES.map((rule) => (
        <div key={rule.en} className="flex items-center gap-3 rounded-xl px-2 py-1.5">
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
          {/* Scroll controls — desktop only; touch users swipe */}
          <div className="hidden items-center gap-1 md:flex">
            <RailButton dir={-1} onClick={() => scrollBy(-1)} />
            <RailButton dir={1} onClick={() => scrollBy(1)} />
          </div>
        </div>
      </div>

      <div
        ref={railRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [mask-image:linear-gradient(to_right,#000_calc(100%-24px),transparent)]"
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
      className="group/card w-[164px] shrink-0 snap-start rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
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
