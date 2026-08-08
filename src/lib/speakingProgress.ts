import { SCENARIOS, type Scenario } from '../data/scenarios';
import { PHRASES, type Phrase } from '../data/phrases';
import type { ProgressState, SpeakingSession } from './progressStore';
import type { JlptLevel } from '../types';
import { JLPT_LEVELS } from '../types';

/**
 * Selectors that turn stored speaking progress into the few things the Speaking page actually asks:
 * what to offer next, what was left half-finished, and which line is worth another go.
 *
 * Kept out of the components so "which scenario does Kai recommend" is one rule with one answer,
 * rather than a different one in the hero and the library grid.
 */

export interface NextSpeak {
  scenario: Scenario;
  /** 'resume' picks up a half-finished role-play; 'start' offers a fresh one. */
  kind: 'resume' | 'start';
  session?: SpeakingSession;
}

/** A role-play the learner started and didn't finish, newest first. */
export interface OpenSession {
  scenario: Scenario;
  session: SpeakingSession;
}

export function listOpenSessions(progress: ProgressState): OpenSession[] {
  return SCENARIOS.map((scenario) => ({ scenario, session: progress.speakingSessions[scenario.id] }))
    .filter((entry): entry is OpenSession => Boolean(entry.session && entry.session.turns > 0 && !entry.session.completed))
    .sort((a, b) => b.session.updatedAt.localeCompare(a.session.updatedAt));
}

/**
 * Kai's pick.
 *
 * An unfinished conversation always wins — being handed a new role-play while one is sitting half-done
 * is how a speaking habit turns into a pile of abandoned openings. Otherwise it's the easiest thing at
 * the learner's own level they haven't played through yet, and once that level is exhausted, the
 * gentlest untried scenario anywhere.
 */
export function pickNextSpeak(progress: ProgressState, level: JlptLevel): NextSpeak | null {
  const [open] = listOpenSessions(progress);
  if (open) return { scenario: open.scenario, kind: 'resume', session: open.session };

  const unplayed = SCENARIOS.filter((s) => !progress.speakingSessions[s.id]?.completed);
  const byEase = (a: Scenario, b: Scenario) =>
    a.difficulty - b.difficulty || JLPT_LEVELS.indexOf(a.level) - JLPT_LEVELS.indexOf(b.level);

  const atLevel = unplayed.filter((s) => s.level === level).sort(byEase);
  const anywhere = [...unplayed].sort(byEase);
  const scenario = atLevel[0] ?? anywhere[0] ?? SCENARIOS[0];
  return scenario ? { scenario, kind: 'start' } : null;
}

/**
 * The Speaking page's headline numbers: how many role-plays the learner has actually spoken in, and how
 * many they played through. A scenario opened and abandoned before saying anything isn't a conversation.
 */
export function speakingTotals(progress: ProgressState): {
  conversations: number;
  completed: number;
  total: number;
} {
  const sessions = SCENARIOS.map((s) => progress.speakingSessions[s.id]).filter(Boolean);
  return {
    conversations: sessions.filter((s) => s.turns > 0).length,
    completed: sessions.filter((s) => s.completed).length,
    total: SCENARIOS.length,
  };
}

/** How far through a scenario's turn goal a session got, 0..1. */
export function sessionPercent(session: SpeakingSession): number {
  if (session.completed) return 1;
  if (session.turnGoal <= 0) return 0;
  return Math.min(1, session.turns / session.turnGoal);
}

/** Where a scenario stands for this learner — the state label on its card. */
export type ScenarioState = 'completed' | 'in-progress' | 'above-level' | 'not-started';

export function scenarioState(
  scenario: Scenario,
  progress: ProgressState,
  level: JlptLevel,
): ScenarioState {
  const session = progress.speakingSessions[scenario.id];
  if (session?.completed) return 'completed';
  if (session && session.turns > 0) return 'in-progress';
  if (JLPT_LEVELS.indexOf(scenario.level) > JLPT_LEVELS.indexOf(level)) return 'above-level';
  return 'not-started';
}

/** The phrases this role-play's set lines are drawn from. */
export function phrasesForScenario(scenario: Scenario): Phrase[] {
  return PHRASES.filter((p) => p.category === scenario.phraseCategory);
}

/**
 * The recorded attempt worth going back to: the lowest-scoring phrase the learner has actually tried,
 * as long as it isn't already good. Nothing tried yet (or everything solid) returns null, and the page
 * says something else rather than inventing a weak spot.
 */
export function weakestPhrase(progress: ProgressState): { phrase: Phrase; score: number } | null {
  let worst: { phrase: Phrase; score: number } | null = null;
  for (const phrase of PHRASES) {
    const score = progress.phraseScores[phrase.id];
    if (score == null || score >= 85) continue;
    if (!worst || score < worst.score) worst = { phrase, score };
  }
  return worst;
}

/** Rough, human "when" for a session card: today in hours, then days, then the plain date. */
export function agoLabel(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const minutes = Math.round((now.getTime() - then.getTime()) / 60000);
  if (!Number.isFinite(minutes) || minutes < 0) return 'Just now';
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}
