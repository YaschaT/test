/**
 * On-device AI fallback for Kai: runs a small LLM entirely in the browser via WebGPU (WebLLM), so the
 * speaking companion works on the deployed site with **no API key and no server** — private, free, and
 * offline after the one-time model download. Used automatically when no cloud provider key is set.
 *
 * The model + runtime are loaded via dynamic import, so WebLLM (large) becomes its own lazy chunk and
 * never touches the main bundle or any other page. The first load downloads the weights (~1 GB) and
 * caches them in the browser; later sessions start from cache.
 */
import type { CompanionReply, ChatTurn } from './aiCompanion';

// q4f16 is ~1.1 GB and needs GPU shader-f16 support; q4f32 is the broader-compatibility fallback.
const PRIMARY_MODEL = 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
const FALLBACK_MODEL = 'Qwen2.5-1.5B-Instruct-q4f32_1-MLC';

export interface LoadProgress {
  /** 0..1 overall download/compile progress. */
  progress: number;
  /** Human-readable status from WebLLM (e.g. "Loading model from cache[12/24]…"). */
  text: string;
}

// Minimal shape we use from WebLLM, so we don't hard-depend on its types in the main bundle.
interface MlcEngine {
  chat: {
    completions: {
      create(opts: {
        messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
        max_tokens?: number;
        temperature?: number;
        response_format?: { type: 'json_object' };
      }): Promise<{ choices: { message: { content: string | null } }[] }>;
    };
  };
}

/** True when the browser exposes WebGPU (required to run the on-device model). */
export function isWebGpuAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator && !!(navigator as { gpu?: unknown }).gpu;
}

let enginePromise: Promise<MlcEngine> | null = null;
let loadedModel: string | null = null;

async function createEngine(model: string, onProgress?: (p: LoadProgress) => void): Promise<MlcEngine> {
  const webllm = await import('@mlc-ai/web-llm');
  const engine = await webllm.CreateMLCEngine(model, {
    initProgressCallback: (r: { progress: number; text: string }) => onProgress?.({ progress: r.progress, text: r.text }),
  });
  loadedModel = model;
  return engine as unknown as MlcEngine;
}

/**
 * Loads (or returns the cached) on-device engine. Tries the smaller f16 build first, then falls back to
 * the broadly-compatible f32 build if the GPU lacks shader-f16. Concurrent callers share one load.
 */
export function loadBrowserAi(onProgress?: (p: LoadProgress) => void): Promise<MlcEngine> {
  if (!enginePromise) {
    enginePromise = createEngine(PRIMARY_MODEL, onProgress).catch((err) => {
      // Retry once on the compatibility build; if that also fails, surface the error and allow a retry.
      const msg = String(err?.message ?? err);
      if (/f16|shader|feature/i.test(msg)) {
        return createEngine(FALLBACK_MODEL, onProgress).catch((err2) => {
          enginePromise = null;
          throw err2;
        });
      }
      enginePromise = null;
      throw err;
    });
  }
  return enginePromise;
}

/** Whether the engine has finished loading at least once this session. */
export function isBrowserAiReady(): boolean {
  return loadedModel !== null;
}

function parseReply(raw: string): CompanionReply {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  try {
    const obj = JSON.parse(start >= 0 && end > start ? raw.slice(start, end + 1) : raw) as CompanionReply;
    if (obj?.ja) return obj;
  } catch {
    /* fall through */
  }
  return { ja: raw.trim(), en: '' };
}

/**
 * Generates one Kai reply on-device. `system` is the base prompt (+ any scenario add-on); `messages` is
 * the conversation so far. Ensures the model is loaded first (callers should show download progress).
 */
export async function browserAiReply(system: string, messages: ChatTurn[], onProgress?: (p: LoadProgress) => void): Promise<CompanionReply> {
  const engine = await loadBrowserAi(onProgress);
  const completion = await engine.chat.completions.create({
    messages: [{ role: 'system', content: system }, ...messages.map((m) => ({ role: m.role, content: m.content }))],
    max_tokens: 400,
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  return parseReply(completion.choices[0]?.message?.content ?? '');
}
