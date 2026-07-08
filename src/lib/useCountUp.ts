import { useEffect, useRef, useState } from 'react';

/**
 * Animates a displayed number from its previous value up to `target` (0 → target on first mount, old →
 * new on later updates) — the numeric companion to `RingStat`'s draw-in, so a stat's ring and its count
 * land together. Uses `requestAnimationFrame` rather than a CSS transition since the value itself drives
 * text content, not a style property. Jumps straight to `target` under `prefers-reduced-motion: reduce`.
 */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target && mountedRef.current) return;
    mountedRef.current = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => {
        setValue(target);
        fromRef.current = target;
      });
      return () => cancelAnimationFrame(frame);
    }

    let frame: number;
    const start = performance.now();
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}
