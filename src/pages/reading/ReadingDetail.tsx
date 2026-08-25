import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  MoreHorizontal,
  RotateCcw,
} from 'lucide-react';
import { Celebration } from '../../components/Celebration';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ReadingQuestionPlayer } from '../../components/ReadingQuestionPlayer';
import { BookCover } from '../../components/reading/BookCover';
import { ReaderControls } from '../../components/reading/ReaderControls';
import { ReaderSentence } from '../../components/reading/ReaderSentence';
import { getReading, readingStats, READINGS } from '../../data/readings';
import { getVocabWord } from '../../data/vocabulary';
import { getGrammarPoint } from '../../data/grammar';
import {
  getProgressSnapshot,
  markReadingCompleted,
  reviewItem,
  recordQuizResult,
  recordReadingPosition,
  useProgress,
} from '../../lib/progressStore';
import { bookPercent, resumeSentenceIndex } from '../../lib/readingProgress';
import { useReadingPrefs } from '../../lib/readingPrefs';
import { isReadingSaved, toggleReadingSaved } from '../../lib/savedReadings';
import { speakJapaneseBrowser, useJapaneseVoiceAvailable } from '../../lib/tts/browserTts';
import type { ReadingPassage } from '../../types';

/**
 * The reader.
 *
 * It used to print every sentence as a numbered card with English and Dutch underneath, both switched on
 * by default — while the library page taught the three rules of extensive reading, one of which is "no
 * dictionary". This screen now reads as prose, in the face a Japanese book is set in, with the meaning as
 * something you pull rather than something pushed at you. See lib/readingPrefs.ts for the three modes.
 */
export function ReadingDetail() {
  const { id } = useParams<{ id: string }>();
  const passage = id ? getReading(id) : undefined;
  if (!passage) return <Navigate to="/reading" replace />;
  // Keyed on the book: React Router keeps this component mounted when only the :id changes, so without
  // it a second book inherited the first one's opened-lines count, quiz result and saved flag.
  return <Reader key={passage.id} passage={passage} />;
}

