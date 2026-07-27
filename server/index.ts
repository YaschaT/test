import 'dotenv/config';
import express from 'express';
import { isConfigPresent, readTtsConfig, synthesizeSpeech } from './googleTts.ts';
import { getScenario } from '../src/data/scenarios.ts';

const app = express();
app.use(express.json());

const PORT = Number(process.env.SERVER_PORT) || 5174;

app.get('/api/tts/status', (_req, res) => {
  const config = readTtsConfig();
  if (!config.enabled) {
    res.json({ available: false, reason: 'disabled' });
    return;
  }
  if (!isConfigPresent(config)) {
    res.json({ available: false, reason: 'missing_config' });
    return;
  }
  res.json({ available: true });
});

app.post('/api/tts', async (req, res) => {
  const config = readTtsConfig();
  if (!isConfigPresent(config)) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  const text = typeof req.body?.text === 'string' ? req.body.text : '';
  const rate = typeof req.body?.rate === 'number' ? req.body.rate : 1;
  if (!text.trim()) {
    res.status(400).json({ error: 'missing_text' });
    return;
  }

  try {
    const audio = await synthesizeSpeech({ text, rate }, config);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audio);
  } catch (err) {
    console.error('[tts] synthesis failed:', err instanceof Error ? err.message : err);
    res.status(502).json({ error: 'synthesis_failed', message: err instanceof Error ? err.message : 'Unknown error' });
  }
});

// ─── AI speaking companion (Anthropic Messages API, called server-side so the key stays secret) ───

const COMPANION_SYSTEM = `You are Kai, Kotobox's AI language companion — a calm, sharp, quietly encouraging conversational assistant (think a helpful AI copilot) who is also a patient Japanese tutor for a learner around JLPT N5–N4 (they may be reaching toward N3). Hold a natural, encouraging SPOKEN-style conversation in Japanese.

Rules:
- Reply in Japanese, kept SHORT (1–2 sentences) and simple for their level. Prefer common words and grammar they are likely to know.
- Always end with a light follow-up question so the conversation keeps going.
- If the learner made a mistake, offer a gentler/more natural version in the "feedback" field (in English), briefly and kindly. Never lecture; keep the chat flowing. If there is nothing to correct, use an empty string.
- Stay in the role of a friendly companion. Keep it positive and low-pressure.

Respond with ONLY a single JSON object and nothing else (no markdown fences):
{"ja": "<your Japanese reply>", "kana": "<full reading of ja in hiragana>", "romaji": "<romaji of ja>", "en": "<natural English translation of ja>", "feedback": "<short English tip, or empty string>"}`;

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type Provider = 'groq' | 'gemini' | 'ollama' | 'anthropic';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

/**
 * Which AI backend to use. `AI_PROVIDER` forces one; otherwise we auto-pick from whatever is set up:
 * Groq key → Gemini key → Anthropic key. Ollama (local) is only used when explicitly forced. Returns
 * null if nothing is configured.
 */
function activeProvider(): Provider | null {
  const forced = (process.env.AI_PROVIDER || '').trim().toLowerCase();
  if (forced === 'groq') return process.env.GROQ_API_KEY ? 'groq' : null;
  if (forced === 'gemini') return process.env.GEMINI_API_KEY ? 'gemini' : null;
  if (forced === 'anthropic') return process.env.ANTHROPIC_API_KEY ? 'anthropic' : null;
  if (forced === 'ollama') return 'ollama';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return null;
}

async function ollamaReachable(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1200);
    const r = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: ctrl.signal });
    clearTimeout(t);
    return r.ok;
  } catch {
    return false;
  }
}

async function isAiAvailable(): Promise<boolean> {
  const provider = activeProvider();
  if (!provider) return false;
  if (provider === 'ollama') return ollamaReachable();
  return true;
}

/** Each provider call returns the model's raw text (which we ask to be a JSON object). */
async function callGemini(system: string, messages: ChatMessage[]): Promise<string> {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const contents = messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: 500, responseMimeType: 'application/json' },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim();
}

async function callOllama(system: string, messages: ChatMessage[]): Promise<string> {
  const model = process.env.OLLAMA_MODEL || 'qwen2.5';
  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      format: 'json',
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!res.ok) throw new Error(`ollama ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { message?: { content?: string } };
  return (data.message?.content ?? '').trim();
}

async function callGroq(system: string, messages: ChatMessage[]): Promise<string> {
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!res.ok) throw new Error(`groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return (data.choices?.[0]?.message?.content ?? '').trim();
}

async function callAnthropic(system: string, messages: ChatMessage[]): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY as string,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model, max_tokens: 400, system, messages }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  return (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('').trim();
}

app.get('/api/chat/status', async (_req, res) => {
  res.json({ available: await isAiAvailable(), provider: activeProvider() });
});

app.post('/api/chat', async (req, res) => {
  const provider = activeProvider();
  if (!provider) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  const history: ChatMessage[] = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = history
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  // Providers expect the conversation to begin with a user turn — drop any leading assistant turns
  // (e.g. the companion's opening greeting, which is generated client-side).
  while (messages.length > 0 && messages[0].role === 'assistant') messages.shift();

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    res.status(400).json({ error: 'bad_request', message: 'The last message must be from the learner.' });
    return;
  }

  // Look up the role-play prompt by id (server-owned, so the client can't inject system text).
  const scenario = typeof req.body?.scenarioId === 'string' ? getScenario(req.body.scenarioId) : undefined;
  const system = scenario?.systemAddon ? `${COMPANION_SYSTEM}\n\n${scenario.systemAddon}` : COMPANION_SYSTEM;

  try {
    const raw =
      provider === 'groq'
        ? await callGroq(system, messages)
        : provider === 'gemini'
          ? await callGemini(system, messages)
          : provider === 'ollama'
            ? await callOllama(system, messages)
            : await callAnthropic(system, messages);

    // The model is asked for pure JSON; be defensive in case it wraps or adds stray text.
    let reply: { ja: string; kana?: string; romaji?: string; en?: string; feedback?: string };
    try {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      reply = JSON.parse(start >= 0 && end > start ? raw.slice(start, end + 1) : raw);
    } catch {
      reply = { ja: raw, en: '' };
    }
    if (!reply.ja) reply.ja = raw;

    res.json({ reply });
  } catch (err) {
    console.error(`[chat] ${provider} request failed:`, err instanceof Error ? err.message : err);
    res.status(502).json({ error: 'request_failed' });
  }
});

app.listen(PORT, () => {
  const config = readTtsConfig();
  const provider = activeProvider();
  console.log(`[server] listening on http://localhost:${PORT}`);
  console.log(`[server] Google Cloud TTS: ${config.enabled ? (isConfigPresent(config) ? 'configured' : 'enabled but missing project/credentials env vars') : 'disabled'}`);
  console.log(
    `[server] AI speaking companion: ${
      provider ? `using ${provider}${provider === 'ollama' ? ` (${OLLAMA_HOST}, model ${process.env.OLLAMA_MODEL || 'qwen2.5'})` : ''}` : 'not configured — set GROQ_API_KEY (free, no card), run Ollama, or set GEMINI_API_KEY / ANTHROPIC_API_KEY'
    }`,
  );
});
