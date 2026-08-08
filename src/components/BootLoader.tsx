import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  BOOT_FINAL_STATUS,
  BOOT_STEPS,
  BOOT_TOTAL_WEIGHT,
  isAppRoute,
  type BootStepId,
} from '../lib/boot';

/**
 * The cold-start screen: the badge racking into focus inside a progress orb, over a ghost of the
 * percentage.
 *
 * The bar is not on a timer. Every point of it is a real boot step settling — the route's code chunk,
 * the webfonts, the session check, the first cloud merge (see boot.ts) — so where it pauses is where
 * the app is actually waiting. Two rules keep that from being unpleasant: the value is eased so a
 * warm cache sweeps rather than flashes, and a hard cap dismisses the screen regardless after
 * {@link MAX_BOOT_MS}, because the app underneath is already usable and a loader that can trap
 * someone is worse than one that lies a little at the very end.
 */

/**
 * The mockup came in its own purple (#0E0A20 canvas, #6D4AE0 glow, #B79BFF accent). DESIGN.md's Closed
 * Vocabulary Rule says a single screen doesn't get new named colors, so the composition is kept exactly
 * and painted in the app's existing night-sky set instead: Canvas Near-Black behind, Lantern Violet in
 * the glow, and iris-400 as the accent — the same violet the Dashboard and Speaking banners celebrate
 * with. The boot screen now resolves *into* the app rather than into a second brand.
 */
const ACCENT = 'var(--color-iris-400)';
const GLOW = 'var(--color-iris-500)';
const DEEP = 'var(--color-iris-900)';
const ACCENT_SOFT = 'color-mix(in oklab, var(--color-iris-400) 50%, transparent)';

const RING_RADIUS = 93;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** The fastest the bar may travel 0 → 100. Below this a fast boot reads as a flicker, not a load. */
const MIN_SWEEP_MS = 850;
/** After this the screen leaves whether or not every step reported in. */
const MAX_BOOT_MS = 6000;

/** Beat between hitting 100% and the burst — long enough to register the number landing. */
const HOLD_MS = 260;
/** Burst → fade. The mockup's demo pacing was ~3.7s of celebration; this runs on every cold load. */
const BURST_MS = 700;
const FADE_MS = 520;

type Phase = 'loading' | 'burst' | 'fading' | 'gone';

