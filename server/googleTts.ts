/**
 * Thin wrapper around Google Cloud Text-to-Speech. Deliberately isolated from the Express route
 * so swapping providers later only means replacing this file, not the API surface.
 */
import 'dotenv/config';

export interface TtsConfig {
  enabled: boolean;
  projectId?: string;
  credentialsPath?: string;
  languageCode: string;
  voiceName?: string;
}

export function readTtsConfig(): TtsConfig {
  return {
    enabled: process.env.GOOGLE_CLOUD_TTS_ENABLED === 'true',
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || undefined,
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined,
    languageCode: process.env.GOOGLE_CLOUD_TTS_LANGUAGE_CODE || 'ja-JP',
    voiceName: process.env.GOOGLE_CLOUD_TTS_VOICE_NAME || undefined,
  };
}

/** Config is "present" (worth attempting) without guaranteeing the credentials actually work — that's only known once a real call is made. */
export function isConfigPresent(config: TtsConfig): boolean {
  return config.enabled && Boolean(config.projectId) && Boolean(config.credentialsPath);
}

export interface SynthesizeParams {
  text: string;
  rate: number;
}

let cachedClient: import('@google-cloud/text-to-speech').TextToSpeechClient | null = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
  cachedClient = new TextToSpeechClient();
  return cachedClient;
}

export async function synthesizeSpeech(params: SynthesizeParams, config: TtsConfig): Promise<Buffer> {
  const client = await getClient();
  const [response] = await client.synthesizeSpeech({
    input: { text: params.text },
    voice: {
      languageCode: config.languageCode,
      name: config.voiceName,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: params.rate,
    },
  });
  if (!response.audioContent) {
    throw new Error('Google Cloud TTS returned no audio content');
  }
  return Buffer.from(response.audioContent as Uint8Array);
}
