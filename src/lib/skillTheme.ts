import { BookOpenText, Layers, PenTool, BookOpen, Headphones, Mic, type LucideIcon } from 'lucide-react';
import type { SkillArea } from '../types';

export interface SkillTheme {
  icon: LucideIcon;
  from: string;
  to: string;
}

/** One distinct color identity per skill — deliberately kept out of the sidebar nav (would compete with
 * the active-state highlight) and used only where a category badge adds real scannability: the
 * dashboard plan and each module's page header. */
export const SKILL_THEME: Record<SkillArea, SkillTheme> = {
  grammar: { icon: BookOpenText, from: '#6f8ffc', to: '#3a54d6' },
  vocabulary: { icon: Layers, from: '#3ddc9b', to: '#0c9463' },
  kanji: { icon: PenTool, from: '#fbbf5a', to: '#d97706' },
  reading: { icon: BookOpen, from: '#4fc3f7', to: '#0284c7' },
  listening: { icon: Headphones, from: '#b18cfa', to: '#7c3aed' },
  speaking: { icon: Mic, from: '#fb8ca0', to: '#e11d48' },
};
