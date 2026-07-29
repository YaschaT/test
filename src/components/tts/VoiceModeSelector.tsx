import type { VoiceMode } from '../../lib/tts/ttsService';

interface VoiceModeSelectorProps {
  mode: VoiceMode;
  onChange: (mode: VoiceMode) => void;
  googleAvailable: boolean | null;
  neuralAvailable?: boolean | null;
}

const ACTIVE = 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300';
const IDLE = 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100';
const DISABLED = 'text-slate-300 dark:text-slate-600 cursor-not-allowed';

export function VoiceModeSelector({ mode, onChange, googleAvailable, neuralAvailable }: VoiceModeSelectorProps) {
  const googleDisabled = googleAvailable !== true;
  const neuralDisabled = neuralAvailable !== true;

  return (
    <div>
      <div role="radiogroup" aria-label="Voice provider" className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-1">
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'neural'}
          disabled={neuralDisabled}
          onClick={() => !neuralDisabled && onChange('neural')}
          title={neuralDisabled ? 'Install edge-tts on the server to enable the natural neural voice' : undefined}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'neural' ? ACTIVE : neuralDisabled ? DISABLED : IDLE
          }`}
        >
          Natural {neuralDisabled ? '(unavailable)' : '(neural)'}
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'browser'}
          onClick={() => onChange('browser')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${mode === 'browser' ? ACTIVE : IDLE}`}
        >
          Browser voice
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'google'}
          disabled={googleDisabled}
          onClick={() => !googleDisabled && onChange('google')}
          title={googleDisabled ? 'Requires Google Cloud TTS setup on the server — see README' : undefined}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'google' ? ACTIVE : googleDisabled ? DISABLED : IDLE
          }`}
        >
          Google Cloud {googleDisabled ? '(unavailable)' : ''}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-1.5 max-w-md">
        The natural (neural) voice uses free, lifelike Japanese voices (Azure "Nanami") when edge-tts is
        installed on the server. Otherwise Kotobox falls back to your browser's Japanese voice, or Google
        Cloud TTS if you've configured it.
      </p>
    </div>
  );
}
