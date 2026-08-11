import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, SkipForward, XCircle } from 'lucide-react';
import { Card } from '../Card';
import { PrimaryButton } from '../PrimaryButton';
import { AudioMeter } from './AudioMeter';
import { BigPlayButton } from './BigPlayButton';
import { SentenceBreakdown } from './SentenceBreakdown';
import { SessionHud } from './SessionHud';
import { SessionResults } from './SessionResults';
import { matchesDictation } from '../../lib/listeningPool';
import { buildSession, ROUND_LABEL, ROUND_PROMPT, type SessionMode } from '../../lib/listeningRounds';
import { recordQuizResult, reviewItem } from '../../lib/progressStore';
import { playCorrect, playWrong } from '../../lib/sound';
import { useTtsPlayer, type VoiceMode } from '../../lib/tts/ttsService';
import { XP_RULES } from '../../lib/xp';
import type { JlptLevel } from '../../types';

export const SESSION_SIZE = 8;
const MAX_HEARTS = 3;
/** One word on its own, slowed right down — the speed you use to pull a sound apart, not to practise at. */
const WORD_RATE = 0.7;
const SLOW_REPLAY_RATE = 0.6;

type Verdict = 'right' | 'wrong' | 'shown';

interface ListeningSessionProps {
  mode: SessionMode;
  level: JlptLevel;
  speed: number;
  voiceMode: VoiceMode;
  playbackAvailable: boolean;
  autoPlay: boolean;
  onAutoPlayChange: (next: boolean) => void;
  /** Recovery when a network voice fails — the device voice works offline. */
  onUseDeviceVoice: () => void;
  /** Reports the XP earned so far, for the running total in the page's header. */
  onSessionXpChange: (xp: number) => void;
  onRestart: () => void;
}

/**
 * One listening session, start to results.
 *
 * The session is a single component rather than one per format because a mixed session moves between
 * formats item by item — hearts, accuracy, the sentence breakdown and the record written at the end all
 * belong to the session, not to any one exercise type. Only the answering control itself changes.
 */
