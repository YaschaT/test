import { useEffect, useRef, useState } from 'react';

/** True for a couple seconds right after `value` increases — used to briefly highlight the streak counter. */
export function useStreakPulse(value: number): boolean {
  const previous = useRef(value);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (value > previous.current) {
      setPulsing(true);
      const timeout = setTimeout(() => setPulsing(false), 1800);
      previous.current = value;
      return () => clearTimeout(timeout);
    }
    previous.current = value;
  }, [value]);

  return pulsing;
}
