import { READINGS } from '../data/readings';
import type { ProgressState } from './progressStore';
import type { JlptLevel, ReadingPassage } from '../types';

/**
 * Selectors that turn raw reading state (`readingPositions` + `completedReadingIds`) into the two
 * things the library page asks for: how far through each book you are, and which book to put behind
 * the big "Continue reading" button.
 *
 * Kept out of progressStore because these need the book data itself, and the store deliberately knows
 * nothing about content.
 */

/** How far through a book the reader is, 0..1. A book marked read is 1 regardless of position. */
export function bookPercent(progress: ProgressState, passage: ReadingPassage): number {
  if (progress.completedReadingIds.includes(passage.id)) return 1;
  const position = progress.readingPositions[passage.id];
  if (!position || position.totalSentences <= 0) return 0;
  return Math.min(1, position.sentencesRead / position.totalSentences);
}

/** True once a book has been opened and at least one sentence reached, but isn't finished. */
export function isInProgress(progress: ProgressState, passage: ReadingPassage): boolean {
  const percent = bookPercent(progress, passage);
  return percent > 0 && percent < 1;
}

/**
 * The sentence index to scroll to when re-opening a book — one before the high-water mark, so the
 * reader lands on a line they've already seen and has some context instead of a cold start.
 */
export function resumeSentenceIndex(progress: ProgressState, passage: ReadingPassage): number {
  const position = progress.readingPositions[passage.id];
  if (!position) return 0;
  if (position.sentencesRead >= passage.sentences.length) return 0;
  return Math.max(0, position.sentencesRead - 1);
}

export interface ReadingPick {
  passage: ReadingPassage;
  /** `resume` — a book already underway. `start` — nothing underway, so this is a suggestion. */
  kind: 'resume' | 'start';
  /** 0..1, always 0 for a `start` pick. */
  percent: number;
}

/**
 * What the hero offers next.
 *
 * A book left half-finished always wins (most recently opened first) — that's the one the reader has
 * a thread to pick back up. With nothing underway it falls back to a *suggestion*: the shortest
 * unread book at their JLPT level, or anywhere in the library once that level is exhausted. The two
 * cases are labelled differently on screen, so a suggestion is never dressed up as resumed progress.
 */
export function pickNextRead(progress: ProgressState, level: JlptLevel): ReadingPick | undefined {
  const started = READINGS.filter((passage) => isInProgress(progress, passage)).sort(
    (a, b) =>
      (progress.readingPositions[b.id]?.lastReadAt ?? '').localeCompare(
        progress.readingPositions[a.id]?.lastReadAt ?? '',
      ),
  );
  if (started.length > 0) {
    return { passage: started[0], kind: 'resume', percent: bookPercent(progress, started[0]) };
  }

  const unread = READINGS.filter((passage) => !progress.completedReadingIds.includes(passage.id));
  const shortestFirst = (a: ReadingPassage, b: ReadingPassage) =>
    a.tadokuLevel - b.tadokuLevel || a.wordCount - b.wordCount;
  const atLevel = unread.filter((passage) => passage.level === level).sort(shortestFirst);
  const suggestion = atLevel[0] ?? [...unread].sort(shortestFirst)[0];
  return suggestion ? { passage: suggestion, kind: 'start', percent: 0 } : undefined;
}
