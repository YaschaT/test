import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ReviewHeader } from '../../components/vocabulary/review/ReviewHeader';
import { ReviewCarousel } from '../../components/review/ReviewCarousel';
import { ReviewAnswerControls } from '../../components/vocabulary/review/ReviewAnswerControls';
import { ReviewSessionRail, type ReviewSessionCounts } from '../../components/vocabulary/review/ReviewSessionRail';
import { GRADE_META, GRADE_ORDER } from '../../components/vocabulary/review/gradeTheme';
import { Kbd } from '../../components/vocabulary/review/Kbd';
import { KanjiReviewCard } from '../../components/kanji/review/KanjiReviewCard';
import { KanjiStudyPanel } from '../../components/kanji/review/KanjiStudyPanel';
import type { DisplayPrefs } from '../../components/DisplayToggles';
import { KANJI_LIST } from '../../data/kanji';
import { getSrsCard, markKanjiLearned, reviewItem, useProgress } from '../../lib/progressStore';
import { buildReviewQueue } from '../../lib/reviewQueue';
import { readStorage, writeStorage } from '../../lib/storage';
import { playCorrect, playSoftClick, playWrong } from '../../lib/sound';
import type { SrsRating } from '../../types';

const DISPLAY_PREFS_KEY = 'kanji-review-display';
/** Assumed pace before any card in this session has been graded; replaced by the measured average after. */
const DEFAULT_SECONDS_PER_CARD = 25;

/**
 * Kanji study session — the same carousel, controls and session rail as the vocabulary review, so the
 * two decks are one experience. Replaces the old flow of opening `/kanji/:id`, reading it, then
 * navigating back to the grid for every single character.
 */
