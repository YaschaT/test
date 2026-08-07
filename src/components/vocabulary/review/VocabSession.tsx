import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../../PrimaryButton';
import { ReviewHeader } from './ReviewHeader';
import { ReviewCarousel } from '../../review/ReviewCarousel';
import { DeckPager } from '../../review/DeckPager';
import { ReviewCard } from './ReviewCard';
import { ReviewAnswerControls } from './ReviewAnswerControls';
import { ReviewSessionRail, type ReviewSessionCounts } from './ReviewSessionRail';
import { GRADE_META, GRADE_ORDER } from './gradeTheme';
import { Kbd } from './Kbd';
import type { DisplayPrefs } from '../../DisplayToggles';
import { getSrsCard, reviewItem, useProgress } from '../../../lib/progressStore';
import { readStorage, writeStorage } from '../../../lib/storage';
import { playCorrect, playSoftClick, playWrong } from '../../../lib/sound';
import { speakJapaneseBrowser } from '../../../lib/tts/browserTts';
import type { SrsRating, VocabWord } from '../../../types';

const DISPLAY_PREFS_KEY = 'vocab-review-display';
/** Assumed pace before any card in this session has been graded; replaced by the measured average after. */
const DEFAULT_SECONDS_PER_CARD = 20;

interface VocabSessionProps {
  /** The deck for this session, in order. */
  queue: VocabWord[];
  /** Where to start — used when opening a specific word from the grid. */
  initialIndex?: number;
  /**
   * 'review' is a finite SRS queue you grade through. 'browse' is the whole deck opened at one word:
   * it adds prev/next so you can move freely without grading, and keeps the URL on the current card.
   */
  mode: 'review' | 'browse';
  title: string;
  exitTo: string;
}

/**
 * The vocabulary card session, shared by the SRS review queue and the "open a word from the grid" flow.
 *
 * The kanji module already worked this way; vocabulary's grid opened an inline accordion instead, which
 * showed the example sentence and then dead-ended — no way to move to the next word, and nothing
 * recorded. Same component, same modes, same keys as KanjiSession so the two decks behave identically.
 */
