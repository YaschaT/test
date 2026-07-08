import { Badge } from '../ui/badge';
import { LEARNING_STATE_THEME } from '../../lib/learningStateTheme';
import type { LearningState } from '../../lib/learningState';

export function LearningStateBadge({ state }: { state: LearningState }) {
  const theme = LEARNING_STATE_THEME[state];
  const Icon = theme.icon;
  return (
    <Badge className={`h-auto gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${theme.badgeBg} ${theme.badgeText}`}>
      <Icon size={11} aria-hidden="true" />
      {theme.label}
    </Badge>
  );
}
