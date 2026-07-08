/**
 * Tactile "press-depth" primary action style: a solid bottom ledge at rest, a slight lift on hover, and
 * a flatten-down press — shared by <PrimaryButton> (real buttons) and any <Link> styled as the one
 * primary action on a screen, so both look identical without duplicating the class string.
 *
 * The gradient (#6460e5 -> #5050d5) and ledge color (#3d3aa8) are pixel-sampled from the reference
 * mockup's "Start Study Session" button — originally scoped to just that one button, now promoted to the
 * app-wide primary-action color per explicit request, so every CTA (Learn/Review, Continue Learning,
 * quiz/reading/listening actions, etc.) matches.
 */
export const PRIMARY_BUTTON_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-b from-[#6460e5] to-[#5050d5] shadow-[0_4px_0_0_#3d3aa8,inset_0_1.5px_0_rgba(255,255,255,0.35)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none disabled:translate-y-0 disabled:hover:brightness-100 transition-all duration-150';
