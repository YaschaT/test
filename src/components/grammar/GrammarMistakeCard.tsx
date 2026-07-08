import { AlertTriangle } from 'lucide-react';
import { Card } from '../Card';
import { Bilingual } from '../Bilingual';
import type { Translatable } from '../../types';

/** Extracted from the old inline warning block so the lesson page's markup reads as a sequence of named
 * sections rather than a flat stack of same-shaped cards. Practical, not alarming — amber, not red. */
export function GrammarMistakeCard({ commonMistake }: { commonMistake: Translatable }) {
  return (
    <Card className="p-4 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30">
      <div className="flex items-start gap-2.5">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">Common mistake</h2>
          <Bilingual text={commonMistake} />
        </div>
      </div>
    </Card>
  );
}
