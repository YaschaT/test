import { GrammarPointCard, type GrammarPathItem } from './GrammarPointCard';
import type { JlptLevel } from '../../types';

const LEVEL_ORDER: JlptLevel[] = ['N5', 'N4'];

interface GrammarPathListProps {
  items: GrammarPathItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * The real ordered list of grammar points, grouped into real N5/N4 clusters (no invented categories).
 * Replaces the old wrapping-grid-of-circles path with actual scannable rows.
 *
 * A thin gradient thread runs behind each cluster's rows, aligned through the number-badge centers
 * (left-8 = 32px, matching the badge's own geometry: p-3.5 padding + half of w-9) — a quiet nod to the
 * "path" this list is named after, visible only in the gaps between cards since each card's opaque
 * background naturally occludes it elsewhere. One signature touch, not a decorative overlay competing
 * with the content.
 */
export function GrammarPathList({ items, selectedId, onSelect }: GrammarPathListProps) {
  const clusters = LEVEL_ORDER.map((level) => ({ level, points: items.filter((n) => n.level === level) })).filter(
    (cluster) => cluster.points.length > 0,
  );

  if (clusters.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-400 dark:text-slate-500">
        No grammar points at this level yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {clusters.map((cluster, clusterIndex) => {
        const startingNumber = clusters.slice(0, clusterIndex).reduce((sum, c) => sum + c.points.length, 0) + 1;
        const completedCount = cluster.points.filter((p) => p.state === 'completed').length;
        return (
          <div key={cluster.level}>
            <div className="flex items-baseline gap-2 mb-3 px-1">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{cluster.level}</h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {completedCount} / {cluster.points.length} completed
              </span>
            </div>
            <div className="relative space-y-2.5">
              <div
                className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-brand-300/70 via-brand-200/40 to-transparent dark:from-brand-700/60 dark:via-brand-800/30"
                aria-hidden="true"
              />
              {cluster.points.map((point, i) => (
                <GrammarPointCard
                  key={point.id}
                  item={point}
                  displayNumber={startingNumber + i}
                  selected={point.id === selectedId}
                  onSelect={onSelect}
                  index={startingNumber + i - 1}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
