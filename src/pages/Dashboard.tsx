import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Target, Lock } from 'lucide-react';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { MascotBubble } from '../components/dashboard/MascotBubble';
import { StatCard } from '../components/dashboard/StatCard';
import { StudyPlanCard } from '../components/dashboard/StudyPlanCard';
import { TodayPathCard, type TodayPathStepData } from '../components/dashboard/TodayPathCard';
import { AchievementCard } from '../components/dashboard/AchievementCard';
import { BottomJourneyStrip } from '../components/dashboard/BottomJourneyStrip';
import { useProgress, getMinutesToday, getDueSrsCount, setLevel } from '../lib/progressStore';
import { displayedStreak } from '../lib/streak';
import { todayIso } from '../lib/date';
import { calculateStudyPlan } from '../lib/studyPlanCalculator';
import { getSavedStudyMinutes, saveStudyMinutes } from '../lib/studyDurationPref';
import { getLevelInfo } from '../lib/xp';
import { studyDaysInLastWeek, pathStepSubtitle, isSkillFullyMastered, WEEKLY_GOAL_DAYS } from '../lib/dashboardStats';
import { SKILL_AREAS, SKILL_LABELS } from '../types';
import type { JlptLevel, SkillArea } from '../types';

const SKILL_ROUTES: Partial<Record<SkillArea, string>> = {
  grammar: '/grammar',
  vocabulary: '/vocabulary',
  kanji: '/kanji',
  reading: '/reading',
  listening: '/listening',
};

