import { Play, Turtle } from 'lucide-react';

/**
 * The listening item's player.
 *
 * The bar heights are a fixed, authored shape — a waveform drawn from the audio would be a lie, since
 * the sentence is spoken by the device's own voice at request time and has no waveform to read. It is
 * decoration that says "audio", and it is labelled as such.
 */
const BARS = [
  10, 16, 24, 32, 26, 18, 12, 20, 30, 36, 28, 20, 14, 10, 16, 26, 34, 30, 22, 16, 12, 18, 28, 34, 26,
  18, 12, 10, 14, 22, 30, 24, 16, 12, 18, 26, 20, 14, 10, 12,
];

export function ListenPlayer({ onPlay, onPlaySlow }: { onPlay: () => void; onPlaySlow: () => void }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-violet-400/25 bg-gradient-to-br from-[#18204a] to-[#0b1120] p-5 sm:gap-5 sm:p-6">
      <button
        type="button"
        onClick={onPlay}
        aria-label="Play the sentence"
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-400 text-[#0b1120] transition-transform hover:brightness-110 active:scale-95"
      >
        <Play size={20} fill="currentColor" aria-hidden="true" />
      </button>
      <div aria-hidden="true" className="flex h-10 min-w-0 flex-1 items-center gap-[3px]">
        {BARS.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-sm bg-violet-400/40"
            style={{ height: `${h}px` }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onPlaySlow}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.06] px-3 py-2.5 text-[12.5px] font-bold text-slate-200 transition-colors hover:bg-white/[0.12]"
      >
        <Turtle size={15} aria-hidden="true" /> 0.6×
      </button>
    </div>
  );
}
