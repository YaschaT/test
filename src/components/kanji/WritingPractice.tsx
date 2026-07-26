import { useState } from 'react';
import { Eraser, Eye, EyeOff } from 'lucide-react';
import { KanjiCanvas } from '../KanjiCanvas';
import { StrokeOrderDiagram } from './StrokeOrderDiagram';
import { getStrokes } from '../../data/strokeOrder';
import type { Translatable } from '../../types';

interface WritingPracticeProps {
  character: string;
  meaning: Translatable;
  reading: string;
  size?: number;
}

type Stage = 'see' | 'trace' | 'copy' | 'recall';

const STAGES: { id: Stage; label: string }[] = [
  { id: 'see', label: 'See' },
  { id: 'trace', label: 'Trace' },
  { id: 'copy', label: 'Copy' },
  { id: 'recall', label: 'Recall' },
];

const INSTRUCTIONS: Record<Stage, string> = {
  see: 'Watch the stroke order. Notice where each stroke starts and which way it goes.',
  trace: 'Trace directly over the model, following the numbered order.',
  copy: 'Now write it yourself with the model beside you for reference.',
  recall: 'From memory only — write it, then reveal to check.',
};

/**
 * See → Trace → Copy → Recall writing practice. Uses authentic numbered stroke order when it is
 * available for the character (`src/data/strokeOrder.ts`) and falls back to the accurate
 * font-outline guide otherwise, so stroke order is never guessed.
 */
export function WritingPractice({ character, meaning, reading, size = 260 }: WritingPracticeProps) {
  const strokes = getStrokes(character);
  const [stage, setStage] = useState<Stage>('see');
  const [resetToken, setResetToken] = useState(0);
  const [revealed, setRevealed] = useState(false);

  function goTo(next: Stage) {
    setStage(next);
    setRevealed(false);
    setResetToken((t) => t + 1);
  }

  const referenceGlyph = (
    <span className="jp-text text-slate-300 dark:text-slate-600 leading-none" style={{ fontSize: size * 0.5 }}>
      {character}
    </span>
  );

  return (
    <div className="flex flex-col items-center gap-4">
      {/* stage stepper */}
      <div className="flex w-full max-w-xs rounded-xl bg-slate-100 dark:bg-slate-800 p-1" role="tablist" aria-label="Writing practice stages">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={stage === s.id}
            onClick={() => goTo(s.id)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
              stage === s.id
                ? 'bg-white dark:bg-slate-950 text-brand-600 dark:text-brand-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span className="tabular-nums opacity-60 mr-1">{i + 1}</span>
            {s.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 text-center min-h-[2.5rem] max-w-sm">{INSTRUCTIONS[stage]}</p>

      {/* SEE */}
      {stage === 'see' &&
        (strokes ? (
          <StrokeOrderDiagram strokes={strokes} size={size} mode="numbered" replayable />
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
              style={{ width: size, height: size, maxWidth: '100%' }}
            >
              <span className="jp-text text-slate-800 dark:text-slate-100 leading-none" style={{ fontSize: size * 0.6 }}>
                {character}
              </span>
            </div>
            <p className="text-xs text-slate-400 text-center max-w-xs">
              Numbered stroke order isn’t available for this kanji yet — study the shape, then trace the outline.
            </p>
          </div>
        ))}

      {/* TRACE */}
      {stage === 'trace' &&
        (strokes ? (
          <div className="relative" style={{ width: size, height: size, maxWidth: '100%' }}>
            <div className="absolute inset-0 pointer-events-none">
              <StrokeOrderDiagram strokes={strokes} size={size} mode="faint" bare />
            </div>
            <div className="absolute inset-0">
              <KanjiCanvas character={character} size={size} transparent fontGuide={false} showControls={false} resetToken={resetToken} />
            </div>
          </div>
        ) : (
          <KanjiCanvas character={character} size={size} fontGuide showControls={false} resetToken={resetToken} />
        ))}

      {/* COPY */}
      {stage === 'copy' && (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div
            className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 shrink-0"
            style={{ width: size * 0.5, height: size * 0.5 }}
            aria-hidden
          >
            {strokes ? <StrokeOrderDiagram strokes={strokes} size={size * 0.45} mode="numbered" /> : referenceGlyph}
          </div>
          <KanjiCanvas character={character} size={size} fontGuide={false} showControls={false} resetToken={resetToken} />
        </div>
      )}

      {/* RECALL */}
      {stage === 'recall' && (
        <div className="flex flex-col items-center gap-3">
          <div className="text-center">
            <p className="jp-text text-lg text-slate-700 dark:text-slate-200">{reading}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{meaning.en}</p>
          </div>
          <KanjiCanvas character={character} size={size} fontGuide={false} showControls={false} resetToken={resetToken} />
          {revealed && (
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900 px-4 py-2">
              <span className="jp-text text-3xl text-slate-800 dark:text-slate-100">{character}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {revealed ? <EyeOff size={13} /> : <Eye size={13} />} {revealed ? 'Hide answer' : 'Reveal answer'}
          </button>
        </div>
      )}

      {/* shared clear control for the drawing stages */}
      {stage !== 'see' && (
        <button
          type="button"
          onClick={() => setResetToken((t) => t + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Eraser size={13} /> Clear
        </button>
      )}
    </div>
  );
}
