import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { SegmentedTabs } from '../SegmentedTabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { JlptLevel } from '../../types';
import { playSoftClick } from '../../lib/sound';

const LEVEL_TABS: Array<JlptLevel | 'all'> = ['all', 'N5', 'N4'];

interface LearningControlsProps {
  level: JlptLevel | 'all';
  onLevelChange: (level: JlptLevel | 'all') => void;
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder: string;
  /** Omit to hide the filter dropdown entirely — some content (e.g. Kanji) has no category data to
   * filter by, and a dropdown with nothing real behind it would just be a dead control. */
  category?: string;
  onCategoryChange?: (category: string) => void;
  categories?: string[];
  layout: 'grid' | 'list';
  onLayoutChange: (layout: 'grid' | 'list') => void;
}

export function LearningControls({
  level,
  onLevelChange,
  query,
  onQueryChange,
  searchPlaceholder,
  category,
  onCategoryChange,
  categories,
  layout,
  onLayoutChange,
}: LearningControlsProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
      <SegmentedTabs
        value={level}
        onChange={onLevelChange}
        className="w-fit"
        options={LEVEL_TABS.map((l) => ({ value: l, label: l === 'all' ? 'All' : l }))}
      />

      <div className="flex flex-1 flex-wrap gap-3">
        <div className="relative w-full sm:min-w-[220px] sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>

        {categories && onCategoryChange && (
          <Select
            value={category}
            onValueChange={(next) => {
              playSoftClick();
              onCategoryChange(next);
            }}
          >
            <SelectTrigger aria-label="Filter by category" className="h-auto rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-3 py-2 pointer-coarse:py-3 text-sm text-slate-600 dark:text-slate-300 font-medium dark:bg-slate-900 dark:hover:bg-slate-900">
              <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <SegmentedTabs
          value={layout}
          onChange={onLayoutChange}
          dense
          className="shrink-0 sm:ml-auto"
          options={[
            { value: 'grid', label: <LayoutGrid size={16} />, ariaLabel: 'Grid view' },
            { value: 'list', label: <List size={16} />, ariaLabel: 'List view' },
          ]}
        />
      </div>
    </div>
  );
}
