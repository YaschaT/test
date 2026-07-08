import { useEffect } from 'react';
import { recordStudyMinutes } from './progressStore';

/** Credits one minute of study time for each minute the tab is actually visible — not a fake counter. */
export function useStudyTimer() {
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        recordStudyMinutes(1);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);
}
