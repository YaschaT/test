import { GO_STROKES } from './goStrokes';

/**
 * 語 (go — "language, word": the koto in Kotobox), drawn from the 14 ordered strokes in
 * goStrokes.ts so it can be drawn, scattered, assembled and folded across the homepage (the
 * "Living Ink" signature object). Every path carries pathLength=1 so both the CSS hero draw-in
 * and GSAP scrubs can animate stroke-dashoffset without measuring lengths. Purely decorative
 * everywhere it appears — always aria-hidden.
 */

export interface GoGlyphProps {
  /** How many strokes (from stroke 1) render as drawn ink. */
  drawn?: number;
  /** How many of the *latest* drawn strokes render in vermilion. */
  accent?: number;
  /** Render the not-yet-drawn strokes as 8% ghosts (vs. omitting them). */
  ghost?: boolean;
  /** Play the one-time CSS draw-in on the drawn strokes (hero only). */
  animate?: boolean;
  /** Give every path a data-stroke index and start undrawn strokes dash-hidden, for GSAP scrubbing. */
  scrubReady?: boolean;
  className?: string;
}

export function GoGlyph({
  drawn = 14,
  accent = 0,
  ghost = false,
  animate = false,
  scrubReady = false,
  className,
}: GoGlyphProps) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      className={`hp-glyph${animate ? ' is-animating' : ''}${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      focusable="false"
    >
      {GO_STROKES.map((d, i) => {
        const isDrawn = i < drawn;
        if (!isDrawn && !ghost && !scrubReady) return null;
        const isAccent = isDrawn && i >= drawn - accent;
        const cls = isDrawn
          ? `is-drawn${isAccent ? ' is-accent' : ''}`
          : scrubReady
            ? 'is-hidden-stroke'
            : 'is-ghost';
        return (
          <path
            key={i}
            d={d}
            pathLength={1}
            className={cls}
            data-stroke={scrubReady ? i : undefined}
            style={animate && isDrawn ? ({ '--d': `${i * 160}ms` } as React.CSSProperties) : undefined}
          />
        );
      })}
    </svg>
  );
}

/** A single displaced stroke of 語 — used by the problem section's scattered scrap field. */
export function GlyphStroke({
  index,
  className,
  style,
}: {
  index: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 1024 1024" className={className} style={style} aria-hidden="true" focusable="false">
      <path d={GO_STROKES[index]} pathLength={1} />
    </svg>
  );
}
