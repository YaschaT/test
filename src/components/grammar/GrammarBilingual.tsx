import type { Translatable } from '../../types';

/**
 * English over Dutch, on the always-dark grammar surfaces.
 *
 * The shared <Bilingual> picks its colours from the light/dark theme, which is wrong here: the grammar
 * lesson and practice cards are dark in *both* themes, so in light mode its slate-800 English would sit
 * on navy. This is the same pairing, coloured for the surface it actually lands on.
 */
export function GrammarBilingual({
  text,
  className = '',
  size = 'base',
}: {
  text: Translatable;
  className?: string;
  size?: 'sm' | 'base';
}) {
  const en = size === 'sm' ? 'text-sm' : 'text-[15px]';
  const nl = size === 'sm' ? 'text-xs' : 'text-[13px]';
  return (
    <div className={className}>
      <p className={`${en} leading-relaxed text-slate-200 text-pretty`}>{text.en}</p>
      <p className={`${nl} mt-1 leading-relaxed text-slate-400 text-pretty`}>{text.nl}</p>
    </div>
  );
}

/** The small tracked-out caps label used for every section eyebrow in the lesson and practice screens. */
export function Eyebrow({
  children,
  tone = 'brand',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'brand' | 'muted' | 'amber';
  className?: string;
}) {
  const color =
    tone === 'brand' ? 'text-brand-300' : tone === 'amber' ? 'text-amber-300' : 'text-slate-400';
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${color} ${className}`}>
      {children}
    </p>
  );
}
