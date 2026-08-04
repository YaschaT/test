import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  ClipboardList,
  Copy,
  Info,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../../components/Card';
import { Celebration } from '../../components/Celebration';
import { JapaneseText } from '../../components/JapaneseText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RingStat } from '../../components/dashboard/RingStat';
import { ReadingQuestionPlayer } from '../../components/ReadingQuestionPlayer';
import { getReading, readingStats, READINGS } from '../../data/readings';
import { getVocabWord } from '../../data/vocabulary';
import { getGrammarPoint } from '../../data/grammar';
import { markReadingCompleted, recordQuizResult, useProgress } from '../../lib/progressStore';
import { isReadingSaved, toggleReadingSaved } from '../../lib/savedReadings';
import { speakJapaneseBrowser, useJapaneseVoiceAvailable } from '../../lib/tts/browserTts';

interface ReadingPrefs {
  furigana: boolean;
  romaji: boolean;
  english: boolean;
  dutch: boolean;
}

export function ReadingDetail() {
  const { id } = useParams<{ id: string }>();
  const progress = useProgress();
  const voiceAvailable = useJapaneseVoiceAvailable();

  const [prefs, setPrefs] = useState<ReadingPrefs>({ furigana: true, romaji: false, english: true, dutch: true });
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [saved, setSaved] = useState(() => (id ? isReadingSaved(id) : false));
  const [showMore, setShowMore] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);
  const quizRef = useRef<HTMLDivElement>(null);

  const passage = id ? getReading(id) : undefined;

  // Stop any in-flight speech when leaving the page.
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const grammarPoints = useMemo(
    () => (passage ? passage.grammarHighlightIds.map(getGrammarPoint).filter((g): g is NonNullable<typeof g> => !!g) : []),
    [passage],
  );

  if (!passage) return <Navigate to="/reading" replace />;

  const read = progress.completedReadingIds.includes(passage.id);
  const stats = readingStats(progress.completedReadingIds);
  const grammarLabel = grammarPoints.map((g) => g.title).join(' · ') || '—';
  // "More books at this level" — same Tadoku shelf, easiest first.
  const otherPassages = READINGS.filter(
    (r) => r.id !== passage.id && r.tadokuLevel === passage.tadokuLevel,
  ).sort((a, b) => a.wordCount - b.wordCount);

  function playSentence(index: number) {
    if (!voiceAvailable) return;
    if (playingIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingIndex(null);
      return;
    }
    speakJapaneseBrowser(passage!.sentences[index].kana, 1, {
      onStart: () => setPlayingIndex(index),
      onEnd: () => setPlayingIndex((cur) => (cur === index ? null : cur)),
      onError: () => setPlayingIndex((cur) => (cur === index ? null : cur)),
    });
  }

  function toggleSaved() {
    setSaved(toggleReadingSaved(passage!.id));
  }

  function openQuiz() {
    setShowQuiz(true);
    requestAnimationFrame(() => quizRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function handleQuizComplete(correct: number, total: number) {
    setResult({ correct, total });
    markReadingCompleted(passage!.id);
    recordQuizResult({ quizId: `reading-${passage!.id}`, skill: 'reading', level: progress.level, correct, total });
  }

  // Extensive reading: finishing a book is the goal, not passing a quiz.
  function markAsRead() {
    markReadingCompleted(passage!.id);
  }

  function copyText() {
    navigator.clipboard?.writeText(passage!.sentences.map((s) => s.segments.map((seg) => seg.text).join('')).join('\n'));
  }

  function restart() {
    setResult(null);
    setShowQuiz(false);
    setPlayingIndex(null);
    window.speechSynthesis?.cancel();
  }

  const toggles: Array<[keyof ReadingPrefs, string]> = [
    ['furigana', 'Furigana'],
    ['romaji', 'Romaji'],
    ['english', 'English'],
    ['dutch', 'Dutch'],
  ];

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-300 ease-out">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/reading"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to reading
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSaved}
            aria-pressed={saved}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
              saved
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500/60 dark:bg-brand-500/15 dark:text-brand-300'
                : 'border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark size={15} className={saved ? 'fill-current' : ''} aria-hidden="true" />
            {saved ? 'Saved' : 'Save'}
          </button>
          <OverflowMenu onCopy={copyText} onRestart={restart} />
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-950">
        <img
          src="/assets/kotobox-dashboard/generated/hero-background.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/40 to-slate-950/20" aria-hidden="true" />
        <div className="relative z-10 grid gap-6 p-6 md:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white ring-1 ring-inset ring-white/20">
                <span aria-hidden="true">{passage.coverEmoji}</span> Tadoku Level {passage.tadokuLevel}
              </span>
              <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                {passage.level}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-bold text-white/70 ring-1 ring-inset ring-white/15">
                <BookOpen size={12} aria-hidden="true" /> {passage.wordCount} words
              </span>
              {passage.genre && (
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-white/60 ring-1 ring-inset ring-white/15">
                  {passage.genre}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-4xl font-bold text-white">{passage.title.en}</h1>
            <p className="mt-1 text-lg text-white/60">{passage.title.nl}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {toggles.map(([key, label]) => {
                const on = prefs[key];
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                      on
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-white/5 text-white/70 ring-1 ring-inset ring-white/15 hover:bg-white/10'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Library volume so far */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm lg:w-[300px]">
            <RingStat progress={stats.totalBooks > 0 ? stats.booksRead / stats.totalBooks : 0} color="var(--color-brand-400)" trackColor="white" size={96} strokeWidth={8} displaySize="84px">
              <span className="text-lg font-bold text-white tabular-nums">{stats.booksRead}</span>
            </RingStat>
            <div className="min-w-0">
              <p className="text-sm text-white/60">You’ve read</p>
              <p className="mt-0.5 text-2xl font-bold text-white tabular-nums">
                {stats.wordsRead.toLocaleString()} words
              </p>
              <p className="text-sm text-white/60 tabular-nums">across {stats.booksRead} of {stats.totalBooks} books</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Passage */}
        <div className="space-y-5">
          <div className="flex items-start gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>Read for enjoyment — no dictionary. Guess unknown words from context, and skip anything that slows you down.</p>
          </div>
          <Card className="overflow-hidden p-2 sm:p-3">
            <ul>
              {passage.sentences.map((sentence, i) => {
                const isPlaying = playingIndex === i;
                return (
                  <li
                    key={i}
                    className={`flex items-start gap-4 rounded-2xl border-b border-slate-100 p-4 last:border-b-0 sm:p-5 dark:border-white/[0.06] ${
                      isPlaying ? 'bg-brand-50 ring-1 ring-inset ring-brand-500/40 dark:bg-brand-500/10' : ''
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${
                        isPlaying
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <JapaneseText segments={sentence.segments} showFurigana={prefs.furigana} className="text-2xl leading-relaxed text-slate-900 dark:text-white" />
                      {prefs.romaji && <p className="mt-1 text-sm text-brand-600 dark:text-brand-300">{sentence.romaji}</p>}
                      {prefs.english && <p className="mt-2 text-slate-600 dark:text-slate-300">{sentence.en}</p>}
                      {prefs.dutch && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{sentence.nl}</p>}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {isPlaying && <Equalizer />}
                      <button
                        type="button"
                        onClick={() => playSentence(i)}
                        disabled={!voiceAvailable}
                        aria-label={isPlaying ? `Stop sentence ${i + 1}` : `Play sentence ${i + 1}`}
                        title={voiceAvailable ? undefined : 'No Japanese voice available on this device'}
                        className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          isPlaying
                            ? 'bg-brand-600 text-white hover:brightness-110'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} className="ml-0.5" aria-hidden="true" />}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {otherPassages.length > 0 && (
              <div className="border-t border-slate-100 p-3 dark:border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowMore((v) => !v)}
                  aria-expanded={showMore}
                  className="mx-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {showMore ? 'Hide other books' : `More books at Level ${passage.tadokuLevel}`}
                  <ChevronDown size={16} className={`transition-transform ${showMore ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {showMore && (
                  <ul className="mt-2 space-y-1">
                    {otherPassages.map((r) => (
                      <li key={r.id}>
                        <Link
                          to={`/reading/${r.id}`}
                          className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                        >
                          <span className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
                            <span aria-hidden="true">{r.coverEmoji}</span>
                            {r.title.en}
                          </span>
                          <span className="text-xs font-semibold tabular-nums text-slate-400">{r.wordCount} words</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Card>

          {/* Finishing the book is the goal — not passing a quiz. */}
          <Card className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                <BookOpen size={18} className="text-brand-500" aria-hidden="true" /> Finished reading?
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {read
                  ? `Nice — this book's ${passage.wordCount} words are counted in your total.`
                  : `Mark it read to add ${passage.wordCount} words to your total.`}
              </p>
            </div>
            {read ? (
              <span className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 sm:w-auto dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30">
                <Check size={16} aria-hidden="true" /> Read
              </span>
            ) : (
              <PrimaryButton onClick={markAsRead} className="w-full shrink-0 sm:w-auto">
                Mark as read
              </PrimaryButton>
            )}
          </Card>

          {/* Optional comprehension check — only for books that carry one. */}
          {passage.questions.length > 0 &&
            (showQuiz ? (
              <div ref={quizRef} className="scroll-mt-4">
                <Card className="p-5">
                  <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Check your understanding</h2>
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
                </Card>
              </div>
            ) : (
              <Card className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                    <ClipboardList size={18} className="text-slate-400" aria-hidden="true" /> Check your understanding
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Optional
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {passage.questions.length} quick question{passage.questions.length === 1 ? '' : 's'}, if you’d like to test yourself.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openQuiz}
                  className="w-full shrink-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 sm:w-auto dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Take the quiz
                </button>
              </Card>
            ))}
        </div>

        {/* Side panels */}
        <aside className="space-y-5">
          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <BookOpen size={18} className="text-brand-500" aria-hidden="true" /> About this book
            </h2>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{passage.description.en}</p>
            <dl className="mt-4 grid grid-cols-3 gap-4">
              <AboutStat label="Tadoku" value={`Level ${passage.tadokuLevel}`} />
              <AboutStat label="Words" value={String(passage.wordCount)} />
              <AboutStat label="JLPT" value={passage.level} />
            </dl>
            <dl className="mt-4 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
              <AboutStat label="Grammar" value={grammarLabel} jp />
            </dl>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <ClipboardList size={18} className="text-brand-500" aria-hidden="true" /> Vocabulary in this book
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {passage.vocabHighlightIds.length}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {passage.vocabHighlightIds.map((vid) => {
                const word = getVocabWord(vid);
                if (!word) return null;
                return (
                  <span
                    key={vid}
                    className="jp-text rounded-lg bg-slate-100 px-2.5 py-1 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {word.japanese} <span className="text-xs text-slate-400 dark:text-slate-500">{word.meaning.en}</span>
                  </span>
                );
              })}
              {grammarPoints.map((point) => (
                <Link
                  key={point.id}
                  to={`/grammar/${point.id}`}
                  className="jp-text rounded-lg bg-brand-50 px-2.5 py-1 text-sm font-medium text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/30 dark:hover:bg-brand-500/25"
                >
                  {point.title}
                </Link>
              ))}
            </div>
          </Card>

        </aside>
      </div>
    </div>
  );
}

function AboutStat({ label, value, jp = false }: { label: string; value: string; jp?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</dt>
      <dd className={`mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100 ${jp ? 'jp-text' : ''}`}>{value}</dd>
    </div>
  );
}

/** Little audio-bars indicator shown on the sentence that's currently being read aloud. */
function Equalizer() {
  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-1 rounded-full bg-brand-500 motion-safe:animate-pulse"
          style={{ height: `${8 + ((i % 3) + 1) * 4}px`, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
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
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onCopy();
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
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
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw size={15} aria-hidden="true" /> Restart passage
          </button>
        </div>
      )}
    </div>
  );
}
