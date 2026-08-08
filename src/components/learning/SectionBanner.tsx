import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { RingStat } from '../dashboard/RingStat';
import { PRIMARY_BUTTON_CLASSES } from '../../lib/buttonStyles';
import { useCountUp } from '../../lib/useCountUp';

/** Link or button — Listening starts a session in place, everything else navigates. */
export type BannerAction =
  | { label: string; to: string; onClick?: () => void }
  | { label: string; onClick: () => void; to?: undefined };

interface SectionBannerProps {
  /** The page's h1. */
  title: string;
  /** This section's identity colour — pass `SKILL_THEME[skill].from` so it matches its icon everywhere. */
  accent: string;
  icon: LucideIcon;
  /** The single kanji watermarked into the right of the panel: 文, 語, 字, 聴, 話, 道. */
  kanji: string;
  /** The one number this section is about. Counts up on mount. */
  value: number;
  /** Rendered before the number, un-animated — Learning Path's "Week". */
  valuePrefix?: string;
  /** The rest of the sentence: "of 42 grammar points learned", "conversations with Kai". */
  detail: string;
  /**
   * 0..1, drawn as the ring and the rule along the bottom edge. Omitted by sections with no bounded
   * ratio to report, which then get a plain accent disc rather than a ring at a made-up value.
   */
  progress?: number;
  action?: BannerAction;
}

/**
 * The one header every section page wears: identity, the single number that page is about, and the one
 * thing to do next.
 *
 * It replaces a stacked pair — a light title block above a separate night-sky stats hero — that together
 * cost ~230px before any content, and repeated the section's name twice. Everything here is one band:
 * the ring carries the ratio, the sentence under the title carries the count, and the rule along the
 * bottom edge repeats the ratio at the full width of the page, which is what makes progress readable at
 * a glance from across the room.
 *
 * Dark in both themes, like the Dashboard and Reading banners it sits alongside — a section's colour
 * identity only holds up against a dark field, and the component it replaced was already dark.
 */
export function SectionBanner({
  title,
  accent,
  icon: Icon,
  kanji,
  value,
  valuePrefix,
  detail,
  progress,
  action,
}: SectionBannerProps) {
  const shown = useCountUp(value);
  const percent = progress == null ? null : Math.round(Math.max(0, Math.min(1, progress)) * 100);

  return (
    <section
      className="relative isolate flex flex-wrap items-center gap-x-5 gap-y-4 overflow-hidden rounded-[18px] border bg-ink-900 px-5 py-4 sm:gap-x-6 sm:px-7 sm:py-5"
      style={{
        borderColor: `color-mix(in oklab, ${accent} 30%, transparent)`,
        // Pooled at the right edge, behind the watermark and the CTA, so the panel lights up where the
        // eye ends rather than washing out the text at the start of it.
        backgroundImage: `radial-gradient(680px 200px at 100% 50%, color-mix(in oklab, ${accent} 20%, transparent), transparent 72%)`,
      }}
    >
      {/* Light catching the top edge — the one thing that stops six flat panels reading as six grey bars. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent 0%, ${accent} 22%, color-mix(in oklab, ${accent} 35%, transparent) 60%, transparent 100%)`,
        }}
      />

      <RingStat
        progress={progress ?? 0}
        color={accent}
        trackColor="#ffffff"
        size={60}
        strokeWidth={4}
        displaySize="clamp(52px, 5vw, 60px)"
      >
        <Icon size={21} strokeWidth={1.8} style={{ color: accent }} aria-hidden="true" />
      </RingStat>

      <div className="flex min-w-0 flex-1 basis-56 flex-col gap-1.5">
        <h1 className="font-display text-xl leading-tight font-semibold text-white sm:text-2xl">{title}</h1>
        <p className="text-[13px] leading-snug text-slate-400 sm:text-sm">
          <b className="font-display text-[1.08em] font-medium text-slate-200 tabular-nums">
            {valuePrefix}
            {shown.toLocaleString()}
          </b>{' '}
          {detail}
        </p>
      </div>

      {/* Sits under the CTA's glow at narrow widths, so it's dropped rather than allowed to collide. */}
      <span
        aria-hidden="true"
        className="jp-text pointer-events-none hidden shrink-0 select-none text-[96px] leading-none font-normal md:block"
        style={{ color: `color-mix(in oklab, ${accent} 12%, transparent)` }}
      >
        {kanji}
      </span>

      {action && (
        <ActionButton action={action} />
      )}

      {percent != null && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[3px] transition-[width] duration-700 ease-out"
          style={{ width: `${percent}%`, background: accent }}
        />
      )}
    </section>
  );
}

/**
 * The app's one primary-action style rather than the mockup's bespoke pill: the colour is the same
 * blue-violet either way, and a second button shape introduced across six pages would fork a system
 * DESIGN.md keeps deliberately closed.
 */
function ActionButton({ action }: { action: BannerAction }) {
  const className = `${PRIMARY_BUTTON_CLASSES} shrink-0 whitespace-nowrap`;
  return action.to ? (
    <Link to={action.to} onClick={action.onClick} className={className}>
      {action.label}
    </Link>
  ) : (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}
