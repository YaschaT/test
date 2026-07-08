interface BottomJourneyStripProps {
  message: string;
  subMessage: string;
  xpToNextLevel: number;
}

/**
 * The closing strip's mountains/dotted-path/torii scene — the reference-provided illustration
 * (public/assets/kotobox-dashboard/generated/footer-background.png, sourced from
 * `kotobox_dashboard_claude_ready_assets/Rework images/background footer.png`). Sits as a background
 * behind the text at high opacity since it's already composed with a dark, low-contrast left side for the
 * mascot/text to sit on.
 */
export function BottomJourneyStrip({ message, subMessage, xpToNextLevel }: BottomJourneyStripProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-brand-900 px-8 py-6 min-h-[125px] flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <img
        src="/assets/kotobox-dashboard/generated/footer-background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-10 flex items-center gap-4 min-w-0 sm:flex-1">
        <img
          src="/assets/dashboard/mascots/mascot-reading-map.png"
          alt=""
          aria-hidden="true"
          width={84}
          height={75}
          className="shrink-0"
        />
        <div className="min-w-0">
          <p className="jp-text text-fluid-section-title font-semibold text-white">{message}</p>
          <p className="text-fluid-hero-sub text-brand-200 mt-1">{subMessage}</p>
        </div>
      </div>
      <div className="relative z-10 shrink-0 text-left sm:text-right">
        <p className="text-xs text-brand-300">Next milestone</p>
        <p className="text-fluid-milestone font-bold text-white">{xpToNextLevel} XP to go</p>
      </div>
    </div>
  );
}
