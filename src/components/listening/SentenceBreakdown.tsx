import { Ear, Rewind } from 'lucide-react';
import type { SoundTrap } from '../../data/soundTraps';
import type { SentenceWord } from '../../lib/listeningRounds';

interface SentenceBreakdownProps {
  words: SentenceWord[];
  translation: string;
  /** The word the round turned on, highlighted. `-1` when the round had no single one. */
  focusIndex: number;
  trap: SoundTrap | null;
  furigana: boolean;
  onToggleFurigana: () => void;
  /** Plays one word on its own, slowly. */
  onSayWord: (word: string) => void;
  /** Replays the whole line at 0.6×. */
  onReplaySlow: () => void;
  playbackAvailable: boolean;
}

/**
 * What was actually said, taken apart.
 *
 * The point of the panel is that a missed sentence is almost never missed as a whole — one word inside it
 * went by too fast. Every word is separately playable and slowed down, so the learner can isolate the one
 * that beat them instead of replaying the full line and hoping. The furigana toggle exists because
 * reading the answer off the kanji is not the same skill as hearing it, and at some point you want it gone.
 */
export function SentenceBreakdown({
  words,
  translation,
  focusIndex,
  trap,
  furigana,
  onToggleFurigana,
  onSayWord,
  onReplaySlow,
  playbackAvailable,
}: SentenceBreakdownProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-hairline dark:bg-ink-800">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-[10px] font-black tracking-[0.14em] text-slate-500 dark:text-slate-400">
            WHAT WAS SAID · TAP ANY WORD
          </h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onToggleFurigana}
              aria-pressed={furigana}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11.5px] font-bold text-slate-600 hover:border-brand-300 dark:border-hairline dark:bg-ink-900 dark:text-slate-300 dark:hover:border-iris-400"
            >
              Furigana {furigana ? 'on' : 'off'}
            </button>
            <button
              type="button"
              onClick={onReplaySlow}
              disabled={!playbackAvailable}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11.5px] font-bold text-slate-600 hover:border-brand-300 disabled:opacity-40 dark:border-hairline dark:bg-ink-900 dark:text-slate-300 dark:hover:border-iris-400"
            >
              <Rewind size={12} aria-hidden="true" />
              Replay 0.6×
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-1.5">
          {words.map((word, index) => {
            const focused = index === focusIndex;
            return (
              <button
                key={`${word.text}-${index}`}
                type="button"
                onClick={() => onSayWord(word.text)}
                disabled={!playbackAvailable}
                aria-label={`Play ${word.text} slowly`}
                className={`jp-text flex flex-col items-center gap-0.5 rounded-xl border px-2.5 py-1.5 transition-colors disabled:cursor-default ${
                  focused
                    ? 'border-brand-400 bg-brand-50 dark:border-iris-400 dark:bg-iris-500/15'
                    : 'border-slate-200 bg-white hover:border-brand-300 dark:border-hairline dark:bg-ink-900 dark:hover:border-iris-400'
                }`}
              >
                {/* The ruby line keeps its height when furigana is off, so toggling doesn't reflow the
                    sentence out from under the finger about to tap it. */}
                <span
                  className={`min-h-3 text-[10px] font-semibold leading-3 text-brand-600 transition-opacity dark:text-brand-300 ${
                    furigana && word.reading ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {word.reading || ' '}
                </span>
                <span
                  className={`text-xl font-medium ${
                    focused ? 'text-brand-700 dark:text-iris-400' : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {word.text}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">{translation}</p>
      </div>

      {/* Only rendered when the sentence genuinely contains one of the traps — see soundTraps.ts. A panel
          that has to appear on every sentence ends up saying nothing on most of them.

          Ember Coral, not the amber "review" state — amber means one thing in this app (an SRS card is
          due) and a sound trap is not that. Coral is the system's sparing highlight accent, and this is
          the one moment on the page that earns it. */}
      {trap && (
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/[0.07] p-5">
          <h4 className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.14em] text-accent-600 dark:text-accent-500">
            <Ear size={12} aria-hidden="true" />
            SOUND TRAP
          </h4>
          <p className="jp-text mt-2 text-[15px] font-black text-accent-600 dark:text-accent-500">{trap.title}</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">{trap.body}</p>
        </div>
      )}
    </div>
  );
}
