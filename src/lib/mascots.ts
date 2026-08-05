/**
 * The one place mascot artwork is mapped to a section of the app.
 *
 * Every file in `public/assets/mascots/` is pre-normalised to the same 512x512 transparent canvas
 * (artwork cropped to its alpha bounds, then centred), so a single fixed CSS box renders every mascot
 * at a consistent visual size — no per-page width/height tweaking, and no mascot appearing smaller
 * just because its source export happened to carry more empty padding.
 */
export type MascotName =
  | 'dashboard'
  | 'learning-path'
  | 'grammar'
  | 'vocabulary'
  | 'kanji'
  | 'reading'
  | 'listening'
  | 'speaking'
  | 'mock-exam';

export const MASCOTS: Record<MascotName, string> = {
  dashboard: '/assets/mascots/dashboard.png',
  'learning-path': '/assets/mascots/learning-path.png',
  grammar: '/assets/mascots/grammar.png',
  vocabulary: '/assets/mascots/vocabulary.png',
  kanji: '/assets/mascots/kanji.png',
  reading: '/assets/mascots/reading.png',
  listening: '/assets/mascots/listening.png',
  speaking: '/assets/mascots/speaking.png',
  'mock-exam': '/assets/mascots/mock-exam.png',
};

/**
 * Shared display size for a mascot in a page banner, in px.
 *
 * Note this is the *canvas* size, and each 512x512 file centres artwork that is rarely square — a
 * landscape pose only fills ~72% of the box's height — so the drawn mascot always reads smaller than
 * this number. Sized up from an initial 92 because that made them look undersized on the page.
 */
export const MASCOT_BANNER_SIZE = 128;

export function mascotSrc(name: MascotName): string {
  return MASCOTS[name];
}
