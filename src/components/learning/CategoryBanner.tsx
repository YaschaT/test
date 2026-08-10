import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../../lib/progressStore';
import { categoryStats } from '../../lib/categoryStats';
import { milestoneFor, type MilestoneCategory } from '../../lib/milestones';
import { calculateXp } from '../../lib/xp';
import { useCountUp } from '../../lib/useCountUp';

/** Link or button — pages that start something in place pass `onClick`, the rest navigate. */
export type BannerAction =
  | { label: string; to: string; onClick?: () => void }
  | { label: string; onClick: () => void; to?: undefined };

interface CategoryBannerProps {
  category: MilestoneCategory;
  title: string;
  subtitle: string;
  /** The page's JLPT level control, kept in the banner's top-right corner across every screen. */
  levels?: ReactNode;
  /** Optional primary action, rendered under the stats. */
  action?: BannerAction;
}

const RING_RADIUS = 74;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/**
 * The banner every category wears: a painted night scene with that section's mascot standing in it,
 * the completion ring, the four counts, and the next milestone.
 *
 * Every number is measured. The ring and `done / total` are mastered items over the section's real
 * pool (see categoryStats.ts); learned / review / to-learn are the app's own SRS states; the milestone
 * is a repeating rung counted off recorded progress (milestones.ts). The streak and XP in the corner
 * are the same global numbers the sidebar shows.
 *
 * Dark in both themes — it's a painted scene, and the artwork is lit for night.
 */
