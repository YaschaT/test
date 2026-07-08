import { Link } from 'react-router-dom';
import { ArrowRight, Map } from 'lucide-react';
import { PRIMARY_BUTTON_CLASSES } from '../../lib/buttonStyles';
import { playPrimaryAction } from '../../lib/sound';

interface GrammarNextStepCardProps {
  nextPoint: { id: string; title: string } | null;
}

/** A real next-step: whichever grammar point actually comes after this one in sequence (or nothing, if
 * this is the last point), plus a way back to the path. No fake "practice/review" action — Grammar has
 * no SRS-based review queue to send someone into. */
export function GrammarNextStepCard({ nextPoint }: GrammarNextStepCardProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <Link
        to="/grammar"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <Map size={16} aria-hidden="true" /> Back to grammar path
      </Link>
      {nextPoint && (
        <Link to={`/grammar/${nextPoint.id}`} onClick={() => playPrimaryAction()} className={PRIMARY_BUTTON_CLASSES}>
          Next: <span className="jp-text">{nextPoint.title}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
