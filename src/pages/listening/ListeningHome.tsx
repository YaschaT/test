import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, ChevronDown, Gem, Settings2 } from 'lucide-react';
import { Card } from '../../components/Card';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { VoiceModeSelector } from '../../components/tts/VoiceModeSelector';
import { BrowserVoiceSelector } from '../../components/tts/BrowserVoiceSelector';
import { CategoryBanner } from '../../components/learning/CategoryBanner';
import { ListeningSession } from '../../components/listening/ListeningSession';
import { useJapaneseVoiceAvailable } from '../../lib/tts/browserTts';
import {
  getSavedVoiceMode,
  saveVoiceMode,
  useGoogleTtsAvailability,
  VOICE_MODE_LABEL,
  type VoiceMode,
} from '../../lib/tts/ttsService';
import { useNeuralTtsAvailability } from '../../lib/tts/neuralTts';
import { getAutoPlayEnabled, setAutoPlayEnabled } from '../../lib/listeningPrefs';
import { MODE_LABEL, type SessionMode } from '../../lib/listeningRounds';
import { useProgress } from '../../lib/progressStore';
import { calculateXp } from '../../lib/xp';
import { JLPT_LEVELS, type JlptLevel } from '../../types';

const SPEEDS = [0.75, 1, 1.25] as const;
const MODES: SessionMode[] = ['full', 'select', 'dictation'];

export function ListeningHome() {
  const progress = useProgress();
  const browserVoiceAvailable = useJapaneseVoiceAvailable();
  const googleAvailable = useGoogleTtsAvailability();
  const neuralAvailable = useNeuralTtsAvailability();
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(() => getSavedVoiceMode());
  const [mode, setMode] = useState<SessionMode>('full');
  const [speed, setSpeed] = useState<number>(1);
  const [autoPlay, setAutoPlay] = useState<boolean>(() => getAutoPlayEnabled());
  const [sessionKey, setSessionKey] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  // Which level's sentence pool to draw from. Seeded from the learner's own level, like every other
  // module page, but changeable — practising a level below your own is how listening gets fluent.
  const [level, setLevel] = useState<JlptLevel>(progress.level);
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

  const startSession = useCallback(() => {
    setSessionXp(0);
    setSessionKey((k) => k + 1);
  }, []);

  // The XP the learner has banked overall, and what this session has added to it so far. Both are the
  // real derived figures — the total is recomputed from recorded progress, and the session's share is the
  // answer XP already credited (the completion bonus lands at the end, and the results card names it).
  const totalXp = calculateXp(progress);

  return (
    // Column layout rather than `space-y`: the exercise below is the flexible part, so it takes the
    // height the header and controls don't use instead of leaving it empty under the card.
    <div className="flex flex-1 flex-col gap-6">
      <CategoryBanner
        category="listening"
        title="Listening"
        subtitle="Tune your ear, understand Japanese naturally."
        levels={
          <SegmentedTabs
            value={level}
            onChange={setLevel}
            variant="glass"
            size="sm"
            groupLabel="Listening level"
            options={JLPT_LEVELS.map((l) => ({ value: l, label: l }))}
          />
        }
        action={{
          label: 'Start session',
          onClick: () => {
            startSession();
            document.getElementById('listening-exercise')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          },
        }}
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

      <div id="listening-exercise" className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs
          value={mode}
          onChange={setMode}
          groupLabel="Session type"
          options={MODES.map((m) => ({ value: m, label: MODE_LABEL[m] }))}
        />

        <div className="flex flex-wrap items-center gap-3">
          <p className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[13px] font-bold text-slate-700 dark:border-hairline dark:bg-ink-900 dark:text-slate-200">
            <Gem size={13} className="text-brand-600 dark:text-iris-400" aria-hidden="true" />
            <span className="tabular-nums">{totalXp.toLocaleString('en-US')} XP</span>
            {sessionXp > 0 && (
              <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                +{sessionXp}
                <span className="sr-only"> earned this session</span>
              </span>
            )}
          </p>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Speed</span>
          <SegmentedTabs
            value={String(speed)}
            onChange={(v) => setSpeed(Number(v))}
            size="sm"
            groupLabel="Playback speed"
            options={SPEEDS.map((sp) => ({ value: String(sp), label: `${sp}x` }))}
          />
        </div>
      </div>

      {/* Keyed on the session type, the level and the restart counter — the first two choose which
          sentences and which formats the session is made of, so changing either genuinely is a new
          session. Voice and speed are not in the key: they're playback preferences, not part of what the
          session is, and keying on them meant that switching voice mid-session (the most likely reason
          anyone touches that control) silently threw the learner's answers away and restarted at item 1. */}
      <ListeningSession
        key={`${mode}-${level}-${sessionKey}`}
        mode={mode}
        level={level}
        speed={speed}
        voiceMode={activeVoiceMode}
        playbackAvailable={playbackAvailable}
        autoPlay={autoPlay}
        onAutoPlayChange={handleAutoPlayChange}
        onUseDeviceVoice={() => handleVoiceModeChange('browser')}
        onSessionXpChange={setSessionXp}
        onRestart={startSession}
      />

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
