import type { VoiceMode } from '../../lib/tts/ttsService';

interface VoiceModeSelectorProps {
  mode: VoiceMode;
  onChange: (mode: VoiceMode) => void;
  googleAvailable: boolean | null;
}

export function VoiceModeSelector({ mode, onChange, googleAvailable }: VoiceModeSelectorProps) {
  const googleDisabled = googleAvailable !== true;

  return (
    <div>
      <div role="radiogroup" aria-label="Voice provider" className="inline-flex rounded-xl border border-slate-200 dark:border-slate-800 p-1">
        <button
          type="button"
          role="radio"
          aria-checked={mode === 'browser'}
          onClick={() => onChange('browser')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            mode === 'browser'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
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
            mode === 'google'
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
              : googleDisabled
                ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          Natural voice {googleDisabled ? '(unavailable)' : '(Google Cloud)'}
        </button>
      </div>
      <p className="text-xs text-slate-400 mt-1.5 max-w-md">
        Natural voice uses Google Cloud Text-to-Speech when configured. Without it, Kotobox falls back
        to your browser's Japanese voice. Voice quality depends on the selected provider and available
        Japanese voices.
      </p>
    </div>
  );
}
