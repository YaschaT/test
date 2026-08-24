import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Flame, Moon, Sun, Volume2, VolumeX, Music2, LogIn, LogOut, Sparkles } from 'lucide-react';
import { NAV_ITEMS } from '../lib/nav';
import { useAwayTitle } from '../lib/awayTitle';
import { levelProgressPercent } from '../lib/dashboardStats';
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
import { WhatsNewNavItem } from './releases/WhatsNewNavItem';
import { WhatsNewPanel } from './releases/WhatsNewPanel';
import { WhatsNewCard } from './releases/WhatsNewCard';
import { WhatsNewDialog } from './releases/WhatsNewDialog';
import { hasPriorActivity, useReleaseNotes } from '../lib/releaseNotes';
import { IconButton } from './ui/IconButton';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Logo } from './Logo';

/** Exactly one nav row is filled at a time, in the redesign's violet; every other row stays quiet so the
 * illustrated icons carry the colour instead of the chrome. */
const NAV_ITEM_CLASSES = (isActive: boolean) =>
  `flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-2.5 text-base font-medium transition-colors ${
    isActive
      ? 'bg-brand-600 text-white shadow-sm dark:bg-gradient-to-r dark:from-iris-800 dark:to-iris-900'
      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
  }`;

export function Layout() {
  const progress = useProgress();
  const [dark, toggleDark] = useDarkMode();
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());
  const [musicOn, toggleMusic] = useBackgroundMusic();
  const streak = displayedStreak(progress.streak, todayIso());
  const streakPulsing = useStreakPulse(streak);
  const levelInfo = getLevelInfo(progress);
  const { newLevel, dismiss: dismissLevelUp } = useLevelUp(levelInfo.level);
  const levelPercent = levelProgressPercent(progress);
  const auth = useAuth();
  const navigate = useNavigate();
  // Release notes: the dot is always there to be ignored, and only a feature or major release says
  // anything louder than that. See lib/releaseNotes.ts for who gets told what.
  const releases = useReleaseNotes(hasPriorActivity(progress));
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  useStudyTimer();
  // Scoped to the app shell rather than the whole site: a first-time visitor still reading the
  // marketing or login page has nothing to be missed from yet.
  useAwayTitle();

  useEffect(() => {
    if (streakPulsing) playMilestone();
  }, [streakPulsing]);

  function openWhatsNew() {
    setWhatsNewOpen(true);
    releases.markAllSeen();
  }

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

      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-slate-200 dark:border-ink-line bg-white dark:bg-slate-950">
        <div className="flex items-center gap-2.5 px-6 h-16">
          <Logo size={40} />
          <span className="text-lg font-extrabold tracking-wide text-brand-700 dark:text-white">KOTOBOX</span>
        </div>
        <ScrollArea className="flex-1">
          <nav className="px-3 pb-4 space-y-0.5" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <div key={item.path}>
                {item.group && (
                  <p className="px-3.5 pt-5 pb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                    {item.group}
                  </p>
                )}
                <NavLink to={item.path} end={item.path === '/'} className={({ isActive }) => NAV_ITEM_CLASSES(isActive)}>
                  <item.icon size={24} aria-hidden="true" />
                  {item.label.en}
                </NavLink>
              </div>
            ))}
          </nav>
        </ScrollArea>
        <Separator className="bg-slate-100 dark:bg-ink-line" />
        <div className="px-3 pt-2">
          <WhatsNewNavItem unreadCount={releases.unseen.length} onOpen={openWhatsNew} />
        </div>
        <div className="px-3 pb-1">
          <AccountNavItem />
        </div>
        <div className="px-3 pb-3">
          <SidebarLevelCard level={progress.level} percent={levelPercent} />
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
            {/* The sidebar is desktop-only, so the mobile bar carries its own way in. */}
            <span className="relative flex">
              <IconButton
                icon={Sparkles}
                label={
                  releases.unseen.length > 0
                    ? `What's new — ${releases.unseen.length} unread`
                    : "What's new"
                }
                active={releases.unseen.length > 0}
                onClick={openWhatsNew}
                size={16}
              />
              {releases.unseen.length > 0 && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-900"
                />
              )}
            </span>
            {auth.status === 'signed-in' ? (
              <IconButton icon={LogOut} label="Sign out" onClick={() => signOut()} size={16} />
            ) : auth.status === 'signed-out' ? (
              <IconButton icon={LogIn} label="Sign in" onClick={() => navigate('/login')} size={16} />
            ) : null}
          </div>
        </header>

        {/* One content frame for every screen: full-bleed, with just a gutter on all four sides (16px on
            mobile, 32px from md, 40px on very wide displays). No max width — the app uses the whole
            window rather than centring a column with dead margins either side. A screen that wants a
            reading-width measure caps that one element itself.
            `flex flex-col` is what lets a page opt into filling the viewport height: a page whose root
            carries `flex-1` (dashboard, review sessions) grows into the leftover space instead of
            leaving a band of empty background under it on a tall screen. */}
        <main id="main-content" className="flex w-full flex-1 flex-col p-4 pb-20 md:p-8 md:pb-8 2xl:px-10">

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

      <WhatsNewPanel open={whatsNewOpen} onClose={() => setWhatsNewOpen(false)} />

      {/* A level-up is a rarer, more earned moment — it gets the screen to itself. */}
      {releases.announce && !whatsNewOpen && newLevel === null && (
        releases.announce.tier === 'major' ? (
          <WhatsNewDialog
            release={releases.announce}
            onDismiss={releases.markAllSeen}
            onOpenAll={openWhatsNew}
          />
        ) : releases.announce.tier === 'feature' ? (
          <WhatsNewCard
            release={releases.announce}
            onDismiss={releases.markAllSeen}
            onOpenAll={openWhatsNew}
          />
        ) : null
      )}
    </div>
  );
}
