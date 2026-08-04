import type { ReactNode } from 'react';
import { CategoryIcon } from '../CategoryIcon';
import type { SkillArea } from '../../types';

interface ModuleHeaderProps {
  skill: SkillArea;
  title: string;
  subtitle: string;
  /** Optional right-aligned slot — a primary CTA, a progress readout, or nothing. */
  right?: ReactNode;
}

/**
 * The one page header shared by every skill module (Grammar, Vocabulary, Kanji, Reading, Listening):
 * skill badge + title + subtitle on the left, an optional action/readout on the right. Keeping this in a
 * single component is what makes all five module pages read as the same product.
 */
export function ModuleHeader({ skill, title, subtitle, right }: ModuleHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <CategoryIcon skill={skill} size={44} />
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      {right}
    </div>
  );
}
