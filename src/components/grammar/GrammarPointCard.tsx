import { ChevronRight } from 'lucide-react';
import { GrammarStateBadge, type GrammarPointState } from './GrammarStateBadge';
import { ENTRANCE_ANIMATION_CLASSES, getEntranceDelayMs } from '../../lib/entranceAnimation';
import type { JlptLevel } from '../../types';

export interface GrammarPathItem {
  id: string;
  title: string;
  meaningEn: string;
  level: JlptLevel;
  state: GrammarPointState;
}

interface GrammarPointCardProps {
  item: GrammarPathItem;
  displayNumber: number;
  selected: boolean;
  onSelect: (id: string) => void;
  /** Position within the path list — drives the entrance stagger. Omit to skip animating. */
  index?: number;
}

/**
 * A real, scannable list row — number, pattern, meaning, level, state, chevron — replacing the old
 * floating-circle path per explicit feedback that circles-in-empty-space read as unfinished. Every card
 * stays clickable regardless of state (Kotobox's standing "no artificial locking" rule): "locked" is a
 * visual read on sequence, never an actual navigation block.
 */
export function GrammarPointCard({ item, displayNumber, selected, onSelect, index }: GrammarPointCardProps) {
  const locked = item.state === 'locked';

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      aria-current={selected ? 'true' : undefined}
      className={`w-full flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${
        selected
          ? 'border-brand-400 dark:border-brand-500 bg-brand-50 dark:bg-brand-950/40 shadow-[0_0_0_1px_rgba(58,84,214,0.15),0_6px_20px_-8px_rgba(58,84,214,0.45)]'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-200 dark:hover:border-brand-800'
      } ${index !== undefined ? ENTRANCE_ANIMATION_CLASSES : ''}`}
      style={index !== undefined ? { animationDelay: `${getEntranceDelayMs(index)}ms` } : undefined}
    >
      <span
        className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold ${
          item.state === 'completed'
            ? 'bg-gradient-to-br from-[#6f8ffc] to-[#3a54d6] text-white'
            : item.state === 'current'
              ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
        }`}
      >
        {displayNumber}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`jp-text text-lg font-bold leading-tight ${locked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
            {item.title}
          </p>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-1.5 py-0.5">
            {item.level}
          </span>
        </div>
        <p className={`text-sm truncate ${locked ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>
          {locked ? 'Unlocks after earlier points' : item.meaningEn}
        </p>
      </div>

      <GrammarStateBadge state={item.state} />
      <ChevronRight size={18} className="shrink-0 text-slate-300 dark:text-slate-600" aria-hidden="true" />
    </button>
  );
}
