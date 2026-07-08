interface MascotBubbleProps {
  message: string;
}

/** The hero greeting's mascot + speech bubble, using the reference-provided mascot artwork
 * (kotobox_dashboard_claude_ready_assets/Rework images) rather than the hand-drawn fox used
 * elsewhere in the app — this pack's mascot is the one requested for the Dashboard specifically. */
export function MascotBubble({ message }: MascotBubbleProps) {
  return (
    <div className="flex items-end gap-4">
      <img
        src="/assets/dashboard/mascots/mascot-greeting.png"
        alt="Kotobox mascot waving"
        width={128}
        height={120}
        className="shrink-0 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
      />
      <div className="relative rounded-2xl rounded-bl-sm bg-white/10 backdrop-blur-sm border border-white/10 px-5 py-3.5 max-w-md">
        <p className="jp-text text-fluid-hero-sub text-slate-100 leading-snug">{message}</p>
      </div>
    </div>
  );
}
