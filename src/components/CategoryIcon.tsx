import { SKILL_THEME } from '../lib/skillTheme';
import type { SkillArea } from '../types';

interface CategoryIconProps {
  skill: SkillArea;
  size?: number;
  className?: string;
}

export function CategoryIcon({ skill, size = 36, className = '' }: CategoryIconProps) {
  const theme = SKILL_THEME[skill];
  const Icon = theme.icon;
  const iconSize = Math.round(size * 0.52);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
        boxShadow: `0 3px 8px -2px ${theme.to}88, inset 0 1.5px 0 rgba(255,255,255,0.35)`,
      }}
    >
      <Icon size={iconSize} className="text-white" strokeWidth={2.25} aria-hidden="true" />
    </div>
  );
}