export function VocabSession({ queue, initialIndex = 0, mode, title, exitTo }: VocabSessionProps) {
  const progress = useProgress();
  const navigate = useNavigate();
  const [position, setPosition] = useState(initialIndex);
  const [revealed, setRevealed] = useState(mode === 'browse');
  const [counts, setCounts] = useState<ReviewSessionCounts>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [correctStreak, setCorrectStreak] = useState(0);
  const [pressedRating, setPressedRating] = useState<SrsRating | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [prefs, setPrefs] = useState<DisplayPrefs>(() =>
    readStorage<DisplayPrefs>(DISPLAY_PREFS_KEY, { furigana: true, romaji: true }),
  );
  // Measured session pace, clamped so one long think (or a coffee break) can't blow up the estimate.
  const [secondsPerCard, setSecondsPerCard] = useState(DEFAULT_SECONDS_PER_CARD);
  const sessionStartRef = useRef(0);
  const advanceTimerRef = useRef<number | undefined>(undefined);
  const touchStartXRef = useRef<number | null>(null);

  const word = queue[position];
  const reviewedCount = counts.again + counts.hard + counts.good + counts.easy;
  const transitioning = pressedRating !== null;
  const browsing = mode === 'browse';

  useEffect(() => {
    sessionStartRef.current = Date.now();
    return () => window.clearTimeout(advanceTimerRef.current);
  }, []);

  // Deliberately NOT syncing the URL to the current card while browsing: the route param seeds the
  // starting word, and rewriting it on every page would change the `:id` the page is keyed on and
  // remount the session mid-slide. The URL keeps pointing at the word you opened.

  function updatePrefs(next: DisplayPrefs) {
    setPrefs(next);
    writeStorage(DISPLAY_PREFS_KEY, next);
  }

  function advance() {
    setPressedRating(null);
    setRevealed(browsing);
    setPosition((p) => p + 1);
  }

  // Reveal the answer and read the example sentence aloud (the kana rendering, so pronunciation is
  // unambiguous). Triggered directly by a user gesture (click / Space / swipe), which browsers require
  // for speech to start. speakJapaneseBrowser cancels any in-flight utterance first.
  function reveal() {
    if (!word || revealed) return;
    setRevealed(true);
    speakJapaneseBrowser(word.example.kana);
  }

  function goPrev() {
    if (position === 0) return;
    window.clearTimeout(advanceTimerRef.current);
    setPressedRating(null);
    setRevealed(browsing);
    setPosition((p) => p - 1);
  }

  function goNext() {
    if (position >= queue.length - 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      advance();
      return;
    }
    // Reuse the grade transition so paging forward slides like the review does.
    setPressedRating('good');
    advanceTimerRef.current = window.setTimeout(advance, 380);
  }

  function rate(rating: SrsRating) {
    if (!word || !revealed || transitioning) return;
    reviewItem('vocabulary', word.id, rating);
    const graded = reviewedCount + 1;
    const elapsed = (Date.now() - sessionStartRef.current) / 1000;
    setSecondsPerCard(Math.min(45, Math.max(8, elapsed / graded)));
    setCounts((c) => ({ ...c, [rating]: c[rating] + 1 }));
    setCorrectStreak((s) => (rating === 'again' ? 0 : rating === 'hard' ? s : s + 1));
    if (rating === 'good' || rating === 'easy') playCorrect();
    else if (rating === 'again') playWrong();
    else playSoftClick();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      advance();
      return;
    }
    setPressedRating(rating);
    advanceTimerRef.current = window.setTimeout(advance, 380);
  }

  // Space reveals, 1–4 grade, arrows page while browsing — skipped when a control has focus.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || !word) return;
      const onControl = e.target instanceof HTMLElement && e.target.closest('button, a, input, [role="button"]');
      if (e.code === 'Space') {
        if (onControl) return;
        e.preventDefault();
        reveal();
        return;
      }
      if (browsing && !onControl && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        if (e.key === 'ArrowRight') goNext();
        else goPrev();
        return;
      }
      const gradeIndex = ['1', '2', '3', '4'].indexOf(e.key);
      if (gradeIndex !== -1 && revealed) {
        e.preventDefault();
        rate(GRADE_ORDER[gradeIndex]);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (queue.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Nothing to review right now</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Come back later, or browse the full deck.</p>
        <Link to={exitTo} className="text-brand-600 dark:text-brand-300 font-semibold hover:underline">
          Back to vocabulary
        </Link>
      </div>
    );
  }

  if (position >= queue.length) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
          {browsing ? 'End of the deck' : 'Review complete'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          You studied {reviewedCount} {reviewedCount === 1 ? 'word' : 'words'} this session.
        </p>
        {reviewedCount > 0 && (
          <ul className="flex justify-center gap-5 mb-8">
            {GRADE_ORDER.map((rating) => (
              <li key={rating} className="flex items-center gap-1.5 text-sm">
                <span aria-hidden="true" className={`w-2 h-2 rounded-full ${GRADE_META[rating].dotClass}`} />
                <span className="text-slate-500 dark:text-slate-400">{GRADE_META[rating].label}</span>
                <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{counts[rating]}</span>
              </li>
            ))}
          </ul>
        )}
        <PrimaryButton onClick={() => navigate(exitTo)}>Back to vocabulary</PrimaryButton>
      </div>
    );
  }

  const remaining = queue.length - position;
  const estMinutes = Math.max(1, Math.round((remaining * secondsPerCard) / 60));

  const railProps = {
    position,
    total: queue.length,
    counts,
    correctStreak,
    estMinutes,
    prefs,
    onPrefsChange: updatePrefs,
  };

  return (
    // `flex-1` fills the shell's content frame at every width — the card, not the background, gets the
    // leftover height. The width cap grows on large displays so the card and rail don't sit in a narrow
    // strip with empty gutters either side.
    <div className="flex w-full flex-1 flex-col overflow-x-clip">
      <ReviewHeader
        position={position}
        total={queue.length}
        railOpen={railOpen}
        onToggleRail={() => setRailOpen((o) => !o)}
        exitTo={exitTo}
        title={title}
        exitLabel={browsing ? 'Back to deck' : 'Exit review'}
      />

      {railOpen && <ReviewSessionRail {...railProps} className="xl:hidden mt-4" />}

      <div className="flex-1 min-h-0 flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_288px] xl:gap-12 xl:items-center xl:pt-6 xl:pb-2 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <section
          aria-label="Flashcard"
          className="flex-1 min-h-0 flex flex-col justify-center py-8 md:py-12 xl:py-0"
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const startX = touchStartXRef.current;
            touchStartXRef.current = null;
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) < 48) return;
            // Browsing: swipe pages the deck. Reviewing: swipe reveals (grading stays on the buttons).
            if (browsing) {
              if (dx < 0) goNext();
              else goPrev();
            } else if (!revealed) {
              reveal();
            }
          }}
        >
          {/* The card grows with the window instead of sitting at a fixed 500px in the middle of a tall
              screen — but it stops at 46rem, past which a flashcard is just a big empty rectangle. The
              little slack that's left is split above and below by the section's `justify-center`. */}
          <ReviewCarousel
            className="xl:h-[clamp(31.25rem,calc(100dvh-19rem),46rem)]"
            item={word}
            prevItem={queue[position - 1]}
            nextItem={queue[position + 1]}
            itemKey={(w) => w.id}
            exiting={pressedRating !== null}
            renderCard={(w, isActive) => (
              <ReviewCard
                word={w}
                revealed={isActive ? revealed : browsing}
                prefs={prefs}
                onReveal={isActive ? reveal : () => {}}
              />
            )}
            renderGhost={(w) => (
              <>
                <p className="jp-text text-4xl font-semibold text-slate-500/80 dark:text-slate-400/60 truncate max-w-full">
                  {w.japanese}
                </p>
                {w.kana !== w.japanese && (
                  <p className="jp-text text-base text-slate-400/80 dark:text-slate-500/70 truncate max-w-full">
                    {w.kana}
                  </p>
                )}
              </>
            )}
          />

          {browsing && <DeckPager position={position} total={queue.length} onPrev={goPrev} onNext={goNext} />}

          <div className="w-full max-w-[760px] xl:max-w-[64rem] 2xl:max-w-[92rem] mx-auto mt-7 md:mt-9 sticky bottom-16 md:static z-20 max-md:bg-slate-50 max-md:dark:bg-slate-950 max-md:py-3 max-md:-my-3">
            <ReviewAnswerControls
              card={getSrsCard(progress, 'vocabulary', word.id)}
              onRate={rate}
              disabled={!revealed || transitioning}
              pressedRating={pressedRating}
            />
            <p className="hidden md:flex xl:hidden items-center justify-center gap-1.5 mt-5 text-xs text-slate-500 dark:text-slate-400">
              {browsing ? (
                <>
                  <Kbd>←</Kbd>
                  <Kbd>→</Kbd> to move, <Kbd>1</Kbd>–<Kbd>4</Kbd> to grade
                </>
              ) : (
                <>
                  Press <Kbd>Space</Kbd> to reveal, then <Kbd>1</Kbd>–<Kbd>4</Kbd> to grade
                </>
              )}
            </p>
          </div>
        </section>

        <ReviewSessionRail {...railProps} className="hidden xl:flex xl:flex-col" />
      </div>
    </div>
  );
}
