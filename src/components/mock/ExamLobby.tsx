import { Clock, ListChecks, Target, Trophy, ArrowRight } from 'lucide-react';
import type { JlptLevel } from '../../types';
import { JLPT_LEVELS } from '../../types';
import { useProgress } from '../../lib/progressStore';
import { EXAM_CONFIG, MOCK_SECTIONS, SCORING, SECTION_LABEL, examTotal } from '../../lib/mockExam';
import { SECTION_THEME } from './examTheme';
import { PrimaryButton } from '../PrimaryButton';
import { playPrimaryAction, playSoftClick } from '../../lib/sound';
import { MASCOTS, MASCOT_BANNER_SIZE } from '../../lib/mascots';

interface ExamLobbyProps {
  level: JlptLevel;
  onLevelChange: (level: JlptLevel) => void;
  onBegin: () => void;
}

export function ExamLobby({ level, onLevelChange, onBegin }: ExamLobbyProps) {
  const progress = useProgress();
  const config = EXAM_CONFIG[level];
  const scoring = SCORING[level];
  const total = examTotal(config);
  const best = progress.mockExams[level];

  return (
    <div className="mx-auto max-w-2xl">
      <header className="text-center">
        <img
          src={MASCOTS['mock-exam']}
          alt=""
          aria-hidden="true"
          width={MASCOT_BANNER_SIZE}
          height={MASCOT_BANNER_SIZE}
          style={{ width: MASCOT_BANNER_SIZE, height: MASCOT_BANNER_SIZE }}
          className="mx-auto mb-2 object-contain"
        />
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Mock Exam</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          A timed practice exam, scored on the official JLPT scale.
          <span className="mt-0.5 block text-sm text-slate-400 dark:text-slate-500">
            Een tijdgebonden oefenexamen, beoordeeld op de officiële JLPT-schaal.
          </span>
        </p>
      </header>

      {/* Level selector */}
      <div role="tablist" aria-label="Exam level" className="mt-8 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/60">
        {JLPT_LEVELS.map((lv) => {
          const active = lv === level;
          const rec = progress.mockExams[lv];
          return (
            <button
              key={lv}
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (!active) {
                  playSoftClick();
                  onLevelChange(lv);
                }
              }}
              className={`relative rounded-xl px-3 py-3 text-center transition-all ${
                active ? 'bg-white shadow-sm dark:bg-slate-900' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <span className={`block text-lg font-bold ${active ? 'text-brand-600 dark:text-brand-300' : ''}`}>{lv}</span>
              <span className="mt-0.5 block text-[11px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
                {rec ? `Best ${rec.bestScore}/180` : 'Not taken'}
              </span>
              {rec?.passed && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" aria-label="Passed" />}
            </button>
          );
        })}
      </div>

      {/* Format panel */}
      <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800">
          <Stat icon={ListChecks} value={String(total)} label="questions" sub="vragen" />
          <Stat icon={Clock} value={`${config.minutes}`} label="minutes" sub={`official ${config.officialMinutes}m`} />
          <Stat icon={Target} value={`${scoring.overallPass}`} label={`to pass / ${scoring.total}`} sub="om te slagen" />
        </div>

        <div className="mt-6 space-y-2.5">
          {MOCK_SECTIONS.map((section) => {
            const theme = SECTION_THEME[section];
            const Icon = theme.icon;
            const count = config.perSection[section];
            return (
              <div key={section} className="flex items-center gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${theme.chip}`}>
                  <Icon size={17} strokeWidth={2} />
                </span>
                <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                  {SECTION_LABEL[section].en}
                  <span className="ml-2 text-slate-400 dark:text-slate-500">{SECTION_LABEL[section].nl}</span>
                </span>
                <span className="text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">×{count}</span>
              </div>
            );
          })}
        </div>

        {/* Official scoring note */}
        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Scored 0–{scoring.total} across {scoring.sections.length} sections. To pass you need{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{scoring.overallPass}/{scoring.total} overall</span>{' '}
            <span className="text-slate-400">and</span> at least the minimum in{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">every</span> section
            {' '}({scoring.sections.map((s) => `${s.min}/${s.max}`).join(', ')}).
          </p>
        </div>

        {best && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
            <Trophy size={18} className="shrink-0 text-amber-500" />
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your best: <span className="font-bold tabular-nums text-slate-900 dark:text-white">{best.bestScore}/180</span>
              <span className="text-slate-400 dark:text-slate-500"> · {best.attempts} {best.attempts === 1 ? 'attempt' : 'attempts'}</span>
              {best.passed && <span className="ml-1 font-semibold text-emerald-600 dark:text-emerald-400">· passed ✓</span>}
            </p>
          </div>
        )}

        <PrimaryButton onClick={() => { playPrimaryAction(); onBegin(); }} className="mt-6 w-full !py-3.5 text-base">
          {best ? 'Retake exam' : 'Begin exam'}
          <ArrowRight size={18} />
        </PrimaryButton>
        <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
          Format &amp; scoring follow the official JLPT (jlpt.jp). Questions are original practice items.
        </p>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, value, label, sub }: { icon: typeof Clock; value: string; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center px-2 text-center">
      <Icon size={18} className="text-slate-400 dark:text-slate-500" />
      <span className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</span>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-[11px] text-slate-400 dark:text-slate-500">{sub}</span>
    </div>
  );
}
