/**
 * Landing-page CTA styles — same tactile press-depth language and lantern-violet gradient as the in-app
 * `PRIMARY_BUTTON_CLASSES` (identical brand hexes from DESIGN.md), sized up for a marketing surface:
 * ≥48px touch height, larger type, and an added ambient glow so the primary action reads from across the
 * room. Kept separate from the app's button so marketing-scale tweaks never ripple into product screens.
 */
export const LANDING_PRIMARY_CTA =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-7 min-h-12 text-base font-bold text-white bg-gradient-to-b from-[#6460e5] to-[#5050d5] shadow-[0_4px_0_0_#3d3aa8,inset_0_1.5px_0_rgba(255,255,255,0.35),0_0_28px_-6px_rgba(100,96,229,0.7)] hover:brightness-110 hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#3d3aa8,inset_0_1.5px_0_rgba(255,255,255,0.35),0_0_36px_-4px_rgba(100,96,229,0.9)] active:translate-y-1 active:shadow-none transition-all duration-150';

export const LANDING_SECONDARY_CTA =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-7 min-h-12 text-base font-semibold text-white/90 border border-white/20 bg-white/5 hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150';
