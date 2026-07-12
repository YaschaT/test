import { useRef, type ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  /** Resting Y-rotation in degrees, so the card reads as a 3D object even before any interaction. */
  restRotateY?: number;
  /** Maximum pointer-tracked tilt in degrees. */
  maxTilt?: number;
  className?: string;
}

/**
 * Pointer-tracked 3D tilt — the landing page's core "not a flat illustration" device. The card rests at a
 * slight perspective angle and leans toward the cursor (mouse only; touch keeps the resting pose, and
 * prefers-reduced-motion users get a static card). Written with direct ref + rAF style updates rather than
 * state so pointer-move never re-renders React.
 */
export function TiltCard({ children, restRotateY = 0, maxTilt = 7, className = '' }: TiltCardProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = innerRef.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      el.style.transform = `rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg)`;
    });
  }

  function handlePointerLeave() {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    const el = innerRef.current;
    if (el) el.style.transform = `rotateY(${restRotateY}deg)`;
  }

  return (
    <div
      style={{ perspective: '1000px' }}
      className={className}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div
        ref={innerRef}
        className="transition-transform duration-200 ease-out"
        style={{ transform: `rotateY(${restRotateY}deg)`, transformStyle: 'preserve-3d' }}
      >
        {children}
      </div>
    </div>
  );
}
