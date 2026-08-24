import { tileClass } from './drillRow';
import type { GrammarBuildDrill } from '../../../types';

interface BuildDrillViewProps {
  drill: GrammarBuildDrill;
  /** Indices into drill.tiles, in the shuffled order the pool is shown in. */
  pool: number[];
  /** Indices into drill.tiles, in the order the learner tapped them. */
  built: number[];
  answered: boolean;
  onPush: (tileIndex: number) => void;
  onPop: (tileIndex: number) => void;
}

/** Tap tiles in order to build the sentence; tap a placed tile to take it back. */
export function BuildDrillView({ drill, pool, built, answered, onPush, onPop }: BuildDrillViewProps) {
  return (
    <div>
      <div className="flex min-h-[92px] flex-wrap items-center gap-2 rounded-2xl border border-dashed border-white/[0.16] bg-[#0c1222] p-5">
        {built.length === 0 ? (
          <p className="text-sm text-slate-500">Tap the tiles below in order.</p>
        ) : (
          built.map((tileIndex, position) => {
            const correct = drill.tiles[tileIndex] === drill.target[position];
            return (
              <button
                key={`${tileIndex}-${position}`}
                type="button"
                disabled={answered}
                onClick={() => onPop(tileIndex)}
                aria-label={`Remove ${drill.tiles[tileIndex]}`}
                className={tileClass(answered ? (correct ? 'right' : 'wrong') : 'picked')}
              >
                <span className="jp-text text-xl">{drill.tiles[tileIndex]}</span>
              </button>
            );
          })
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((tileIndex) => {
          const used = built.includes(tileIndex);
          return (
            <button
              key={tileIndex}
              type="button"
              disabled={answered || used}
              onClick={() => onPush(tileIndex)}
              className={tileClass('idle', used ? 'opacity-20' : '')}
            >
              <span className="jp-text text-xl">{drill.tiles[tileIndex]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
