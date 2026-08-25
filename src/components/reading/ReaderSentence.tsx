import { Pause, Volume2 } from 'lucide-react';
import { JapaneseText } from '../JapaneseText';
import type { MeaningMode } from '../../lib/readingPrefs';
import type { ReadingSentence as Sentence } from '../../types';

interface ReaderSentenceProps {
  sentence: Sentence;
  index: number;
  furigana: boolean;
  romaji: boolean;
  meaning: MeaningMode;
  /** True once the reader has opened this line's meaning. Only meaningful in `hidden` mode. */
  opened: boolean;
  playing: boolean;
  voiceAvailable: boolean;
  /** Tategaki: the meaning moves to a single slab under the whole passage instead of sitting inline. */
  vertical: boolean;
  onOpen: () => void;
  onPlay: () => void;
  innerRef: (node: HTMLLIElement | null) => void;
}

/**
 * One sentence of a book.
 *
 * No number, no card, no border — a book is prose, and the old numbered rows made every passage read as
 * an exercise sheet. What replaces them: the line you are on gets a quiet marker, and the meaning is
 * something you ask for.
 *
 * Colours are fixed light-on-dark rather than theme-dependent: the reader card is dark in *both*
 * themes, so a `dark:` variant here would render slate-800 Japanese on navy in light mode.
 */
export function ReaderSentence({
  sentence,
  index,
  furigana,
  romaji,
  meaning,
  opened,
  playing,
  voiceAvailable,
  vertical,
  onOpen,
  onPlay,
  innerRef,
}: ReaderSentenceProps) {
  const revealed = meaning === 'shown' || (meaning === 'hidden' && opened);
  // Tategaki has no inline slot for a translation, so every line stays tappable there whatever the mode
  // is — the tap is what puts it in the slab under the passage. Without this, Dimmed and Shown showed a
  // vertical reader no meanings at all.
  const canOpen = vertical || (meaning === 'hidden' && !opened);

  const japanese = (
    <JapaneseText
      segments={sentence.segments}
      showFurigana={furigana}
      className={`jp-serif ${
        // Tategaki has the room a horizontal line does not: the columns run down the pane and it is the
        // page's *width* they spend, so the text can be set at something closer to a real book's size.
        // In vertical writing mode line-height is what sets the gap between columns, not between lines.
        vertical ? 'text-[30px] leading-[1.9] sm:text-[34px]' : 'text-[21px] leading-[2.1] sm:text-[22px]'
      } ${playing ? 'text-brand-200' : 'text-slate-100'}`}
    />
  );

  return (
    <li
      ref={innerRef}
      data-sentence-index={index}
      className={`group relative ${vertical ? '' : 'py-0.5'} ${
        playing ? 'rounded-lg bg-brand-500/10' : ''
      }`}
    >
      <div className={vertical ? '' : 'flex items-start gap-2'}>
        {canOpen ? (
          // A real button: tap or Enter opens the meaning, and it is the only control on the line, so
          // it keeps its own focus ring rather than borrowing the row's.
          <button
            type="button"
            onClick={onOpen}
            aria-label={`Show the meaning of sentence ${index + 1}`}
            className="min-w-0 flex-1 rounded-lg text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            {japanese}
          </button>
        ) : (
          <p className={vertical ? '' : 'min-w-0 flex-1'}>{japanese}</p>
        )}

        {!vertical && (
          <button
            type="button"
            onClick={onPlay}
            disabled={!voiceAvailable}
            aria-label={playing ? `Stop sentence ${index + 1}` : `Read sentence ${index + 1} aloud`}
            title={voiceAvailable ? undefined : 'No Japanese voice available on this device'}
            className={`mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-[opacity,color,background-color] hover:bg-white/10 hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-0 group-hover:opacity-100 pointer-coarse:opacity-100 ${
              playing ? 'bg-brand-500 text-white opacity-100 hover:bg-brand-500' : 'opacity-0'
            }`}
          >
            {playing ? <Pause size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}
          </button>
        )}
      </div>

      {romaji && !vertical && (
        <p className="mt-0.5 text-sm text-brand-300">{sentence.romaji}</p>
      )}

      {/* In tategaki the meaning cannot sit inline without breaking the column, so the reader shows the
          most recently opened line in one slab beneath the whole passage instead. */}
      {!vertical && (revealed || meaning === 'dim') && (
        <div
          className={`mb-2 ml-1 border-l-2 border-brand-500/50 py-1 pl-4 transition-opacity ${
            meaning === 'dim'
              ? 'border-transparent opacity-35 group-hover:border-brand-500/50 group-hover:opacity-100 group-focus-within:border-brand-500/50 group-focus-within:opacity-100'
              : 'animate-review-reveal-in'
          }`}
        >
          <p className="text-[15px] leading-relaxed text-slate-300">{sentence.en}</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-slate-400">{sentence.nl}</p>
        </div>
      )}
    </li>
  );
}
