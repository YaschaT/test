import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, XCircle, RotateCcw, Headphones, Settings2, SkipForward } from 'lucide-react';
import { Card } from '../../components/Card';
import { Celebration } from '../../components/Celebration';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { PrimaryButton } from '../../components/PrimaryButton';
import { VoiceModeSelector } from '../../components/tts/VoiceModeSelector';
import { BrowserVoiceSelector } from '../../components/tts/BrowserVoiceSelector';
import { ModuleHeader } from '../../components/learning/ModuleHeader';
import { ModuleStatsHero } from '../../components/learning/ModuleStatsHero';
import { BigPlayButton } from '../../components/listening/BigPlayButton';
import { ListeningSessionProgress } from '../../components/listening/ListeningSessionProgress';
import { useJapaneseVoiceAvailable } from '../../lib/tts/browserTts';
import {
  getSavedVoiceMode,
  saveVoiceMode,
  useGoogleTtsAvailability,
  useTtsPlayer,
  VOICE_MODE_LABEL,
  type VoiceMode,
} from '../../lib/tts/ttsService';
import { useNeuralTtsAvailability } from '../../lib/tts/neuralTts';
import { getAutoPlayEnabled, setAutoPlayEnabled } from '../../lib/listeningPrefs';
import { buildDictationPool, buildListeningPool, matchesDictation, shuffle, type ListeningItem } from '../../lib/listeningPool';
import { recordQuizResult, useProgress } from '../../lib/progressStore';
import type { JlptLevel } from '../../types';
import { XP_RULES } from '../../lib/xp';
import { playCorrect, playWrong } from '../../lib/sound';

const SPEEDS = [0.75, 1, 1.25] as const;
const SESSION_SIZE = 8;

