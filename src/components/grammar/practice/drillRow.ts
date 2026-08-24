/**
 * The five states any answer row can be in, and the one place their colours live.
 *
 * Every drill kind that offers a list of things to pick — multiple choice, the broken-word tokens, the
 * matching columns, a roleplay reply — draws from this so "chosen", "right" and "wrong" look identical
 * across the whole session rather than being restyled per exercise.
 */
export type RowTone = 'idle' | 'picked' | 'right' | 'wrong' | 'dim';

const TONE: Record<RowTone, string> = {
  idle: 'border-white/10 bg-[#0c1222] text-slate-100 hover:border-brand-400/50 hover:bg-white/[0.06]',
  picked: 'border-brand-400/60 bg-brand-500/15 text-white',
  right: 'border-emerald-500/50 bg-emerald-500/[0.13] text-emerald-50',
  wrong: 'border-rose-500/50 bg-rose-500/[0.12] text-rose-50',
  dim: 'border-white/[0.05] bg-[#0a0f1d] text-slate-400',
};

export function rowClass(tone: RowTone, extra = ''): string {
  const interactive = tone === 'idle' || tone === 'picked' ? 'cursor-pointer' : 'cursor-default';
  return `flex w-full items-center gap-3.5 rounded-2xl border px-4 py-4 text-left transition-colors ${TONE[tone]} ${interactive} ${extra}`;
}

/** Same palette, sized for a tile or chip rather than a full-width row. */
export function tileClass(tone: RowTone, extra = ''): string {
  const interactive = tone === 'idle' || tone === 'picked' ? 'cursor-pointer' : 'cursor-default';
  return `rounded-xl border px-4 py-3 transition-colors ${TONE[tone]} ${interactive} ${extra}`;
}
