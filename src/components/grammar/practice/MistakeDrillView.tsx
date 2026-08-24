import { tileClass, type RowTone } from './drillRow';
import type { GrammarMistakeDrill } from '../../../types';

interface MistakeDrillViewProps {
  drill: GrammarMistakeDrill;
  selected: number | null;
  answered: boolean;
  onSelect: (index: number) => void;
}

/** One token in the sentence is wrong — tap it. */
export function MistakeDrillView({ drill, selected, answered, onSelect }: MistakeDrillViewProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.07] bg-[#0c1222] p-6">
      {drill.tokens.map((token, i) => {
        let tone: RowTone = 'idle';
        if (answered) tone = i === drill.answerIndex || i === selected ? 'wrong' : 'dim';
        else if (selected === i) tone = 'picked';

        return (
          <button
            key={i}
            type="button"
            disabled={answered}
            aria-pressed={selected === i}
            onClick={() => onSelect(i)}
            className={tileClass(
              tone,
              answered && i === drill.answerIndex ? 'border-rose-500/70 bg-rose-500/[0.18]' : '',
            )}
          >
            <span className="jp-text text-2xl">{token}</span>
          </button>
        );
      })}
    </div>
  );
}