export function ListeningHome() {
  const progress = useProgress();
  const browserVoiceAvailable = useJapaneseVoiceAvailable();
  const googleAvailable = useGoogleTtsAvailability();
  const neuralAvailable = useNeuralTtsAvailability();
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(() => getSavedVoiceMode());
  const [mode, setMode] = useState<'select' | 'dictation'>('select');
  const [speed, setSpeed] = useState<number>(1);
  const [autoPlay, setAutoPlay] = useState<boolean>(() => getAutoPlayEnabled());
  const [sessionKey, setSessionKey] = useState(0);
  const userChoseVoice = useRef(false);

  // Prefer the natural neural voice by default once we know it's available (unless the learner has
  // picked a voice this session). It's strictly nicer than the robotic browser voice.
  useEffect(() => {
    if (neuralAvailable && !userChoseVoice.current && voiceMode === 'browser') setVoiceMode('neural');
  }, [neuralAvailable, voiceMode]);

  // A voice saved on a previous visit may not exist here — a different device, or a server that no longer
  // offers it. Derived rather than corrected in state, so the label can never briefly name a voice that
  // cannot play. Everything downstream uses this, not the raw saved preference.
  const unavailable =
    (voiceMode === 'neural' && neuralAvailable === false) || (voiceMode === 'google' && googleAvailable === false);
  const activeVoiceMode: VoiceMode = unavailable ? 'browser' : voiceMode;

  function handleVoiceModeChange(next: VoiceMode) {
    userChoseVoice.current = true;
    setVoiceMode(next);
    saveVoiceMode(next);
  }

  function handleAutoPlayChange(next: boolean) {
    setAutoPlay(next);
    setAutoPlayEnabled(next);
  }

  const playbackAvailable =
    activeVoiceMode === 'browser'
      ? browserVoiceAvailable
      : activeVoiceMode === 'neural'
        ? neuralAvailable === true
        : googleAvailable === true;

  // Real listening stats, derived from recorded session results.
  const listeningResults = progress.quizResults.filter((r) => r.skill === 'listening');
  const sessionsDone = listeningResults.length;
  const totalCorrect = listeningResults.reduce((n, r) => n + r.correct, 0);
  const totalAnswered = listeningResults.reduce((n, r) => n + r.total, 0);
  const accuracyPct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div className="space-y-6">
      <ModuleHeader
        skill="listening"
        title="Listening"
        subtitle="Train your ear on real sentences at your level."
      />
      <ModuleStatsHero
        ringProgress={totalAnswered > 0 ? totalCorrect / totalAnswered : 0}
        ringIcon={Headphones}
        headlineValue={sessionsDone}
        headlineLabel={sessionsDone === 1 ? 'Session completed' : 'Sessions completed'}
        mascot="listening"
        facts={totalAnswered > 0 ? [{ value: accuracyPct, label: 'Accuracy', suffix: '%' }] : []}
      />

      {activeVoiceMode === 'browser' && !browserVoiceAvailable && (
        <Card className="p-4 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-semibold">No Japanese voice found on this device.</p>
              <p className="mt-1">
                Audio playback isn't available in this browser/OS. Try Chrome or Edge, or install a Japanese
                voice pack in your system's text-to-speech settings. The Play button is disabled until a
                voice is available — you can still read the sentences below.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs
          value={mode}
          onChange={setMode}
          groupLabel="Exercise type"
          options={[
            { value: 'select', label: 'Listen & Select' },
            { value: 'dictation', label: 'Dictation' },
          ]}
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-300">Speed</span>
          <SegmentedTabs
            value={String(speed)}
            onChange={(v) => setSpeed(Number(v))}
            size="sm"
            groupLabel="Playback speed"
            options={SPEEDS.map((sp) => ({ value: String(sp), label: `${sp}x` }))}
          />
        </div>
      </div>

      {/* Keyed on the session counter only. Voice is a playback preference, not part of what the session
          is — keying on it too meant that switching voice mid-session (the most likely reason anyone
          touches that control) silently threw the learner's answers away and restarted at item 1. */}
      {mode === 'select' ? (
        <ListenSelect
          key={`select-${sessionKey}`}
          speed={speed}
          voiceMode={activeVoiceMode}
          playbackAvailable={playbackAvailable}
          level={progress.level}
          autoPlay={autoPlay}
          onAutoPlayChange={handleAutoPlayChange}
          onRestart={() => setSessionKey((k) => k + 1)}
          onUseDeviceVoice={() => handleVoiceModeChange('browser')}
        />
      ) : (
        <Dictation
          key={`dictation-${sessionKey}`}
          speed={speed}
          voiceMode={activeVoiceMode}
          playbackAvailable={playbackAvailable}
          level={progress.level}
          autoPlay={autoPlay}
          onAutoPlayChange={handleAutoPlayChange}
          onRestart={() => setSessionKey((k) => k + 1)}
          onUseDeviceVoice={() => handleVoiceModeChange('browser')}
        />
      )}

      {/* Folded away and placed after the exercise. Almost nobody changes their voice more than once, yet
          everyone used to scroll past the full settings block to reach the play button — on a phone it sat
          more than a screen down. A native <details> keeps it keyboard-operable with no extra code. */}
      <details className="group rounded-2xl border border-slate-200 bg-white dark:border-ink-line dark:bg-ink-900">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200">
          <Settings2 size={16} aria-hidden="true" className="shrink-0 text-slate-500 dark:text-slate-400" />
          Voice: {VOICE_MODE_LABEL[activeVoiceMode]}
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="ml-auto shrink-0 text-slate-500 transition-transform group-open:rotate-180 dark:text-slate-400"
          />
        </summary>
        <div className="space-y-3 border-t border-slate-200 px-4 py-3 dark:border-ink-line">
          <VoiceModeSelector mode={activeVoiceMode} onChange={handleVoiceModeChange} googleAvailable={googleAvailable} neuralAvailable={neuralAvailable} />
          {activeVoiceMode === 'browser' && <BrowserVoiceSelector />}
        </div>
      </details>
    </div>
  );
}

/**
 * Dictation draws from the narrower pool of hand-written romaji, because it grades typing against that
 * field. Listen & Select only ever compares English meanings, so it can use every sentence. Both are
 * scoped to the learner's level, which is also what the result is recorded against.
 */
function useSession(mode: 'select' | 'dictation', level: JlptLevel) {
  return useMemo(
    () => shuffle(mode === 'dictation' ? buildDictationPool(level) : buildListeningPool(level)).slice(0, SESSION_SIZE),
    [mode, level],
  );
}

interface ModeProps {
  speed: number;
  voiceMode: VoiceMode;
  playbackAvailable: boolean;
  level: JlptLevel;
  autoPlay: boolean;
  onAutoPlayChange: (next: boolean) => void;
  onRestart: () => void;
  /** Recovery when a network voice fails — the device voice works offline. */
  onUseDeviceVoice: () => void;
}

function AutoPlayToggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-brand-600 w-3.5 h-3.5" />
      Auto-play
    </label>
  );
}

