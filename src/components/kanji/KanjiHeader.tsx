import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { CategoryIcon } from '../CategoryIcon';
import { PRIMARY_BUTTON_CLASSES } from '../../lib/buttonStyles';
import { playPrimaryAction } from '../../lib/sound';

interface KanjiHeaderProps {
  ctaLabel: string | null;
  ctaHref: string;
}

export function KanjiHeader({ ctaLabel, ctaHref }: KanjiHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <CategoryIcon skill="kanji" size={48} />
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">Kanji</h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-1">Master the building blocks of Japanese.</p>
        </div>
      </div>
      {ctaLabel ? (
        <Link to={ctaHref} onClick={() => playPrimaryAction()} className={PRIMARY_BUTTON_CLASSES}>
          <Sparkles size={16} />
          {ctaLabel}
        </Link>
      ) : (
        <span className="text-sm text-slate-400 self-center">All caught up for now</span>
      )}
    </div>
  );
}
