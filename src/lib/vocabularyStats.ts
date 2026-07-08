import type { VocabWord } from '../types';
import type { ProgressState } from './progressStore';
import { getLearningState, getLearningProgress, type LearningState } from './learningState';
import { todayIso } from './date';

export type VocabWordState = LearningState;

export function getVocabWordState(word: VocabWord, progress: ProgressState, today: string = todayIso()): VocabWordState {
  return getLearningState('vocabulary', word.id, progress, today);
}

export function getVocabWordProgress(word: VocabWord, progress: ProgressState): number {
  return getLearningProgress('vocabulary', word.id, progress);
}
