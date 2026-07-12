import type { ReactElement } from 'react';
import {
  DashboardNavIcon,
  GrammarNavIcon,
  VocabularyNavIcon,
  KanjiNavIcon,
  ReadingNavIcon,
  ListeningNavIcon,
} from '../components/dashboard/navIcons';
import type { Translatable } from '../types';

export interface NavItem {
  path: string;
  label: Translatable;
  icon: (props: { size?: number; className?: string }) => ReactElement;
}

/** Extended as each phase's page lands — every entry here must point to a real, working route. */
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: { en: 'Dashboard', nl: 'Overzicht' }, icon: DashboardNavIcon },
  { path: '/grammar', label: { en: 'Grammar', nl: 'Grammatica' }, icon: GrammarNavIcon },
  { path: '/vocabulary', label: { en: 'Vocabulary', nl: 'Woordenschat' }, icon: VocabularyNavIcon },
  { path: '/kanji', label: { en: 'Kanji', nl: 'Kanji' }, icon: KanjiNavIcon },
  { path: '/reading', label: { en: 'Reading', nl: 'Lezen' }, icon: ReadingNavIcon },
  { path: '/listening', label: { en: 'Listening', nl: 'Luisteren' }, icon: ListeningNavIcon },
];
