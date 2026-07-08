import type { LevelInfo } from '../../lib/xp';

/** Shown at the bottom of the sidebar, above the streak/settings row. XP and level are entirely derived
 * from real progress (see src/lib/xp.ts) — nothing here is a hardcoded example number. Background is the
 * reference-provided illustration (sidepanel-background.png, from `Rework images/background
 * sidepanel.png`), with a dark gradient overlay on top so the white text stays readable over it. */
export function SidebarLevelCard({ levelInfo }: { levelInfo: LevelInfo }) {
  const pct = Math.round((levelInfo.xpIntoLevel / levelInfo.xpForNextLevel) * 100);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-800/50 p-4 pr-[72px]">
      <img
        src="/assets/kotobox-dashboard/generated/sidepanel-background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/70 to-slate-950/80" aria-hidden="true" />
      <img
        src="/assets/dashboard/mascots/mascot-level-card.png"
        alt=""
        aria-hidden="true"
        className="absolute -top-1.5 -right-2.5 w-24 h-24 object-contain opacity-95"
      />
      <div className="relative z-10">
        <p className="text-lg font-bold text-white">Level {levelInfo.level}</p>
        <p className="text-sm text-brand-300">{levelInfo.title}</p>
        <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-brand-300/80">
          {levelInfo.xpIntoLevel} / {levelInfo.xpForNextLevel} XP
        </p>
      </div>
    </div>
  );
}
