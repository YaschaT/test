import { useEffect, useRef, type ReactNode } from 'react';

const SPOTLIGHT_R = 260;

/**
 * Same soft falloff stops as the user's template (1 → 1 → .75 → .4 → .12 → 0), expressed as a CSS mask
 * instead of the template's canvas-toDataURL-per-frame approach: identical visual, but the browser
 * composites the mask on the GPU and no PNG is re-encoded 60× a second. Before JS runs (and for any
 * failure), the var() fallbacks park the spotlight at a pleasing center-high position, so the reveal
 * layer is never invisible — that's also exactly where it stays on touch devices, as a fixed lantern glow.
 */
const MASK = `radial-gradient(circle min(${SPOTLIGHT_R}px, 42vw) at var(--spot-x, 50%) var(--spot-y, 55%), rgb(0 0 0) 0%, rgb(0 0 0) 40%, rgb(0 0 0 / 0.75) 60%, rgb(0 0 0 / 0.4) 75%, rgb(0 0 0 / 0.12) 88%, transparent 100%)`;

interface SpotlightLayersProps {
  base: ReactNode;
  reveal: ReactNode;
}

/**
 * The hero's signature: a lantern of light that trails the cursor (lerped at the template's 0.1 factor
 * for the soft lag), revealing the second scene through the mask. Coordinates are written straight to a
 * CSS custom property from the rAF loop — React never re-renders during pointer movement. Under
 * prefers-reduced-motion the lerp factor becomes 1, so the light still follows the pointer (input-driven,
 * not decorative motion) but without the trailing animation.
 */
export function SpotlightLayers({ base, reveal }: SpotlightLayersProps) {
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Parked below the headline block, so the resting glow (also the permanent touch-device position)
    // lights the scene rather than fighting the type for attention.
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight * 0.55 };
    const smooth = { ...mouse };
    let hasPointer = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      hasPointer = true;
    };

    const tick = () => {
      if (hasPointer) {
        const k = reduced ? 1 : 0.1;
        smooth.x += (mouse.x - smooth.x) * k;
        smooth.y += (mouse.y - smooth.y) * k;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--spot-x', `${smooth.x - rect.left}px`);
        el.style.setProperty('--spot-y', `${smooth.y - rect.top}px`);
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="absolute inset-0 z-10 overflow-hidden">{base}</div>
      <div
        ref={revealRef}
        aria-hidden="true"
        className="absolute inset-0 z-30 overflow-hidden pointer-events-none"
        style={{ maskImage: MASK, WebkitMaskImage: MASK }}
      >
        {reveal}
      </div>
    </>
  );
}
