import { Headphones } from 'lucide-react';
import { ListeningMascotImage } from './ListeningMascotImage';

/**
 * Listening's hero — same dark starfield identity as Grammar/Vocabulary/Kanji's own hero panels, so
 * opening this page feels like arriving at the same product rather than a bare settings form (its
 * previous state: a plain light header with no atmosphere at all). No ring/count here — unlike
 * vocabulary/kanji/grammar, listening sessions aren't a persistent per-item deck, so there's no real
 * bounded ratio to visualize; inventing one would violate the "real data, always" principle.
 */
export function ListeningHero() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 sm:p-8">
      <div className="absolute inset-0 star-field" aria-hidden="true" />
      <div className="relative z-10 flex items-center gap-4">
        <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 shrink-0">
          <Headphones size={22} className="text-white" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">Listening</h1>
          <p className="text-sm sm:text-base text-white/60 mt-0.5">
            Practice with text-to-speech, using your browser's voice or Google Cloud's natural voice.
          </p>
        </div>
        <ListeningMascotImage size={68} className="shrink-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] hidden sm:block" />
      </div>
    </div>
  );
}
