import { useEffect, useRef, type ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Flame, Layers, Sparkles, Sprout, Timer } from 'lucide-react';
import { PrimaryButton } from '../PrimaryButton';
import { RingStat } from '../dashboard/RingStat';
import { GRADE_META, GRADE_ORDER } from '../vocabulary/review/gradeTheme';
import { PRIMARY_BUTTON_CLASSES, SECONDARY_BUTTON_CLASSES } from '../../lib/buttonStyles';
import { MASCOTS, type MascotName } from '../../lib/mascots';
import { MASTERED_INTERVAL_DAYS } from '../../lib/learningState';
import { playComplete, playMilestone } from '../../lib/sound';
import { useCountUp } from '../../lib/useCountUp';
import type { ReviewSummary } from '../../lib/reviewSummary';
import type { SrsRating } from '../../types';

/** Everything the screen needs to name a card it wants to send you back to. */
export interface ReviewCompleteItem {
  id: string;
  japanese: string;
  reading?: string;
  meaning: string;
  href: string;
}

interface ReviewCompleteProps {
  summary: ReviewSummary;
  /** Every grade press in order — the session trace draws one mark per press. */
  trace: SrsRating[];
  /** Lookup for the cards the summary points at, keyed by id. */
  items: Map<string, ReviewCompleteItem>;
  mascot: MascotName;
  /** How this deck's cards are named in copy — "words", "kanji". */
  noun: { en: string; nl: string };
  /** Wall-clock seconds from the first card to the last grade. */
  seconds: number;
  bestStreak: number;
  /** True for the browse flow, which reaches the end of a deck rather than finishing a queue. */
  browsing: boolean;
  exitTo: string;
  exitLabel: { en: string; nl: string };
  /** Offered only when another queue can genuinely be built right now. */
  nextRound?: { count: number; onStart: () => void };
}

const PANEL =
  'rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-hairline dark:bg-ink-900';
const CHIP_LIMIT = 10;

function duration(total: number): string {
  const m = Math.floor(total / 60);
  return m > 0 ? `${m}m ${String(total % 60).padStart(2, '0')}s` : `${total}s`;
}

/** A session has to be long enough for "all of it" to mean something before it reads as a sweep. */
const SWEEP_MIN_CARDS = 4;

/** English + Dutch verdict, tiered by how much of the session came back cleanly. */
function verdict(accuracy: number, graded: number): { en: string; nl: string } {
  if (graded === 0)
    return {
      en: 'You reached the last card without grading any.',
      nl: 'Je bent aan het eind zonder iets te beoordelen.',
    };
  if (accuracy === 1)
    return {
      en: 'Every card came back to you. Clean sweep.',
      nl: 'Elke kaart wist je meteen. Alles goed.',
    };
  if (accuracy >= 0.8)
    return {
      en: 'Strong recall — this deck is settling in.',
      nl: 'Sterke recall — deze stapel begint te zitten.',
    };
  if (accuracy >= 0.5)
    return {
      en: 'Solid session. The shaky ones come back soonest.',
      nl: 'Degelijke sessie. De wankele komen het snelst terug.',
    };
  return {
    en: 'A hard one — which is exactly when the scheduler earns its keep.',
    nl: 'Een zware — juist dan doet de planner zijn werk.',
  };
}

/**
 * The end of a review session.
 *
 * The screen this replaced restated the one thing the learner already knew — how many cards they had
 * just graded — and stopped. This one answers what the session actually bought: how much came back
 * cleanly, when the scheduler is bringing each card round again, which cards are worth one more look,
 * and which crossed into the mastered range. Every number is read back out of the real SRS store after
 * the fact (see reviewSummary.ts), so nothing here is an estimate.
 */
