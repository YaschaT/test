import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { CategoryIcon } from '../CategoryIcon';
import { PRIMARY_BUTTON_CLASSES } from '../../lib/buttonStyles';
import { playPrimaryAction } from '../../lib/sound';

interface VocabularyHeaderProps {
  ctaLabel: string | null;
}

export function VocabularyHeader({ ctaLabel }: VocabularyHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <CategoryIcon skill="vocabulary" size={48} />
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">Vocabulary</h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Build your Japanese word bank step by step.</p>
        </div>
      </div>
      {ctaLabel ? (
        <Link to="/vocabulary/review" onClick={() => playPrimaryAction()} className={PRIMARY_BUTTON_CLASSES}>
          <Sparkles size={16} />
          {ctaLabel}
        </Link>
      ) : (
        <span className="text-sm text-slate-400 self-center">All caught up for now</span>
      )}
    </div>
  );
}
