interface ProgressBarProps {
  /** Completion percentage, 0–100 (clamped). */
  value: number;
  /** Extra classes on the track — height override, `flex-1`, `w-24`, margins, etc. Height defaults to h-1.5. */
  className?: string;
  /** For always-dark surfaces (grammar practice card, sidebar level card) where a light track would clash. */
  onDark?: boolean;
  /** Accessible label. Omit only when an adjacent element already labels the meter. */
  label?: string;
}

/**
 * The single linear progress meter used across the app — the Grammar overview bar, promoted to a shared
 * primitive so every completion/session meter looks and animates identically: a rounded track with a
 * blue→violet gradient fill that eases its width over 500ms.
 */
export function ProgressBar({ value, className = '', onDark = false, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-1.5 overflow-hidden rounded-full ${
        onDark ? 'bg-white/10' : 'bg-slate-200 dark:bg-white/10'
      } ${className}`}
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