/**
 * A failed playback used to be a dead end: a red line of text and nothing to do about it. When the
 * failure is the network and a voice that works offline is one control away, the fix belongs right here
 * rather than folded inside the settings the learner would have to go hunting for.
 */
function PlaybackError({
  message,
  canUseDeviceVoice,
  onUseDeviceVoice,
}: {
  message?: string;
  canUseDeviceVoice: boolean;
  onUseDeviceVoice: () => void;
}) {
  if (!message) return null;
  return (
    <div role="alert" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-red-600 dark:text-red-400">
      <span className="flex items-center gap-1.5">
        <AlertTriangle size={14} aria-hidden="true" /> {message}
      </span>
      {canUseDeviceVoice && (
        <button
          type="button"
          onClick={onUseDeviceVoice}
          className="font-semibold text-brand-600 underline underline-offset-2 dark:text-brand-300"
        >
          Use my device's voice
        </button>
      )}
    </div>
  );
}

/**
 * Reveals the answer without scoring it.
 *
 * A learner stuck on item 3 of 8 previously had two options: guess, which pollutes their accuracy, or
 * leave. "I don't know" is also a different signal from a wrong guess and deserves to be expressible.
 */
function SkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 underline-offset-2 hover:underline dark:text-slate-300"
    >
      <SkipForward size={13} aria-hidden="true" />
      I don't know — show the answer
    </button>
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
  done: boolean;
  answered: number;
  correct: number;
  total: number;
}) {
  const recordedRef = useRef(false);
  // Mirrored into a ref after each render so the unmount cleanup, which captures nothing, can still see
  // how far the learner actually got.
  const latest = useRef(args);
  useEffect(() => {
    latest.current = args;
  });

  useEffect(() => {
    if (!args.done || recordedRef.current) return;
    recordedRef.current = true;
    recordQuizResult({
      quizId: args.quizId,
      skill: 'listening',
      level: args.level,
      correct: args.correct,
      total: args.total,
      completed: true,
    });
  }, [args.done, args.quizId, args.level, args.correct, args.total]);

  useEffect(
    () => () => {
      const { quizId, level, answered, correct } = latest.current;
      if (recordedRef.current || answered === 0) return;
      recordedRef.current = true;
      recordQuizResult({ quizId, skill: 'listening', level, correct, total: answered, completed: false });
    },
    [],
  );
}

