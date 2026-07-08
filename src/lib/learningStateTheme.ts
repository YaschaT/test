import { Sparkles, BookOpen, Clock, CheckCircle2, type LucideIcon } from 'lucide-react';
import type { LearningState } from './learningState';

export interface LearningStateTheme {
  label: string;
  icon: LucideIcon;
  border: string;
  borderHover: string;
  ring: string;
  badgeBg: string;
  badgeText: string;
  iconText: string;
  barColor: string;
  /** Outer glow at rest — a soft, always-on colored shadow so the state reads even before hovering. */
  glow: string;
  /** Outer glow on hover/focus — same hue, stronger, paired with the border-color intensification. */
  glowHover: string;
}

/** One color per learning state, applied consistently across the card border/glow, the state pill, and the
 * progress bar so a grid of Vocabulary or Kanji cards can be scanned at a glance without reading a label. */
export const LEARNING_STATE_THEME: Record<LearningState, LearningStateTheme> = {
  new: {
    label: 'New',
    icon: Sparkles,
    border: 'border-blue-500/25',
    borderHover: 'hover:border-blue-400/60',
    ring: 'focus-visible:ring-blue-400/60',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-700 dark:text-blue-300',
    iconText: 'text-blue-400',
    barColor: 'bg-blue-500',
    glow: 'shadow-[0_0_0_1px_rgba(59,130,246,0.08),0_6px_20px_-8px_rgba(59,130,246,0.35)]',
    glowHover: 'hover:shadow-[0_0_0_1px_rgba(59,130,246,0.25),0_10px_28px_-6px_rgba(59,130,246,0.55)]',
  },
  practice: {
    label: 'Practice',
    icon: BookOpen,
    border: 'border-violet-500/30',
    borderHover: 'hover:border-violet-400/60',
    ring: 'focus-visible:ring-violet-400/60',
    badgeBg: 'bg-violet-500/15',
    badgeText: 'text-violet-700 dark:text-violet-300',
    iconText: 'text-violet-400',
    barColor: 'bg-violet-500',
    glow: 'shadow-[0_0_0_1px_rgba(139,92,246,0.1),0_6px_20px_-8px_rgba(139,92,246,0.4)]',
    glowHover: 'hover:shadow-[0_0_0_1px_rgba(139,92,246,0.28),0_10px_28px_-6px_rgba(139,92,246,0.6)]',
  },
  review: {
    label: 'Review',
    icon: Clock,
    border: 'border-amber-500/30',
    borderHover: 'hover:border-amber-400/60',
    ring: 'focus-visible:ring-amber-400/60',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-800 dark:text-amber-300',
    iconText: 'text-amber-400',
    barColor: 'bg-amber-500',
    glow: 'shadow-[0_0_0_1px_rgba(245,158,11,0.1),0_6px_20px_-8px_rgba(245,158,11,0.4)]',
    glowHover: 'hover:shadow-[0_0_0_1px_rgba(245,158,11,0.28),0_10px_28px_-6px_rgba(245,158,11,0.6)]',
  },
  mastered: {
    label: 'Mastered',
    icon: CheckCircle2,
    border: 'border-emerald-500/30',
    borderHover: 'hover:border-emerald-400/60',
    ring: 'focus-visible:ring-emerald-400/60',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    iconText: 'text-emerald-400',
    barColor: 'bg-emerald-500',
    glow: 'shadow-[0_0_0_1px_rgba(16,185,129,0.1),0_6px_20px_-8px_rgba(16,185,129,0.4)]',
    glowHover: 'hover:shadow-[0_0_0_1px_rgba(16,185,129,0.28),0_10px_28px_-6px_rgba(16,185,129,0.6)]',
  },
};
