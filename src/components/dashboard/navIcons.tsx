/**
 * Inline copies of the new asset pack's line-icon navigation SVGs (kotobox_dashboard_claude_ready_assets/
 * 02_svg_icons/navigation/*.svg). Kept as plain JSX rather than <img> so they inherit `currentColor` the
 * same way the lucide icons they replace did — the sidebar's active/inactive nav color logic needs that.
 */
interface NavIconProps {
  size?: number;
  className?: string;
}

export function DashboardNavIcon({ size = 18, className }: NavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  );
}

export function GrammarNavIcon({ size = 18, className }: NavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 5.5c0-1 .8-1.7 1.8-1.5 2.5.3 4.2 1.1 5.7 2.6 1.5-1.5 3.2-2.3 5.7-2.6 1-.2 1.8.5 1.8 1.5v13c0 1-.6 1.6-1.5 1.7-2.4.3-4.1 1-6 2.5-1.9-1.5-3.6-2.2-6-2.5-.9-.1-1.5-.7-1.5-1.7v-13Z"
      />
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 6.6v16" />
    </svg>
  );
}

export function VocabularyNavIcon({ size = 18, className }: NavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M12 3 3.5 7.5 12 12l8.5-4.5L12 3Z" />
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 12l8 4 8-4" />
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 16l8 4 8-4" />
    </svg>
  );
}

export function KanjiNavIcon({ size = 18, className }: NavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M5 16.5 16.8 4.7a2.1 2.1 0 0 1 3 3L8 19.5l-4 1 1-4Z" />
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="m14.5 7.2 2.3 2.3" />
    </svg>
  );
}

export function ReadingNavIcon({ size = 18, className }: NavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 6.5c0-1 .8-1.7 1.8-1.5 2.5.3 4.2 1.1 5.7 2.6 1.5-1.5 3.2-2.3 5.7-2.6 1-.2 1.8.5 1.8 1.5v12c0 1-.6 1.6-1.5 1.7-2.4.3-4.1 1-6 2.5-1.9-1.5-3.6-2.2-6-2.5-.9-.1-1.5-.7-1.5-1.7v-12Z"
      />
    </svg>
  );
}

export function ListeningNavIcon({ size = 18, className }: NavIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M4 13a8 8 0 0 1 16 0" />
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 13v4a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2Zm16 0v4a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z"
      />
    </svg>
  );
}
