import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Mic, Square, Volume2, X } from 'lucide-react';
import { PHRASES, PHRASE_CATEGORIES, type Phrase } from '../../data/phrases';
import type { Scenario } from '../../data/scenarios';
import { recordPhraseScore, type ProgressState } from '../../lib/progressStore';
import { scoreAttempt, scoreBand, type ScoreBand } from '../../lib/pronunciation';
import { useSpeechRecognition } from '../../lib/speech';
import { phrasesForScenario } from '../../lib/speakingProgress';

interface PhrasebookProps {
  progress: ProgressState;
  /** The scenario Kai is recommending — the drill offers the set phrases it actually uses. */
  scenario: Scenario | null;
  speak: (text: string) => void;
}

/**
 * Pronunciation practice that works with no AI provider at all: hear a set phrase, say it back, and
 * the browser's Japanese recogniser tells you how much of it came through.
 *
 * The score is a *match*, not a phoneme grade (see pronunciation.ts), so every attempt shows what was
 * heard right next to the number — a learner who reads 「大丈夫です」 back from their own 「だいじょうぶ
 * です」 can see the recogniser understood them fine, and one who reads something else entirely knows
 * exactly which part drifted.
 */
export function Phrasebook({ progress, scenario, speak }: PhrasebookProps) {
  const [category, setCategory] = useState<string>('All');
  const [sayFirst, setSayFirst] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [drill, setDrill] = useState<Phrase[] | null>(null);

  const speech = useSpeechRecognition('ja-JP');
  const [attempt, setAttempt] = useState<{ id: string; score: number; heard: string } | null>(null);
  const recording = useRef<Phrase | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const wasListening = useRef(false);

  // Scoring happens when the recogniser stops, not on every interim result: the later hypotheses are
  // the better ones, and a score that ticks upward while you're still talking is noise.
  useEffect(() => {
    if (wasListening.current && !speech.listening) {
      const phrase = recording.current;
      if (phrase) {
        const result = scoreAttempt(speech.hypotheses, [phrase.ja, phrase.kana]);
        setAttempt({ id: phrase.id, ...result });
        if (result.heard) recordPhraseScore(phrase.id, result.score);
        setRevealed((r) => ({ ...r, [phrase.id]: true }));
      }
      recording.current = null;
      setRecordingId(null);
    }
    wasListening.current = speech.listening;
  }, [speech.listening, speech.hypotheses]);

  const scenarioPhrases = useMemo(() => (scenario ? phrasesForScenario(scenario) : []), [scenario]);
  const list = useMemo(
    () => (category === 'All' ? PHRASES : PHRASES.filter((p) => p.category === category)),
    [category],
  );

  function toggleRecording(phrase: Phrase) {
    if (speech.listening) {
      speech.stop();
      return;
    }
    setAttempt(null);
    recording.current = phrase;
    setRecordingId(phrase.id);
    speech.start();
  }

  function play(phrase: Phrase) {
    setRevealed((r) => ({ ...r, [phrase.id]: true }));
    speak(phrase.ja);
  }

  function startDrill(phrases: Phrase[]) {
    if (!phrases.length) return;
    setCategory(phrases[0].category);
    setAttempt(null);
    setDrill(phrases);
  }

  const hidden = (phrase: Phrase) => sayFirst && !revealed[phrase.id];

  if (drill) {
    return (
      <PhraseDrill
        phrases={drill}
        progress={progress}
        attempt={attempt}
        recordingId={recordingId}
        supported={speech.supported}
        onPlay={play}
        onRecord={toggleRecording}
        onClearAttempt={() => setAttempt(null)}
        onExit={() => {
          if (speech.listening) speech.stop();
          setDrill(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {scenario && scenarioPhrases.length > 0 && (
        <DrillInvite
          scenario={scenario}
          phrases={scenarioPhrases}
          onStart={() => startDrill(scenarioPhrases)}
        />
      )}

      <section aria-labelledby="phrase-bank">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 id="phrase-bank" className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Phrase bank
            </h2>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              {speech.supported
                ? 'Tap a phrase to hear it, then record yourself saying it'
                : 'Tap a phrase to hear it and shadow it out loud'}
            </p>
          </div>
          <label className="inline-flex cursor-pointer select-none items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-bold text-slate-600 dark:border-hairline dark:bg-ink-900 dark:text-slate-300">
            <input
              type="checkbox"
              checked={sayFirst}
              onChange={(e) => {
                setSayFirst(e.target.checked);
                setRevealed({});
              }}
              className="h-3.5 w-3.5 accent-iris-500"
            />
            Say it first (hide Japanese)
          </label>
        </div>

        <div className="mb-3.5 flex flex-wrap gap-2">
          <CategoryChip active={category === 'All'} onClick={() => setCategory('All')}>
            All
          </CategoryChip>
          {PHRASE_CATEGORIES.map((c) => (
            <CategoryChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </CategoryChip>
          ))}
        </div>

        <ul className="space-y-2.5">
          {list.map((phrase) => (
            <li key={phrase.id}>
              <PhraseRow
                phrase={phrase}
                best={progress.phraseScores[phrase.id]}
                attempt={attempt?.id === phrase.id ? attempt : null}
                hidden={hidden(phrase)}
                recording={recordingId === phrase.id}
                canRecord={speech.supported}
                onPlay={() => play(phrase)}
                onRecord={() => toggleRecording(phrase)}
                onReveal={() => setRevealed((r) => ({ ...r, [phrase.id]: true }))}
              />
            </li>
          ))}
        </ul>

        {speech.error && <p className="mt-3 text-xs text-rose-500">{speech.error}</p>}
        {!speech.supported && (
          <p className="mt-3 text-xs text-slate-400">
            Recording needs Chrome or Edge. You can still play every phrase and shadow it out loud here.
          </p>
        )}
      </section>
    </div>
  );
}

// ── Drill invite ──────────────────────────────────────────────────────────────
function DrillInvite({
  scenario,
  phrases,
  onStart,
}: {
  scenario: Scenario;
  phrases: Phrase[];
  onStart: () => void;
}) {
  return (
    <section className="flex flex-wrap items-center gap-5 rounded-3xl border border-slate-200 bg-white p-5 sm:gap-7 sm:px-7 dark:border-hairline dark:bg-ink-900">
      <span
        aria-hidden="true"
        className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-iris-400/30 bg-iris-500/15"
      >
        <span className="flex h-6 items-end gap-[3px]">
          {[9, 20, 14, 22, 8].map((height, i) => (
            <span
              key={i}
              className={`w-[3px] rounded-sm ${i % 2 ? 'bg-brand-300' : 'bg-iris-400'}`}
              style={{ height }}
            />
          ))}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        {/* The category leads and the count follows, rather than "shadow N <category> phrases" —
            categories like "Reactions" don't survive being used as an adjective. */}
        <h2 className="font-display text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
          {scenario.phraseCategory} — {phrases.length} phrases to shadow
        </h2>
        <p className="mt-1.5 max-w-[70ch] text-sm text-slate-500 dark:text-slate-400">
          The set lines <em>{scenario.title.en}</em> is built on. Hear each one, say it back, and the
          mic tells you how much came through. No AI key needed — this works offline.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="inline-flex shrink-0 items-center gap-2 rounded-[18px] bg-gradient-to-r from-iris-500 to-iris-600 px-6 py-3.5 text-[15px] font-extrabold text-white shadow-[0_10px_28px_-10px_rgba(88,87,231,0.9)] transition-[filter,transform] hover:brightness-110 active:scale-[0.985]"
      >
        Start drill
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </section>
  );
}

// ── Drill runner ──────────────────────────────────────────────────────────────
interface PhraseDrillProps {
  phrases: Phrase[];
  progress: ProgressState;
  attempt: { id: string; score: number; heard: string } | null;
  recordingId: string | null;
  supported: boolean;
  onPlay: (phrase: Phrase) => void;
  onRecord: (phrase: Phrase) => void;
  onClearAttempt: () => void;
  onExit: () => void;
}

/**
 * One phrase at a time, in order. The drill is the same hear → say → score loop as a bank row, with
 * everything else off the screen — the point is to stop choosing what to practise and just practise.
 */
function PhraseDrill({
  phrases,
  progress,
  attempt,
  recordingId,
  supported,
  onPlay,
  onRecord,
  onClearAttempt,
  onExit,
}: PhraseDrillProps) {
  const [index, setIndex] = useState(0);
  const phrase = phrases[Math.min(index, phrases.length - 1)];
  const current = attempt?.id === phrase.id ? attempt : null;
  const best = progress.phraseScores[phrase.id];
  const last = index === phrases.length - 1;
  const recording = recordingId === phrase.id;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-hairline dark:bg-ink-900">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] font-bold text-slate-500 tabular-nums dark:text-slate-400">
          Phrase {index + 1} of {phrases.length}
          <span className="ml-2 font-semibold text-slate-400 dark:text-slate-500">{phrase.category}</span>
        </p>
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-ink-800 dark:hover:text-white"
        >
          <X size={14} aria-hidden="true" /> End drill
        </button>
      </div>

      <div className="mt-1.5 flex gap-1" aria-hidden="true">
        {phrases.map((p, i) => (
          <span
            key={p.id}
            className={`h-1 flex-1 rounded-full ${
              i < index ? 'bg-iris-400' : i === index ? 'bg-brand-500' : 'bg-slate-200 dark:bg-ink-700'
            }`}
          />
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">{phrase.meaning.en}</p>
        <p className="jp-text mt-2 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
          {phrase.ja}
        </p>
        <p className="mt-2 text-sm italic text-slate-400">{phrase.romaji}</p>
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onPlay(phrase)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-brand-400 dark:border-hairline dark:bg-ink-800 dark:text-slate-200 dark:hover:border-iris-800"
        >
          <Volume2 size={16} aria-hidden="true" /> Hear it
        </button>
        {supported && (
          <button
            type="button"
            onClick={() => onRecord(phrase)}
            className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-extrabold text-white transition-colors ${
              recording ? 'animate-pulse bg-rose-500' : 'bg-gradient-to-r from-iris-500 to-iris-600 hover:brightness-110'
            }`}
          >
            {recording ? <Square size={15} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
            {recording ? 'Stop' : 'Say it'}
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            onClearAttempt();
            if (last) onExit();
            else setIndex((i) => i + 1);
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-brand-400 dark:border-hairline dark:bg-ink-800 dark:text-slate-200 dark:hover:border-iris-800"
        >
          {last ? (
            <>
              <Check size={16} aria-hidden="true" /> Finish
            </>
          ) : (
            <>
              Next <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      <div className="mt-6 min-h-14 rounded-2xl bg-slate-50 p-4 text-center dark:bg-ink-800/70">
        {recording ? (
          <p className="text-sm font-semibold text-rose-500">Listening — say the line, then tap Stop.</p>
        ) : current ? (
          <AttemptResult attempt={current} />
        ) : best != null ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your best on this line so far: <ScoreText score={best} />
          </p>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {supported ? 'Hear it first, then say it back.' : 'Hear it, then shadow it out loud.'}
          </p>
        )}
      </div>
    </section>
  );
}

function AttemptResult({ attempt }: { attempt: { score: number; heard: string } }) {
  if (!attempt.heard) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">The mic didn’t catch anything — try again.</p>;
  }
  const band = scoreBand(attempt.score);
  return (
    <div className="space-y-1">
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {band === 'good' ? 'Clear — that came through.' : band === 'close' ? 'Close, say it once more.' : 'Not quite — listen again first.'}{' '}
        <ScoreText score={attempt.score} />
      </p>
      <p className="jp-text text-[13px] text-slate-500 dark:text-slate-400">Heard: {attempt.heard}</p>
    </div>
  );
}

const BAND_TEXT: Record<ScoreBand, string> = {
  good: 'text-emerald-600 dark:text-emerald-400',
  close: 'text-brand-600 dark:text-brand-300',
  off: 'text-accent-600 dark:text-accent-500',
};

const BAND_BAR: Record<ScoreBand, string> = {
  good: 'bg-emerald-500',
  close: 'bg-brand-500',
  off: 'bg-accent-500',
};

function ScoreText({ score }: { score: number }) {
  return <span className={`font-extrabold tabular-nums ${BAND_TEXT[scoreBand(score)]}`}>{score}%</span>;
}

// ── Bank row ──────────────────────────────────────────────────────────────────
interface PhraseRowProps {
  phrase: Phrase;
  best?: number;
  attempt: { score: number; heard: string } | null;
  hidden: boolean;
  recording: boolean;
  canRecord: boolean;
  onPlay: () => void;
  onRecord: () => void;
  onReveal: () => void;
}

function PhraseRow({
  phrase,
  best,
  attempt,
  hidden,
  recording,
  canRecord,
  onPlay,
  onRecord,
  onReveal,
}: PhraseRowProps) {
  const score = attempt?.heard ? attempt.score : best;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-[22px] border border-slate-200 bg-white p-3.5 sm:flex-nowrap sm:gap-5 sm:px-5 dark:border-hairline dark:bg-ink-900">
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play ${phrase.romaji}`}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-brand-600 transition-colors hover:bg-brand-100 dark:bg-ink-800 dark:text-brand-300 dark:hover:bg-iris-500/30 dark:hover:text-white"
      >
        <Volume2 size={16} aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1 basis-full sm:basis-auto">
        {hidden ? (
          <button
            type="button"
            onClick={onReveal}
            className="jp-text text-lg text-slate-900 blur-[6px] transition hover:blur-none dark:text-white"
          >
            {phrase.ja}
          </button>
        ) : (
          <p className="jp-text text-lg text-slate-900 dark:text-white">{phrase.ja}</p>
        )}
        {/* Romaji rides on the meaning line rather than taking a row of its own: it's a reading aid,
            and the phrase itself has to stay the largest thing here. */}
        <p className="mt-0.5 truncate text-[13px] text-slate-500 dark:text-slate-400">
          {phrase.meaning.en}
          <span className="text-slate-400 dark:text-slate-500"> · {phrase.romaji}</span>
        </p>
        {attempt && (
          <p className="jp-text mt-1 truncate text-xs text-slate-400 dark:text-slate-500">
            {attempt.heard ? `Heard: ${attempt.heard}` : 'The mic didn’t catch anything — try again.'}
          </p>
        )}
      </div>

      <span className="hidden shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-[11.5px] font-bold text-slate-600 lg:inline-flex dark:bg-ink-800 dark:text-brand-300">
        {phrase.category}
      </span>

      <span className="flex w-24 shrink-0 items-center gap-2" title={score == null ? 'Not recorded yet' : 'Best match so far'}>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-ink-700">
          {score != null && (
            <span
              className={`block h-full rounded-full ${BAND_BAR[scoreBand(score)]}`}
              style={{ width: `${score}%` }}
            />
          )}
        </span>
        {score == null ? (
          <span className="text-[11.5px] font-bold text-slate-300 dark:text-slate-600">—</span>
        ) : (
          <ScoreText score={score} />
        )}
      </span>

      {canRecord && (
        <button
          type="button"
          onClick={onRecord}
          aria-label={recording ? 'Stop recording' : `Record your attempt at ${phrase.romaji}`}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
            recording
              ? 'animate-pulse border-rose-400 bg-rose-500 text-white'
              : 'border-rose-300/60 bg-rose-500/10 text-rose-500 hover:bg-rose-500/25 hover:text-rose-600 dark:border-rose-400/35 dark:text-rose-300 dark:hover:text-white'
          }`}
        >
          {recording ? <Square size={13} aria-hidden="true" /> : <Mic size={16} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}

function CategoryChip({
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
      className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
        active
          ? 'bg-brand-600 text-white shadow-sm'
          : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-hairline dark:text-slate-300 dark:hover:bg-ink-800'
      }`}
    >
      {children}
    </button>
  );
}