export function KanjiReview() {
  const progress = useProgress();
  const navigate = useNavigate();
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [counts, setCounts] = useState<ReviewSessionCounts>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [correctStreak, setCorrectStreak] = useState(0);
  const [pressedRating, setPressedRating] = useState<SrsRating | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [prefs, setPrefs] = useState<DisplayPrefs>(() =>
    readStorage<DisplayPrefs>(DISPLAY_PREFS_KEY, { furigana: true, romaji: true }),
  );
  const [secondsPerCard, setSecondsPerCard] = useState(DEFAULT_SECONDS_PER_CARD);
  const sessionStartRef = useRef(0);
  const advanceTimerRef = useRef<number | undefined>(undefined);
  const touchStartXRef = useRef<number | null>(null);

  // Queue is captured once per mount so it doesn't reshuffle mid-session as cards update.
  const queue = useMemo(() => buildReviewQueue(KANJI_LIST, 'kanji', progress, 10), []); // eslint-disable-line react-hooks/exhaustive-deps

  const kanji = queue[position];
  const reviewedCount = counts.again + counts.hard + counts.good + counts.easy;
  const transitioning = pressedRating !== null;

  useEffect(() => {
    sessionStartRef.current = Date.now();
    return () => window.clearTimeout(advanceTimerRef.current);
  }, []);

  function updatePrefs(next: DisplayPrefs) {
    setPrefs(next);
    writeStorage(DISPLAY_PREFS_KEY, next);
  }

  function advance() {
    setPressedRating(null);
    setRevealed(false);
    setPosition((p) => p + 1);
  }

  function reveal() {
    if (!kanji || revealed) return;
    setRevealed(true);
  }

  function rate(rating: SrsRating) {
    if (!kanji || !revealed || transitioning) return;
    reviewItem('kanji', kanji.id, rating);
    markKanjiLearned(kanji.id);
    const graded = reviewedCount + 1;
    const elapsed = (Date.now() - sessionStartRef.current) / 1000;
    setSecondsPerCard(Math.min(60, Math.max(8, elapsed / graded)));
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

  // Space reveals, 1–4 grade — skipped when a button/link has focus so native activation wins.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || !kanji) return;
      if (e.code === 'Space') {
        if (e.target instanceof HTMLElement && e.target.closest('button, a, input, [role="button"]')) return;
        e.preventDefault();
        reveal();
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
        <Link to="/kanji" className="text-brand-600 dark:text-brand-300 font-semibold hover:underline">
          Back to kanji
        </Link>
      </div>
    );
  }

  if (position >= queue.length) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Review complete</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          You reviewed {reviewedCount} {reviewedCount === 1 ? 'kanji' : 'kanji'}.
        </p>
        <ul className="flex justify-center gap-5 mb-8">
          {GRADE_ORDER.map((rating) => (
            <li key={rating} className="flex items-center gap-1.5 text-sm">
              <span aria-hidden="true" className={`w-2 h-2 rounded-full ${GRADE_META[rating].dotClass}`} />
              <span className="text-slate-500 dark:text-slate-400">{GRADE_META[rating].label}</span>
              <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{counts[rating]}</span>
            </li>
          ))}
        </ul>
        <PrimaryButton onClick={() => navigate('/kanji')}>Back to kanji</PrimaryButton>
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
    <div className="mx-auto w-full max-w-[1240px] flex flex-col overflow-x-clip md:min-h-[calc(100dvh-2rem)] xl:min-h-0">
      <ReviewHeader
        position={position}
        total={queue.length}
        railOpen={railOpen}
        onToggleRail={() => setRailOpen((o) => !o)}
        exitTo="/kanji"
        title="Kanji review"
      />

      {railOpen && <ReviewSessionRail {...railProps} className="xl:hidden mt-4" />}

      <div className="flex-1 flex flex-col xl:grid xl:grid-cols-[minmax(0,1fr)_288px] xl:gap-12 xl:items-start xl:pt-6 xl:pb-2">
        <section
          aria-label="Flashcard"
          className="flex-1 flex flex-col justify-center py-8 md:py-12 xl:py-0 xl:justify-start"
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const startX = touchStartXRef.current;
            touchStartXRef.current = null;
            if (startX !== null && Math.abs(e.changedTouches[0].clientX - startX) > 48 && !revealed) {
              reveal();
            }
          }}
        >
          <ReviewCarousel
            item={kanji}
            prevItem={queue[position - 1]}
            nextItem={queue[position + 1]}
            itemKey={(k) => k.id}
            exiting={pressedRating !== null}
            renderCard={(k, isActive) => (
              <KanjiReviewCard
                kanji={k}
                revealed={isActive && revealed}
                onReveal={isActive ? reveal : () => {}}
              />
            )}
            renderGhost={(k) => (
              <p className="jp-text text-6xl font-semibold text-slate-500/80 dark:text-slate-400/60">{k.character}</p>
            )}
          />

          <div className="w-full max-w-[760px] mx-auto mt-7 md:mt-9 sticky bottom-16 md:static z-20 max-md:bg-slate-50 max-md:dark:bg-slate-950 max-md:py-3 max-md:-my-3">
            <ReviewAnswerControls
              card={getSrsCard(progress, 'kanji', kanji.id)}
              onRate={rate}
              disabled={!revealed || transitioning}
              pressedRating={pressedRating}
            />
            <p className="hidden md:flex xl:hidden items-center justify-center gap-1.5 mt-5 text-xs text-slate-500 dark:text-slate-400">
              Press <Kbd>Space</Kbd> to reveal, then <Kbd>1</Kbd>–<Kbd>4</Kbd> to grade
            </p>
          </div>

          {/* Everything you'd previously have left the session to read — keyed so it collapses per card. */}
          <div className="w-full max-w-[760px] mx-auto mt-5">
            <KanjiStudyPanel key={kanji.id} kanji={kanji} prefs={prefs} />
          </div>
        </section>

        <ReviewSessionRail {...railProps} className="hidden xl:flex xl:flex-col" />
      </div>
    </div>
  );
}
