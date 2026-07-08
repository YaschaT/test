import type { KanjiEntry } from '../types';
import type { ProgressState } from './progressStore';
import { getLearningState, getLearningProgress, type LearningState } from './learningState';
import { todayIso } from './date';

export type KanjiCardState = LearningState;

export function getKanjiState(kanji: KanjiEntry, progress: ProgressState, today: string = todayIso()): KanjiCardState {
  return getLearningState('kanji', kanji.id, progress, today);
}

export function getKanjiProgress(kanji: KanjiEntry, progress: ProgressState): number {
  return getLearningProgress('kanji', kanji.id, progress);
}
