import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card } from '../Card';
import { PrimaryButton } from '../PrimaryButton';
import { GrammarMascotImage } from './GrammarMascotImage';
import { GrammarStateBadge, type GrammarPointState } from './GrammarStateBadge';
import type { GrammarPoint } from '../../types';

interface GrammarLessonPreviewProps {
  point: GrammarPoint;
  state: GrammarPointState;
}

/**
 * The learning layout's right column — a live preview of whichever point is selected in the path list,
 * with a real, working CTA into the actual lesson page. Not a duplicate of the detail page: just enough
 * (meaning + first example) to help a learner decide this is the one they want to open.
 */
export function GrammarLessonPreview({ point, state }: GrammarLessonPreviewProps) {
  const example = point.examples[0];

  return (
    <Card className="p-5 space-y-4 lg:sticky lg:top-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <h2 className="jp-text text-2xl font-bold text-slate-900 dark:text-white">{point.title}</h2>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full px-1.5 py-0.5">
            {point.level}
          </span>
        </div>
        <GrammarStateBadge state={state} />
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300">{point.meaning.en}</p>

      {example && (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3.5">
          <p className="jp-text text-slate-800 dark:text-slate-100">{example.segments.map((s) => s.text).join('')}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{example.en}</p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <GrammarMascotImage size={40} className="shrink-0" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {state === 'completed' ? "You've got this one — review any time." : 'Ready when you are.'}
        </p>
      </div>

      <Link to={`/grammar/${point.id}`} className="block">
        <PrimaryButton className="w-full justify-center">
          {state === 'completed' ? 'Review lesson' : 'Start lesson'} <ArrowRight size={16} aria-hidden="true" />
        </PrimaryButton>
      </Link>
    </Card>
  );
}
