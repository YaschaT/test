import { Card } from '../Card';
import { VocabularyCard } from './VocabularyCard';
import { getVocabWordState, getVocabWordProgress } from '../../lib/vocabularyStats';
import type { ProgressState } from '../../lib/progressStore';
import type { VocabWord } from '../../types';

interface VocabularyCardGridProps {
  words: VocabWord[];
  progress: ProgressState;
  layout: 'grid' | 'list';
}

export function VocabularyCardGrid({ words, progress, layout }: VocabularyCardGridProps) {
  if (words.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-500 dark:text-slate-400">
        No words match your search. Try a different term or filter.
      </Card>
    );
  }

  return (
    <div className={layout === 'grid' ? 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'flex flex-col gap-3'}>
      {words.map((word, i) => (
        <VocabularyCard
          key={word.id}
          word={word}
          state={getVocabWordState(word, progress)}
          progress={getVocabWordProgress(word, progress)}
          layout={layout}
          index={i}
        />
      ))}
    </div>
  );
}