export function ReviewComplete({
  summary,
  trace,
  items,
  mascot,
  noun,
  seconds,
  bestStreak,
  browsing,
  exitTo,
  exitLabel,
  nextRound,
}: ReviewCompleteProps) {
  const { graded, correct, accuracy, counts, buckets, weakIds, masteredIds, xpEarned, firstLearned } =
    summary;
  const perfect = graded >= SWEEP_MIN_CARDS && accuracy === 1;
  const landingRef = useRef<HTMLHeadingElement>(null);
  const pct = useCountUp(Math.round(accuracy * 100), 900);
  const shownGraded = useCountUp(graded, 700);
  const line = verdict(accuracy, graded);

  useEffect(() => {
    if (perfect || masteredIds.length > 0) playMilestone();
    else playComplete();
    // Focus leaves the grading controls along with the cards, so put it on the heading that replaced
    // them: the screen gets announced, and Tab picks up here instead of back at the page chrome. The
    // heading (rather than the panel) is the target so the focus ring a keyboard user sees hugs the
    // words rather than boxing the whole hero.
    landingRef.current?.focus({ preventScroll: true });
  }, [perfect, masteredIds.length]);

  const lookup = (id: string) => items.get(id);
  const weakChips = weakIds.map(lookup).filter((i): i is ReviewCompleteItem => Boolean(i));
  const masteredChips = masteredIds.map(lookup).filter((i): i is ReviewCompleteItem => Boolean(i));
  // Long sessions would otherwise stagger for ten seconds; short ones keep the full per-card beat.
  const traceStep = trace.length > 0 ? Math.min(26, 620 / trace.length) : 0;

  const stats: {
    icon: ComponentType<{ size?: number; className?: string }>;
    value: string;
    en: string;
    nl: string;
  }[] = [
    {
      icon: Layers,
      value: String(shownGraded),
      en: `${noun.en} reviewed`,
      nl: `${noun.nl} beoordeeld`,
    },
  ];
  if (seconds > 0)
    stats.push({
      icon: Timer,
      value: duration(seconds),
      en: 'time on cards',
      nl: 'tijd op kaarten',
    });
  if (bestStreak > 0)
    stats.push({
      icon: Flame,
      value: String(bestStreak),
      en: 'best run',
      nl: 'beste reeks',
    });
  if (firstLearned > 0)
    stats.push({
      icon: Sprout,
      value: String(firstLearned),
      en: 'met for the first time',
      nl: 'voor het eerst gezien',
    });

  return (
    <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-4 py-2 md:gap-5 md:py-5">
      <section className="review-card-surface rc-rise relative overflow-hidden rounded-[28px] px-5 py-7 sm:px-9 sm:py-9">
        {/* The lantern behind the mascot — the same soft coloured light the system uses everywhere for
            depth, sized and placed rather than sprayed across the panel. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -left-20 h-80 w-80 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(76,110,240,0.20), transparent 68%)',
          }}
        />

        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex items-start gap-4 sm:gap-5">
            <img
              src={MASCOTS[mascot]}
              alt=""
              aria-hidden="true"
              width={84}
              height={84}
              className="h-[72px] w-[72px] shrink-0 object-contain sm:h-[84px] sm:w-[84px]"
            />
            <div className="min-w-0">
              <h1
                ref={landingRef}
                tabIndex={-1}
                className="font-display rounded-lg text-[27px] leading-tight font-bold text-slate-900 sm:text-[33px] dark:text-white"
              >
                {browsing ? 'End of the deck' : 'Session complete'}
              </h1>
              {/* The XP pill rides with the Dutch subtitle rather than the English heading, so the two
                  halves of the title stay on consecutive lines when the pill wraps on a narrow screen. */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">
                  {browsing ? 'Einde van de stapel' : 'Sessie voltooid'}
                </p>
                {xpEarned > 0 && (
                  <span className="rc-pop bg-brand-500/15 text-brand-700 dark:text-brand-300 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-bold">
                    <Sparkles size={13} aria-hidden="true" />+{xpEarned} XP
                  </span>
                )}
              </div>
              <p className="mt-3 max-w-[46ch] text-[15px] leading-snug text-slate-700 dark:text-slate-200">
                {line.en}
              </p>
              <p className="max-w-[46ch] text-[13.5px] leading-snug text-slate-500 dark:text-slate-400">
                {line.nl}
              </p>
            </div>
          </div>

          {graded > 0 && (
            <div className="flex shrink-0 flex-col items-center gap-3 self-start sm:self-auto">
              <div className="relative">
                {perfect && (
                  <span
                    aria-hidden="true"
                    className="rc-halo absolute inset-0 rounded-full ring-2 ring-emerald-400/70"
                  />
                )}
                <RingStat
                  progress={accuracy}
                  size={112}
                  strokeWidth={9}
                  color={perfect ? '#10b981' : 'var(--color-brand-500)'}
                >
                  <div className="text-center text-slate-900 dark:text-white">
                    <p className="font-display text-[30px] leading-none font-bold tabular-nums">{pct}%</p>
                    <p className="mt-1 text-[11px] font-bold tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
                      recall
                    </p>
                  </div>
                </RingStat>
              </div>
              <p className="max-w-[13rem] text-center text-[13px] leading-snug text-balance text-slate-500 dark:text-slate-400">
                <span className="font-bold text-slate-700 tabular-nums dark:text-slate-200">
                  {correct} of {graded}
                </span>{' '}
                graded Good or Easy
              </p>
            </div>
          )}
        </div>

        {graded > 0 && (
          <div className="relative mt-8">
            {/* The session itself: one mark per grade press, in the order you pressed them. Below a
                handful of cards the marks stretch into something that reads as a progress bar rather
                than a trace, so short sessions get the tally alone. */}
            <div
              className={`flex h-2.5 gap-[3px] ${trace.length >= SWEEP_MIN_CARDS ? '' : 'hidden'}`}
              aria-hidden="true"
            >
              {trace.map((rating, i) => (
                <span
                  key={i}
                  className="rc-trace min-w-[3px] flex-1 rounded-full"
                  style={{
                    backgroundColor: GRADE_META[rating].hex,
                    animationDelay: `${Math.round(i * traceStep)}ms`,
                  }}
                />
              ))}
            </div>
            <ul
              className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${trace.length >= SWEEP_MIN_CARDS ? 'mt-4' : ''}`}
            >
              {GRADE_ORDER.map((rating) => (
                <li key={rating} className="flex items-center gap-1.5 text-[13px]">
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${GRADE_META[rating].dotClass}`}
                  />
                  <span className="text-slate-500 dark:text-slate-400">
                    {GRADE_META[rating].label}
                    <span className="ml-1 hidden text-slate-400 sm:inline dark:text-slate-500">
                      · {GRADE_META[rating].labelNl}
                    </span>
                  </span>
                  <span className="font-bold text-slate-800 tabular-nums dark:text-slate-100">
                    {counts[rating]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {graded > 0 && (
          <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4 border-t border-slate-200/80 pt-6 dark:border-white/[0.07]">
            {stats.map((s) => (
              <div key={s.en} className="flex flex-col-reverse">
                <dt className="mt-1.5 text-[12.5px] leading-tight text-slate-600 dark:text-slate-300">
                  {s.en}
                  <span className="block text-slate-500 dark:text-slate-400">{s.nl}</span>
                </dt>
                <dd className="flex items-center gap-1.5 font-display text-[21px] leading-none font-bold text-slate-900 tabular-nums dark:text-white">
                  <s.icon size={16} className="text-slate-500 dark:text-slate-400" />
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      {graded > 0 && (
        <>
          {/* The horizon runs the full width: it is a wide, horizontal read, and the five nodes need
              the room for their labels to stay on one line. */}
          <section className={`${PANEL} rc-rise rc-delay-1`}>
            <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
              When these come back{' '}
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                · Wanneer ze terugkomen
              </span>
            </h2>
            <p className="mt-1 max-w-[52ch] text-[13.5px] leading-snug text-slate-500 dark:text-slate-400">
              Each card was pushed out as far as your grade said it could go. Nothing to remember — the queue
              brings them back on its own.
            </p>

            <div className="relative mx-auto mt-9 mb-1 max-w-[46rem]">
              <div
                aria-hidden="true"
                className="absolute top-[15px] h-px bg-slate-200 dark:bg-white/[0.12]"
                style={{
                  left: `${50 / buckets.length}%`,
                  right: `${50 / buckets.length}%`,
                }}
              />
              <ol
                className="relative grid"
                style={{
                  gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))`,
                }}
              >
                {buckets.map((b, i) => (
                  <li key={b.key} className="flex flex-col items-center gap-2 px-1 text-center">
                    <span
                      className={`rc-pop grid h-[31px] min-w-[31px] place-items-center rounded-full px-2.5 text-[14px] font-bold tabular-nums ring-1 ${
                        b.mastered
                          ? 'bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300'
                          : 'bg-brand-500/15 text-brand-700 ring-brand-500/25 dark:text-brand-300'
                      }`}
                      style={{ animationDelay: `${260 + i * 90}ms` }}
                    >
                      {b.count}
                    </span>
                    <span className="text-[12.5px] leading-tight font-semibold text-slate-700 dark:text-slate-200">
                      {b.label.en}
                    </span>
                    <span className="-mt-1 text-[11.5px] leading-tight text-slate-500 dark:text-slate-400">
                      {b.label.nl}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* Two card lists, side by side when both exist — a lone one takes the width rather than
              leaving a column of nothing beside it. */}
          <div className={`grid gap-4 md:gap-5 ${masteredChips.length > 0 ? 'lg:grid-cols-2' : ''}`}>
            <section className={`${PANEL} rc-rise rc-delay-2`}>
              <h2 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
                Worth another look{' '}
                <span className="font-semibold text-slate-500 dark:text-slate-400">· Nog eens bekijken</span>
              </h2>

              {weakChips.length > 0 ? (
                <>
                  <p className="mt-1 max-w-[46ch] text-[13.5px] leading-snug text-slate-500 dark:text-slate-400">
                    The {weakChips.length === 1 ? 'card' : `${weakChips.length} cards`} you graded Again or
                    Hard. Open one to read it properly before it comes round.
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {weakChips.slice(0, CHIP_LIMIT).map((item) => (
                      <li key={item.id}>
                        <Link
                          to={item.href}
                          className="group inline-flex items-baseline gap-2 rounded-2xl border border-slate-200 px-3 py-2 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.1] dark:hover:border-white/25 dark:hover:bg-white/[0.04]"
                        >
                          <span className="jp-text text-[17px] font-bold text-slate-900 dark:text-white">
                            {item.japanese}
                          </span>
                          {item.reading && (
                            <span className="jp-text text-[12.5px] text-slate-500 dark:text-slate-400">
                              {item.reading}
                            </span>
                          )}
                          <span className="text-[13px] text-slate-500 dark:text-slate-400">
                            {item.meaning}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {weakChips.length > CHIP_LIMIT && (
                    <p className="mt-3 text-[12.5px] text-slate-500 dark:text-slate-400">
                      + {weakChips.length - CHIP_LIMIT} more in the queue
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-emerald-500/[0.08] px-4 py-3.5 ring-1 ring-emerald-500/15">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <p>
                    <span className="block text-[14px] leading-snug font-bold text-slate-800 dark:text-slate-100">
                      Nothing to redo — you didn't miss one.
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-slate-500 dark:text-slate-400">
                      Niets over te doen — je miste er geen.
                    </span>
                  </p>
                </div>
              )}
            </section>
            {masteredChips.length > 0 && (
              <section className={`${PANEL} rc-rise rc-delay-3`}>
                <h2 className="flex items-center gap-1.5 text-[15px] font-bold text-emerald-700 dark:text-emerald-300">
                  <Check size={16} strokeWidth={3} aria-hidden="true" />
                  Now mastered <span className="font-semibold opacity-70">· Nu beheerst</span>
                </h2>
                <p className="mt-1 max-w-[46ch] text-[13.5px] leading-snug text-slate-500 dark:text-slate-400">
                  Past {MASTERED_INTERVAL_DAYS} days between reviews — the point where it counts as long-term,
                  not just recent.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {masteredChips.slice(0, CHIP_LIMIT).map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.href}
                        className="inline-flex items-baseline gap-2 rounded-2xl bg-emerald-500/10 px-3 py-2 ring-1 ring-emerald-500/20 transition-colors hover:bg-emerald-500/20"
                      >
                        <span className="jp-text text-[17px] font-bold text-slate-900 dark:text-white">
                          {item.japanese}
                        </span>
                        <span className="text-[13px] text-emerald-700 dark:text-emerald-300">
                          {item.meaning}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {masteredChips.length > CHIP_LIMIT && (
                  <p className="mt-3 text-[12.5px] text-slate-500 dark:text-slate-400">
                    + {masteredChips.length - CHIP_LIMIT} more
                  </p>
                )}
              </section>
            )}
          </div>
        </>
      )}

      <div className="rc-rise rc-delay-4 flex flex-wrap items-center justify-center gap-3 pt-1 pb-2">
        {nextRound ? (
          <>
            {/* The one gradient button on the screen, per the app's single-primary-action rule. */}
            <PrimaryButton onClick={nextRound.onStart} className="px-6 py-3.5 text-[15px]">
              Another round · {nextRound.count} {noun.en}
              <ArrowRight size={17} aria-hidden="true" />
            </PrimaryButton>
            <Link to={exitTo} className={SECONDARY_BUTTON_CLASSES}>
              {exitLabel.en} <span className="font-normal opacity-60">· {exitLabel.nl}</span>
            </Link>
          </>
        ) : (
          <Link to={exitTo} className={`${PRIMARY_BUTTON_CLASSES} px-6 py-3.5 text-[15px]`}>
            {exitLabel.en} <span className="font-normal opacity-70">· {exitLabel.nl}</span>
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
