/**
 * Floating sakura petals — one of the landing page's four Japanese motifs (torii, sakura, origami crane,
 * lantern). Fourteen small CSS-animated petals drifting down the hero; deterministic per-index values
 * (no Math.random in render, keeping the component pure) spread via golden-ratio stepping so the scatter
 * looks organic without repeating columns. Petals have `opacity: 0` at rest and only become visible
 * through the animation itself, so prefers-reduced-motion users simply never see them instead of finding
 * petals frozen mid-air.
 */
const PETALS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 61.8 + 7) % 100,
  delaySec: (i * 1.9) % 14,
  durationSec: 12 + (i % 5) * 2.4,
  sizePx: 8 + (i % 3) * 3,
  driftPx: (i % 2 === 0 ? 1 : -1) * (24 + ((i * 13) % 36)),
}));

export function SakuraParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 opacity-0 animate-sakura-fall bg-gradient-to-br from-rose-200/70 to-rose-300/40"
          style={{
            left: `${p.left}%`,
            width: p.sizePx,
            height: p.sizePx,
            borderRadius: '100% 0 100% 0',
            animationDelay: `${p.delaySec}s`,
            animationDuration: `${p.durationSec}s`,
            ['--sakura-drift' as string]: `${p.driftPx}px`,
          }}
        />
      ))}
    </div>
  );
}
