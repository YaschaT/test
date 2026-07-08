import { Card } from '../Card';
import { KanjiCard } from './KanjiCard';
import { getKanjiState, getKanjiProgress } from '../../lib/kanjiStats';
import type { ProgressState } from '../../lib/progressStore';
import type { KanjiEntry } from '../../types';

interface KanjiCardGridProps {
  entries: KanjiEntry[];
  progress: ProgressState;
  layout: 'grid' | 'list';
}

export function KanjiCardGrid({ entries, progress, layout }: KanjiCardGridProps) {
  if (entries.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-500 dark:text-slate-400">
        No kanji match your search. Try a different term or filter.
      </Card>
    );
  }

  return (
    <div className={layout === 'grid' ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' : 'flex flex-col gap-3'}>
      {entries.map((kanji, i) => (
        <KanjiCard
          key={kanji.id}
          kanji={kanji}
          state={getKanjiState(kanji, progress)}
          progress={getKanjiProgress(kanji, progress)}
          layout={layout}
          index={i}
        />
      ))}
    </div>
  );
}
