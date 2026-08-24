import { rowClass, type RowTone } from './drillRow';
import type { GrammarMatchDrill } from '../../../types';

interface MatchDrillViewProps {
  drill: GrammarMatchDrill;
  /** Pair indices, in the shuffled order the meanings column is shown in. */
  rightOrder: number[];
  /** Pair indices already solved. */
  matched: number[];
  selectedLeft: number | null;
  /** The meaning most recently paired wrongly — flashes red, then clears. */
  badRight: number | null;
  onLeft: (pairIndex: number) => void;
  onRight: (pairIndex: number) => void;
}

/** Pair each sentence with its meaning. Solving every pair grades the item. */
export function MatchDrillView({
  drill,
  rightOrder,
  matched,
  selectedLeft,
  badRight,
  onLeft,
  onRight,
}: MatchDrillViewProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-2.5">
        {drill.pairs.map((pair, i) => {
          const solved = matched.includes(i);
          const tone: RowTone = solved ? 'right' : selectedLeft === i ? 'picked' : 'idle';
          return (
            <button
              key={i}
              type="button"
              disabled={solved}
              aria-pressed={selectedLeft === i}
              onClick={() => onLeft(i)}
              className={rowClass(tone, 'py-3.5')}
            >
              <span className="jp-text text-base">{pair.japanese}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2.5">
        {rightOrder.map((pairIndex) => {
          const solved = matched.includes(pairIndex);
          const tone: RowTone = solved ? 'right' : badRight === pairIndex ? 'wrong' : 'idle';
          return (
            <button
              key={pairIndex}
              type="button"
              disabled={solved || selectedLeft === null}
              onClick={() => onRight(pairIndex)}
              className={rowClass(
                tone,
                `py-3.5 ${badRight === pairIndex ? 'animate-shake' : ''} ${
                  selectedLeft === null && !solved ? 'opacity-70' : ''
                }`,
              )}
            >
              <span className="min-w-0">
                <span className="block text-[14.5px]">{drill.pairs[pairIndex].meaning.en}</span>
                <span className="mt-0.5 block text-xs text-slate-400">
                  {drill.pairs[pairIndex].meaning.nl}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
