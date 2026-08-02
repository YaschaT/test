import { Layers, PenLine, BookOpen, ScrollText, Headphones, type LucideIcon } from 'lucide-react';
import type { MockSection } from '../../lib/mockExam';

/**
 * Per-section visual identity for the mock exam — four calm, distinct hues (drawn from the app's own
 * brand/state palette) so the section eyebrow and the results breakdown read as one system without
 * turning into a carnival. `hex` drives SVG/inline fills; the class strings drive chips.
 */
export interface SectionTheme {
  icon: LucideIcon;
  hex: string;
  /** Soft tinted chip: bg + text, light & dark. */
  chip: string;
  /** Foreground text color for the hue. */
  text: string;
}

export const SECTION_THEME: Record<MockSection, SectionTheme> = {
  vocabulary: {
    icon: Layers,
    hex: '#4c6ef0',
    chip: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
    text: 'text-brand-600 dark:text-brand-300',
  },
  kanji: {
    icon: PenLine,
    hex: '#8b5cf6',
    chip: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    text: 'text-violet-600 dark:text-violet-300',
  },
  grammar: {
    icon: BookOpen,
    hex: '#10b981',
    chip: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-300',
  },
  reading: {
    icon: ScrollText,
    hex: '#f59e0b',
    chip: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-300',
  },
  listening: {
    icon: Headphones,
    hex: '#e8735c',
    chip: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    text: 'text-rose-600 dark:text-rose-300',
  },
};
