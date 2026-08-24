import { rowClass, type RowTone } from './drillRow';
import type { GrammarChoiceOption } from '../../../types';

const KEYS = ['A', 'B', 'C', 'D', 'E'];

interface ChoiceDrillViewProps {
  options: GrammarChoiceOption[];
  answerIndex: number;
  selected: number | null;
  answered: boolean;
  /** Exam items run kana-only with no glosses, exactly as the real paper does. */
  hideHints?: boolean;
  onSelect: (index: number) => void;
}

/** The multiple-choice list, shared by written choice questions and by listening. */
export function ChoiceDrillView({
  options,
  answerIndex,
  selected,
  answered,
  hideHints,
  onSelect,
}: ChoiceDrillViewProps) {
  return (
    <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="Answer options">
      {options.map((option, i) => {
        let tone: RowTone = 'idle';
        if (answered) tone = i === answerIndex ? 'right' : i === selected ? 'wrong' : 'dim';
        else if (selected === i) tone = 'picked';

        return (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected === i}
            disabled={answered}
            onClick={() => onSelect(i)}
            className={rowClass(tone, answered && i === selected && i !== answerIndex ? 'animate-shake' : '')}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-[11px] font-extrabold text-slate-300">
              {KEYS[i]}
            </span>
            <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5 text-left">
              <span className="jp-text text-lg font-medium">{option.japanese}</span>
              {!hideHints && option.hint && (
                <span className="text-[12.5px] text-slate-400">{option.hint}</span>
              )}
            </span>
            <span aria-hidden="true" className="w-5 shrink-0 text-center text-[15px]">
              {answered ? (i === answerIndex ? '✓' : i === selected ? '✕' : '') : ''}
            </span>
          </button>
        );
      })}
    </div>
  );
}
