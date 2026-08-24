import { Lightbulb } from 'lucide-react';
import type { GrammarTypeDrill } from '../../../types';

interface TypeDrillViewProps {
  drill: GrammarTypeDrill;
  value: string;
  answered: boolean;
  showHint: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onToggleHint: () => void;
}

/** Type the missing word, or the whole sentence. Kana and kanji both count — see typedMatches. */
export function TypeDrillView({
  drill,
  value,
  answered,
  showHint,
  onChange,
  onSubmit,
  onToggleHint,
}: TypeDrillViewProps) {
  return (
    <div>
      <div className="flex items-stretch gap-2.5">
        <input
          // Autofocus is right here: the whole item is "type the answer", and there is nothing else to
          // read first — the prompt sits above and stays visible.
          autoFocus
          value={value}
          disabled={answered}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !answered) {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={drill.placeholder}
          aria-label="Your answer in Japanese"
          className="jp-text min-w-0 flex-1 rounded-xl border border-white/12 bg-[#0c1222] px-5 py-4 text-xl text-white outline-none transition-colors placeholder:text-slate-600 focus:border-brand-500 focus:bg-[#0e1426] disabled:opacity-70"
        />
        {!drill.exam && (
          <button
            type="button"
            onClick={onToggleHint}
            aria-expanded={showHint}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-[12.5px] font-bold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Lightbulb size={15} aria-hidden="true" /> Hint
          </button>
        )}
      </div>

      {showHint && !drill.exam && (
        <div className="animate-review-reveal-in mt-3 rounded-xl border border-amber-400/20 bg-amber-400/[0.07] px-4 py-3">
          <p className="text-[13.5px] text-amber-200">{drill.hint.en}</p>
          <p className="mt-0.5 text-xs text-amber-200/70">{drill.hint.nl}</p>
        </div>
      )}

      <p className="mt-3 text-[12.5px] text-slate-500">Kana or kanji both count.</p>
    </div>
  );
}
