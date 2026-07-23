/**
 * The one primary-action style, shared by <PrimaryButton> (real buttons) and any <Link> styled as the one
 * primary action on a screen, so both look identical without duplicating the class string.
 *
 * This is the Grammar screens' button — a horizontal blue→violet gradient (#4c6ef0 -> #3a54d6) with a soft
 * colored glow — promoted app-wide per explicit request so every CTA (Learn/Review, Continue Learning,
 * Start lesson, quiz/reading/listening actions, etc.) matches the grammar flow exactly.
 */
export const PRIMARY_BUTTON_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#4c6ef0] to-[#3a54d6] shadow-[0_8px_20px_-8px_rgba(58,84,214,0.8)] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none disabled:hover:brightness-100 disabled:active:scale-100 transition-[filter,transform] duration-150';
