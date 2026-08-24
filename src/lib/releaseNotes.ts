import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { readStorage, writeStorage } from './storage';
import { LATEST_RELEASE_ID, RELEASES, type Release } from '../data/releases';
import type { ProgressState } from './progressStore';

/**
 * Two markers, not one — this is the whole design.
 *
 * `ANNOUNCED_KEY` records that the release has had its moment on screen, so it is never shown twice.
 * `SEEN_KEY` records that the learner actually engaged with it, and that is a much higher bar: opening
 * the full panel, or following the release's own call to action. Closing a dialog with Escape or a click
 * on the backdrop is not engagement — people dismiss modals reflexively, before reading — so it stops the
 * announcement without clearing the quiet trace that keeps the opportunity alive.
 *
 * The cost of keeping a dot the learner has already mentally filed is one small dot. The cost of clearing
 * it wrongly is that the release is gone for good. The asymmetry is why closing is not acknowledging.
 */
const SEEN_KEY = 'release-seen';
const ANNOUNCED_KEY = 'release-announced';
const VISITED_KEY = 'release-visited';

export function getSeenReleaseId(): string | null {
  return readStorage<string | null>(SEEN_KEY, null);
}

export function getAnnouncedReleaseId(): string | null {
  return readStorage<string | null>(ANNOUNCED_KEY, null);
}

/**
 * Nav path → the release that was current the last time the learner opened that section.
 *
 * Held in a module store rather than component state because it is written from a route-change effect:
 * an external system (storage) being synced, with `useSyncExternalStore` doing the re-render, which is
 * the shape React actually wants for this.
 */
let visitedCache: Record<string, string> | null = null;
const visitedListeners = new Set<() => void>();

export function getVisitedSections(): Record<string, string> {
  if (visitedCache === null) visitedCache = readStorage<Record<string, string>>(VISITED_KEY, {});
  return visitedCache;
}

/** Records that a section has been opened, clearing its badge. No-op once it is already current. */
export function recordSectionVisit(path: string): void {
  const current = getVisitedSections();
  if (current[path] === LATEST_RELEASE_ID) return;
  visitedCache = { ...current, [path]: LATEST_RELEASE_ID };
  writeStorage(VISITED_KEY, visitedCache);
  visitedListeners.forEach((listener) => listener());
}

export function subscribeVisitedSections(listener: () => void): () => void {
  visitedListeners.add(listener);
  return () => visitedListeners.delete(listener);
}

/** Test seam — the module cache would otherwise leak between cases. */
export function resetVisitedSections(): void {
  visitedCache = null;
  visitedListeners.forEach((listener) => listener());
}

/**
 * Whether this device has any study history at all.
 *
 * It is what separates the two people who both arrive with no markers: someone who has been using
 * Kotobox since before release notes existed (and genuinely has catching up to do) from someone opening
 * the app for the very first time (who does not).
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

/**
 * The nav paths that should wear a "New" badge: sections a release changed that the learner has not
 * opened since. Each section carries its own marker, so visiting Kanji clears Kanji without quietly
 * clearing Grammar too.
 */
export function sectionsWithNews(
  visited: Record<string, string>,
  returning: boolean,
): Set<string> {
  const paths = new Set<string>();
  for (const release of RELEASES) {
    for (const path of release.sections ?? []) {
      if (paths.has(path)) continue;
      const pending = unseenReleases(visited[path] ?? null, returning);
      if (pending.some((r) => r.sections?.includes(path))) paths.add(path);
    }
  }
  return paths;
}

/* ------------------------------------------------------------------------------------------------
 * The study moment
 *
 * A release note lands badly at app open: the learner arrived with an intention — do my reviews, finish
 * a lesson — and the announcement competes with it and loses. It lands well just after they finish
 * something, when that intention is spent. The completion screens report reaching that point; the
 * announcement then waits until the learner navigates away from the screen that reported it, so it
 * never stacks on top of a session summary that is itself worth reading.
 *
 * Session-scoped on purpose: it lives in module state and resets on reload, because "just finished
 * studying" is not a fact worth persisting past the tab.
 * ---------------------------------------------------------------------------------------------- */

