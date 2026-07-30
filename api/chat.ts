import { activeProvider, callProvider, COMPANION_SYSTEM, type ChatMessage } from './_ai.js';
import { getScenario } from '../src/data/scenarios.js';

interface ApiRequest {
  method?: string;
  body?: unknown;
}
interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
}

/** POST /api/chat { messages, scenarioId } → { reply } (Vercel serverless port of the local server). */
export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const provider = activeProvider();
  if (!provider) {
    res.status(503).json({ error: 'not_configured' });
    return;
  }

  const body = (req.body ?? {}) as { messages?: unknown; scenarioId?: unknown };
  const history: ChatMessage[] = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
  const messages = history
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }));

  // Providers expect the conversation to start with a user turn — drop leading assistant turns.
  while (messages.length > 0 && messages[0].role === 'assistant') messages.shift();
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    res.status(400).json({ error: 'bad_request', message: 'The last message must be from the learner.' });
    return;
  }

  // Role-play prompt is looked up server-side by id, so the client can't inject system text.
  const scenario = typeof body.scenarioId === 'string' ? getScenario(body.scenarioId) : undefined;
  const system = scenario?.systemAddon ? `${COMPANION_SYSTEM}\n\n${scenario.systemAddon}` : COMPANION_SYSTEM;

  try {
    const raw = await callProvider(provider, system, messages);
    let reply: { ja: string; kana?: string; romaji?: string; en?: string; feedback?: string };
    try {
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      reply = JSON.parse(start >= 0 && end > start ? raw.slice(start, end + 1) : raw);
    } catch {
      reply = { ja: raw, en: '' };
    }
    if (!reply.ja) reply.ja = raw;
    res.status(200).json({ reply });
  } catch {
    res.status(502).json({ error: 'request_failed' });
  }
}
