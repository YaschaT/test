import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import {
  getSavedVoiceUri,
  resolveSelectedVoice,
  saveVoiceUri,
  speakJapaneseBrowser,
  useJapaneseVoices,
} from '../../lib/tts/browserTts';

const SAMPLE_PHRASE = 'こんにちは、よろしくお願いします。';

export function BrowserVoiceSelector() {
  const voices = useJapaneseVoices();
  const [selectedUri, setSelectedUri] = useState<string | null>(() => getSavedVoiceUri());

  if (voices.length === 0) {
    return (
      <p className="text-xs text-slate-400 max-w-md">
        No Japanese browser voice found on this device. Try Chrome or Edge, or install a Japanese voice
        pack in your system's text-to-speech settings.
      </p>
    );
  }

  const activeVoice = voices.find((v) => v.voiceURI === selectedUri) ?? resolveSelectedVoice(voices);

  function handleChange(uri: string) {
    setSelectedUri(uri);
    saveVoiceUri(uri);
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={activeVoice?.voiceURI ?? ''}
          onChange={(e) => handleChange(e.target.value)}
          aria-label="Browser voice"
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100"
        >
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => speakJapaneseBrowser(SAMPLE_PHRASE, 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Volume2 size={13} /> Test voice
        </button>
      </div>
      <p className="text-xs text-slate-400">
        Using: {activeVoice?.name ?? 'system default'}. Voice quality depends on your browser and
        installed system voices.
      </p>
    </div>
  );
}
