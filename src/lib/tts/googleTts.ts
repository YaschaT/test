export interface GoogleTtsStatus {
  available: boolean;
  reason?: 'disabled' | 'missing_config' | 'error';
}

/** Asks our backend proxy whether Google Cloud TTS is usable — never talks to Google directly. */
export async function fetchGoogleTtsStatus(): Promise<GoogleTtsStatus> {
  try {
    const res = await fetch('/api/tts/status');
    if (!res.ok) return { available: false, reason: 'error' };
    return (await res.json()) as GoogleTtsStatus;
  } catch {
    return { available: false, reason: 'error' };
  }
}

// Session-lived cache of generated audio, keyed by text+rate, so repeated plays of the same
// sentence don't re-call the API. Cleared automatically on page reload (object URLs die with it).
const audioCache = new Map<string, string>();

function cacheKey(text: string, rate: number): string {
  return `${text}::${rate}`;
}

export class GoogleTtsError extends Error {}

export async function fetchGoogleTtsAudioUrl(text: string, rate: number): Promise<string> {
  const key = cacheKey(text, rate);
  const cached = audioCache.get(key);
  if (cached) return cached;

  const res = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, rate }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string; message?: string });
    const message =
      body.error === 'not_configured'
        ? 'Google Cloud TTS is not configured on this server.'
        : body.message || 'Failed to generate audio.';
    throw new GoogleTtsError(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  audioCache.set(key, url);
  return url;
}
