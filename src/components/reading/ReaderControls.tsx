import { AlignLeft, Languages, Pause, Type, Volume2 } from 'lucide-react';
import type { MeaningMode, ReadingPrefs } from '../../lib/readingPrefs';

const MEANING_OPTIONS: { value: MeaningMode; label: string; hint: string }[] = [
  { value: 'hidden', label: 'Hidden', hint: 'Tap a line to open its meaning' },
  { value: 'dim', label: 'Dimmed', hint: 'Meanings stay on screen, quietly' },
  { value: 'shown', label: 'Shown', hint: 'Every meaning printed under its line' },
];

interface ReaderControlsProps {
  prefs: ReadingPrefs;
  onChange: (patch: Partial<ReadingPrefs>) => void;
  /** How many lines the reader has opened, and out of how many. */
  opened: number;
  total: number;
  voiceAvailable: boolean;
  readingAloud: boolean;
  onReadAloud: () => void;
}

/**
 * The reader's controls, in a bar that stays reachable — the same sticky treatment the grammar lesson
 * and practice screens use, lifted clear of the mobile tab bar.
 */
export function ReaderControls({
  prefs,
  onChange,
  opened,
  total,
  voiceAvailable,
  readingAloud,
  onReadAloud,
}: ReaderControlsProps) {
  const active = MEANING_OPTIONS.find((o) => o.value === prefs.meaning) ?? MEANING_OPTIONS[0];

  return (
    <div className="sticky bottom-20 z-20 mx-3 mb-3 mt-2 rounded-2xl border border-white/10 bg-[#0b1222]/95 px-4 py-3 backdrop-blur md:bottom-4 lg:mx-5 lg:mb-5 lg:px-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div
          role="radiogroup"
          aria-label="How much of the meaning to show"
          className="flex shrink-0 rounded-xl border border-white/10 bg-white/[0.04] p-1"
        >
          {MEANING_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={prefs.meaning === option.value}
              onClick={() => onChange({ meaning: option.value })}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-bold transition-colors ${
                prefs.meaning === option.value
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Icon-only on a phone: with labels these four wrapped onto three rows and the bar ate a
            quarter of the screen — on a reading screen, of all places. */}
        <Toggle on={prefs.furigana} onClick={() => onChange({ furigana: !prefs.furigana })} icon={Type}>
          Furigana
        </Toggle>
        <Toggle on={prefs.romaji} onClick={() => onChange({ romaji: !prefs.romaji })} icon={Languages}>
          Romaji
        </Toggle>
        <Toggle on={prefs.vertical} onClick={() => onChange({ vertical: !prefs.vertical })} icon={AlignLeft}>
          Vertical
        </Toggle>

        {voiceAvailable && (
          <Toggle on={readingAloud} onClick={onReadAloud} icon={readingAloud ? Pause : Volume2}>
            {readingAloud ? 'Stop' : 'Read aloud'}
          </Toggle>
        )}

        <p className="ml-auto w-full text-[13px] text-slate-400 sm:w-auto sm:text-right">
          {prefs.meaning === 'hidden' ? (
            opened === 0 ? (
              <span>Reading without meanings — {total} lines to go</span>
            ) : (
              <span>
                You have opened <strong className="font-bold text-white tabular-nums">{opened}</strong> of{' '}
                <span className="tabular-nums">{total}</span> lines
              </span>
            )
          ) : (
            <span>{active.hint}</span>
          )}
        </p>
      </div>
    </div>
  );
}

function Toggle({
  on,
  onClick,
  icon: Icon,
  children,
}: {
  on: boolean;
  onClick: () => void;
  icon: typeof Type;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={children}
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-2 text-[13px] font-bold transition-colors sm:px-3 ${
        on
          ? 'border-brand-400/45 bg-brand-500/15 text-brand-200'
          : 'border-white/10 bg-white/[0.04] text-slate-400 hover:text-white'
      }`}
    >
      <Icon size={15} aria-hidden="true" />
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}
