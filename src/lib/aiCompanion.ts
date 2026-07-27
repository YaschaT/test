/** Client for the server-side AI speaking companion (`/api/chat`). The Anthropic key lives only on
 *  the server, so the browser only ever talks to our own endpoint. */

export interface CompanionReply {
  ja: string;
  kana?: string;
  romaji?: string;
  en?: string;
  feedback?: string;
}

export type ChatRole = 'user' | 'assistant';
export interface ChatTurn {
  role: ChatRole;
  content: string;
}

export async function getCompanionStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/chat/status');
    if (!res.ok) return false;
    const data = (await res.json()) as { available?: boolean };
    return data.available === true;
  } catch {
    return false;
  }
}

export class CompanionError extends Error {}

export async function sendCompanionMessage(messages: ChatTurn[], scenarioId?: string): Promise<CompanionReply> {
  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages, scenarioId }),
    });
  } catch {
    throw new CompanionError('Could not reach the companion. Is the server running?');
  }

  if (res.status === 503) throw new CompanionError('not_configured');
  if (!res.ok) throw new CompanionError('The companion had trouble replying. Please try again.');

  const data = (await res.json()) as { reply?: CompanionReply };
  if (!data.reply?.ja) throw new CompanionError('The companion sent an empty reply. Please try again.');
  return data.reply;
}