export function ListeningSession({
  mode,
  level,
  speed,
  voiceMode,
  playbackAvailable,
  autoPlay,
  onAutoPlayChange,
  onUseDeviceVoice,
  onSessionXpChange,
  onRestart,
}: ListeningSessionProps) {
  const rounds = useMemo(() => buildSession(mode, level, SESSION_SIZE), [mode, level]);
  const { state, play, stop } = useTtsPlayer(voiceMode);

  const [index, setIndex] = useState(0);
  const [log, setLog] = useState<boolean[]>([]);
  const [correct, setCorrect] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [plays, setPlays] = useState(0);
  const [furigana, setFurigana] = useState(true);

  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState('');
  const [line, setLine] = useState<number[]>([]);

  /**
   * Set when the learner leaves the last reveal, not derived from the hearts. Losing the third heart ends
   * the session, but it must not snatch the answer away in the same frame — the round you got wrong is
   * precisely the one you need to read.
   */
  const [done, setDone] = useState(false);

  const round = rounds[index];
  const ranOutOfHearts = hearts <= 0;

  useEffect(() => {
    onSessionXpChange(correct * XP_RULES.quizCorrectAnswer);
  }, [correct, onSessionXpChange]);

  useSessionRecording({
    quizId: `listening-${mode}`,
    level,
    finished: done,
    answered: log.length,
    correct,
    total: rounds.length,
    // The completion bonus is for sitting through a session, so a run cut short by the hearts does not
    // collect it — same rule that already governs walking away half way.
    completed: !ranOutOfHearts,
  });

  const answered = verdict !== null;

  // The A–D badges on the answer buttons are a promise that those keys work, so they do. Only bound while
  // a multiple-choice round is unanswered, which is also the only time this page has no text input open.
  useEffect(() => {
    if (!round || answered || round.choices.length === 0) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const slot = 'abcd'.indexOf(event.key.toLowerCase());
      if (slot < 0 || slot >= round!.choices.length) return;
      event.preventDefault();
      choose(slot);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (rounds.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          No {level} sentences are available for this session type yet.
        </p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Try another level, or a different session type.
        </p>
      </Card>
    );
  }

  if (done) {
    return (
      <SessionResults
        rounds={rounds}
        log={log}
        correct={correct}
        heartsLeft={hearts}
        maxHearts={MAX_HEARTS}
        ranOutOfHearts={ranOutOfHearts}
        onReplay={(japanese) => play(japanese, SLOW_REPLAY_RATE)}
        playbackAvailable={playbackAvailable}
        onRestart={onRestart}
      />
    );
  }

  function resolve(outcome: Verdict) {
    if (verdict || !round) return;
    const right = outcome === 'right';
    setVerdict(outcome);
    setLog((entries) => [...entries, right]);
    // Every sentence is its own SRS card: heard correctly it moves out on a longer interval, missed — or
    // given up on, which is the same admission — it comes straight back.
    reviewItem('listening', round.item.id, right ? 'good' : 'again');
    if (right) {
      setCorrect((c) => c + 1);
      playCorrect();
    } else {
      // Giving up costs no heart. "I don't know" is a different signal from a wrong guess and the page has
      // always treated it as one; charging for honesty would just push learners back to guessing.
      if (outcome === 'wrong') setHearts((h) => h - 1);
      playWrong();
    }
    stop();
  }

  function choose(slot: number) {
    if (verdict || !round) return;
    setPicked(slot);
    resolve(slot === round.correctIndex ? 'right' : 'wrong');
  }

  function next() {
    if (ranOutOfHearts || isLastRound) {
      setDone(true);
      return;
    }
    const upcoming = rounds[index + 1];
    setIndex((i) => i + 1);
    setVerdict(null);
    setPicked(null);
    setTyped('');
    setLine([]);

    // Auto-play starts the next line from here rather than from an effect watching the index, which also
    // settles the first-item problem for free: this only ever runs off the learner's own tap on "Next",
    // so the browser always has the gesture it needs and nobody is left waiting on silence.
    const auto = autoPlay && playbackAvailable && !!upcoming;
    setPlays(auto ? 1 : 0);
    if (auto) play(upcoming.item.japanese, speed);
  }

  function playCurrent() {
    setPlays((n) => n + 1);
    play(round.item.japanese, speed);
  }

  const isChoice = round.choices.length > 0;
  const words = round.words;
  const orderAnswer = words.map((w) => w.text).join('');
  const isLastRound = index + 1 >= rounds.length;

  return (
    <Card className="flex flex-col gap-6 p-6 sm:p-7">
      <SessionHud
        index={index}
        total={rounds.length}
        log={log}
        accuracy={log.length > 0 ? Math.round((correct / log.length) * 100) : 0}
        hearts={hearts}
        maxHearts={MAX_HEARTS}
      />

      <div className="flex flex-col items-center gap-3.5 border-b border-slate-200 pb-6 dark:border-hairline">
        <BigPlayButton onClick={playCurrent} onStop={stop} playbackAvailable={playbackAvailable} status={state.status} />
        <AudioMeter playing={state.status === 'playing'} />
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {plays > 0 && (
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {plays} {plays === 1 ? 'play' : 'plays'}
            </span>
          )}
          <label className="inline-flex cursor-pointer select-none items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={autoPlay}
              onChange={(e) => onAutoPlayChange(e.target.checked)}
              className="h-3.5 w-3.5 accent-brand-600"
            />
            Auto-play
          </label>
        </div>
        {state.status === 'error' && (
          <div role="alert" className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-red-600 dark:text-red-400">
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={14} aria-hidden="true" /> {state.errorMessage}
            </span>
            {voiceMode !== 'browser' && (
              <button
                type="button"
                onClick={onUseDeviceVoice}
                className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300"
              >
                Use my device's voice
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-brand-50 px-3.5 py-1.5 text-[10px] font-black tracking-[0.14em] text-brand-700 dark:bg-iris-500/15 dark:text-iris-400">
            {ROUND_LABEL[round.kind]}
          </span>
          <h3 id="listening-prompt" className="text-base font-bold text-slate-800 dark:text-slate-100">
            {ROUND_PROMPT[round.kind]}
          </h3>
        </div>

        {round.kind === 'gap' && (
          <p className="jp-text text-2xl text-slate-800 dark:text-slate-100">{round.gapPrompt}</p>
        )}

        {isChoice && (
          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-labelledby="listening-prompt">
            {round.choices.map((choice, slot) => {
              const showCorrect = answered && slot === round.correctIndex;
              const showWrong = answered && slot === picked && slot !== round.correctIndex;
              return (
                <button
                  key={`${slot}-${choice}`}
                  type="button"
                  /* aria-disabled rather than disabled: `disabled` on the element that currently has focus
                     destroys it, dropping a keyboard user back to the top of the document every round. */
                  aria-disabled={answered}
                  aria-keyshortcuts={answered ? undefined : 'ABCD'[slot]}
                  onClick={() => choose(slot)}
                  className={`flex items-center gap-3 rounded-2xl border px-5 py-4 text-left text-[15px] font-bold transition-all ${
                    showCorrect
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : showWrong
                        ? 'animate-shake border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : answered
                          ? 'border-slate-200 text-slate-400 dark:border-hairline dark:text-slate-500'
                          : 'border-slate-200 text-slate-800 hover:-translate-y-px hover:border-brand-300 dark:border-slate-700 dark:text-slate-100 dark:hover:border-iris-400'
                  } ${answered ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'}`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-black ${
                      showCorrect
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-500 dark:bg-ink-800 dark:text-slate-400'
                    }`}
                    aria-hidden="true"
                  >
                    {'ABCD'[slot]}
                  </span>
                  <span className={round.kind === 'gap' ? 'jp-text text-lg' : ''}>{choice}</span>
                  {showCorrect && <CheckCircle2 size={16} className="ml-auto shrink-0" aria-hidden="true" />}
                  {showWrong && <XCircle size={16} className="ml-auto shrink-0" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        )}

        {round.kind === 'dictation' && (
          <div className="flex flex-col gap-3">
            <label htmlFor="dictation-input" className="sr-only">
              Type what you heard — romaji or kana
            </label>
            <input
              id="dictation-input"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={answered}
              placeholder="e.g. Nihon ni ikitai desu"
              /* A phone keyboard would otherwise capitalise and autocorrect romaji into English words, and
                 spellcheck underlines every one of them as a misspelling. */
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={verdict === 'wrong' ? true : undefined}
              onKeyDown={(e) => e.key === 'Enter' && typed.trim() && resolve(matchesDictation(typed, round.item) ? 'right' : 'wrong')}
              className={`jp-text w-full rounded-2xl border bg-white px-5 py-4 text-lg text-slate-800 outline-none disabled:opacity-70 dark:bg-ink-800 dark:text-slate-100 ${
                verdict === 'right'
                  ? 'border-emerald-400'
                  : verdict === 'wrong'
                    ? 'border-red-400'
                    : 'border-slate-200 focus:border-brand-400 dark:border-hairline dark:focus:border-iris-400'
              }`}
            />
            {!answered && (
              <div className="flex flex-wrap items-center gap-4">
                <PrimaryButton
                  onClick={() => resolve(matchesDictation(typed, round.item) ? 'right' : 'wrong')}
                  disabled={typed.trim().length === 0}
                >
                  Check
                </PrimaryButton>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Romaji or kana — either is accepted.
                </span>
              </div>
            )}
          </div>
        )}

        {round.kind === 'order' && (
          <div className="flex flex-col gap-3.5">
            <div
              className={`flex min-h-[66px] flex-wrap content-start gap-2 rounded-2xl border bg-slate-50 p-3.5 dark:bg-ink-800 ${
                verdict === 'right'
                  ? 'border-emerald-400'
                  : verdict === 'wrong'
                    ? 'border-red-400'
                    : 'border-slate-200 dark:border-hairline'
              }`}
            >
              {line.length === 0 ? (
                <p className="self-center text-[13px] font-medium text-slate-400 dark:text-slate-500">
                  Tap the words below in the order you heard them.
                </p>
              ) : (
                line.map((wordIndex, position) => (
                  <button
                    key={`${wordIndex}-${position}`}
                    type="button"
                    disabled={answered}
                    onClick={() => setLine((current) => current.filter((_, p) => p !== position))}
                    aria-label={`Remove ${words[wordIndex].text}`}
                    className="jp-text rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2 text-lg text-slate-800 disabled:opacity-70 dark:border-iris-400/40 dark:bg-iris-500/15 dark:text-slate-100"
                  >
                    {words[wordIndex].text}
                  </button>
                ))
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {round.bank.map((wordIndex) => {
                const spent = line.includes(wordIndex);
                return (
                  <button
                    key={wordIndex}
                    type="button"
                    disabled={spent || answered}
                    onClick={() => setLine((current) => [...current, wordIndex])}
                    className="jp-text rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-lg text-slate-800 hover:border-brand-300 disabled:opacity-35 dark:border-hairline dark:bg-ink-900 dark:text-slate-100 dark:hover:border-iris-400"
                  >
                    {words[wordIndex].text}
                  </button>
                );
              })}
            </div>
            {!answered && (
              <PrimaryButton
                className="self-start"
                disabled={line.length !== words.length}
                onClick={() => resolve(line.map((i) => words[i].text).join('') === orderAnswer ? 'right' : 'wrong')}
              >
                Check
              </PrimaryButton>
            )}
          </div>
        )}

        {!answered && (
          <button
            type="button"
            onClick={() => resolve('shown')}
            className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
          >
            <SkipForward size={13} aria-hidden="true" />
            I don't know — teach me this one
          </button>
        )}
      </div>

      {answered && (
        <div className="flex animate-celebrate flex-col gap-4 border-t border-slate-200 pt-6 dark:border-hairline">
          <div role="status" className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-black tracking-[0.1em] ${
                verdict === 'right'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/15 text-red-600 dark:text-red-400'
              }`}
            >
              {verdict === 'right' ? 'CAUGHT IT' : verdict === 'shown' ? 'SHOWN' : 'MISSED'}
            </span>
            <span className="text-[13.5px] font-bold text-slate-600 dark:text-slate-300">
              {verdict === 'right'
                ? plays <= 1
                  ? 'First listen, no replay. That is the hard version.'
                  : 'Correct. Now see how the line is built.'
                : verdict === 'shown'
                  ? 'No score either way — here is how it goes together.'
                  : 'Here is what your ear skipped.'}
            </span>
          </div>

          <SentenceBreakdown
            words={words}
            translation={round.item.en}
            focusIndex={round.focusIndex}
            trap={round.trap}
            furigana={furigana}
            onToggleFurigana={() => setFurigana((on) => !on)}
            onSayWord={(word) => play(word, WORD_RATE)}
            onReplaySlow={() => play(round.item.japanese, SLOW_REPLAY_RATE)}
            playbackAvailable={playbackAvailable}
          />

          <PrimaryButton onClick={next} className="self-end" autoFocus>
            {isLastRound || hearts <= 0 ? 'See results' : 'Next item'}
          </PrimaryButton>
        </div>
      )}
    </Card>
  );
}

/**
 * Saves the session's result exactly once — on completion, or on unmount if the learner leaves partway
 * through. Leaving used to record nothing at all, so seven answers out of eight simply vanished.
 *
 * A partial result is scored against what was actually attempted (`total = answered`) rather than the
 * full session length, so stopping early doesn't read as a pile of wrong answers, and it is flagged
 * `completed: false` so it doesn't collect the session bonus.
 */
function useSessionRecording(args: {
  quizId: string;
  level: JlptLevel;
  finished: boolean;
  answered: number;
  correct: number;
  total: number;
  completed: boolean;
}) {
  const recorded = useRef(false);
  // Mirrored into a ref after each render so the unmount cleanup, which captures nothing, can still see
  // how far the learner actually got.
  const latest = useRef(args);
  useEffect(() => {
    latest.current = args;
  });

  useEffect(() => {
    if (!args.finished || recorded.current || args.answered === 0) return;
    recorded.current = true;
    recordQuizResult({
      quizId: args.quizId,
      skill: 'listening',
      level: args.level,
      correct: args.correct,
      total: args.completed ? args.total : args.answered,
      completed: args.completed,
    });
  }, [args.finished, args.quizId, args.level, args.correct, args.total, args.answered, args.completed]);

  useEffect(
    () => () => {
      const { quizId, level, answered, correct } = latest.current;
      if (recorded.current || answered === 0) return;
      recorded.current = true;
      recordQuizResult({ quizId, skill: 'listening', level, correct, total: answered, completed: false });
    },
    [],
  );
}