function Reader({ passage }: { passage: ReadingPassage }) {
  const progress = useProgress();
  const voiceAvailable = useJapaneseVoiceAvailable();
  const [prefs, setPrefs] = useReadingPrefs();

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [readingAloud, setReadingAloud] = useState(false);
  const [opened, setOpened] = useState<number[]>([]);
  const [saved, setSaved] = useState(() => isReadingSaved(passage.id));
  const [showMore, setShowMore] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);

  const quizRef = useRef<HTMLDivElement>(null);
  const sentenceRefs = useRef<(HTMLLIElement | null)[]>([]);
  const furthestRef = useRef(0);
  const aloudRef = useRef(false);

  // Stop any in-flight speech when leaving the page.
  useEffect(
    () => () => {
      aloudRef.current = false;
      window.speechSynthesis?.cancel();
    },
    [],
  );

  /**
   * Reading position, measured rather than guessed: the furthest sentence actually read is what drives
   * the shelf's per-book percentage and the daily word tally. Only advances — scrolling back up never
   * costs the reader progress.
   *
   * A sentence has to stay mostly on screen for DWELL_MS before it counts. Without that, opening a
   * five-line book on a tall display would mark the whole thing read in the same frame it rendered,
   * and the word tally would be counting pixels shown rather than Japanese read.
   */
  useEffect(() => {
    const nodes = sentenceRefs.current.filter((node): node is HTMLLIElement => node != null);
    if (nodes.length === 0) return;

    const DWELL_MS = 1500;
    const timers = new Map<number, ReturnType<typeof setTimeout>>();

    function credit(index: number) {
      const furthest = index + 1;
      if (furthest <= furthestRef.current) return;
      furthestRef.current = furthest;
      recordReadingPosition(passage.id, furthest, passage.sentences.length, passage.wordCount);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.sentenceIndex);
          if (entry.isIntersecting) {
            if (index + 1 <= furthestRef.current || timers.has(index)) continue;
            timers.set(
              index,
              setTimeout(() => {
                timers.delete(index);
                credit(index);
              }, DWELL_MS),
            );
          } else {
            // Scrolled straight past before the dwell elapsed — that line wasn't read.
            const timer = timers.get(index);
            if (timer) {
              clearTimeout(timer);
              timers.delete(index);
            }
          }
        }
      },
      { threshold: 0.6 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
    // Re-observes when the layout changes direction, since tategaki remounts the sentence nodes.
  }, [passage, prefs.vertical]);

  // Re-opening a part-read book drops you back where you stopped, one sentence early for context.
  useEffect(() => {
    const index = resumeSentenceIndex(getProgressSnapshot(), passage);
    if (index <= 0) return;
    const node = sentenceRefs.current[index];
    if (!node) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    // Mount only: re-running this on every progress tick would yank the page around mid-read, and the
    // component is remounted per book anyway.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grammarPoints = useMemo(
    () => passage.grammarHighlightIds.map(getGrammarPoint).filter((g): g is NonNullable<typeof g> => !!g),
    [passage],
  );

  const stopAloud = useCallback(() => {
    aloudRef.current = false;
    window.speechSynthesis?.cancel();
    setReadingAloud(false);
    setPlayingIndex(null);
  }, []);

  /** Reads the passage straight through, so a learner can listen and follow the text at the same time. */
  const speakFrom = useCallback(
    (index: number) => {
      if (!aloudRef.current) return;
      if (index >= passage.sentences.length) {
        stopAloud();
        return;
      }
      speakJapaneseBrowser(passage.sentences[index].kana, 1, {
        onStart: () => setPlayingIndex(index),
        onEnd: () => speakFrom(index + 1),
        onError: stopAloud,
      });
    },
    [passage, stopAloud],
  );

  const read = progress.completedReadingIds.includes(passage.id);
  const stats = readingStats(progress.completedReadingIds);
  const percent = bookPercent(progress, passage);
  const position = Math.min(passage.sentences.length, Math.max(furthestRef.current, Math.round(percent * passage.sentences.length)));
  const lastOpened = opened.length > 0 ? passage.sentences[opened[opened.length - 1]] : null;
  const otherPassages = READINGS.filter(
    (r) => r.id !== passage.id && r.tadokuLevel === passage.tadokuLevel,
  ).sort((a, b) => a.wordCount - b.wordCount);

  function playSentence(index: number) {
    if (!voiceAvailable) return;
    if (readingAloud) stopAloud();
    if (playingIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingIndex(null);
      return;
    }
    speakJapaneseBrowser(passage.sentences[index].kana, 1, {
      onStart: () => setPlayingIndex(index),
      onEnd: () => setPlayingIndex((cur) => (cur === index ? null : cur)),
      onError: () => setPlayingIndex((cur) => (cur === index ? null : cur)),
    });
  }

  function readAloud() {
    if (readingAloud) {
      stopAloud();
      return;
    }
    aloudRef.current = true;
    setReadingAloud(true);
    speakFrom(0);
  }

  function openMeaning(index: number) {
    setOpened((prev) => (prev.includes(index) ? prev : [...prev, index]));
  }

  function toggleSaved() {
    setSaved(toggleReadingSaved(passage.id));
  }

  function openQuiz() {
    setShowQuiz(true);
    requestAnimationFrame(() => quizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function handleQuizComplete(correct: number, total: number) {
    setResult({ correct, total });
    finishBook();
    recordQuizResult({ quizId: `reading-${passage.id}`, skill: 'reading', level: progress.level, correct, total });
  }

  // Extensive reading: finishing a book is the goal, not passing a quiz. Closing the book also closes
  // out its position, so any sentences skipped past still count toward the day's words exactly once.
  function finishBook() {
    const book = passage;
    markReadingCompleted(book.id);
    // A finished book re-enters the rotation on its own interval — extensive reading rewards re-reading
    // at a comfortable level, so "due again" is a genuine suggestion here, not a chore.
    reviewItem('reading', book.id, 'good');
    recordReadingPosition(book.id, book.sentences.length, book.sentences.length, book.wordCount);
    furthestRef.current = book.sentences.length;
  }

  function copyText() {
    navigator.clipboard?.writeText(
      passage.sentences.map((s) => s.segments.map((seg) => seg.text).join('')).join('\n'),
    );
  }

  function restart() {
    setResult(null);
    setShowQuiz(false);
    setOpened([]);
    stopAloud();
  }

  const sentences = passage.sentences.map((sentence, i) => (
    <ReaderSentence
      key={i}
      sentence={sentence}
      index={i}
      furigana={prefs.furigana}
      romaji={prefs.romaji}
      meaning={prefs.meaning}
      opened={opened.includes(i)}
      playing={playingIndex === i}
      voiceAvailable={voiceAvailable}
      vertical={prefs.vertical}
      onOpen={() => openMeaning(i)}
      onPlay={() => playSentence(i)}
      innerRef={(node) => {
        sentenceRefs.current[i] = node;
      }}
    />
  ));

  return (
    <div className="flex w-full flex-1 flex-col">
      {/* No overflow-hidden: it would make this card the scroll container for the sticky control bar
          and stop it pinning. The header bar rounds its own corners instead. */}
      <div className="relative flex flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-[#141d36] via-[#0f1830] to-[#0b1222]">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-t-3xl border-b border-white/[0.07] bg-[#0b1222]/70 px-5 py-3.5 backdrop-blur lg:px-8">
          <Link
            to="/reading"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-white/55 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Library
          </Link>

          {/* One mark per sentence — how far through this book you are, at a glance. */}
          <div
            className="flex min-w-[140px] flex-1 gap-1"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={passage.sentences.length}
            aria-valuenow={position}
            aria-label="Progress through this book"
          >
            {passage.sentences.map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < position ? 'bg-brand-500' : 'bg-white/[0.12]'
                }`}
              />
            ))}
          </div>
          <span className="shrink-0 text-xs font-bold tabular-nums text-slate-400">
            {position} / {passage.sentences.length}
          </span>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={toggleSaved}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from saved' : 'Save this book'}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                saved ? 'text-brand-300' : 'text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Bookmark size={16} className={saved ? 'fill-current' : ''} aria-hidden="true" />
            </button>
            <OverflowMenu onCopy={copyText} onRestart={restart} />
          </div>
        </div>

        <div className="px-5 pb-6 pt-9 lg:px-8">
          <div className="mx-auto max-w-[640px]">
            <h1 className="jp-serif text-3xl font-semibold text-white lg:text-4xl">{passage.titleJa}</h1>
            <p className="mt-2 text-[15px] text-slate-300">{passage.title.en}</p>
            <p className="text-sm text-slate-400">{passage.title.nl}</p>
            <p className="mt-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {passage.level} · Tadoku L{passage.tadokuLevel} · {passage.wordCount} words
              {passage.genre ? ` · ${passage.genre}` : ''}
            </p>
          </div>

          {/* The passage. Tategaki sets it the way a Japanese book is: top to bottom, right to left. */}
          {prefs.vertical ? (
            <div className="mt-9">
              {/* The passage sizes itself to its own columns — in vertical writing mode a block's width
                  is content-determined — so a flex wrapper is what centres it in the pane. It is not a
                  flex container itself: in vertical-rl the children already stack along the block axis,
                  which runs right to left, and that is exactly the column order a Japanese book has. */}
              <div className="flex justify-center">
                <ol
                  className="jp-serif h-[min(58vh,560px)] max-w-full overflow-x-auto [writing-mode:vertical-rl] [&>li]:ml-7 [&>li:first-child]:ml-0"
                  style={{ letterSpacing: '0.04em' }}
                >
                  {sentences}
                </ol>
              </div>
              {/* Tategaki has nowhere to put an inline translation without breaking the column, so the
                  line you most recently opened lands here instead. */}
              <div className="mx-auto mt-6 min-h-[76px] max-w-[640px] rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-4">
                {lastOpened ? (
                  <div className="animate-review-reveal-in">
                    <p className="text-[15px] leading-relaxed text-slate-200">{lastOpened.en}</p>
                    <p className="mt-0.5 text-[13px] leading-relaxed text-slate-400">{lastOpened.nl}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    Tap a line to open its meaning here. Vertical text reads top to bottom, starting on the
                    right.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <ol className="mx-auto mt-9 max-w-[640px]">{sentences}</ol>
          )}

          <div className="mx-auto mt-10 max-w-[640px] space-y-4">
            {read ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-5 text-center sm:flex-row sm:text-left">
                <img
                  src="/assets/reading/award.png"
                  alt=""
                  aria-hidden="true"
                  width={96}
                  height={96}
                  className="h-24 w-24 shrink-0 object-contain"
                />
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-white">Book finished</h2>
                  <p className="mt-1 text-sm text-slate-300">
                    This book’s {passage.wordCount} words are counted in your total —{' '}
                    {stats.wordsRead.toLocaleString()} across {stats.booksRead} book
                    {stats.booksRead === 1 ? '' : 's'} so far.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-1.5 text-sm font-semibold text-emerald-300">
                    <Check size={16} aria-hidden="true" /> Read
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Finished reading?</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Mark it read to add {passage.wordCount} words to your total.
                  </p>
                </div>
                <PrimaryButton onClick={finishBook} className="w-full shrink-0 sm:w-auto">
                  Mark as read
                </PrimaryButton>
              </div>
            )}

            {passage.questions.length > 0 &&
              (showQuiz ? (
                <div ref={quizRef} className="scroll-mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
                  <h2 className="mb-4 text-lg font-bold text-white">Check your understanding</h2>
                  {result ? (
                    <Celebration
                      correct={result.correct}
                      total={result.total}
                      onRetry={() => {
                        setResult(null);
                        setShowQuiz(true);
                      }}
                    />
                  ) : (
                    <ReadingQuestionPlayer questions={passage.questions} onComplete={handleQuizComplete} />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 text-base font-bold text-white">
                      <ClipboardList size={17} className="text-slate-400" aria-hidden="true" /> Check your
                      understanding
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                        Optional
                      </span>
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {passage.questions.length} quick question
                      {passage.questions.length === 1 ? '' : 's'}, if you’d like to test yourself.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openQuiz}
                    className="w-full shrink-0 rounded-xl border border-white/12 bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 sm:w-auto"
                  >
                    Take the quiz
                  </button>
                </div>
              ))}

            {/* Reference material, after the book rather than beside it — it used to sit in a sidebar
                competing with the text for attention while you were trying to read. */}
            <details className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-bold text-white">
                About this book
                <ChevronDown
                  size={17}
                  aria-hidden="true"
                  className="shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{passage.description.en}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{passage.description.nl}</p>
              {grammarPoints.length > 0 && (
                <div className="mt-4 border-t border-white/[0.07] pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Grammar</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {grammarPoints.map((point) => (
                      <Link
                        key={point.id}
                        to={`/grammar/${point.id}`}
                        className="jp-text rounded-lg border border-brand-400/25 bg-brand-500/12 px-2.5 py-1 text-sm font-medium text-brand-200 transition-colors hover:bg-brand-500/20"
                      >
                        {point.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {passage.vocabHighlightIds.length > 0 && (
                <div className="mt-4 border-t border-white/[0.07] pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    Vocabulary · {passage.vocabHighlightIds.length}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {passage.vocabHighlightIds.map((vid) => {
                      const word = getVocabWord(vid);
                      if (!word) return null;
                      return (
                        <span
                          key={vid}
                          className="jp-text rounded-lg bg-white/[0.06] px-2.5 py-1 text-sm text-slate-200"
                        >
                          {word.japanese}{' '}
                          <span className="text-xs text-slate-400">{word.meaning.en}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </details>

            {otherPassages.length > 0 && (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-4">
                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  aria-expanded={showMore}
                  className="flex w-full items-center justify-between gap-3 text-base font-bold text-white"
                >
                  More books at Level {passage.tadokuLevel}
                  <ChevronDown
                    size={17}
                    aria-hidden="true"
                    className={`shrink-0 text-slate-400 transition-transform ${showMore ? 'rotate-180' : ''}`}
                  />
                </button>
                {showMore && (
                  <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                    {otherPassages.slice(0, 6).map((r) => (
                      <li key={r.id}>
                        <Link to={`/reading/${r.id}`} className="group block">
                          <BookCover book={r} onDark />
                          <p className="jp-serif mt-2 text-sm font-semibold text-slate-100 group-hover:text-white">
                            {r.titleJa}
                          </p>
                          <p className="text-xs text-slate-400">{r.title.en}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <ReaderControls
          prefs={prefs}
          onChange={setPrefs}
          opened={opened.length}
          total={passage.sentences.length}
          voiceAvailable={voiceAvailable}
          readingAloud={readingAloud}
          onReadAloud={readAloud}
        />
      </div>
    </div>
  );
}

function OverflowMenu({ onCopy, onRestart }: { onCopy: () => void; onRestart: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <MoreHorizontal size={17} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0c1428] py-1 shadow-2xl"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onCopy();
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-200 hover:bg-white/[0.06]"
          >
            <Copy size={15} aria-hidden="true" /> {copied ? 'Copied!' : 'Copy Japanese text'}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onRestart();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-200 hover:bg-white/[0.06]"
          >
            <RotateCcw size={15} aria-hidden="true" /> Restart passage
          </button>
        </div>
      )}
    </div>
  );
}