export function CategoryBanner({ category, title, subtitle, levels, action }: CategoryBannerProps) {
  const progress = useProgress();
  const stats = categoryStats(category, progress);
  const milestone = milestoneFor(category, progress);
  const xp = calculateXp(progress);
  const streak = progress.streak.current;

  const percent = Math.round(stats.percent * 100);
  const shownPercent = useCountUp(percent, 900);

  // The ring draws in from empty on the first frame, like every other progress ring in the app.
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative isolate min-h-[300px] overflow-hidden rounded-[28px] border border-[#7e92d0]/16 bg-[#03091e] shadow-[0_24px_60px_rgba(0,0,0,0.55)] lg:h-[330px]">
      {/* The scene sits to the right and bleeds off the edge; the scrim below carries it into flat navy
          under the text, which is what keeps the copy legible over a busy painting. */}
      <img
        src={`/assets/banner/bg/${category}.webp`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-right"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#03091e_0%,#03091e_19%,rgba(3,9,30,0.82)_29%,rgba(3,9,30,0.42)_38%,rgba(3,9,30,0.12)_46%,rgba(3,9,30,0)_54%)]"
      />

      {/* Mascot — anchored to the bottom of the scene so it stands on the painted ground. */}
      <img
        src={`/assets/banner/mascot/${category}.webp`}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-[46%] -z-10 hidden h-[82%] w-auto object-contain object-bottom drop-shadow-[0_16px_22px_rgba(0,0,0,0.55)] lg:block"
      />

      {/* Streak · XP · level control, in the notched strip the design puts across the top right. */}
      <div className="absolute top-0 right-0 flex items-center gap-4 rounded-bl-[26px] border-b border-l border-[#8c9bd7]/16 bg-[#03081a]/90 py-2.5 pr-4 pl-6 backdrop-blur-md sm:gap-5">
        {levels}
        <span className="hidden items-center gap-2 sm:flex">
          <img src="/assets/banner/icon-streak.png" alt="" aria-hidden="true" className="h-[23px] w-[18px] object-contain" />
          <span className="text-[15px] font-semibold whitespace-nowrap text-slate-200">
            <span className="font-bold text-amber-400 tabular-nums">{streak}</span> day streak
          </span>
        </span>
        <span className="flex items-center gap-2">
          <img src="/assets/banner/icon-xp.png" alt="" aria-hidden="true" className="h-[21px] w-[21px] object-contain" />
          <span className="text-[15px] font-semibold whitespace-nowrap text-brand-300 tabular-nums">
            {xp.toLocaleString()} XP
          </span>
        </span>
      </div>

      <div className="relative flex h-full flex-col gap-5 p-6 pt-16 sm:p-7 sm:pt-14 lg:flex-row lg:items-start lg:gap-7 lg:pr-[380px]">
        {/* Ring */}
        <div className="relative h-[132px] w-[132px] shrink-0 sm:h-[158px] sm:w-[158px]">
          <svg viewBox="0 0 158 158" className="h-full w-full drop-shadow-[0_0_14px_rgba(56,189,248,0.25)]">
            <defs>
              <linearGradient id={`cat-ring-${category}`} x1="0.55" y1="0" x2="0.12" y2="1">
                <stop offset="0%" stopColor="#90F29B" />
                <stop offset="42%" stopColor="#7FCEF9" />
                <stop offset="100%" stopColor="#4FA0EF" />
              </linearGradient>
            </defs>
            <circle cx="79" cy="79" r={RING_RADIUS} fill="rgba(0,0,0,0.3)" stroke="#141D34" strokeWidth="9.3" />
            <circle
              cx="79"
              cy="79"
              r={RING_RADIUS}
              fill="none"
              stroke={`url(#cat-ring-${category})`}
              strokeWidth="9.3"
              strokeLinecap="round"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={drawn ? RING_LENGTH * (1 - stats.percent) : RING_LENGTH}
              transform="rotate(-90 79 79)"
              className="transition-[stroke-dashoffset] duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <p className="text-[34px] leading-none font-extrabold text-white tabular-nums sm:text-[42px]">
              {shownPercent}%
            </p>
            <p className="text-sm leading-none font-medium text-slate-300 sm:text-base">Completed</p>
          </div>
        </div>

        <div className="min-w-0 flex-1 lg:max-w-[42%]">
          <h1 className="text-[34px] leading-none font-extrabold tracking-tight text-white text-balance sm:text-[46px] 2xl:text-[57px]">
            {title}
          </h1>
          <p className="mt-2.5 text-[15px] leading-snug font-medium text-slate-300 sm:text-[17px]">{subtitle}</p>

          <div className="mt-4 grid max-w-lg grid-cols-2 gap-x-6 gap-y-3">
            <Stat colour="#4ADE80" hollow value={stats.done} suffix={`/ ${stats.total.toLocaleString()}`} />
            <Stat colour="#8B7BF7" value={stats.learned} suffix="learned" />
            <Stat colour="#34E5A6" value={stats.review} suffix="review" />
            <Stat colour="#F5B740" value={stats.toLearn} suffix="to learn" />
          </div>

          {action && (
            <div className="mt-5">
              {action.to ? (
                <Link to={action.to} onClick={action.onClick} className={ACTION_CLASSES}>
                  {action.label}
                </Link>
              ) : (
                <button type="button" onClick={action.onClick} className={ACTION_CLASSES}>
                  {action.label}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Next milestone */}
        <div className="flex w-full shrink-0 items-center rounded-[26px] border border-[#96a0dc]/18 bg-gradient-to-br from-[#282046]/90 via-[#151532]/90 to-[#201b3e]/90 shadow-[0_14px_40px_rgba(0,0,0,0.4)] backdrop-blur-md lg:absolute lg:right-5 lg:bottom-5 lg:w-[346px]">
          <div className="flex flex-1 flex-col gap-3 py-4 pr-2 pl-6">
            <p className="text-xl leading-none font-bold text-white">Next Milestone</p>
            <p className="text-[15px] leading-none font-medium text-slate-200">{milestone.label.en}</p>
            <div className="flex items-center gap-3.5">
              <div className="relative h-[11px] w-full max-w-[136px] overflow-hidden rounded-md bg-[#bec8eb]/22">
                <div
                  className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-[#7B5CF0] to-[#A78BFA] shadow-[0_0_12px_rgba(150,120,250,0.55)] transition-[width] duration-1000 ease-out"
                  style={{ width: drawn ? `${milestone.percent}%` : 0 }}
                />
              </div>
              <p className="text-[15px] font-medium whitespace-nowrap text-slate-300 tabular-nums">
                {milestone.done} / {milestone.target}
              </p>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="h-[76px] w-px bg-gradient-to-b from-transparent via-[#a0aae1]/26 to-transparent"
          />
          <div className="flex shrink-0 items-center justify-center px-5">
            <div className="relative grid h-[73px] w-[73px] place-items-center rounded-full border border-[#9696eb]/32 bg-[radial-gradient(circle_at_50%_40%,rgba(94,80,200,0.32),rgba(30,26,66,0.22))] shadow-[0_0_22px_rgba(120,105,245,0.25)]">
              <img
                src="/assets/banner/icon-xp-milestone.webp"
                alt=""
                aria-hidden="true"
                className="-mt-3 h-12 w-12 object-contain drop-shadow-[0_0_10px_rgba(120,110,255,0.55)]"
              />
              <p className="absolute inset-x-0 bottom-1.5 text-center text-[15px] font-bold text-white [text-shadow:0_2px_6px_rgba(0,0,0,0.6)]">
                +{milestone.xp} XP
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const ACTION_CLASSES =
  'inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#6b78ff] to-iris-600 px-6 py-3 text-[15px] font-extrabold text-white shadow-[0_12px_28px_-14px_var(--color-iris-500)] transition-transform hover:-translate-y-px active:translate-y-0';

/** One counted state. The first is drawn hollow, as the design does, to read as the "of total" anchor. */
function Stat({
  colour,
  value,
  suffix,
  hollow = false,
}: {
  colour: string;
  value: number;
  suffix: string;
  hollow?: boolean;
}) {
  return (
    <p className="flex items-center gap-3 whitespace-nowrap">
      <span
        aria-hidden="true"
        className="h-5 w-5 shrink-0 rounded-full"
        style={
          hollow
            ? { border: `3.5px solid ${colour}`, boxShadow: `0 0 12px ${colour}73` }
            : { background: colour, boxShadow: `0 0 12px ${colour}80` }
        }
      />
      <span className="text-[19px] font-bold text-white tabular-nums">{value.toLocaleString()}</span>
      <span className="-ml-1 text-base font-medium text-slate-300">{suffix}</span>
    </p>
  );
}
