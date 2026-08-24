import { Volume2 } from 'lucide-react';
import { rowClass } from './drillRow';
import type { GrammarRoleplayDrill } from '../../../types';

export interface RoleplayLine {
  who: 'partner' | 'you';
  japanese: string;
  /** English under the bubble — the partner's translation, or the gloss on the reply you chose. */
  gloss: string;
}

interface RoleplayDrillViewProps {
  drill: GrammarRoleplayDrill;
  log: RoleplayLine[];
  /** Which turn's replies to offer; hidden entirely once the item is graded. */
  turnIndex: number;
  answered: boolean;
  onChoose: (choiceIndex: number) => void;
  onSpeak: (kana: string) => void;
}

/** Hold your side of a short conversation — the partner speaks, you pick the reply that fits. */
export function RoleplayDrillView({
  drill,
  log,
  turnIndex,
  answered,
  onChoose,
  onSpeak,
}: RoleplayDrillViewProps) {
  const turn = drill.turns[Math.min(turnIndex, drill.turns.length - 1)];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0f1d]">
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-brand-500/20 text-sm"
        >
          {drill.partner.avatar}
        </span>
        <div className="min-w-0">
          <p className="jp-text text-[13.5px] font-bold text-white">{drill.partner.name}</p>
          <p className="text-[11.5px] text-slate-400">{drill.partner.role.en}</p>
        </div>
        <button
          type="button"
          onClick={() => onSpeak(drill.turns[Math.min(turnIndex, drill.turns.length - 1)].npc.kana)}
          aria-label="Play their line again"
          className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 transition-colors hover:bg-white/10 hover:text-brand-300"
        >
          <Volume2 size={14} aria-hidden="true" />
        </button>
      </div>

      {/* aria-live so each new line is announced as the conversation moves rather than read only on focus. */}
      <div aria-live="polite" className="flex min-h-[184px] flex-col gap-3 px-4 py-5">
        {log.map((line, i) => (
          <div key={i} className={`flex ${line.who === 'partner' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[80%] border px-4 py-3 ${
                line.who === 'partner'
                  ? 'rounded-[16px_16px_16px_5px] border-white/[0.08] bg-white/[0.06]'
                  : 'rounded-[16px_16px_5px_16px] border-brand-400/40 bg-brand-500/20'
              }`}
            >
              <p className="jp-text text-[17px] leading-relaxed text-white">{line.japanese}</p>
              <p className="mt-1 text-[12.5px] text-slate-300/70">{line.gloss}</p>
            </div>
          </div>
        ))}
      </div>

      {!answered && (
        <div className="flex flex-col gap-2 border-t border-white/[0.06] bg-white/[0.015] px-4 py-4">
          <p className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Your reply
          </p>
          {turn.choices.map((choice, i) => (
            <button key={i} type="button" onClick={() => onChoose(i)} className={rowClass('idle', 'py-3.5')}>
              <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-3 gap-y-0.5 text-left">
                <span className="jp-text text-[17px]">{choice.japanese}</span>
                <span className="text-[12.5px] text-slate-400">{choice.hint.en}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
