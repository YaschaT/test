interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Kotobox's brand mark — the supplied penguin badge, shown in the sidebar header and the mobile top bar.
 *
 * Decorative by design: both call sites already render the "Kotobox" wordmark right beside it, so giving
 * the image a label would only make a screen reader announce the name twice.
 */
export function Logo({ size = 36, className }: LogoProps) {
  return (
    <img
      src="/assets/brand/nav-logo.webp"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className={`shrink-0 object-contain ${className ?? ''}`}
    />
  );
}