export function Dashboard() {
  const progress = useProgress();
  const navigate = useNavigate();
  const location = useLocation();
  const today = todayIso();
  const planSectionRef = useRef<HTMLDivElement>(null);

  // Lets sidebar shortcuts (Achievements / Study Plan) deep-link into this page's own sections via a
  // real URL hash rather than a fake button — works from any route, not just when already on Dashboard.
  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  const [durationMinutes, setDurationMinutes] = useState(() => getSavedStudyMinutes());

  const streak = displayedStreak(progress.streak, today);
  const minutesToday = getMinutesToday(progress, today);
  const dueCount = getDueSrsCount(progress, today);
  const totalSrsCards = Object.keys(progress.srsCards).length;
  const levelInfo = getLevelInfo(progress);
  const studyDays = studyDaysInLastWeek(progress.minutesByDate, today);

  const plan = calculateStudyPlan(durationMinutes);
  const planBySkill = new Map(plan.items.map((item) => [item.skill, item.minutes]));
  const orderedSkills = SKILL_AREAS;
  const planSkillList = orderedSkills.filter((skill) => planBySkill.has(skill));
  const firstIncludedSkill = orderedSkills.find((skill) => planBySkill.has(skill) && SKILL_ROUTES[skill]);
  const firstRoute = firstIncludedSkill ? SKILL_ROUTES[firstIncludedSkill]! : '/grammar';

  const pathSteps: TodayPathStepData[] = [
    {
      id: 'warm-up',
      title: 'Warm Up',
      subtitle: dueCount > 0 ? `${dueCount} review${dueCount === 1 ? '' : 's'} due · 5 min` : 'No reviews due right now',
      done: dueCount === 0,
      route: dueCount > 0 ? '/vocabulary' : null,
    },
    ...planSkillList.map((skill) => ({
      id: skill,
      title: SKILL_LABELS[skill].en,
      subtitle: pathStepSubtitle(skill, planBySkill.get(skill)!, progress),
      done: isSkillFullyMastered(skill, progress),
      route: SKILL_ROUTES[skill] ?? null,
      skill,
    })),
  ];

  function handleDurationChange(minutes: number) {
    setDurationMinutes(minutes);
    saveStudyMinutes(minutes);
  }

  function scrollToPlan() {
    planSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const { greetingJa, emoji } = timeGreeting();

  return (
    <div className="flex flex-col gap-4 md:h-full animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-300 ease-out">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 shrink-0 min-h-[230px] md:min-h-[255px]">
        <img
          src="/assets/kotobox-dashboard/generated/hero-background.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 h-full p-6 md:p-8 flex flex-col justify-between gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-fluid-hero-title font-extrabold text-white jp-text">
                {greetingJa} {emoji}
              </h1>
              <p className="text-fluid-hero-sub text-slate-300 mt-2">Let's make progress toward JLPT {progress.level} today.</p>
            </div>
            <div className="flex items-center gap-3">
              <LevelToggle level={progress.level} onChange={setLevel} />
              <button
                type="button"
                onClick={scrollToPlan}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                <Target size={15} />
                Edit Goals
              </button>
            </div>
          </div>
          <MascotBubble message={mascotMessage(streak, dueCount)} />
        </div>
      </section>

      <div key={progress.level} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 shrink-0">
        <StatCard
          icon={<img src="/assets/kotobox-dashboard/generated/stats-icons/study-streak-flame.svg" alt="" className="w-7 h-7" />}
          label="Study Streak"
          value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
          sublabel={`Best: ${progress.streak.longest} ${progress.streak.longest === 1 ? 'day' : 'days'}`}
          ringProgress={progress.streak.longest > 0 ? streak / progress.streak.longest : 0}
          ringColor="var(--color-accent-500)"
          index={0}
        />
        <StatCard
          icon={<img src="/assets/kotobox-dashboard/generated/stats-icons/studied-today-book.svg" alt="" className="w-7 h-7" />}
          label="Studied Today"
          value={`${minutesToday} min`}
          sublabel={`Goal: ${durationMinutes} min`}
          ringProgress={durationMinutes > 0 ? minutesToday / durationMinutes : 0}
          ringColor="var(--color-brand-500)"
          index={1}
        />
        <StatCard
          icon={<img src="/assets/kotobox-dashboard/generated/stats-icons/reviews-due-check.svg" alt="" className="w-7 h-7" />}
          label="Reviews Due"
          value={String(dueCount)}
          sublabel={dueCount > 0 ? 'Keep it going!' : 'All caught up!'}
          ringProgress={totalSrsCards > 0 ? dueCount / totalSrsCards : 0}
          ringColor="var(--color-brand-500)"
          index={2}
        />
        <WeeklyGoalCard studyDays={studyDays} index={3} />
      </div>

      <div ref={planSectionRef} className="grid lg:grid-cols-[2fr_1.6fr_1.4fr] gap-4 sm:gap-5 scroll-mt-4 md:flex-1 md:min-h-0">
        <div id="study-plan-section" className="scroll-mt-6">
          <StudyPlanCard
            durationMinutes={durationMinutes}
            onDurationChange={handleDurationChange}
            plan={plan}
            onStart={() => navigate(firstRoute)}
          />
        </div>
        <div id="today-path-section" className="scroll-mt-6">
          <TodayPathCard
            steps={pathSteps}
            onSelect={(route) => navigate(route)}
            onViewPath={() => document.getElementById('today-path-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          />
        </div>
        <div id="achievements-section" className="scroll-mt-6">
          <AchievementCard progress={progress} />
        </div>
      </div>

      <div className="shrink-0">
        <BottomJourneyStrip
          message="旅の一歩一歩が、未来のあなたをつくる。"
          subMessage={`Keep going. You're building your path.`}
          xpToNextLevel={levelInfo.xpForNextLevel - levelInfo.xpIntoLevel}
        />
      </div>
    </div>
  );
}

function timeGreeting(): { greetingJa: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { greetingJa: 'おはよう！', emoji: '🌅' };
  if (hour < 18) return { greetingJa: 'こんにちは！', emoji: '☀️' };
  return { greetingJa: 'こんばんは！', emoji: '🌙' };
}

function mascotMessage(streak: number, dueCount: number): string {
  if (dueCount > 0) return `今日も一緒にがんばろう！${dueCount}個の復習が待ってるよ。`;
  if (streak > 0) return '今日も一緒にがんばろう！小さな積み重ねが、大きな力になるよ。';
  return '今日から一緒に始めよう！小さな一歩が、大きな未来につながるよ。';
}

function LevelToggle({ level, onChange }: { level: JlptLevel; onChange: (l: JlptLevel) => void }) {
  return (
    <SegmentedTabs
      value={level}
      onChange={onChange}
      variant="glass"
      size="sm"
      groupLabel="JLPT level"
      options={(['N5', 'N4'] as const).map((l) => ({ value: l, label: l }))}
    />
  );
}

function WeeklyGoalCard({ studyDays, index }: { studyDays: number; index?: number }) {
  return (
    <StatCard
      icon={<img src="/assets/kotobox-dashboard/generated/stats-icons/weekly-goal-calendar.svg" alt="" className="w-7 h-7" />}
      label="Weekly Goal"
      value={`${studyDays} / ${WEEKLY_GOAL_DAYS} days`}
      sublabel={
        <span className="inline-flex items-center gap-1 text-slate-400 dark:text-slate-600 cursor-not-allowed" title="Progress page coming soon">
          <Lock size={11} aria-hidden="true" />
          View Progress
        </span>
      }
      ringProgress={studyDays / WEEKLY_GOAL_DAYS}
      ringColor="#10b981"
      index={index}
    />
  );
}
