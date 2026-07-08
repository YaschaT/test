import { useEffect, useRef, useState } from 'react';

/**
 * Fires only when `level` increases *during this session* — initializes to the current level on mount
 * (same pattern as useStreakPulse) so returning users never see a false "level up" just from the app
 * recalculating their already-earned level on load. Level itself is a pure derived value (see xp.ts), so
 * this is the only place that actually remembers "what level were they a moment ago."
 */
export function useLevelUp(level: number): { newLevel: number | null; dismiss: () => void } {
  const previous = useRef(level);
  const [newLevel, setNewLevel] = useState<number | null>(null);

  useEffect(() => {
    if (level > previous.current) {
      setNewLevel(level);
    }
    previous.current = level;
  }, [level]);

  function dismiss() {
    setNewLevel(null);
  }

  return { newLevel, dismiss };
}
