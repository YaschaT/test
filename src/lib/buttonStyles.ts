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

/**
 * The Dashboard hero's single session CTA. Same shape and press behaviour as PRIMARY_BUTTON_CLASSES,
 * but on the violet accent the dashboard redesign is built around (see the --color-iris-* tokens) rather
 * than the app-wide blue — it has to sit on the hero's night-scene artwork, where the blue gradient
 * disappeared into the background. Deliberately the only gradient button on that screen.
 */
export const SESSION_CTA_CLASSES =
  'inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-iris-500 to-iris-600 shadow-[0_10px_28px_-10px_rgba(88,87,231,0.9)] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iris-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-[filter,transform] duration-150';

/**
 * The quieter counterpart to the primary CTA — same shape and size, but a bordered/neutral surface so a
 * screen can carry exactly one dominant (gradient) action while secondary actions stay clearly subordinate.
 */
export const SECONDARY_BUTTON_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-[background-color,transform] duration-150';
