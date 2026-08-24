import { useCallback, useEffect, useState } from 'react';
import { readStorage, writeStorage } from './storage';
import { LATEST_RELEASE_ID, RELEASES, type Release } from '../data/releases';
import type { ProgressState } from './progressStore';

const SEEN_KEY = 'release-seen';

export function getLastSeenReleaseId(): string | null {
  return readStorage<string | null>(SEEN_KEY, null);
}

export function setLastSeenReleaseId(id: string): void {
  writeStorage(SEEN_KEY, id);
}

/**
 * Whether this device has any study history at all.
 *
 * It is what separates the two people who both arrive with no "last seen" marker: someone who has been
 * using Kotobox since before release notes existed (and genuinely has catching up to do) from someone
 * opening the app for the very first time (who does not).
 */
export function hasPriorActivity(progress: ProgressState): boolean {
  return (
    progress.completedGrammarIds.length > 0 ||
    progress.learnedKanjiIds.length > 0 ||
    progress.completedReadingIds.length > 0 ||
    progress.quizResults.length > 0 ||
    Object.keys(progress.srsCards).length > 0 ||
    progress.streak.lastStudyDate !== null
  );
}

/**
 * Releases published since the learner last looked, newest first.
 *
 * With no marker at all, a returning learner is shown the newest release only — not the whole history,
 * which would be a wall of text about versions they have already been using. A marker that no longer
 * matches any release (an entry was renamed, or it predates the current list) counts as "seen
 * everything" rather than replaying that history at someone.
 */
export function unseenReleases(lastSeen: string | null, returning: boolean): Release[] {
  if (lastSeen === null) return returning ? RELEASES.slice(0, 1) : [];
  const index = RELEASES.findIndex((r) => r.id === lastSeen);
  return index === -1 ? [] : RELEASES.slice(0, index);
}

export interface ReleaseNotesState {
  /** Releases the learner has not been shown yet, newest first. */
  unseen: Release[];
  /** The one to announce — the newest unseen release, or null when there is nothing to say. */
  announce: Release | null;
  /** Marks everything up to the latest as seen: clears the dot and stops the announcement. */
  markAllSeen: () => void;
}

/**
 * What to tell the learner about what has shipped.
 *
 * A first-ever visit records the latest release silently instead of announcing it — someone who has
 * never used the app has nothing to catch up on, and opening on a changelog would be a strange first
 * impression.
 */
export function useReleaseNotes(returning: boolean): ReleaseNotesState {
  // Frozen at mount on purpose: the question is "had this learner used Kotobox when the app opened",
  // and letting it flip mid-session would pop a release note the moment someone finished their very
  // first lesson.
  const [returningAtMount] = useState(returning);
  const [lastSeen, setLastSeen] = useState<string | null>(() => getLastSeenReleaseId());

  // Records the latest release for a brand-new device so it is not announced on their second visit.
  // Storage only — there is nothing to re-render, since a new learner is shown nothing either way.
  useEffect(() => {
    if (lastSeen !== null || returningAtMount) return;
    setLastSeenReleaseId(LATEST_RELEASE_ID);
  }, [lastSeen, returningAtMount]);

  const markAllSeen = useCallback(() => {
    setLastSeenReleaseId(LATEST_RELEASE_ID);
    setLastSeen(LATEST_RELEASE_ID);
  }, []);

  const unseen = unseenReleases(lastSeen, returningAtMount);
  return { unseen, announce: unseen[0] ?? null, markAllSeen };
}