/** Three expanding outlines and three filled washes, staggered so the burst reads as depth, not a flash. */
const BURSTS = [
  { ring: true, color: 'rgba(255,255,255,0.55)', delay: 0, duration: 900 },
  { ring: true, color: ACCENT, delay: 90, duration: 1000 },
  { ring: true, color: ACCENT_SOFT, delay: 200, duration: 1050 },
  { ring: false, color: DEEP, delay: 150, duration: 950 },
  { ring: false, color: GLOW, delay: 300, duration: 900 },
  { ring: false, color: ACCENT, delay: 440, duration: 860 },
];

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function BootLoader() {
  // Decided once, from the URL the tab actually opened on: a client-side navigation into the app is
  // not a boot, and this component never remounts on one.
  const [applies] = useState(() => typeof window !== 'undefined' && isAppRoute(window.location.pathname));
  const [calm] = useState(prefersReducedMotion);

  const [phase, setPhase] = useState<Phase>('loading');
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState(BOOT_STEPS[0].status);

  const parallaxRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!applies) return;

    const done = new Set<BootStepId>();
    let target = 0;
    let capped = false;

    function refreshTarget() {
      const settledWeight = BOOT_STEPS.filter((s) => done.has(s.id)).reduce((sum, s) => sum + s.weight, 0);
      target = capped ? 100 : (settledWeight / BOOT_TOTAL_WEIGHT) * 100;
      // The status names the furthest-along step still outstanding, which is what the app is waiting
      // on right now.
      const pending = BOOT_STEPS.find((s) => !done.has(s.id));
      setStatus(pending ? pending.status : BOOT_FINAL_STATUS);
    }

    for (const step of BOOT_STEPS) {
      step.settled().then(
        () => {
          done.add(step.id);
          refreshTarget();
        },
        () => {
          // A step that rejects is still a step that is no longer pending — the app carries on without
          // it (an offline sync, a font that never arrives), so the bar must too.
          done.add(step.id);
          refreshTarget();
        },
      );
    }
    refreshTarget();

    const capTimer = setTimeout(() => {
      capped = true;
      refreshTarget();
    }, MAX_BOOT_MS);

    // Parallax is written straight to the DOM rather than through state: it would otherwise re-render
    // the whole screen on every pointer sample, including after the bar has settled.
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const wantsParallax = !calm && window.matchMedia('(pointer: fine)').matches;

    function onPointerMove(e: PointerEvent) {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    }
    if (wantsParallax) window.addEventListener('pointermove', onPointerMove);

    // rAF doesn't run in a background tab, so a boot that finishes there would otherwise be replayed —
    // sweep, burst and all — the moment someone finally looks, long after the app was ready. If the tab
    // was ever hidden, the screen just steps aside on arrival.
    let missedIt = document.hidden;
    function onVisibility() {
      if (document.hidden) missedIt = true;
    }
    document.addEventListener('visibilitychange', onVisibility);

    let value = 0;
    let raf = 0;
    let last = performance.now();
    let finished = false;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;

      if (!finished) {
        const maxRise = (dt / MIN_SWEEP_MS) * 100;
        const step = Math.min((target - value) * 0.14, maxRise);
        value = missedIt && target >= 100 ? 100 : Math.min(target, value + Math.max(step, 0));
        // Easing alone only ever approaches its target; close enough is arrival.
        if (target - value < 0.35) value = target;
        setPercent(value);
        if (value >= 100) {
          finished = true;
          setStatus(BOOT_FINAL_STATUS);
          const skipCelebration = calm || missedIt;
          window.setTimeout(
            () => setPhase(skipCelebration ? 'fading' : 'burst'),
            skipCelebration ? 0 : HOLD_MS,
          );
        }
      }

      if (wantsParallax) {
        eased.x += (pointer.x - eased.x) * 0.07;
        eased.y += (pointer.y - eased.y) * 0.07;
        if (parallaxRef.current) {
          parallaxRef.current.style.transform = `translate3d(${eased.x * -14}px, ${eased.y * -14}px, 0)`;
        }
        if (ghostRef.current) {
          ghostRef.current.style.transform = `translate(-50%, -50%) translate3d(${eased.x * -26}px, ${eased.y * -26}px, 0)`;
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(capTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      if (wantsParallax) window.removeEventListener('pointermove', onPointerMove);
    };
  }, [applies, calm]);

  // Burst → fade → unmount.
  useEffect(() => {
    if (phase === 'burst') {
      const t = setTimeout(() => setPhase('fading'), BURST_MS);
      return () => clearTimeout(t);
    }
    if (phase === 'fading') {
      const t = setTimeout(() => setPhase('gone'), calm ? 200 : FADE_MS);
      return () => clearTimeout(t);
    }
  }, [phase, calm]);

  if (!applies || phase === 'gone') return null;

  const leaving = phase === 'fading';
  const rounded = Math.round(percent);
  // How far a 40px seed has to grow to clear the furthest corner of *this* screen.
  const reach = Math.ceil(Math.hypot(window.innerWidth, window.innerHeight) / 40);

  return (
    <div
      role="progressbar"
      aria-label="Loading Kotobox"
      aria-valuenow={rounded}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed inset-0 z-100 overflow-hidden bg-slate-950 font-display text-white"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.04)' : 'scale(1)',
        transition: calm
          ? `opacity ${200}ms linear`
          : `opacity ${FADE_MS}ms cubic-bezier(.5,0,.2,1), transform 900ms cubic-bezier(.5,0,.2,1)`,
        pointerEvents: leaving ? 'none' : 'auto',
      }}
    >
      {/* Dot field. Faint enough to read as texture on the flat canvas rather than as a pattern. */}
      <div
        aria-hidden="true"
        className="boot-grain absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.09) 1.2px, transparent 1.3px)',
          backgroundSize: '34px 34px',
        }}
      />

      <div ref={parallaxRef} className="absolute inset-0" aria-hidden="true">
        {/* The percentage at wall size, barely there — the number you feel rather than read. */}
        {/* Centred with `transform`, not the translate utilities: Tailwind v4 emits those as the separate
            `translate` property, which composes with the parallax transform written here and would
            double the offset. */}
        <div
          ref={ghostRef}
          className="pointer-events-none absolute left-1/2 top-1/2 select-none font-mono font-bold leading-none whitespace-nowrap text-white/5 blur-[3px]"
          style={{
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(200px, 42vw, 760px)',
            letterSpacing: '-0.06em',
          }}
        >
          {rounded}
        </div>

        <div
          className="boot-in absolute inset-0 m-auto"
          style={{ width: 'min(42vh, 38vw, 380px)', height: 'min(42vh, 38vw, 380px)' }}
        >
          <div
            className="boot-halo absolute -inset-[14%] rounded-full opacity-30 blur-[60px]"
            style={{ background: GLOW }}
          />

          <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full -rotate-90 overflow-visible">
            <circle cx="100" cy="100" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="2" />
            <circle
              cx="100"
              cy="100"
              r={RING_RADIUS}
              fill="none"
              stroke={ACCENT}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              style={{
                strokeDashoffset: RING_LENGTH - (RING_LENGTH * percent) / 100,
                filter: `drop-shadow(0 0 14px ${ACCENT})`,
              }}
            />
          </svg>

          <svg viewBox="0 0 300 300" className="boot-spin absolute -inset-[24%] h-[148%] w-[148%]">
            <defs>
              <path
                id="boot-ring-path"
                d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0"
              />
            </defs>
            <text fill="rgba(255,255,255,0.42)" fontFamily="ui-monospace, monospace" fontSize="13" letterSpacing="7.2">
              <textPath href="#boot-ring-path">
                LOADING · LOADING · LOADING · LOADING · LOADING · LOADING ·
              </textPath>
            </text>
          </svg>

          <div className="boot-spin-back absolute -inset-[6%] rounded-full border border-dashed border-iris-400/30" />

          <div className={`absolute inset-[13%] ${percent >= 100 && !calm ? 'boot-exit' : ''}`}>
            {/* The glow sits on the wrapper, not the badge: `boot-rack` animates `filter` on the image
                itself and its end state would otherwise wipe a drop-shadow declared there. */}
            <div
              className="boot-float h-full w-full"
              style={{
                filter: 'drop-shadow(0 24px 50px color-mix(in oklab, var(--color-iris-500) 85%, transparent))',
              }}
            >
              <img
                src="/assets/brand/badge.webp"
                alt=""
                width={512}
                height={512}
                className="boot-rack h-full w-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-[clamp(20px,4vw,56px)] pb-[clamp(24px,4vh,44px)]">
          {/* Clipped to one line so a new status rises into place from underneath the old one. */}
          <div className="h-[1.15em] overflow-hidden">
            <p
              key={status}
              className="boot-rise-word font-mono text-[clamp(11px,1.1vw,14px)] uppercase tracking-[0.32em] text-white/60"
            >
              {status}
              <span className="boot-caret ml-[3px] inline-block">_</span>
            </p>
          </div>
          <p className="font-mono text-[clamp(11px,1.1vw,14px)] uppercase tracking-[0.32em] text-white/35">
            {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-white/8">
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${percent}%`, background: ACCENT, boxShadow: `0 0 18px ${ACCENT}` }}
        />
      </div>

      {/* Omitted under reduced motion rather than left to the global animation kill-switch, which would
          snap each circle to its end frame and flash the viewport for one frame. */}
      {phase === 'burst' && !calm && (
        <div aria-hidden="true">
          {BURSTS.map((burst, i) => (
            <div
              key={i}
              className="pointer-events-none absolute left-1/2 top-1/2 -ml-5 -mt-5 h-10 w-10 rounded-full"
              style={
                {
                  background: burst.ring ? 'transparent' : burst.color,
                  border: burst.ring ? `1px solid ${burst.color}` : 'none',
                  '--boot-reach': reach,
                  animation: `${burst.ring ? 'boot-ripple' : 'boot-blast'} ${burst.duration}ms cubic-bezier(.7,0,.25,1) ${burst.delay}ms forwards`,
                } as CSSProperties
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
