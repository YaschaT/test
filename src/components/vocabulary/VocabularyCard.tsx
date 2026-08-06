import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Volume2 } from 'lucide-react';
import { LearningProgressBar } from '../learning/LearningProgressBar';
import { LEARNING_STATE_THEME } from '../../lib/learningStateTheme';
import { ENTRANCE_ANIMATION_CLASSES, getEntranceDelayMs } from '../../lib/entranceAnimation';
import { isWordSaved, toggleWordSaved } from '../../lib/savedWords';
import { speakJapaneseBrowser } from '../../lib/tts/browserTts';
import type { LearningState } from '../../lib/learningState';
import type { VocabWord } from '../../types';
import { playCardTap } from '../../lib/sound';

interface VocabularyCardProps {
  word: VocabWord;
  state: LearningState;
  progress: number;
  layout: 'grid' | 'list';
  /** Position within the current filtered list — drives the entrance stagger. Omit to skip animating. */
  index?: number;
}

/**
 * Redesigned against a user-supplied reference mockup, matched closely for the header (word + NEW/level
 * badge + save star) and footer (audio + Learn/progress) rows. The Japanese word dropped from
 * text-3xl/2rem to text-xl/2xl — the reference's own proportions, and a direct fix for explicit feedback
 * that the word text read as too large. The learning-state color story (border/glow) is unchanged; the
 * old bottom icon-badge was dropped as redundant now that the same 4-state color already carries that
 * meaning via the card's border and glow.
 */
export function VocabularyCard({ word, state, progress, layout, index }: VocabularyCardProps) {
  const [saved, setSaved] = useState(() => isWordSaved(word.id));
  const theme = LEARNING_STATE_THEME[state];

  // Nested controls sit inside the link, so their clicks must not also follow it.
  function handleToggleSaved(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved(toggleWordSaved(word.id));
  }

  function handlePlay(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    speakJapaneseBrowser(word.japanese);
  }

  return (
    // A real link, not a div pretending: opening a word now goes to the card session — the same thing
    // tapping a kanji does — so it gets Enter, middle-click and open-in-new-tab for free.
    <Link
      to={`/vocabulary/${word.id}`}
      onClick={() => playCardTap()}
      style={index !== undefined ? { animationDelay: `${getEntranceDelayMs(index)}ms` } : undefined}
      className={`group relative block overflow-hidden rounded-2xl border bg-white dark:bg-slate-900 p-4 select-none transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm ${theme.border} ${theme.borderHover} ${theme.ring} ${theme.glow} ${theme.glowHover} ${layout === 'list' ? 'flex items-center gap-4' : ''} ${index !== undefined ? ENTRANCE_ANIMATION_CLASSES : ''}`}
    >
      <div className={layout === 'list' ? 'flex-1 min-w-0' : ''}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="jp-text text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight truncate">
              {word.japanese}
            </p>
            {word.kana !== word.japanese && (
              <p className="jp-text text-xs text-slate-400 dark:text-slate-500 mt-0.5">{word.kana}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${
                state === 'new' ? 'bg-brand-600 text-white' : 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {state === 'new' ? 'New' : word.level}
            </span>
            <button
              type="button"
              onClick={handleToggleSaved}
              aria-label={saved ? `Remove ${word.japanese} from saved words` : `Save ${word.japanese}`}
              aria-pressed={saved}
              className="text-slate-300 dark:text-slate-600 hover:text-amber-400 dark:hover:text-amber-400 transition-colors"
            >
              <Star size={16} className={saved ? 'fill-amber-400 text-amber-400' : ''} aria-hidden="true" />
            </button>
          </div>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 truncate">{word.meaning.en}</p>

        <div className="flex items-center gap-3 mt-3">
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Play pronunciation of ${word.japanese}`}
            className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Volume2 size={15} aria-hidden="true" />
          </button>

          {state === 'new' ? (
            <span className="inline-flex items-center gap-1 rounded-xl bg-brand-600 text-white text-xs font-bold px-3 py-1.5 ml-auto">
              + Learn
            </span>
          ) : (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-end mb-1">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{progress}%</span>
              </div>
              <LearningProgressBar percent={progress} />
            </div>
          )}
        </div>

      </div>
    </Link>
  );
}
