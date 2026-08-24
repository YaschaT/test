import { beforeEach, describe, expect, it } from 'vitest';
import {
  getStudyMomentPath,
  hasPriorActivity,
  markStudyMoment,
  resetStudyMoment,
  sectionsWithNews,
  unseenReleases,
} from './releaseNotes';
import { LATEST_RELEASE_ID, RELEASES, releaseDateLabel } from '../data/releases';
import { NAV_ITEMS } from './nav';
import { createInitialSrsCard } from './srs';
import type { ProgressState } from './progressStore';

function progress(over: Partial<ProgressState> = {}): ProgressState {
  return {
    level: 'N5',
    streak: { current: 0, longest: 0, lastStudyDate: null },
    minutesByDate: {},
    srsCards: {},
    completedGrammarIds: [],
    learnedKanjiIds: [],
    completedReadingIds: [],
    readingPositions: {},
    readingWordsByDate: {},
    speakingSessions: {},
    phraseScores: {},
    speakingTurnsByDate: {},
    quizResults: [],
    weeklyCheckpoints: {},
    mockExams: {},
    session: null,
    ...over,
  };
}

describe('unseenReleases', () => {
  it('shows a brand-new learner nothing at all', () => {
    expect(unseenReleases(null, false)).toEqual([]);
  });

  it('shows a learner who predates release notes only the newest one, not the whole history', () => {
    const unseen = unseenReleases(null, true);
    expect(unseen).toHaveLength(1);
    expect(unseen[0].id).toBe(LATEST_RELEASE_ID);
  });

  it('says nothing once everything has been seen', () => {
    expect(unseenReleases(LATEST_RELEASE_ID, true)).toEqual([]);
  });

  it('returns exactly the releases published since the marker, newest first', () => {
    const unseen = unseenReleases(RELEASES[2].id, true);
    expect(unseen.map((r) => r.id)).toEqual([RELEASES[0].id, RELEASES[1].id]);
  });

  it('treats a marker that no longer matches a release as caught up', () => {
    expect(unseenReleases('1999-01-01', true)).toEqual([]);
  });
});

describe('hasPriorActivity', () => {
  it('is false on a device that has never studied', () => {
    expect(hasPriorActivity(progress())).toBe(false);
  });

  it.each([
    ['a finished grammar point', { completedGrammarIds: ['desu'] }],
    ['a learned kanji', { learnedKanjiIds: ['k-sei-world'] }],
    ['a finished reading', { completedReadingIds: ['r-ryuugaku'] }],
    ['an SRS card', { srsCards: { 'vocabulary:v-sekai': createInitialSrsCard('v-sekai', 'vocabulary') } }],
    ['a recorded streak', { streak: { current: 1, longest: 1, lastStudyDate: '2026-08-24' } }],
  ])('is true from %s alone', (_label, over) => {
    expect(hasPriorActivity(progress(over as Partial<ProgressState>))).toBe(true);
  });
});

describe('the release list itself', () => {
  it('is ordered newest first, with unique ids', () => {
    const ids = RELEASES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort().reverse()).toEqual(ids);
    expect(LATEST_RELEASE_ID).toBe(ids[0]);
  });

  it('says everything in both languages, and never announces an empty release', () => {
    for (const release of RELEASES) {
      expect(release.title.en.length, release.id).toBeGreaterThan(0);
      expect(release.title.nl.length, release.id).toBeGreaterThan(0);
      expect(release.changes.length, release.id).toBeGreaterThan(0);
      for (const change of release.changes) {
        expect(change.text.en.length, release.id).toBeGreaterThan(0);
        expect(change.text.nl.length, release.id).toBeGreaterThan(0);
      }
      if (release.cta) {
        expect(release.cta.label.en.length).toBeGreaterThan(0);
        expect(release.cta.label.nl.length).toBeGreaterThan(0);
      }
    }
  });

  it('only ever links somewhere the app can actually go', () => {
    const routes = ['/dashboard', '/path', '/grammar', '/vocabulary', '/kanji', '/reading', '/listening', '/speaking', '/mock'];
    for (const release of RELEASES) {
      if (!release.cta) continue;
      expect(routes, `${release.id} links to ${release.cta.to}`).toContain(release.cta.to);
    }
  });

  it('reserves the interrupting dialog for major releases', () => {
    expect(RELEASES.filter((r) => r.tier === 'major').length).toBeLessThanOrEqual(1);
  });
});

describe('releaseDateLabel', () => {
  it('reads as a date a person would say', () => {
    expect(releaseDateLabel('2026-08-24')).toBe('24 August 2026');
    expect(releaseDateLabel('2026-07-26')).toBe('26 July 2026');
  });
});

describe('sectionsWithNews', () => {
  const latest = RELEASES[0];

  it('badges the sections the newest release actually touched, and no others', () => {
    const badges = sectionsWithNews({}, true);
    expect([...badges].sort()).toEqual([...(latest.sections ?? [])].sort());
  });

  it('badges nothing for someone who has never used the app', () => {
    expect(sectionsWithNews({}, false).size).toBe(0);
  });

  it('clears a badge once that section has been opened, and leaves the others alone', () => {
    const path = (latest.sections ?? [])[0];
    const badges = sectionsWithNews({ [path]: LATEST_RELEASE_ID }, true);
    expect(badges.has(path)).toBe(false);
    for (const other of (latest.sections ?? []).slice(1)) {
      expect(badges.has(other), `${other} should still be badged`).toBe(true);
    }
  });

  it('only ever names a section the sidebar actually has', () => {
    const navPaths = NAV_ITEMS.map((item) => item.path);
    for (const release of RELEASES) {
      for (const path of release.sections ?? []) {
        expect(navPaths, `${release.id} points at ${path}`).toContain(path);
      }
    }
  });
});

describe('the study moment', () => {
  beforeEach(resetStudyMoment);

  it('starts unset — a fresh session has not finished anything yet', () => {
    expect(getStudyMomentPath()).toBeNull();
  });

  it('remembers the screen that reported it', () => {
    markStudyMoment('/vocabulary/review');
    expect(getStudyMomentPath()).toBe('/vocabulary/review');
  });

  it('keeps the first one: finishing a second session does not move the goalposts', () => {
    markStudyMoment('/vocabulary/review');
    markStudyMoment('/kanji/review');
    expect(getStudyMomentPath()).toBe('/vocabulary/review');
  });
});
