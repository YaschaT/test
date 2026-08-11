import type { ReactNode } from 'react';

interface StatValueProps {
  /** The number itself. Kept separate from `unit` so only the value gets tabular figures. */
  children: ReactNode;
  /**
   * Trailing unit ("min", "days", "%"), rendered a step down and lighter. Optional — a bare count
   * like "Reviews due" has no unit to show.
   */
  unit?: ReactNode;
  /**
   * `fluid` (default) is the design system's stat spec, and scales with the viewport. `compact` is the
   * same treatment at a fixed size, for a stat inside a container that doesn't grow with the window —
   * the 256px sidebar being the only one today.
   */
  size?: 'fluid' | 'compact';
  className?: string;
}

/**
 * The one headline-number treatment on a stat panel.
 *
 * The design system specifies a single spec for every stat value — display face, weight 700, and the
 * fluid `clamp(1.25rem, 0.8rem + 1.2vw, 2.5rem)` step. Before this component the dashboard had four
 * different takes on the same idea (1.625rem, 4xl, and two xl, all at weight 800 in the body face), so
 * "9 min", "3 / 7 days" and "42%" each looked like they belonged to a different card.
 *
 * `tabular-nums` on the value keeps a counting number from reflowing its own width as it changes —
 * these are live figures, not static labels.
 */
export function StatValue({ children, unit, size = 'fluid', className = '' }: StatValueProps) {
  return (
    <p
      className={`font-display font-bold leading-none text-slate-900 dark:text-white ${
        size === 'fluid' ? 'text-fluid-stat' : 'text-xl'
      } ${className}`}
    >
      <span className="tabular-nums">{children}</span>
      {unit != null && (
        // A percent sign hugs its number; a word unit ("min", "days") needs the space.
        <span
          className={`text-[0.55em] font-bold text-slate-500 dark:text-slate-400 ${unit === '%' ? '' : 'ml-1.5'}`}
        >
          {unit}
        </span>
      )}
    </p>
  );
}
