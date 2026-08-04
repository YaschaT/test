import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, BookMarked, Ban, Wind } from 'lucide-react';
import { Card } from '../../components/Card';
import { CategoryIcon } from '../../components/CategoryIcon';
import { READINGS, readingStats, TADOKU_LEVEL_INFO } from '../../data/readings';
import { useProgress } from '../../lib/progressStore';
import type { TadokuLevel } from '../../types';
import { TADOKU_LEVELS } from '../../types';

/** The three golden rules of extensive reading (tadoku). */
const GOLDEN_RULES = [
  { icon: Ban, en: 'No dictionary', nl: 'Geen woordenboek', ja: '辞書を引かない' },
  { icon: Wind, en: 'Skip what you don’t get', nl: 'Sla over wat je niet snapt', ja: 'わからない所は飛ばす' },
  { icon: BookMarked, en: 'Bored? Pick another', nl: 'Verveeld? Kies een ander', ja: 'つまらなければ別の本へ' },
];

const LEVEL_ACCENT: Record<number, string> = {
  0: 'bg-sky-500',
  1: 'bg-emerald-500',
  2: 'bg-brand-500',
  3: 'bg-amber-500',
  4: 'bg-rose-500',
  5: 'bg-violet-500',
};

export function ReadingList() {
  const progress = useProgress();
  const completed = progress.completedReadingIds;
  const stats = useMemo(() => readingStats(completed), [completed]);
  const [filter, setFilter] = useState<TadokuLevel | 'all'>('all');

  const doneSet = useMemo(() => new Set(completed), [completed]);

  // Books grouped by Tadoku level, easiest-first within each shelf.
  const shelves = useMemo(() => {
    return TADOKU_LEVELS.map((lvl) => ({
      level: lvl,
      books: READINGS.filter((r) => r.tadokuLevel === lvl).sort((a, b) => a.wordCount - b.wordCount),
    })).filter((shelf) => shelf.books.length > 0);
  }, []);

  const visibleShelves = filter === 'all' ? shelves : shelves.filter((s) => s.level === filter);

  // Next thousand-word milestone, for the progress bar.
  const nextMilestone = Math.max(1000, Math.ceil((stats.wordsRead + 1) / 1000) * 1000);
  const milestonePct = Math.min(100, Math.round((stats.wordsRead / nextMilestone) * 100));

  return (
    <div className="space-y-6">
      {/* Volume hero — the tadoku motivator: how much you've read */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950">
        <img
          src="/assets/kotobox-dashboard/generated/hero-background.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/25" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <CategoryIcon skill="reading" size={40} />
              <div>
                <h1 className="text-3xl font-bold text-white">Reading Library</h1>
                <p className="text-white/60">Read a lot, read easy — the words add up.</p>
              </div>
            </div>

            {/* Words-read counter + milestone bar */}
            <div className="mt-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-4xl font-bold tabular-nums text-white">
                    {stats.wordsRead.toLocaleString()}
                    <span className="ml-2 text-base font-medium text-white/60">words read</span>
                  </p>
                </div>
                <p className="text-sm text-white/60 tabular-nums">
                  {stats.booksRead}/{stats.totalBooks} books
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15" role="presentation">
                <div
                  className="h-full rounded-full bg-brand-400 transition-[width] duration-500"
                  style={{ width: `${milestonePct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-white/50 tabular-nums">
                {(nextMilestone - stats.wordsRead).toLocaleString()} words to {nextMilestone.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Golden rules */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:w-[320px]">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-white/50">How to read here</p>
            <ul className="space-y-2.5">
              {GOLDEN_RULES.map((rule) => (
                <li key={rule.en} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                    <rule.icon size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{rule.en}</p>
                    <p className="jp-text text-xs text-white/50">{rule.ja}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Level filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All levels
        </FilterChip>
        {shelves.map((shelf) => (
          <FilterChip key={shelf.level} active={filter === shelf.level} onClick={() => setFilter(shelf.level)}>
            <span className={`inline-block h-2 w-2 rounded-full ${LEVEL_ACCENT[shelf.level]}`} aria-hidden="true" />
            Level {shelf.level}
          </FilterChip>
        ))}
      </div>

      {/* Shelves */}
      <div className="space-y-8">
        {visibleShelves.map((shelf) => {
          const info = TADOKU_LEVEL_INFO[shelf.level];
          const shelfDone = shelf.books.filter((b) => doneSet.has(b.id)).length;
          return (
            <section key={shelf.level}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-bold text-white ${LEVEL_ACCENT[shelf.level]}`}
                  >
                    L{shelf.level}
                  </span>
                  <div>
                    <h2 className="font-bold text-slate-900 dark:text-white">{info.name.en}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{info.blurb.en}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-400 dark:text-slate-500">
                  {shelfDone}/{shelf.books.length}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {shelf.books.map((r) => (
                  <BookCard key={r.id} book={r} done={doneSet.has(r.id)} accent={LEVEL_ACCENT[r.tadokuLevel]} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
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
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function BookCard({
  book,
  done,
  accent,
}: {
  book: (typeof READINGS)[number];
  done: boolean;
  accent: string;
}) {
  return (
    <Link to={`/reading/${book.id}`} className="group">
      <Card className="flex h-full items-center gap-3 p-3 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:translate-y-0 active:scale-[0.99] dark:hover:border-brand-600">
        {/* Cover */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-3xl dark:bg-slate-800">
          <span aria-hidden="true">{book.coverEmoji}</span>
          <span className={`absolute -bottom-1 -right-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white ${accent}`}>
            L{book.tadokuLevel}
          </span>
        </div>

        {/* Meta */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-900 dark:text-white">{book.title.en}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{book.title.nl}</p>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="inline-flex items-center gap-1">
              <BookOpen size={12} aria-hidden="true" />
              {book.wordCount} words
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="font-semibold uppercase tracking-wide">{book.level}</span>
          </div>
        </div>

        {done && <CheckCircle2 size={18} className="shrink-0 text-emerald-500" aria-label="Read" />}
      </Card>
    </Link>
  );
}
