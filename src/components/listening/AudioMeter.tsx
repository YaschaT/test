const BAR_COUNT = 40;

/**
 * Bar heights are a fixed sine profile rather than anything sampled from the audio. The app's three voice
 * engines include browser speech synthesis, which exposes no waveform at all, so a "real" meter would be
 * real on two engines and faked on the third. A steady, obviously-stylised shape that only moves while
 * audio genuinely plays is the honest version: it reports *that* sound is happening, and claims nothing
 * about what the sound looks like.
 */
const BARS = Array.from({ length: BAR_COUNT }, (_, index) => ({
  height: 6 + Math.abs(Math.sin(index * 1.35)) * 19,
  duration: 0.8 + (index % 5) * 0.13,
  delay: (index % 8) * 0.06,
}));

/**
 * The line of bars under the play button. Idle it is a flat dotted rule; playing, it moves — the same
 * "sound is happening now" signal the SoundRipple gives around the button itself, at the width of the
 * sentence rather than the button.
 */
export function AudioMeter({ playing }: { playing: boolean }) {
  return (
    <div className="flex h-[26px] w-full max-w-[420px] items-end gap-[3px]" aria-hidden="true">
      {BARS.map((bar, index) => (
        <span
          key={index}
          className={`flex-1 origin-bottom rounded-full transition-colors duration-300 ${
            !playing
              ? 'bg-slate-200 dark:bg-ink-700'
              : index % 2
                ? 'animate-listening-meter bg-brand-500 dark:bg-iris-500'
                : 'animate-listening-meter bg-brand-400 dark:bg-iris-400'
          }`}
          style={{
            height: `${bar.height}px`,
            animationDuration: `${bar.duration}s`,
            animationDelay: `${bar.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
