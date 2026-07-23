import { Link } from 'react-router-dom';
import { LearningStateBadge } from '../learning/LearningStateBadge';
import { LearningProgressBar } from '../learning/LearningProgressBar';
import { LEARNING_STATE_THEME } from '../../lib/learningStateTheme';
import { ENTRANCE_ANIMATION_CLASSES, getEntranceDelayMs } from '../../lib/entranceAnimation';
import type { LearningState } from '../../lib/learningState';
import type { KanjiEntry } from '../../types';
import { playCardTap } from '../../lib/sound';

interface KanjiCardProps {
  kanji: KanjiEntry;
  state: LearningState;
  progress: number;
  layout: 'grid' | 'list';
  /** Position within the current filtered list — drives the entrance stagger. Omit to skip animating. */
  index?: number;
}

export function KanjiCard({ kanji, state, progress, layout, index }: KanjiCardProps) {
  const theme = LEARNING_STATE_THEME[state];
  const readings = [...kanji.onyomi, ...kanji.kunyomi].join('、 ');

  return (
    <Link
      to={`/kanji/${kanji.id}`}
      onClick={() => playCardTap()}
      style={index !== undefined ? { animationDelay: `${getEntranceDelayMs(index)}ms` } : undefined}
      className={`group relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 p-4 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${theme.border} ${theme.borderHover} ${theme.ring} ${theme.glow} ${theme.glowHover} ${layout === 'list' ? 'flex items-center gap-4' : 'block'} ${index !== undefined ? ENTRANCE_ANIMATION_CLASSES : ''}`}
    >
      <div className={layout === 'list' ? 'flex-1 min-w-0' : ''}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="jp-text text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight">{kanji.character}</p>
            <p className="jp-text text-sm text-slate-400 dark:text-slate-500 mt-0.5 truncate">{readings}</p>
          </div>
          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-0.5 mt-1">
            {kanji.level}
          </span>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 truncate">{kanji.meaning.en}</p>

        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex-1">
            <LearningProgressBar percent={progress} />
          </div>
          <LearningStateBadge state={state} />
        </div>
      </div>
    </Link>
  );
}
