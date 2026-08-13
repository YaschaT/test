import { useEffect, useRef, useState } from 'react';
import {
  BOOT_STEPS,
  SPLASH_MASCOT_SRC,
  getConnectionGrade,
  isAppRoute,
  observeBoot,
  type BootFrontId,
  type BootSnapshot,
} from '../lib/boot';
import {
  CHIPS,
  CHIP_RISE,
  CUE,
  LAYOUTS,
  advance,
  clamp,
  initialState,
  isFinished,
  ringProgress,
  sampleScene,
  type GateId,
  type Layout,
} from '../lib/splashTimeline';
import { fireSoundCues, makeKit, type SoundKit } from '../lib/splashSound';

/**
 * The cold-start splash: the violet field wakes, Kai rockets up through the frame and settles inside
 * an XP ring that fills with the app's real boot progress, the wordmark rises, and a dark wipe hands
 * off to the dashboard.
 *
 * The composition is the Claude Design "Splash Screen" piece, reproduced as authored: full 7.5s pacing,
 * the XP chips, and the synthesised sound kit (see lib/splashSound.ts — note that autoplay policy
 * usually mutes it on a first visit). What it adds is that the playhead *waits* for the real boot at
 * two points, so it never finishes ahead of the app it is covering. See lib/splashTimeline.ts for the
 * clock and lib/boot.ts for what it is waiting on.
 *
 * Two things still differ from the mockup, and both are choices worth knowing about:
 *
 * - **It is painted in the app's own palette.** The mockup carries its own violet (#1B0E48 field,
 *   #FFA320 accent), which collides with DESIGN.md's Closed Vocabulary Rule. The field's four stops
 *   turn out to sit almost exactly on the existing `iris-*` ramp, and the orange accent is the amber
 *   the app already spends on XP and streaks — so the mapping is near-lossless and the splash resolves
 *   *into* the app rather than into a second brand.
 * - **The three loader segments carry real progress.** The mockup fills them on a timer after the load
 *   is already over; here they are the three real fronts of the boot (the app, your screen, your data)
 *   and they are on screen while there is still something to wait for. The tagline slot carries the
 *   live boot status for the same reason.
 *
 * The chips' labels are the mockup's own fixed strings, not the visitor's numbers — at boot the app has
 * not yet reconciled either one, which is the very thing the ring is waiting on.
 */

/** Peak scale of the authored composition. Beyond this the 657px avatar art starts showing its seams. */
const MAX_STAGE_SCALE = 1.35;

/** Mote count, full and lite. */
const MOTES = 26;
const MOTES_LITE = 10;

const ACCENT = 'var(--color-amber-500)';
const MOTE_LILAC = 'color-mix(in oklab, var(--color-iris-400) 60%, white)';
const CONFETTI_PALE = 'color-mix(in oklab, var(--color-iris-400) 22%, white)';

const FIELD = [
  'radial-gradient(circle at 50% 38%,',
  'var(--color-iris-400) 0%,',
  'var(--color-iris-600) 38%,',
  'var(--color-iris-800) 68%,',
  'var(--color-iris-900) 100%)',
].join(' ');

/** Deterministic scatter, verbatim from the composition so the mote field is the one that was drawn. */
const rand = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function pickLayout(vw: number, vh: number): Layout {
  return LAYOUTS[vw / vh >= 0.95 ? 'desktop' : 'mobile'];
}

const FRONTS: BootFrontId[] = ['app', 'screen', 'data'];

