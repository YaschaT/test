import type { ReactElement } from 'react';
import {
  DashboardNavIcon,
  GrammarNavIcon,
  VocabularyNavIcon,
  KanjiNavIcon,
  ReadingNavIcon,
  ListeningNavIcon,
  PathNavIcon,
  SpeakingNavIcon,
  MockTestNavIcon,
} from '../components/dashboard/navIcons';
import type { Translatable } from '../types';

export interface NavItem {
  path: string;
  label: Translatable;
  icon: (props: { size?: number; className?: string }) => ReactElement;
  /** Sidebar grouping heading rendered above this item. Omitted for the two top-level destinations. */
  group?: 'LEARN' | 'ASSESS';
}

/** Extended as each phase's page lands — every entry here must point to a real, working route. Order and
 * grouping follow the dashboard redesign reference's sidebar. */
export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: { en: 'Dashboard', nl: 'Overzicht' }, icon: DashboardNavIcon },
  { path: '/path', label: { en: 'Learning Path', nl: 'Leerpad' }, icon: PathNavIcon },
  { path: '/grammar', label: { en: 'Grammar', nl: 'Grammatica' }, icon: GrammarNavIcon, group: 'LEARN' },
  { path: '/vocabulary', label: { en: 'Vocabulary', nl: 'Woordenschat' }, icon: VocabularyNavIcon },
  { path: '/kanji', label: { en: 'Kanji', nl: 'Kanji' }, icon: KanjiNavIcon },
  { path: '/reading', label: { en: 'Reading', nl: 'Lezen' }, icon: ReadingNavIcon },
  { path: '/listening', label: { en: 'Listening', nl: 'Luisteren' }, icon: ListeningNavIcon },
  { path: '/speaking', label: { en: 'Speaking', nl: 'Spreken' }, icon: SpeakingNavIcon },
  { path: '/mock', label: { en: 'Mock Exam', nl: 'Proefexamen' }, icon: MockTestNavIcon, group: 'ASSESS' },
];
