import { Volume2 } from 'lucide-react';
import { GrammarBilingual } from '../GrammarBilingual';
import type { GrammarRegister, GrammarRegisterLine } from '../../../types';

const LABEL: Record<GrammarRegister, string> = {
  casual: 'Casual',
  polite: 'Polite',
  formal: 'Formal',
};

/** Polite is the learner's default, so it's the row that carries the accent. */
const TONE: Record<GrammarRegister, { chip: string; shell: string }> = {
  casual: { chip: 'bg-amber-400/15 text-amber-300', shell: 'border-white/10 bg-white/[0.02]' },
  polite: { chip: 'bg-brand-500/20 text-brand-200', shell: 'border-brand-400/40 bg-brand-500/[0.08]' },
  formal: { chip: 'bg-violet-400/15 text-violet-300', shell: 'border-white/10 bg-white/[0.02]' },
};

export function RegisterLadder({
  lines,
  onSpeak,
}: {
  lines: GrammarRegisterLine[];
  onSpeak?: (line: GrammarRegisterLine) => void;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {lines.map((line) => {
        const tone = TONE[line.register];
        return (
          <li
            key={line.register}
            className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 ${tone.shell}`}
          >
            <span
              className={`w-[68px] shrink-0 rounded-lg px-2 py-1 text-center text-[10.5px] font-extrabold uppercase tracking-[0.08em] ${tone.chip}`}
            >
              {LABEL[line.register]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="jp-text text-lg text-white">{line.japanese}</p>
              <GrammarBilingual text={line.note} size="sm" className="mt-1" />
            </div>
            {onSpeak && (
              <button
                type="button"
                onClick={() => onSpeak(line)}
                aria-label={`Play ${LABEL[line.register]} version`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition-colors hover:bg-white/10 hover:text-brand-300"
              >
                <Volume2 size={15} aria-hidden="true" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
