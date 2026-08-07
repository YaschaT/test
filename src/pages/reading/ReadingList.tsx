import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ban, BookMarked, BookOpen, Bookmark, Check, Layers, Wind } from 'lucide-react';
import { CategoryIcon } from '../../components/CategoryIcon';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { READINGS, readingMinutes, readingStats, TADOKU_LEVEL_INFO } from '../../data/readings';
import { getReadingWordsToday, useProgress } from '../../lib/progressStore';
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

/** Per-shelf identity: a solid badge accent and the soft tint used behind an emoji-only cover. */
const LEVEL_ACCENT: Record<number, string> = {
  0: 'bg-sky-500',
  1: 'bg-emerald-500',
  2: 'bg-indigo-500',
  3: 'bg-amber-500',
  4: 'bg-rose-500',
  5: 'bg-violet-500',
};
/**
 * The tinted panel behind an emoji-only cover. Sitting next to painted covers these have to hold
 * their own, so the dark values are a ring plus a real tint rather than the 15%-over-slate wash they
 * started as — at that strength every shelf read as the same grey box.
 */
const LEVEL_COVER: Record<number, string> = {
  0: 'bg-sky-100 ring-1 ring-inset ring-sky-500/20 dark:bg-sky-500/25 dark:ring-sky-400/25',
  1: 'bg-emerald-100 ring-1 ring-inset ring-emerald-500/20 dark:bg-emerald-500/25 dark:ring-emerald-400/25',
  2: 'bg-indigo-100 ring-1 ring-inset ring-indigo-500/20 dark:bg-indigo-500/25 dark:ring-indigo-400/25',
  3: 'bg-amber-100 ring-1 ring-inset ring-amber-500/20 dark:bg-amber-500/25 dark:ring-amber-400/25',
  4: 'bg-rose-100 ring-1 ring-inset ring-rose-500/20 dark:bg-rose-500/25 dark:ring-rose-400/25',
  5: 'bg-violet-100 ring-1 ring-inset ring-violet-500/20 dark:bg-violet-500/25 dark:ring-violet-400/25',
};