let studyMomentPath: string | null = null;
const momentListeners = new Set<() => void>();

/**
 * Called by a session-completion screen. The first one in a session wins, and it remembers which screen
 * reported it so the announcement can wait until the learner has moved on from it.
 */
export function markStudyMoment(path?: string): void {
  if (studyMomentPath !== null) return;
  studyMomentPath = path ?? (typeof window === 'undefined' ? '/' : window.location.pathname);
  momentListeners.forEach((listener) => listener());
}

export function getStudyMomentPath(): string | null {
  return studyMomentPath;
}

export function subscribeStudyMoment(listener: () => void): () => void {
  momentListeners.add(listener);
  return () => momentListeners.delete(listener);
}

/** Test seam — the module store would otherwise leak between cases. */
export function resetStudyMoment(): void {
  studyMomentPath = null;
  momentListeners.forEach((listener) => listener());
}

export interface ReleaseNotesState {
  /** Releases the learner has not acknowledged, newest first. Drives the dot. */
  unseen: Release[];
  /** The release to put on screen right now, or null. */
  announce: Release | null;
  /** Nav paths that should show a "New" badge. */
  sectionBadges: Set<string>;
  /** The announcement had its moment: stop showing it, but leave the dot alone. */
  markAnnounced: () => void;
  /** The learner genuinely engaged — clears the dot and the announcement together. */
  markAcknowledged: () => void;
}

/**
 * What to tell the learner about what has shipped, and when.
 *
 * A first-ever visit records the latest release silently instead of announcing it — someone who has
 * never used the app has nothing to catch up on, and opening on a changelog would be a strange first
 * impression.
 */
export function useReleaseNotes(returning: boolean, currentPath: string): ReleaseNotesState {
  // Frozen at mount on purpose: the question is "had this learner used Kotobox when the app opened",
  // and letting it flip mid-session would pop a release note the moment someone finished their very
  // first lesson.
  const [returningAtMount] = useState(returning);
  const [seen, setSeen] = useState<string | null>(() => getSeenReleaseId());
  const [announced, setAnnounced] = useState<string | null>(() => getAnnouncedReleaseId());
  const visited = useSyncExternalStore(
    subscribeVisitedSections,
    getVisitedSections,
    getVisitedSections,
  );

  const momentPath = useSyncExternalStore(subscribeStudyMoment, getStudyMomentPath, () => null);

  // Records the latest release for a brand-new device so it is not announced on their second visit.
  // Storage only — there is nothing to re-render, since a new learner is shown nothing either way.
  useEffect(() => {
    if (seen !== null || returningAtMount) return;
    writeStorage(SEEN_KEY, LATEST_RELEASE_ID);
    writeStorage(ANNOUNCED_KEY, LATEST_RELEASE_ID);
  }, [seen, returningAtMount]);

  const markAnnounced = useCallback(() => {
    writeStorage(ANNOUNCED_KEY, LATEST_RELEASE_ID);
    setAnnounced(LATEST_RELEASE_ID);
  }, []);

  const markAcknowledged = useCallback(() => {
    writeStorage(SEEN_KEY, LATEST_RELEASE_ID);
    writeStorage(ANNOUNCED_KEY, LATEST_RELEASE_ID);
    setSeen(LATEST_RELEASE_ID);
    setAnnounced(LATEST_RELEASE_ID);
  }, []);

  const unseen = unseenReleases(seen, returningAtMount);
  const candidate = unseen[0] ?? null;

  const announce =
    candidate !== null &&
    candidate.tier !== 'patch' && // a patch is the dot and nothing else
    announced !== LATEST_RELEASE_ID && // it has already had its moment
    momentPath !== null && // the learner has finished something
    currentPath !== momentPath // ...and moved on from the screen that said so
      ? candidate
      : null;

  return {
    unseen,
    announce,
    sectionBadges: sectionsWithNews(visited, returningAtMount),
    markAnnounced,
    markAcknowledged,
  };
}