export function SplashScreen() {
  // Decided once, from the URL the tab actually opened on: a client-side navigation into the app is
  // not a boot, and this component never remounts on one.
  const [applies] = useState(() => typeof window !== 'undefined' && isAppRoute(window.location.pathname));
  const [calm] = useState(prefersReducedMotion);
  const [lite] = useState(() => getConnectionGrade() === 'lite');
  const [gone, setGone] = useState(false);
  const [status, setStatus] = useState(BOOT_STEPS[0].status);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mascotRef = useRef<HTMLDivElement>(null);
  const ghostRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ringGroupRef = useRef<SVGGElement>(null);
  const ringArcRef = useRef<SVGCircleElement>(null);
  const ringFlashRef = useRef<SVGCircleElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const barFillRefs = useRef<(HTMLDivElement | null)[]>([]);
  const streakRefs = useRef<(HTMLDivElement | null)[]>([]);
  const burstRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!applies) return;

    let layout = pickLayout(window.innerWidth, window.innerHeight);

    function fitStage() {
      layout = pickLayout(window.innerWidth, window.innerHeight);
      const stage = stageRef.current;
      if (!stage) return;
      // Contain, not cover: the composition is a fixed drawing and cropping it would cut the wordmark
      // off on the aspect ratios it was not drawn for. The field behind fills the viewport on its own,
      // so the letterboxing is invisible.
      const scale = Math.min(
        MAX_STAGE_SCALE,
        Math.min(window.innerWidth / layout.W, window.innerHeight / layout.H),
      );
      stage.style.width = `${layout.W}px`;
      stage.style.height = `${layout.H}px`;
      stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
    fitStage();
    window.addEventListener('resize', fitStage);

    // ── What the animation is waiting on ────────────────────────────────────────────────────────
    let boot: BootSnapshot = { overall: 0, fronts: { app: 0, screen: 0, data: 0 }, status, settled: false };
    let artReady = false;
    let lastStatus = status;

    const stopObserving = observeBoot((snapshot) => {
      boot = snapshot;
      if (snapshot.status !== lastStatus) {
        lastStatus = snapshot.status;
        setStatus(snapshot.status);
      }
    });
    BOOT_STEPS.find((s) => s.id === 'art')
      ?.settled()
      .then(
        () => {
          artReady = true;
        },
        () => {
          artReady = true;
        },
      );

    // Eased so the ring glides between the coarse steps the boot actually reports, rather than
    // jumping in five visible increments.
    let easedReal = 0;
    const isOpen = (gate: GateId) => (gate === 'art' ? artReady : boot.settled && easedReal > 0.995);

    // rAF doesn't run in a background tab, so a boot that finishes there would otherwise be replayed —
    // launch, confetti and all — the moment someone finally looks, long after the app was ready. If
    // the tab was ever hidden, the splash just steps aside on arrival.
    let missedIt = document.hidden;
    const onVisibility = () => {
      if (document.hidden) missedIt = true;
    };
    document.addEventListener('visibilitychange', onVisibility);

    // The sound kit. Created suspended under autoplay policy; a resume is attempted immediately and
    // again on the first real gesture, so the splash is silent on a first-ever visit and audible on
    // later ones wherever the browser keeps a media-engagement score. Skipped under reduced motion,
    // where none of the beats it is cued to actually play.
    let kit: SoundKit | null = calm ? null : makeKit();
    const resumeAudio = () => {
      void kit?.ctx.resume();
    };
    resumeAudio();
    if (kit) {
      window.addEventListener('pointerdown', resumeAudio, { once: true });
      window.addEventListener('keydown', resumeAudio, { once: true });
    }

    // Reduced motion opens on the settled frame: no launch, no confetti, no wipe — the mascot and the
    // wordmark are simply there, and the ring still reports the truth.
    let state = initialState(calm ? CUE.charge : 0);
    let last = performance.now();
    let raf = 0;
    let firedChips = 0;

    const draw = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;

      easedReal += (boot.overall - easedReal) * 0.12;
      if (boot.overall - easedReal < 0.004) easedReal = boot.overall;

      const prevT = state.t;
      state = advance(state, dt, isOpen);
      const t = state.t;
      const s = sampleScene(t, layout, lite || calm);
      const ring = ringProgress(t, easedReal);

      if (kit) fireSoundCues(kit, prevT, t);

      // Chips are launched, not sampled: crossing the cue starts a CSS animation that finishes on its
      // own clock, so the one still in the air at the work gate doesn't hang there through a slow boot.
      if (!calm) {
        while (firedChips < CHIPS.length && t >= CHIPS[firedChips].at) {
          chipRefs.current[firedChips]?.classList.add('splash-chip-go');
          firedChips++;
        }
      }

      const root = rootRef.current;
      if (root) root.setAttribute('aria-valuenow', String(Math.round(ring * 100)));

      // Kai, and the motion-blur copies trailing him. `s.y` is his *centre* in composition pixels, so
      // every layer offsets by half his height to place its top edge.
      const top = s.y - layout.av / 2;
      if (mascotRef.current) {
        mascotRef.current.style.transform = `translate3d(0, ${top}px, 0)`;
        mascotRef.current.style.filter = s.blur > 0.1 ? `blur(${s.blur}px)` : '';
      }
      for (let i = 0; i < ghostRefs.current.length; i++) {
        const ghost = ghostRefs.current[i];
        if (!ghost) continue;
        const live = i < s.ghosts;
        ghost.style.opacity = live ? String(0.34 * (1 - i / (s.ghosts + 1))) : '0';
        if (live) {
          ghost.style.transform = `translate3d(0, ${top + s.ghostStep * (i + 1)}px, 0)`;
          ghost.style.filter = `blur(${5 + i * 5}px)`;
        }
      }
      // Squash and stretch sits on its own layer so it composes with the idle bob below it rather
      // than being overwritten by it.
      const inner = mascotRef.current?.firstElementChild as HTMLElement | undefined;
      if (inner) {
        inner.style.transform = `scale(${(1 - s.stretch * 0.45) * s.scale}, ${(1 + s.stretch) * s.scale})`;
      }

      // The XP ring.
      if (ringGroupRef.current) ringGroupRef.current.style.opacity = String(s.ringIn);
      if (ringArcRef.current) {
        const circumference = 2 * Math.PI * layout.ring;
        ringArcRef.current.style.strokeDashoffset = String(circumference * (1 - ring));
        ringArcRef.current.style.filter = `drop-shadow(0 0 ${16 + s.ringFlash * 40}px ${ACCENT})`;
      }
      if (ringFlashRef.current) ringFlashRef.current.style.opacity = String(s.ringFlash);

      // Type, and the three real fronts.
      if (markRef.current) {
        markRef.current.style.opacity = String(s.markO);
        markRef.current.style.transform = `translateY(${s.markY}px)`;
      }
      if (statusRef.current) {
        statusRef.current.style.opacity = String(s.statusO);
        statusRef.current.style.transform = `translateY(${s.statusY}px)`;
      }
      if (barsRef.current) barsRef.current.style.opacity = String(s.loadO);
      for (let i = 0; i < FRONTS.length; i++) {
        const fill = barFillRefs.current[i];
        if (fill) fill.style.transform = `scaleX(${boot.fronts[FRONTS[i]]})`;
      }

      // One-shot decoration.
      for (let i = 0; i < streakRefs.current.length; i++) {
        const streak = streakRefs.current[i];
        if (!streak) continue;
        const p = s.streaks[i];
        streak.style.opacity = String((1 - p) * Math.min(1, p * 6));
        streak.style.transform = `translate3d(0, ${-p * (layout.H * 0.72)}px, 0)`;
      }
      if (burstRef.current) {
        burstRef.current.style.opacity = s.burst > 0 && s.burst < 1 ? '1' : '0';
        burstRef.current.style.setProperty('--burst', String(s.burst));
      }

      // Handoff: the wipe covers first, then the whole screen dissolves off the dashboard behind it.
      // Under reduced motion there is no wipe to hide behind — an expanding circle is exactly the kind
      // of movement that preference is asking about — so the screen simply cross-fades over the whole
      // beat instead of over its tail.
      if (wipeRef.current) {
        const cover = clamp(s.wipe / 0.6, 0, 1);
        wipeRef.current.style.transform = `translate(-50%, -50%) scale(${cover * 1.05})`;
        wipeRef.current.style.opacity = cover > 0 ? '1' : '0';
      }
      if (root) {
        root.style.opacity = String(calm ? 1 - s.wipe : 1 - clamp((s.wipe - 0.55) / 0.45, 0, 1));
      }

      if (isFinished(state)) {
        setGone(true);
        return;
      }
      // A boot that completed while the tab was hidden has no performance left to give: the app was
      // ready before anyone looked, so hand it over rather than playing a show to a finished load.
      if (missedIt && boot.settled) {
        setGone(true);
        return;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      stopObserving();
      window.removeEventListener('resize', fitStage);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointerdown', resumeAudio);
      window.removeEventListener('keydown', resumeAudio);
      // Browsers cap how many AudioContexts a page may hold, and the splash's is finished with the
      // moment it leaves.
      void kit?.ctx.close().catch(() => undefined);
      kit = null;
    };
    // Every input here is frozen at mount by design; the loop is the only thing that may run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applies, calm, lite]);

  if (!applies || gone) return null;

  const moteCount = lite ? MOTES_LITE : MOTES;
  const desktop = typeof window !== 'undefined' && window.innerWidth / window.innerHeight >= 0.95;
  const layout = LAYOUTS[desktop ? 'desktop' : 'mobile'];
  const CX = layout.W / 2;
  const circumference = 2 * Math.PI * layout.ring;

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-label="Loading Kotobox"
      aria-valuenow={0}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed inset-0 z-100 overflow-hidden bg-slate-950 text-white"
    >
      {/* The field wakes on its own clock rather than the playhead's — it has to finish lighting up
          even while the timeline is waiting at the art gate. */}
      <div aria-hidden="true" className="splash-field absolute inset-0">
        <div className="absolute inset-0" style={{ background: FIELD }} />
        <div
          className="splash-bloom absolute left-1/2 top-[38%] h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--color-iris-400) 42%, transparent), transparent 62%)',
          }}
        />
      </div>

      <div
        ref={stageRef}
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 origin-center"
        style={{ width: layout.W, height: layout.H }}
      >
        {/* Mote field. Two counter-drifting layers rather than 26 individually animated elements:
            the splash is covering a cold boot and must not compete with it for the main thread. */}
        <div className="splash-motes-a absolute inset-0">
          {Array.from({ length: moteCount }, (_, i) => (i % 2 === 0 ? mote(i, layout) : null))}
        </div>
        <div className="splash-motes-b absolute inset-0">
          {Array.from({ length: moteCount }, (_, i) => (i % 2 === 1 ? mote(i, layout) : null))}
        </div>

        {/* Spark streaks racing up from below the frame. */}
        {!calm &&
          [0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              ref={(el) => {
                streakRefs.current[i] = el;
              }}
              className="absolute w-4 rounded-full opacity-0"
              style={{
                left: CX + (i - 2) * layout.streakGap - 8,
                top: layout.H + 120,
                height: 260 + i * 46,
                background: `linear-gradient(to top, transparent 0%, ${ACCENT} 70%, white 100%)`,
                boxShadow: `0 0 34px ${ACCENT}`,
                filter: lite ? undefined : 'blur(7px)',
                willChange: 'transform',
              }}
            />
          ))}

        <svg
          width={layout.W}
          height={layout.H}
          className="absolute inset-0 overflow-visible"
          aria-hidden="true"
        >
          <g ref={ringGroupRef} style={{ opacity: 0 }}>
            <circle
              cx={CX}
              cy={layout.baseY}
              r={layout.ring}
              fill="none"
              stroke="rgba(255,255,255,.16)"
              strokeWidth={layout.stroke}
            />
            <circle
              ref={ringArcRef}
              cx={CX}
              cy={layout.baseY}
              r={layout.ring}
              fill="none"
              stroke={ACCENT}
              strokeWidth={layout.stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              transform={`rotate(-90 ${CX} ${layout.baseY})`}
            />
            <circle
              ref={ringFlashRef}
              cx={CX}
              cy={layout.baseY}
              r={layout.ring}
              fill="none"
              stroke="#fff"
              strokeWidth={layout.stroke}
              opacity={0}
            />
          </g>
        </svg>

        {/* Kai. The ghosts are his motion blur — real copies, because a CSS blur cannot smear along a
            path. They sit behind him and collapse to nothing the moment he stops moving. */}
        {!calm &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              ref={(el) => {
                ghostRefs.current[i] = el;
              }}
              className="absolute left-1/2 top-0 opacity-0"
              style={{ width: layout.av, height: layout.av, marginLeft: -layout.av / 2, willChange: 'transform' }}
            >
              <img
                src={SPLASH_MASCOT_SRC}
                alt=""
                width={layout.av}
                height={layout.av}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        <div
          ref={mascotRef}
          className="absolute left-1/2 top-0"
          style={{ width: layout.av, height: layout.av, marginLeft: -layout.av / 2, willChange: 'transform' }}
        >
          {/* Squash-and-stretch on this wrapper, idle bob and sway on the two inside it: the loops run
              on their own CSS clocks so a gate hold leaves Kai breathing rather than frozen. */}
          <div className="h-full w-full origin-[50%_60%]">
            <div className="splash-bob h-full w-full">
              <div className="splash-sway h-full w-full">
                <img
                  src={SPLASH_MASCOT_SRC}
                  alt=""
                  width={layout.av}
                  height={layout.av}
                  className="h-full w-full object-contain drop-shadow-[0_24px_50px_color-mix(in_oklab,var(--color-iris-900)_90%,transparent)]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Confetti, thrown outward as he lands. */}
        {!calm && !lite && (
          <div ref={burstRef} className="absolute inset-0 opacity-0" style={{ ['--burst' as string]: 0 }}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const d = (200 + rand(i, 9) * 200) * (layout.av / 560);
              const size = 10 + rand(i, 8) * 12;
              return (
                <div
                  key={i}
                  className="splash-confetti absolute"
                  style={{
                    left: CX - size / 2,
                    top: layout.baseY - size / 2,
                    width: size,
                    height: size,
                    borderRadius: i % 2 ? 99 : 5,
                    background: i % 3 === 0 ? ACCENT : CONFETTI_PALE,
                    ['--dx' as string]: `${Math.cos(a) * d}px`,
                    ['--dy' as string]: `${Math.sin(a) * d}px`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* The XP chips, thrown up past Kai as the ring charges. */}
        {!calm &&
          CHIPS.map((chip, i) => (
            <div
              key={chip.label}
              ref={(el) => {
                chipRefs.current[i] = el;
              }}
              className="splash-chip absolute text-center font-display font-bold text-white"
              style={{
                left: CX + chip.side * layout.chipX + chip.nudge - layout.chipW / 2,
                top: layout.baseY + 120,
                width: layout.chipW,
                padding: '14px 0',
                borderRadius: 99,
                background: 'rgba(255,255,255,.14)',
                border: '2px solid rgba(255,255,255,.3)',
                fontSize: layout.chipFs,
                backdropFilter: 'blur(6px)',
                ['--rise' as string]: `${-CHIP_RISE}px`,
              }}
            >
              {chip.label}
            </div>
          ))}

        <div
          ref={markRef}
          className="absolute inset-x-0 text-center font-display font-extrabold text-white opacity-0"
          style={{
            top: layout.markTop,
            fontSize: layout.markSize,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textShadow: '0 8px 0 color-mix(in oklab, var(--color-iris-900) 55%, transparent)',
          }}
        >
          Kotobox<span style={{ color: ACCENT }}>.</span>
        </div>

        {/* The mockup's tagline slot. It carries the live boot status instead — on a slow connection
            the one thing worth saying here is what is actually being waited for. */}
        <div
          ref={statusRef}
          className="absolute inset-x-0 text-center font-semibold text-white/80 opacity-0"
          style={{
            top: layout.statusTop,
            fontSize: layout.statusSize,
            letterSpacing: '0.01em',
          }}
        >
          <span key={status} className="splash-status inline-block">
            {status}
          </span>
        </div>

        {/* One segment per boot front: the app, your screen, your data. */}
        <div
          ref={barsRef}
          className="absolute flex gap-4 opacity-0"
          style={{ left: CX - layout.loadW / 2, top: layout.loadTop, width: layout.loadW }}
        >
          {FRONTS.map((front, i) => (
            <div key={front} className="h-4 flex-1 overflow-hidden rounded-full bg-white/20">
              <div
                ref={(el) => {
                  barFillRefs.current[i] = el;
                }}
                className="h-full origin-left rounded-full"
                style={{ background: ACCENT, transform: 'scaleX(0)' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* The handoff wipe, expanding from Kai's mark. */}
      {!calm && (
        <div
          ref={wipeRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[38%] h-[300vmax] w-[300vmax] rounded-full bg-slate-950 opacity-0"
          style={{ transform: 'translate(-50%, -50%) scale(0)' }}
        />
      )}

      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

/** One drifting speck in the ambient field, placed exactly where the composition scatters it. */
function mote(i: number, layout: Layout) {
  const a = rand(i, 1) * Math.PI * 2;
  const radius = layout.radBase + rand(i, 2) * layout.radSpan;
  const size = 5 + rand(i, 3) * 13;
  const pill = rand(i, 6) > 0.62;
  return (
    <div
      key={i}
      className="absolute rounded-full"
      style={{
        left: layout.W / 2 + Math.cos(a) * radius * layout.radX - size / 2,
        top: layout.baseY + Math.sin(a) * radius * layout.radY - size / 2,
        width: pill ? size * 2.6 : size,
        height: size,
        background: i % 5 === 0 ? ACCENT : i % 3 === 0 ? MOTE_LILAC : 'rgba(255,255,255,.85)',
        opacity: 0.18 + rand(i, 5) * 0.5,
        filter: `blur(${pill ? 1.6 : 0.4}px)`,
        transform: `rotate(${(a * 180) / Math.PI}deg)`,
      }}
    />
  );
}
