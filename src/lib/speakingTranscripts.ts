import { readStorage, writeStorage } from './storage';
import type { CompanionReply } from './aiCompanion';

/**
 * The actual conversations with Kai, kept on this device only.
 *
 * "Pick up where you stopped" is only true if the thread is still there when you come back, so the
 * transcript is stored rather than replayed from the opening line. It stays out of `progressStore`
 * (and so out of cloud sync) deliberately: what's *learned* — turns taken, scenarios finished — is
 * progress worth carrying between devices, but a chat log is bulky, personal, and meaningless on a
 * device that wasn't part of it. The synced session summary carries Kai's last line so the card still
 * reads correctly there; opening it simply starts the scenario fresh.
 */

const KEY = 'speaking-transcripts-v1';

export type StoredMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'companion'; reply: CompanionReply };

/** Enough to hold a full role-play several times over; caps what one runaway thread can occupy. */
const MAX_MESSAGES = 60;

type Transcripts = Record<string, StoredMessage[]>;

function all(): Transcripts {
  return readStorage<Transcripts>(KEY, {});
}

export function loadTranscript(scenarioId: string): StoredMessage[] {
  const stored = all()[scenarioId];
  return Array.isArray(stored) ? stored : [];
}

export function saveTranscript(scenarioId: string, messages: StoredMessage[]): void {
  // Trimmed from the front: the opening line is cheap to lose, the last exchanges are the context you
  // come back for.
  writeStorage(KEY, { ...all(), [scenarioId]: messages.slice(-MAX_MESSAGES) });
}

export function clearTranscript(scenarioId: string): void {
  const transcripts = all();
  delete transcripts[scenarioId];
  writeStorage(KEY, transcripts);
}
