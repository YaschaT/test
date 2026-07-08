import type { ReactNode } from 'react';
import { CategoryIcon } from '../CategoryIcon';
import type { SkillArea } from '../../types';

interface SectionHeaderProps {
  skill: SkillArea;
  title: string;
  subtitle: ReactNode;
  iconSize?: number;
}

/** The "icon + title + subtitle" page header repeated (with slightly different markup each time) at the
 * top of Grammar, Reading, and Listening — consolidated into one component so they stay visually
 * consistent as a set. Vocabulary and Kanji have their own dedicated header components since those also
 * carry a CTA button; this is for the simpler, CTA-less pages. */
export function SectionHeader({ skill, title, subtitle, iconSize = 44 }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <CategoryIcon skill={skill} size={iconSize} />
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
