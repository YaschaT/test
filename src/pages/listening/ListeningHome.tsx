import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, RotateCcw, Headphones, Target } from 'lucide-react';
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
import { buildListeningPool, normalizeForCompare, shuffle, type ListeningItem } from '../../lib/listeningPool';
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
        mascotSrc="/assets/dashboard/mascots/mascot-greeting.png"
        mascotWidth={84}
        mascotHeight={84}
        stats={[
          { icon: CheckCircle2, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-300', value: totalCorrect, label: 'Correct answers', helper: 'so far' },
          { icon: Headphones, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-300', value: totalAnswered, label: 'Items heard', helper: 'total' },
          { icon: Target, iconBg: 'bg-violet-500/20', iconColor: 'text-violet-300', value: accuracyPct, label: 'Accuracy', helper: 'correct', suffix: '%' },
        ]}
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

      {mode === 'select' ? (
        <ListenSelect
          key={`select-${sessionKey}-${voiceMode}`}
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
          key={`dictation-${sessionKey}-${voiceMode}`}
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

function useSession() {
  return useMemo(() => shuffle(buildListeningPool()).slice(0, SESSION_SIZE), []);
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
    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
      <AlertTriangle size={14} /> {message}
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
  const session = useSession();
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Which meaning did you hear?">
          {options.map((opt) => {
            const showCorrect = answered && opt === item.en;
            const showWrong = answered && opt === selected && opt !== item.en;
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={selected === opt}
                disabled={answered}
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
                {showCorrect && <CheckCircle2 size={16} />}
                {showWrong && <XCircle size={16} />}
              </button>
            );
          })}
        </div>

        {answered && (
          <div>
            <p className={`text-sm font-medium ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isCorrect ? 'Correct!' : 'Not quite.'}
            </p>
            <p className="jp-text text-slate-500 dark:text-slate-400 text-sm mt-1">{item.japanese}</p>
            <PrimaryButton onClick={next} className="mt-3">
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
  const session = useSession();
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
  const isCorrect = checked && normalizeForCompare(input) === normalizeForCompare(item.romaji);

  function submit() {
    if (checked) return;
    setChecked(true);
    if (normalizeForCompare(input) === normalizeForCompare(item.romaji)) {
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
            Type what you heard, in romaji
          </label>
          <input
            id="dictation-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={checked}
            placeholder="e.g. Nihon ni ikitai desu"
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
            <p className={`text-sm font-medium flex items-center gap-1.5 ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              {isCorrect ? 'Correct!' : 'Not quite.'}
            </p>
            <p className="jp-text text-slate-700 dark:text-slate-200 mt-1">{item.japanese}</p>
            <p className="text-sm text-brand-600 dark:text-brand-300">{item.romaji}</p>
            <PrimaryButton onClick={next} className="mt-3">
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
