import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LineChart, RotateCcw } from 'lucide-react';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { SummaryStrip } from '../components/dashboard/SummaryStrip';
import { TodaySessionCard, type SessionStep } from '../components/dashboard/TodaySessionCard';
import { WeeklyProgressCard } from '../components/dashboard/WeeklyProgressCard';
import { AchievementCard } from '../components/dashboard/AchievementCard';
import { BottomJourneyStrip } from '../components/dashboard/BottomJourneyStrip';
import { useProgress, getMinutesToday, getDueSrsCount, setLevel } from '../lib/progressStore';
import { todayIso } from '../lib/date';
import { calculateStudyPlan } from '../lib/studyPlanCalculator';
import { getSavedStudyMinutes, saveStudyMinutes } from '../lib/studyDurationPref';
import { currentWeekDays, pathStepSubtitle, isSkillFullyMastered, WEEKLY_GOAL_DAYS } from '../lib/dashboardStats';
import { SKILL_AREAS, SKILL_LABELS } from '../types';
import type { SkillArea } from '../types';

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

  // Lets sidebar/deep links jump into this page's own sections via a real URL hash rather than a fake
  // button — works from any route, not just when already on Dashboard.
  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  const [durationMinutes, setDurationMinutes] = useState(() => getSavedStudyMinutes());

  const minutesToday = getMinutesToday(progress, today);
  const dueCount = getDueSrsCount(progress, today);
  const totalSrsCards = Object.keys(progress.srsCards).length;
  const weekDays = currentWeekDays(progress.minutesByDate, today);
  const studyDays = weekDays.filter((day) => day.studied).length;

  const plan = calculateStudyPlan(durationMinutes);
  const planBySkill = new Map(plan.items.map((item) => [item.skill, item.minutes]));
  const planSkillList = SKILL_AREAS.filter((skill) => planBySkill.has(skill));
  const firstIncludedSkill = planSkillList.find((skill) => SKILL_ROUTES[skill]);
  const firstRoute = firstIncludedSkill ? SKILL_ROUTES[firstIncludedSkill]! : '/grammar';

  // A brand-new learner has literally nothing yet — no reviews, no completed lessons, no study time.
  // They get a welcome + a first-lesson CTA instead of the usual "continue" flow.
  const isNewUser =
    totalSrsCards === 0 &&
    progress.completedGrammarIds.length === 0 &&
    progress.completedReadingIds.length === 0 &&
    progress.learnedKanjiIds.length === 0 &&
    Object.keys(progress.minutesByDate).length === 0;

  // The single dominant action for the whole screen: start the first lesson, clear the review queue, or
  // continue with the day's plan.
  const primaryCta = isNewUser
    ? { label: 'Start your first lesson', onClick: () => navigate('/grammar') }
    : dueCount > 0
      ? { label: `Review ${dueCount} card${dueCount === 1 ? '' : 's'}`, onClick: () => navigate('/vocabulary/review') }
      : { label: "Continue today's session", onClick: () => navigate(firstRoute) };

  const warmUpMinutes = Math.min(5, plan.totalMinutes);
  const sessionSteps: SessionStep[] = [
    {
      id: 'warm-up',
      title: 'Warm-up',
      meta:
        dueCount > 0
          ? `${warmUpMinutes} min · ${dueCount} review${dueCount === 1 ? '' : 's'}`
          : `${warmUpMinutes} min · no reviews due`,
      done: dueCount === 0,
      route: dueCount > 0 ? '/vocabulary/review' : null,
    },
    ...planSkillList.map((skill) => ({
      id: skill,
      title: SKILL_LABELS[skill].en,
      meta: pathStepSubtitle(skill, planBySkill.get(skill)!, progress),
      done: isSkillFullyMastered(skill, progress),
      route: SKILL_ROUTES[skill] ?? null,
      skill,
    })),
  ];

  function handleDurationChange(minutes: number) {
    setDurationMinutes(minutes);
    saveStudyMinutes(minutes);
  }

  const { greetingJa, emoji } = timeGreeting();

  return (
    // `flex-1` so the page owns the full height of the shell's content frame: on a tall display the
    // slack goes into the cards below rather than into an empty band under the last one.
    <div className="flex flex-1 flex-col gap-5 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-300 ease-out">
      <DashboardHero
        greetingJa={greetingJa}
        greetingEmoji={emoji}
        supportingText={
          isNewUser
            ? 'Welcome to Kotobox! Learn a lesson, review it daily, and watch your JLPT progress grow.'
            : `Let's make progress toward JLPT ${progress.level} today.`
        }
        ctaLabel={primaryCta.label}
        onStart={primaryCta.onClick}
        durationMinutes={durationMinutes}
        onDurationChange={handleDurationChange}
        level={progress.level}
        onLevelChange={setLevel}
      />

      <SummaryStrip
        minutesToday={minutesToday}
        goalMinutes={durationMinutes}
        dueCount={dueCount}
        totalSrsCards={totalSrsCards}
        studyDays={studyDays}
        weeklyGoalDays={WEEKLY_GOAL_DAYS}
      />

      {isNewUser && <OnboardingSteps />}

      {/* The row that flexes: it takes whatever height is left over, and both columns stretch into it
          (min-h-0 so a tall session list scrolls the page rather than overflowing the grid). */}
      <div className="grid flex-1 min-h-0 gap-5 lg:grid-cols-2">
        <TodaySessionCard
          steps={sessionSteps}
          totalMinutes={plan.totalMinutes}
          onSelect={(route) => navigate(route)}
          onViewFullPlan={() => navigate('/path')}
        />
        <div className="flex flex-col gap-5">
          <WeeklyProgressCard
            days={weekDays}
            studyDays={studyDays}
            goalDays={WEEKLY_GOAL_DAYS}
            onViewFullPath={() => navigate('/path')}
            className="flex-1"
          />
          <AchievementCard progress={progress} className="flex-1" />
        </div>
      </div>

      <BottomJourneyStrip message="Consistency is the key to fluency. You're doing great!" />
    </div>
  );
}

/** First-run teaching strip: the three-step loop the whole app is built around. Only rendered for a
 * brand-new learner, and disappears the moment they have any real progress — so it never competes with
 * the redesigned dashboard's normal state. */
function OnboardingSteps() {
  const steps = [
    { n: 1, icon: BookOpen, title: 'Learn', text: 'Start a Grammar or Vocabulary lesson.' },
    { n: 2, icon: RotateCcw, title: 'Review', text: 'Come back daily to lock it into memory.' },
    { n: 3, icon: LineChart, title: 'Track', text: 'Watch your streak and readiness grow.' },
  ];
  return (
    <ol className="grid gap-4 sm:grid-cols-3">
      {steps.map((step) => (
        <li
          key={step.n}
          className="flex items-start gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-ink-line dark:bg-ink-900"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-iris-900 dark:text-iris-400">
            <step.icon size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              <span className="text-slate-400 dark:text-slate-500">{step.n}.</span> {step.title}
            </p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function timeGreeting(): { greetingJa: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { greetingJa: 'おはよう！', emoji: '🌅' };
  if (hour < 18) return { greetingJa: 'こんにちは！', emoji: '☀️' };
  return { greetingJa: 'こんばんは！', emoji: '🌙' };
}
