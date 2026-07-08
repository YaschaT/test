import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { READINGS } from '../../data/readings';
import { useProgress } from '../../lib/progressStore';

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/40 dark:text-amber-300',
  hard: 'text-red-600 bg-red-50 dark:bg-red-900/40 dark:text-red-300',
};

export function ReadingList() {
  const progress = useProgress();

  return (
    <div className="space-y-5">
      <SectionHeader
        skill="reading"
        title="Reading"
        subtitle={`${progress.completedReadingIds.length} of ${READINGS.length} passages completed`}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {READINGS.map((r) => {
          const done = progress.completedReadingIds.includes(r.id);
          return (
            <Link key={r.id} to={`/reading/${r.id}`}>
              <Card className="p-4 hover:border-brand-300 dark:hover:border-brand-600 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99] transition-all h-full flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/40 rounded-full px-2 py-0.5">
                      {r.level}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full px-2 py-0.5 ${DIFFICULTY_COLORS[r.difficulty]}`}>
                      {r.difficulty}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-white">{r.title.en}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{r.title.nl}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {done && <CheckCircle2 size={18} className="text-emerald-500" aria-label="Completed" />}
                  <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
