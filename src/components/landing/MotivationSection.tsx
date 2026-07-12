import { Flame, RotateCcw, Zap, Trophy, CalendarDays, ListChecks } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Mechanic {
  icon: LucideIcon;
  iconClasses: string;
  title: string;
  copy: string;
}

/** Every mechanic listed here is real and shipped — streaks, SRS due-counts, derived XP/levels, badges, weekly goal, and the daily plan. */
const MECHANICS: Mechanic[] = [
  { icon: Flame, iconClasses: 'bg-accent-500/15 text-accent-500', title: 'Streaks', copy: 'One session a day keeps the flame alive. Miss a day, and the mascot misses you.' },
  { icon: RotateCcw, iconClasses: 'bg-amber-500/15 text-amber-300', title: 'Reviews due', copy: 'A single number tells you exactly what needs attention before it fades.' },
  { icon: Zap, iconClasses: 'bg-brand-500/15 text-brand-300', title: 'XP & levels', copy: 'Every word, kanji, and grammar point earns XP — climb from Beginner toward Master.' },
  { icon: Trophy, iconClasses: 'bg-amber-500/15 text-amber-300', title: 'Achievements', copy: 'Badges you actually earn — first kanji written, week-long streaks, level milestones.' },
  { icon: CalendarDays, iconClasses: 'bg-emerald-500/15 text-emerald-300', title: 'Weekly goal', copy: 'Study days light up across the week, so consistency is something you can see.' },
  { icon: ListChecks, iconClasses: 'bg-sky-500/15 text-sky-300', title: "Today's plan", copy: 'Sections check off as you complete them — ending the day done is the whole point.' },
];

/**
 * Why people come back daily — the real reward loop, presented under the warm glow of two paper lanterns
 * (the "guidance and warmth" motif; base glow is static and visible, the slow breathe only plays without
 * reduced-motion). Gold is reserved for reward moments, matching the app's own accent discipline.
 */
export function MotivationSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* paper lanterns — a visible chochin silhouette hanging inside each warm glow, so the light has a
          believable source instead of being an unexplained smudge */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-[8%]">
          <div
            className="absolute -inset-6 rounded-full bg-amber-400/15 blur-xl animate-lantern-breathe"
            style={{ opacity: 0.6 }}
          />
          <svg viewBox="0 0 40 72" className="relative w-9 h-16 text-amber-300/50">
            <line x1="20" y1="0" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="13" y="6" width="14" height="4" rx="1.5" fill="currentColor" />
            <ellipse cx="20" cy="36" rx="15" ry="25" fill="currentColor" opacity="0.55" />
            <path d="M6 28 Q20 32 34 28 M5 36 Q20 40 35 36 M6 44 Q20 48 34 44" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7" />
            <rect x="13" y="60" width="14" height="4" rx="1.5" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute bottom-16 right-[9%]">
          <div
            className="absolute -inset-8 rounded-full bg-amber-400/12 blur-2xl animate-lantern-breathe"
            style={{ opacity: 0.5, animationDelay: '2.7s' }}
          />
          <svg viewBox="0 0 40 72" className="relative w-11 h-20 text-amber-300/40">
            <line x1="20" y1="0" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5" />
            <rect x="13" y="6" width="14" height="4" rx="1.5" fill="currentColor" />
            <ellipse cx="20" cy="36" rx="15" ry="25" fill="currentColor" opacity="0.55" />
            <path d="M6 28 Q20 32 34 28 M5 36 Q20 40 35 36 M6 44 Q20 48 34 44" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7" />
            <rect x="13" y="60" width="14" height="4" rx="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <h2 data-reveal className="text-3xl sm:text-4xl font-extrabold text-white text-balance max-w-3xl">
          Open Kotobox and instantly know what to do next.
        </h2>
        <p data-reveal className="mt-4 text-white/60 max-w-2xl">
          No decision fatigue, no blank page. The dashboard greets you, shows what's due, and every finished
          session pays out visibly.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MECHANICS.map((m) => (
            <div
              key={m.title}
              data-reveal
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-5"
            >
              <span className={`inline-flex items-center justify-center shrink-0 w-10 h-10 rounded-xl ${m.iconClasses}`}>
                <m.icon size={20} aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">{m.title}</h3>
                <p className="mt-1 text-sm text-white/60 leading-relaxed">{m.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