export function ReadingList() {
  const progress = useProgress();
  const completed = progress.completedReadingIds;
  const stats = useMemo(() => readingStats(completed), [completed]);

  // Opens on the learner's own level rather than always N5, like every other module page.
  const [level, setLevel] = useState<JlptLevel>(progress.level);
  const [shelf, setShelf] = useState<TadokuLevel | 'all'>('all');

  const doneSet = useMemo(() => new Set(completed), [completed]);
  const wordsToday = getReadingWordsToday(progress);
  const next = useMemo(() => pickNextRead(progress, level), [progress, level]);

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
      <ReadingHero
        level={level}
        onLevelChange={setLevel}
        next={next}
        wordsToday={wordsToday}
        booksRead={stats.booksRead}
      />

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

// ── Hero ──────────────────────────────────────────────────────────────────────
interface ReadingHeroProps {
  level: JlptLevel;
  onLevelChange: (level: JlptLevel) => void;
  next: ReturnType<typeof pickNextRead>;
  wordsToday: number;
  booksRead: number;
}

/**
 * The night-sky banner, built around one job: get back into a book.
 *
 * The headline slot is a real book — either one left half-finished (`resume`) or, with nothing
 * underway, the shortest unread book at this level offered as a suggestion (`start`). The two are
 * labelled differently and only the first carries a progress bar, so a suggestion is never dressed up
 * as progress the reader hasn't made.
 */
function ReadingHero({ level, onLevelChange, next, wordsToday, booksRead }: ReadingHeroProps) {
  const resuming = next?.kind === 'resume';
  const percent = next ? Math.round(next.percent * 100) : 0;

  return (
    /* Deliberately a touch shorter than the Dashboard's 280/300px hero: that one is the app's front
       door and carries the primary CTA, this one sits above a shelf that wants the room. The border
       and the mascot's inset from the corner are what make it read as a *banner* — a framed object on
       the page — rather than a dark background the page happens to start with. */
    <section className="relative isolate min-h-[248px] overflow-hidden rounded-3xl border border-ink-line bg-[radial-gradient(115%_150%_at_50%_38%,#0a1040_0%,#010723_72%)] sm:min-h-[268px]">
      {/* The same painted night scene as the Dashboard hero — moon, ridge, lanterns, torii — which is
          what the mockup drew. It was a flat starfield first, and the banner read as a dark panel
          rather than an illustration. Sized off the banner's *height* from `sm` so the composition
          stays one island with its own faded edges dissolving into the navy, instead of being cropped
          to a strip; on a phone the banner is taller than it is wide, so there it simply covers. */}
      <img
        src="/assets/dashboard/redesign/hero-scenery.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[64%_58%] sm:inset-auto sm:left-[52%] sm:top-[-28%] sm:h-[168%] sm:w-auto sm:max-w-none sm:-translate-x-1/2 sm:object-contain"
      />
      {/* Keeps the copy legible where the scene's left edge reaches under it. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-[#010723] via-[#010723]/55 to-transparent"
        aria-hidden="true"
      />
      <img
        src="/assets/reading/reading-banner.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-5 -z-10 hidden h-[80%] w-auto max-w-[34%] object-contain object-bottom lg:block"
      />

      <div className="relative flex min-h-[inherit] flex-col justify-between gap-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <CategoryIcon skill="reading" size={40} />
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Reading</h1>
              <p className="mt-0.5 text-sm text-white/70">Read a lot, read easy — the words add up.</p>
            </div>
          </div>
          <SegmentedTabs
            value={level}
            onChange={onLevelChange}
            variant="glass"
            groupLabel="Reading level"
            options={JLPT_LEVELS.map((lvl) => ({ value: lvl, label: lvl }))}
          />
        </div>

        {next && (
          <div className="max-w-xl">
            {/* Today's volume rides on the eyebrow's empty right side. It used to sit on a row of its
                own, which cost the banner ~70px for two numbers. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-300">
                {resuming ? 'Continue reading' : 'Start reading'}
              </p>
              <p className="flex items-center gap-x-2 text-xs text-white/50">
                <BookOpen size={13} aria-hidden="true" />
                <span>
                  <strong className="font-bold text-white/80 tabular-nums">{wordsToday.toLocaleString()}</strong>{' '}
                  word{wordsToday === 1 ? '' : 's'} today
                </span>
                <Dot />
                <Layers size={13} aria-hidden="true" />
                <span>
                  <strong className="font-bold text-white/80 tabular-nums">{booksRead.toLocaleString()}</strong>{' '}
                  book{booksRead === 1 ? '' : 's'} completed
                </span>
              </p>
            </div>

            <p className="jp-text mt-1.5 text-2xl font-bold text-white sm:text-3xl">{next.passage.titleJa}</p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-white/60">
              <span className="font-semibold">L{next.passage.tadokuLevel}</span>
              <Dot />
              <span className="tabular-nums">{next.passage.wordCount} words</span>
              <Dot />
              <span className="tabular-nums">~{readingMinutes(next.passage.wordCount)} min</span>
              <Dot />
              <span>{next.passage.title.en}</span>
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {resuming && (
                <div className="min-w-0 flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-brand-400 transition-[width] duration-500 ease-out"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-white/60 tabular-nums">{percent}% completed</p>
                </div>
              )}
              <Link
                to={`/reading/${next.passage.id}`}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-300"
              >
                {resuming ? 'Continue reading' : 'Start reading'}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Dot() {
  return (
    <span className="text-white/25" aria-hidden="true">
      ·
    </span>
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
        {/* Cover. Books with painted art show it; the rest keep the tinted emoji cover, at the same
            aspect ratio so a mixed shelf still lines up. */}
        <div className={`relative overflow-hidden rounded-xl ${book.cover ? 'bg-slate-100 dark:bg-slate-800' : LEVEL_COVER[book.tadokuLevel]}`}>
          {book.cover ? (
            <img
              src={book.cover}
              alt=""
              aria-hidden="true"
              width={640}
              height={450}
              loading="lazy"
              className="aspect-[64/45] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[64/45] w-full items-center justify-center">
              <span className="text-5xl transition-transform duration-200 ease-out group-hover:scale-110" aria-hidden="true">
                {book.coverEmoji}
              </span>
            </div>
          )}
          <span
            className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm ${LEVEL_ACCENT[book.tadokuLevel]}`}
          >
            L{book.tadokuLevel}
          </span>
          {done && (
            <span
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm ring-2 ring-white dark:ring-slate-900"
              aria-label="Read"
            >
              <Check size={13} strokeWidth={3} aria-hidden="true" />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-1 pt-2.5">
          <p className="jp-text line-clamp-2 font-bold leading-snug text-slate-900 dark:text-white">
            {book.titleJa}
          </p>
          <p className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{book.title.en}</p>
          <p className="mt-auto pt-2 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <span className="tabular-nums">{book.wordCount} words</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="tabular-nums">~{readingMinutes(book.wordCount)} min</span>
          </p>
          {started && (
            <div className="mt-2 flex items-center gap-2">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <span
                  className="block h-full rounded-full bg-brand-500"
                  style={{ width: `${Math.round(percent * 100)}%` }}
                />
              </span>
              <span className="text-[11px] font-semibold text-slate-500 tabular-nums dark:text-slate-400">
                {Math.round(percent * 100)}%
              </span>
            </div>
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
        } ${done ? 'right-11' : ''}`}
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
