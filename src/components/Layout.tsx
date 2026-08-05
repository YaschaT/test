import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Flame, Moon, Sun, Volume2, VolumeX, Music2, RotateCcw, Trophy, CalendarDays, LogIn, LogOut } from 'lucide-react';
import { NAV_ITEMS } from '../lib/nav';
import { useProgress } from '../lib/progressStore';
import { displayedStreak } from '../lib/streak';
import { todayIso } from '../lib/date';
import { useDarkMode } from '../lib/useDarkMode';
import { useStudyTimer } from '../lib/useStudyTimer';
import { useStreakPulse } from '../lib/useStreakPulse';
import { useLevelUp } from '../lib/useLevelUp';
import { useBackgroundMusic } from '../lib/useBackgroundMusic';
import { isSoundEnabled, playMilestone, setSoundEnabled } from '../lib/sound';
import { getLevelInfo } from '../lib/xp';
import { useAuth } from '../lib/authStore';
import { signOut } from '../lib/auth';
import { SidebarLevelCard } from './dashboard/SidebarLevelCard';
import { LevelUpDialog } from './LevelUpDialog';
import { AccountNavItem } from './AccountNavItem';
import { IconButton } from './ui/IconButton';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Logo } from './Logo';

const NAV_ITEM_CLASSES = (isActive: boolean) =>
  `flex items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] font-medium transition-colors ${
    isActive
      ? 'bg-brand-600 text-white shadow-sm'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

/**
 * Real shortcuts into content that already exists on the Dashboard — not top-level routes, so they never
 * get the NavLink "active" highlight (that's reserved for NAV_ITEMS). Every entry genuinely navigates
 * somewhere real; nothing here is a placeholder or "coming soon" link.
 */
function useSecondaryNavItems() {
  const navigate = useNavigate();
  return [
    { key: 'review', label: 'Review', icon: RotateCcw, onClick: () => navigate('/vocabulary') },
    { key: 'achievements', label: 'Achievements', icon: Trophy, onClick: () => navigate('/dashboard#achievements-section') },
    { key: 'study-plan', label: 'Study Plan', icon: CalendarDays, onClick: () => navigate('/dashboard#study-plan-section') },
  ];
}

export function Layout() {
  const progress = useProgress();
  const [dark, toggleDark] = useDarkMode();
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [musicOn, toggleMusic] = useBackgroundMusic();
  const streak = displayedStreak(progress.streak, todayIso());
  const streakPulsing = useStreakPulse(streak);
  const levelInfo = getLevelInfo(progress);
  const { newLevel, dismiss: dismissLevelUp } = useLevelUp(levelInfo.level);
  const location = useLocation();
  // These screens share the Dashboard's full-width treatment rather than the narrower reading-focused
  // `max-w-5xl` used by detail pages (Grammar/Kanji/Reading detail, etc.) — a fixed-width column left a
  // lot of dead space either side once the stats panel/card grid were built to fill the available width.
  // The vocabulary review workspace joined the list with its two-column stage + session-rail redesign.
  const isWideLayout =
    location.pathname === '/dashboard' ||
    location.pathname === '/vocabulary' ||
    location.pathname === '/kanji' ||
    location.pathname === '/vocabulary/review' ||
    location.pathname.startsWith('/grammar') ||
    location.pathname.startsWith('/reading/');
  const secondaryNavItems = useSecondaryNavItems();
  const auth = useAuth();
  const navigate = useNavigate();
  useStudyTimer();

  useEffect(() => {
    if (streakPulsing) playMilestone();
  }, [streakPulsing]);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-200 dark:border-slate-800">
          <Logo size={32} />
          <span className="text-xl font-semibold text-brand-700 dark:text-brand-300">Kotobox</span>
        </div>
        <ScrollArea className="flex-1">
          <nav className="px-3 py-4 space-y-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => NAV_ITEM_CLASSES(isActive)}
              >
                <item.icon size={19} aria-hidden="true" />
                {item.label.en}
              </NavLink>
            ))}

            <Separator className="my-2 bg-slate-100 dark:bg-slate-800" />

            {secondaryNavItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                className={`w-full ${NAV_ITEM_CLASSES(false)}`}
              >
                <item.icon size={19} aria-hidden="true" />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            ))}
          </nav>
        </ScrollArea>
        <div className="px-3 pb-1">
          <AccountNavItem />
        </div>
        <div className="px-3 pb-3">
          <SidebarLevelCard levelInfo={levelInfo} />
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 ${streakPulsing ? 'animate-pop' : ''}`}>
            <Flame size={16} className={streak > 0 ? 'text-accent-500' : ''} aria-hidden="true" />
            <span>{streak} day streak</span>
          </div>
          <div className="flex items-center gap-1">
            <IconButton
              icon={soundOn ? Volume2 : VolumeX}
              label={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
              active={soundOn}
              onClick={toggleSound}
            />
            <IconButton
              icon={Music2}
              label={musicOn ? 'Turn off background music' : 'Turn on background music'}
              active={musicOn}
              onClick={toggleMusic}
            />
            <IconButton
              icon={dark ? Sun : Moon}
              label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleDark}
            />
          </div>
        </div>
      </aside>

      {/* min-w-0: as a flex item this defaults to min-width:auto, so a page whose content has a wide
          minimum (e.g. Reading's shelves) pushes it past the viewport and scrolls the whole page
          sideways instead of staying inside its column. */}
      <div className="flex-1 min-w-0 md:ml-64 flex flex-col min-h-screen">
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
          <span className="flex items-center gap-2 text-lg font-semibold text-brand-700 dark:text-brand-300">
            <Logo size={26} />
            Kotobox
          </span>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 ${streakPulsing ? 'animate-pop' : ''}`}>
              <Flame size={14} className={streak > 0 ? 'text-accent-500' : ''} aria-hidden="true" />
              {streak}
            </span>
            <IconButton
              icon={soundOn ? Volume2 : VolumeX}
              label={soundOn ? 'Mute sound effects' : 'Unmute sound effects'}
              active={soundOn}
              onClick={toggleSound}
              size={16}
            />
            <IconButton
              icon={Music2}
              label={musicOn ? 'Turn off background music' : 'Turn on background music'}
              active={musicOn}
              onClick={toggleMusic}
              size={16}
            />
            <IconButton
              icon={dark ? Sun : Moon}
              label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={toggleDark}
              size={16}
            />
            {auth.status === 'signed-in' ? (
              <IconButton icon={LogOut} label="Sign out" onClick={() => signOut()} size={16} />
            ) : auth.status === 'signed-out' ? (
              <IconButton icon={LogIn} label="Sign in" onClick={() => navigate('/login')} size={16} />
            ) : null}
          </div>
        </header>

        <main
          id="main-content"
          className={`flex-1 px-4 pb-20 w-full ${
            isWideLayout ? 'py-3 md:px-8 md:py-4 md:pb-4' : 'py-6 md:px-8 md:py-8 md:pb-8 max-w-5xl mx-auto'
          }`}
        >
          <Outlet />
        </main>

        {/* Many destinations (9) don't fit a fixed mobile bar, so each item keeps a readable fixed
            width and the bar scrolls horizontally instead of squashing the labels into each other. */}
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-30 flex overflow-x-auto border-t border-slate-200 bg-white/95 backdrop-blur [scrollbar-width:none] dark:border-slate-800 dark:bg-slate-900/95 [&::-webkit-scrollbar]:hidden"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex w-[4.75rem] shrink-0 flex-col items-center justify-center gap-1 px-1 py-2 text-center text-[11px] font-medium leading-tight ${
                  isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <item.icon size={18} aria-hidden="true" />
              <span className="w-full">{item.label.en}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {newLevel !== null && <LevelUpDialog level={newLevel} title={levelInfo.title} onDismiss={dismissLevelUp} />}
    </div>
  );
}
