/** Natural neural Japanese voice (Azure "Nanami"/"Keita" via edge-tts on the server, free, no key).
 *  Falls back to the browser voice at the call site if this isn't available. */

export type NeuralVoice = 'ja-JP-NanamiNeural' | 'ja-JP-KeitaNeural';

export interface NeuralVoiceStatus {
  available: boolean;
  voices: NeuralVoice[];
  default: NeuralVoice;
}

export async function getNeuralTtsStatus(): Promise<NeuralVoiceStatus> {
  try {
    const res = await fetch('/api/tts/neural/status');
    if (!res.ok) return { available: false, voices: [], default: 'ja-JP-NanamiNeural' };
    return (await res.json()) as NeuralVoiceStatus;
  } catch {
    return { available: false, voices: [], default: 'ja-JP-NanamiNeural' };
  }
}

let audioEl: HTMLAudioElement | null = null;

/** Synthesises `text` on the server and plays it. Throws if the neural endpoint is unavailable. */
export async function playNeural(text: string, opts?: { rate?: number; voice?: NeuralVoice }): Promise<void> {
  const res = await fetch('/api/tts/neural', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, rate: opts?.rate ?? 1, voice: opts?.voice }),
  });
  if (!res.ok) throw new Error('neural_tts_failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  if (!audioEl) audioEl = new Audio();
  audioEl.pause();
  audioEl.src = url;
  audioEl.onended = () => URL.revokeObjectURL(url);
  await audioEl.play();
}

export function stopNeural(): void {
  audioEl?.pause();
}