function ListenSelect({ speed, voiceMode, playbackAvailable, level, autoPlay, onAutoPlayChange, onRestart, onUseDeviceVoice }: ModeProps) {
  // Distractors come from the same level as the answer, so the wrong options are plausible rather than
  // obviously out of place.
  const pool = useMemo(() => buildListeningPool(level), [level]);
  const session = useSession('select', level);
  const { state, play, stop } = useTtsPlayer(voiceMode);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const done = index >= session.length;
  const item = done ? null : session[index];
  const options = useMemo(() => (item ? buildOptions(item, pool) : []), [item, pool]);

  useSessionRecording({
    quizId: 'listening-select',
    level,
    done,
    // The current item counts as answered as soon as it is resolved, before "Next" is pressed.
    answered: index + (selected !== null || skipped ? 1 : 0),
    correct: correctCount,
    total: session.length,
  });

  // Skips index 0 deliberately: on arrival no user gesture has happened yet, so the browser blocks the
  // audio and the learner waits for a sound that is never coming. They press play once; from then on the
  // page has a gesture to work with and later items play by themselves.
  useEffect(() => {
    if (autoPlay && index > 0 && item && playbackAvailable) play(item.japanese, speed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, autoPlay]);

  if (done || !item) {
    return <SessionComplete correct={correctCount} total={session.length} onRestart={onRestart} />;
  }

  const answered = selected !== null || skipped;
  const isCorrect = selected !== null && selected === item.en;

  const choose = (en: string) => {
    if (answered) return;
    setSelected(en);
    if (en === item.en) {
      setCorrectCount((c) => c + 1);
      playCorrect();
    } else {
      playWrong();
    }
  };

  const next = () => {
    setIndex((i) => i + 1);
    setSelected(null);
    setSkipped(false);
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-5 items-start">
      <Card className="p-6 space-y-5">
        {/* Just the locator. The running score used to sit here too, duplicating the panel alongside and
            counting only answer XP, so the total jumped when the session bonus landed at the end. */}
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Item {index + 1} of {session.length}
        </p>

        <div className="flex flex-col items-center gap-2 py-2">
          <BigPlayButton
            onClick={() => play(item.japanese, speed)}
            onStop={stop}
            playbackAvailable={playbackAvailable}
            status={state.status}
          />
          <AutoPlayToggle checked={autoPlay} onChange={onAutoPlayChange} />
        </div>
        {state.status === 'error' && (
          <PlaybackError
            message={state.errorMessage}
            canUseDeviceVoice={voiceMode !== 'browser'}
            onUseDeviceVoice={onUseDeviceVoice}
          />
        )}

        {/* The prompt used to exist only as an aria-label, so the one group who could perceive it were the
            users who couldn't see the screen. It's a real heading now, and it names the group. */}
        <h3 id="listen-select-prompt" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Which meaning did you hear?
        </h3>

        {/* Plain buttons in a labelled group, not radios: a quiz answer is a command, not a form value, and
            the previous role="radio" promised arrow-key navigation the widget never implemented. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="group" aria-labelledby="listen-select-prompt">
          {options.map((opt) => {
            const showCorrect = answered && opt === item.en;
            const showWrong = answered && opt === selected && opt !== item.en;
            return (
              <button
                key={opt}
                type="button"
                /* aria-disabled rather than disabled: `disabled` on the element that currently has focus
                   destroys it, dropping the keyboard user back to the top of the document on every
                   question. This keeps them where they are. */
                aria-disabled={answered}
                onClick={() => choose(opt)}
                className={`w-full text-left rounded-xl border px-4 py-2.5 pointer-coarse:py-3.5 text-sm font-medium transition-all flex items-center justify-between gap-2 ${
                  showCorrect
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : showWrong
                      ? 'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 animate-shake'
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 text-slate-800 dark:text-slate-100'
                } ${answered ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'}`}
              >
                {opt}
                {showCorrect && <CheckCircle2 size={16} aria-hidden="true" />}
                {showWrong && <XCircle size={16} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {!answered && <SkipButton onSkip={() => setSkipped(true)} />}

        {answered && (
          <div>
            <div role="status">
              <p
                className={`text-sm font-medium ${
                  isCorrect
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : skipped
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isCorrect ? 'Correct!' : skipped ? `The answer was "${item.en}".` : `Not quite — the answer was "${item.en}".`}
              </p>
              <p className="jp-text text-slate-600 dark:text-slate-300 text-sm mt-1">{item.japanese}</p>
            </div>
            <PrimaryButton onClick={next} className="mt-3" autoFocus>
              Next
            </PrimaryButton>
          </div>
        )}
      </Card>

      <ListeningSessionProgress index={index} total={session.length} correctCount={correctCount} />
    </div>
  );
}

function Dictation({ speed, voiceMode, playbackAvailable, level, autoPlay, onAutoPlayChange, onRestart, onUseDeviceVoice }: ModeProps) {
  const session = useSession('dictation', level);
  const { state, play, stop } = useTtsPlayer(voiceMode);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const done = index >= session.length;
  const resolved = checked || skipped;

  useSessionRecording({
    quizId: 'listening-dictation',
    level,
    done,
    answered: index + (resolved ? 1 : 0),
    correct: correctCount,
    total: session.length,
  });

  // See ListenSelect: the first item never autoplays, because nothing has granted a gesture yet.
  useEffect(() => {
    if (autoPlay && index > 0 && !done && playbackAvailable) play(session[index].japanese, speed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, autoPlay]);

  if (done) {
    return <SessionComplete correct={correctCount} total={session.length} onRestart={onRestart} />;
  }

  const item = session[index];
  const isCorrect = checked && matchesDictation(input, item);

  function submit() {
    if (checked) return;
    setChecked(true);
    if (matchesDictation(input, item)) {
      setCorrectCount((c) => c + 1);
      playCorrect();
    } else {
      playWrong();
    }
  }

  function next() {
    setIndex((i) => i + 1);
    setInput('');
    setChecked(false);
    setSkipped(false);
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-5 items-start">
      <Card className="p-6 space-y-5">
        {/* Just the locator. The running score used to sit here too, duplicating the panel alongside and
            counting only answer XP, so the total jumped when the session bonus landed at the end. */}
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Item {index + 1} of {session.length}
        </p>

        <div className="flex flex-col items-center gap-2 py-2">
          <BigPlayButton
            onClick={() => play(item.japanese, speed)}
            onStop={stop}
            playbackAvailable={playbackAvailable}
            status={state.status}
          />
          <AutoPlayToggle checked={autoPlay} onChange={onAutoPlayChange} />
        </div>
        {state.status === 'error' && (
          <PlaybackError
            message={state.errorMessage}
            canUseDeviceVoice={voiceMode !== 'browser'}
            onUseDeviceVoice={onUseDeviceVoice}
          />
        )}

        <div>
          <label htmlFor="dictation-input" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Type what you heard — romaji or kana
          </label>
          <input
            id="dictation-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={resolved}
            placeholder="e.g. Nihon ni ikitai desu"
            /* A phone keyboard would otherwise capitalise and autocorrect romaji into English words, and
               spellcheck underlines every one of them as a misspelling. */
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={checked && !isCorrect ? true : undefined}
            aria-describedby="dictation-feedback"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </div>

        {!resolved ? (
          <div className="flex flex-wrap items-center gap-4">
            <PrimaryButton onClick={submit} disabled={input.trim().length === 0}>
              Check
            </PrimaryButton>
            <SkipButton onSkip={() => setSkipped(true)} />
          </div>
        ) : (
          <div>
            {/* role="status" so the result is announced — it is the whole point of the exercise, and
                previously it appeared silently for anyone not watching this corner of the screen. */}
            <div id="dictation-feedback" role="status">
              <p
                className={`text-sm font-medium flex items-center gap-1.5 ${
                  isCorrect
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : skipped
                      ? 'text-slate-700 dark:text-slate-200'
                      : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isCorrect ? <CheckCircle2 size={16} aria-hidden="true" /> : !skipped && <XCircle size={16} aria-hidden="true" />}
                {isCorrect ? 'Correct!' : skipped ? "Here's the answer." : 'Not quite.'}
              </p>
              <p className="jp-text text-slate-700 dark:text-slate-200 mt-1">{item.japanese}</p>
              <p className="text-sm text-brand-600 dark:text-brand-300">{item.romaji}</p>
            </div>
            <PrimaryButton onClick={next} className="mt-3" autoFocus>
              Next
            </PrimaryButton>
          </div>
        )}
      </Card>

      <ListeningSessionProgress index={index} total={session.length} correctCount={correctCount} />
    </div>
  );
}

function SessionComplete({ correct, total, onRestart }: { correct: number; total: number; onRestart: () => void }) {
  const sessionBonusXp = XP_RULES.listeningSession;
  const correctXp = correct * XP_RULES.quizCorrectAnswer;
  return (
    <Card className="p-8">
      <Celebration correct={correct} total={total} extraNote="Your result has been saved." />
      <div className="flex items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
        <span>
          +{sessionBonusXp} XP <span className="text-slate-400 dark:text-slate-500">session</span>
        </span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span>
          +{correctXp} XP <span className="text-slate-400 dark:text-slate-500">correct answers</span>
        </span>
      </div>
      <div className="text-center">
        <PrimaryButton onClick={onRestart}>
          <RotateCcw size={16} /> Start new session
        </PrimaryButton>
      </div>
    </Card>
  );
}

function buildOptions(item: ListeningItem, pool: ListeningItem[]): string[] {
  const distractors = shuffle(pool.filter((p) => p.en !== item.en))
    .slice(0, 3)
    .map((p) => p.en);
  return shuffle([item.en, ...distractors]);
}
