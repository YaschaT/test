import { useEffect } from 'react';

/**
 * The tab title while the app is sitting in a background tab.
 *
 * Front-loaded on purpose: a background tab collapses to roughly 15–25 characters, so the hook has to
 * land in the first few words — everything after "Miss you!" is a bonus for wide tabs.
 *
 * Deliberately warm and non-specific. It has no way to know whether this learner actually has reviews
 * waiting, and a tab title is the wrong place to assert something that might not be true.
 */
const AWAY_TITLE = '🐧 Miss you! Your Japanese is waiting';

/**
 * Swaps the tab title while the app is hidden and puts the real one back on return.
 *
 * Only reacts to visibility *changes* — a page opened straight into a background tab (cmd-click) has
 * never been seen, so greeting it with "miss you" would be nonsense. The title in place when the tab is
 * hidden is what gets restored, rather than a hardcoded string, so this keeps working if a page ever
 * sets its own title.
 */
export function useAwayTitle() {
  useEffect(() => {
    let activeTitle = document.title;

    function onVisibilityChange() {
      if (document.hidden) {
        activeTitle = document.title;
        document.title = AWAY_TITLE;
      } else {
        document.title = activeTitle;
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (document.title === AWAY_TITLE) document.title = activeTitle;
    };
  }, []);
}
