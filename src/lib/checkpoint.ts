import type { QuizQuestion, RoadmapWeek } from '../types';
import { GRAMMAR_POINTS } from '../data/grammar';

/**
 * Builds a week's checkpoint quiz from the quiz questions already authored on that week's grammar
 * points — no separate question bank to maintain. Deterministic (first `max` in roadmap order) so a
 * week's checkpoint is stable across sessions. Vocab-only weeks return an empty list; the UI treats
 * those as "no checkpoint" rather than an unpassable gate.
 */
export function getCheckpointQuestions(week: RoadmapWeek, max = 8): QuizQuestion[] {
  const grammarIds = new Set<string>();
  for (const unit of week.units) unit.grammarIds.forEach((id) => grammarIds.add(id));

  const questions: QuizQuestion[] = [];
  for (const point of GRAMMAR_POINTS) {
    if (grammarIds.has(point.id)) questions.push(...point.quiz);
  }
  return questions.slice(0, max);
}

export function hasCheckpoint(week: RoadmapWeek): boolean {
  return getCheckpointQuestions(week).length > 0;
}
