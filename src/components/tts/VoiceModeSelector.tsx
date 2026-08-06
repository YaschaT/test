import { SegmentedTabs } from '../SegmentedTabs';
import { VOICE_MODE_DESCRIPTION, VOICE_MODE_LABEL, type VoiceMode } from '../../lib/tts/ttsService';

interface VoiceModeSelectorProps {
  mode: VoiceMode;
  onChange: (mode: VoiceMode) => void;
  googleAvailable: boolean | null;
  neuralAvailable?: boolean | null;
}

/**
 * Picks which voice reads the sentences.
 *
 * Only voices that actually work are offered. Previously the unconfigured ones were rendered greyed out
 * and captioned with server details — "edge-tts installed on the server", Azure "Nanami", "Google Cloud
 * TTS if you've configured it" — none of which a learner can act on, and all of which made the product
 * look half-finished. A choice nobody can make is not a choice worth showing.
 */
export function VoiceModeSelector({ mode, onChange, googleAvailable, neuralAvailable }: VoiceModeSelectorProps) {
  // The device voice is always listed: it needs no server, and when the device has no Japanese voice the
  // page already carries a dedicated card explaining how to install one.
  const modes: VoiceMode[] = [
    ...(neuralAvailable === true ? (['neural'] as const) : []),
    'browser',
    ...(googleAvailable === true ? (['google'] as const) : []),
  ];

  return (
    <div className="space-y-2">
      {modes.length > 1 && (
        <SegmentedTabs
          value={mode}
          onChange={onChange}
          size="sm"
          groupLabel="Voice"
          options={modes.map((m) => ({ value: m, label: VOICE_MODE_LABEL[m] }))}
        />
      )}
      <p className="max-w-md text-xs text-slate-600 dark:text-slate-300">{VOICE_MODE_DESCRIPTION[mode]}</p>
    </div>
  );
}
