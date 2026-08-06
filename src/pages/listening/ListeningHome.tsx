import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, RotateCcw, Headphones } from 'lucide-react';
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
import { getSavedVoiceMode, saveVoiceMode, useGoogleTtsAvailability, useTtsPlayer, type VoiceMode } from '../../lib/tts/ttsService';
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
    voiceMode === 'browser' ? browserVoiceAvailable : voiceMode === 'neural' ? neuralAvailable === true : googleAvailable === true;

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
        subtitle="Practice with text-to-speech, using your browser's voice or a natural neural voice."
      />
      <ModuleStatsHero
        ringProgress={totalAnswered > 0 ? totalCorrect / totalAnswered : 0}
        ringIcon={Headphones}
        headlineValue={sessionsDone}
        headlineLabel={sessionsDone === 1 ? 'Session completed' : 'Sessions completed'}
        mascot="listening"
        facts={totalAnswered > 0 ? [{ value: accuracyPct, label: 'Accuracy', suffix: '%' }] : []}
      />

      {voiceMode === 'browser' && !browserVoiceAvailable && (
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

      <Card className="p-4 space-y-3">
        <VoiceModeSelector mode={voiceMode} onChange={handleVoiceModeChange} googleAvailable={googleAvailable} neuralAvailable={neuralAvailable} />
        {voiceMode === 'browser' && <BrowserVoiceSelector />}
      </Card>

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
          <span className="text-xs text-slate-400">Speed</span>
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
          voiceMode={voiceMode}
          playbackAvailable={playbackAvailable}
          level={progress.level}
          autoPlay={autoPlay}
          onAutoPlayChange={handleAutoPlayChange}
          onRestart={() => setSessionKey((k) => k + 1)}
        />
      ) : (
        <Dictation
          key={`dictation-${sessionKey}`}
          speed={speed}
          voiceMode={voiceMode}
          playbackAvailable={playbackAvailable}
          level={progress.level}
          autoPlay={autoPlay}
          onAutoPlayChange={handleAutoPlayChange}
          onRestart={() => setSessionKey((k) => k + 1)}
        />
      )}
    </div>
  );
}

/**
 * Dictation draws from the narrower pool of hand-written romaji, because it grades typing against that
 * field. Listen & Select only ever compares English meanings, so it can use every sentence.
 */
function useSession(mode: 'select' | 'dictation') {
  return useMemo(
    () => shuffle(mode === 'dictation' ? buildDictationPool() : buildListeningPool()).slice(0, SESSION_SIZE),
    [mode],
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
}

function AutoPlayToggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-brand-600 w-3.5 h-3.5" />
      Auto-play
    </label>
  );
}

function PlaybackError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
      <AlertTriangle size={14} aria-hidden="true" /> {message}
    </p>
  );
}

function SessionScoreReadout({ correctCount }: { correctCount: number }) {
  const xpSoFar = correctCount * XP_RULES.quizCorrectAnswer;
  return (
    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
      Score: <span className="text-slate-600 dark:text-slate-300">{xpSoFar} XP</span>
    </p>
  );
}

function ListenSelect({ speed, voiceMode, playbackAvailable, level, autoPlay, onAutoPlayChange, onRestart }: ModeProps) {
  const pool = useMemo(() => buildListeningPool(), []);
  const session = useSession('select');
  const { state, play } = useTtsPlayer(voiceMode);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const recordedRef = useRef(false);

  const done = index >= session.length;
  const item = done ? null : session[index];
  const options = useMemo(() => (item ? buildOptions(item, pool) : []), [item, pool]);

  useEffect(() => {
    if (done && !recordedRef.current) {
      recordedRef.current = true;
      recordQuizResult({ quizId: 'listening-select', skill: 'listening', level, correct: correctCount, total: session.length });
    }
  }, [done, correctCount, level, session.length]);

  useEffect(() => {
    if (autoPlay && item && playbackAvailable) play(item.japanese, speed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, autoPlay]);

  if (done || !item) {
    return <SessionComplete correct={correctCount} total={session.length} onRestart={onRestart} />;
  }

  const answered = selected !== null;
  const isCorrect = answered && selected === item.en;

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
  };

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-5 items-start">
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-400">
            Item {index + 1} of {session.length}
          </p>
          <SessionScoreReadout correctCount={correctCount} />
        </div>

        <div className="flex flex-col items-center gap-2 py-2">
          <BigPlayButton onClick={() => play(item.japanese, speed)} playbackAvailable={playbackAvailable} status={state.status} />
          <AutoPlayToggle checked={autoPlay} onChange={onAutoPlayChange} />
        </div>
        {state.status === 'error' && <PlaybackError message={state.errorMessage} />}

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

        {answered && (
          <div>
            <div role="status">
              <p className={`text-sm font-medium ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isCorrect ? 'Correct!' : `Not quite — the answer was "${item.en}".`}
              </p>
              <p className="jp-text text-slate-500 dark:text-slate-400 text-sm mt-1">{item.japanese}</p>
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

function Dictation({ speed, voiceMode, playbackAvailable, level, autoPlay, onAutoPlayChange, onRestart }: ModeProps) {
  const session = useSession('dictation');
  const { state, play } = useTtsPlayer(voiceMode);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const recordedRef = useRef(false);
  const done = index >= session.length;

  useEffect(() => {
    if (done && !recordedRef.current) {
      recordedRef.current = true;
      recordQuizResult({ quizId: 'listening-dictation', skill: 'listening', level, correct: correctCount, total: session.length });
    }
  }, [done, correctCount, level, session.length]);

  useEffect(() => {
    if (autoPlay && !done && playbackAvailable) play(session[index].japanese, speed);
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
  }

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-5 items-start">
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-400">
            Item {index + 1} of {session.length}
          </p>
          <SessionScoreReadout correctCount={correctCount} />
        </div>

        <div className="flex flex-col items-center gap-2 py-2">
          <BigPlayButton onClick={() => play(item.japanese, speed)} playbackAvailable={playbackAvailable} status={state.status} />
          <AutoPlayToggle checked={autoPlay} onChange={onAutoPlayChange} />
        </div>
        {state.status === 'error' && <PlaybackError message={state.errorMessage} />}

        <div>
          <label htmlFor="dictation-input" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            Type what you heard — romaji or kana
          </label>
          <input
            id="dictation-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={checked}
            placeholder="e.g. Nihon ni ikitai desu"
            /* A phone keyboard would otherwise capitalise and autocorrect romaji into English words, and
               spellcheck underlines every one of them as a misspelling. */
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={checked && !isCorrect}
            aria-describedby="dictation-feedback"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-100"
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
        </div>

        {!checked ? (
          <PrimaryButton onClick={submit} disabled={input.trim().length === 0}>
            Check
          </PrimaryButton>
        ) : (
          <div>
            {/* role="status" so the result is announced — it is the whole point of the exercise, and
                previously it appeared silently for anyone not watching this corner of the screen. */}
            <div id="dictation-feedback" role="status">
              <p className={`text-sm font-medium flex items-center gap-1.5 ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isCorrect ? <CheckCircle2 size={16} aria-hidden="true" /> : <XCircle size={16} aria-hidden="true" />}
                {isCorrect ? 'Correct!' : 'Not quite.'}
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
