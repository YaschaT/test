import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CategoryBanner } from '../../components/learning/CategoryBanner';
import { SegmentedTabs } from '../../components/SegmentedTabs';
import { CurrentWeekCard } from '../../components/path/CurrentWeekCard';
import { RouteSpine } from '../../components/path/RouteSpine';
import { WeekPanel } from '../../components/path/WeekPanel';
import { ROADMAP } from '../../data/roadmap';
import { evaluateGate } from '../../lib/roadmapGate';
import { hasCheckpoint } from '../../lib/checkpoint';
import { useProgress } from '../../lib/progressStore';
import { buildRouteState, buildStations, gateProgressFrom, weekSkills } from '../../lib/pathWeek';
import { dailyRange, getBudget, saveBudget, type BudgetChoice } from '../../lib/pathBudget';
import type { JlptLevel, RoadmapPhase, RoadmapWeek } from '../../types';
import { JLPT_LEVELS } from '../../types';

/**
 * The Learning Path in three tiers of attention rather than one.
 *
 * Before this, the page was a register: twenty-two week cards at identical weight, each carrying a
 * level badge, a bilingual theme and up to four progress chips, under a hundred-odd words explaining
 * the route three times. It answered every question except the one a learner arrives with — *what do I
 * do next* — and the only thing it could actually start was a checkpoint.
 *
 * Now:
 *  1. **You are here** — one card, the current week at full detail, whose skill rows link to the exact
 *     next item the mastery gate is asking for, and which owns the page's single primary button.
 *  2. **The route** — one vertical spine you scan instead of read (`RouteSpine`). Weeks are rows with a
 *     four-segment meter, phases are stations, and only the station holding the current week is open.
 *  3. **The week** — a panel opened on purpose (`WeekPanel`), carrying the objectives, the gate, both
 *     languages and the checkpoint quiz.
 *
 * Nothing was dropped: every fact the old page printed is still reachable, just no longer all at once.
 */
export function LearningPath() {
  const progress = useProgress();

  const route = useMemo(() => buildRouteState(progress), [progress]);
  const stations = useMemo(() => buildStations(route), [route]);
  const currentWeek = useMemo(
    () => ROADMAP.find((w) => w.week === route.currentWeek) ?? ROADMAP[ROADMAP.length - 1],
    [route.currentWeek],
  );

  const [budget, setBudget] = useState<BudgetChoice>(() => getBudget());
  const [openWeek, setOpenWeek] = useState<RoadmapWeek | null>(null);
  const [levelTab, setLevelTab] = useState<JlptLevel | 'all'>('all');
  // Only the phase you are actually in is open: the other three collapse to a station bar, which is
  // what takes the resting page from 22 cards to a handful of rows.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([currentWeek.phase]));
  // A collapsed phase has no rows yet, so a jump into one has to wait for the expand to commit. Held in
  // a ref rather than state: this only reads the DOM after the render, it never drives another one.
  const scrollTarget = useRef<number | null>(null);

  useEffect(() => {
    const week = scrollTarget.current;
    if (week == null) return;
    scrollTarget.current = null;
    document.getElementById(`path-week-${week}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [expanded]);

  const toggleStation = useCallback((phase: string) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  }, []);

  function chooseBudget(choice: BudgetChoice) {
    setBudget(choice);
    saveBudget(choice);
  }

  /**
   * The level control jumps rather than filters. A path you can filter down to one phase stops being a
   * path — and the phases are already stations on the line, so "N4" has somewhere real to land.
   */
  function jumpToLevel(value: JlptLevel | 'all') {
    setLevelTab(value);
    const target = value === 'all' ? currentWeek : ROADMAP.find((w) => w.level === value) ?? currentWeek;
    const phase: RoadmapPhase = target.phase;
    if (expanded.has(phase)) {
      document.getElementById(`path-week-${target.week}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    scrollTarget.current = target.week;
    setExpanded((previous) => new Set(previous).add(phase));
  }

  const currentSlices = useMemo(() => weekSkills(currentWeek, progress), [currentWeek, progress]);
  const currentGate = useMemo(
    () => evaluateGate(currentWeek, gateProgressFrom(progress)),
    [currentWeek, progress],
  );

  return (
    <div className="flex flex-1 flex-col gap-5 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-both duration-300 ease-out">
      {/* No action on the banner: the single primary button belongs on the card that can actually start
          the work, and two violet buttons on one screen is one too many. */}
      <CategoryBanner
        category="learning-path"
        title="Learning Path"
        subtitle={`Week ${route.currentWeek} of ${ROADMAP.length} · mastery opens the next one, not the calendar.`}
        levels={
          <SegmentedTabs
            value={levelTab}
            onChange={jumpToLevel}
            variant="glass"
            size="sm"
            groupLabel="Jump to a level"
            options={[{ value: 'all' as const, label: 'All' }, ...JLPT_LEVELS.map((l) => ({ value: l, label: l }))]}
          />
        }
      />

      <CurrentWeekCard
        week={currentWeek}
        slices={currentSlices}
        gate={currentGate}
        best={progress.weeklyCheckpoints[currentWeek.week]}
        hasCheckpoint={hasCheckpoint(currentWeek)}
        dailyTarget={dailyRange(currentWeek, budget)}
        onOpenWeek={() => setOpenWeek(currentWeek)}
      />

      <RouteSpine
        stations={stations}
        route={route}
        progress={progress}
        choice={budget}
        onChoiceChange={chooseBudget}
        expanded={expanded}
        onToggleStation={toggleStation}
        onOpenWeek={setOpenWeek}
        totalWeeks={ROADMAP.length}
      />

      <WeekPanel
        week={openWeek}
        status={openWeek ? route.statusOf(openWeek.week) : 'locked'}
        progress={progress}
        onClose={() => setOpenWeek(null)}
      />
    </div>
  );
}
