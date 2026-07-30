/**
 * Shared AI-provider logic for the Vercel serverless speaking companion (`/api/chat`).
 * Fetch-based providers only (Groq / Gemini / Anthropic) — the local-only bits from `server/`
 * (Ollama, pykakasi furigana, edge-tts neural voice) can't run on Vercel's serverless runtime, so
 * on the deployed site the reply is ja + en (+ feedback); the browser handles pronunciation via
 * Web-Speech TTS. Keys are read from Vercel environment variables and never reach the browser.
 */
export type Provider = 'groq' | 'gemini' | 'anthropic';
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const COMPANION_SYSTEM = `You are Kai, a friendly Japanese conversation tutor for a JLPT N5–N4 learner.
- Reply in natural Japanese: ONE short, simple sentence, then a short follow-up question. Use only common words/grammar for their level.
- Write the "ja" field in Japanese only — never put English or roman letters inside it.
- "en" must be an accurate, natural English translation of your "ja".
- If the learner made a real mistake, add a short, kind English tip in "feedback"; otherwise use "".
Reply with ONLY this JSON, nothing else (no markdown): {"ja":"<Japanese reply>","en":"<English translation of ja>","feedback":"<short English tip or empty>"}`;

/** Which backend to use. `AI_PROVIDER` forces one; otherwise auto-pick from whatever key is set. */
export function activeProvider(): Provider | null {
  const forced = (process.env.AI_PROVIDER || '').trim().toLowerCase();
  if (forced === 'groq') return process.env.GROQ_API_KEY ? 'groq' : null;
  if (forced === 'gemini') return process.env.GEMINI_API_KEY ? 'gemini' : null;
  if (forced === 'anthropic') return process.env.ANTHROPIC_API_KEY ? 'anthropic' : null;
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return null;
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

async function callGemini(system: string, messages: ChatMessage[]): Promise<string> {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
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
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return (data.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim();
}

async function callAnthropic(system: string, messages: ChatMessage[]): Promise<string> {
  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ model, max_tokens: 400, system, messages }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  return (data.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('').trim();
}

export function callProvider(provider: Provider, system: string, messages: ChatMessage[]): Promise<string> {
  if (provider === 'groq') return callGroq(system, messages);
  if (provider === 'gemini') return callGemini(system, messages);
  return callAnthropic(system, messages);
}
