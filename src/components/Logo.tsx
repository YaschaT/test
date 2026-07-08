import { useId } from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Kotobox's brand mark — deliberately separate from the panda mascot (logo vs. character, the way
 * most modern products keep them distinct). A minimal torii-gate silhouette: "道" (dō) means "way/path",
 * and a torii marks the entrance to a path — an original, non-mascot nod to the app's own name rather
 * than a literal illustration or borrowed identity.
 */
export function Logo({ size = 36, className }: LogoProps) {
  const uid = useId().replace(/:/g, '');

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Kotobox logo"
    >
      <defs>
        <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-400)" />
          <stop offset="100%" stopColor="var(--color-brand-700)" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="20" fill={`url(#bg-${uid})`} />
      <ellipse cx="22" cy="14" rx="16" ry="8" fill="#ffffff" opacity="0.18" transform="rotate(-15 22 14)" />

      {/* torii mark */}
      <rect x="13" y="15" width="38" height="5.5" rx="2.5" fill="#fdfdff" />
      <rect x="17.5" y="24.5" width="29" height="4.5" rx="2" fill="#fdfdff" opacity="0.92" />
      <rect x="20.5" y="28.5" width="5.5" height="21" rx="2.2" fill="#fdfdff" />
      <rect x="38" y="28.5" width="5.5" height="21" rx="2.2" fill="#fdfdff" />
    </svg>
  );
}
