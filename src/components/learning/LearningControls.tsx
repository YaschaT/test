import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import { SegmentedTabs } from '../SegmentedTabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { playSoftClick } from '../../lib/sound';

/**
 * Search, category/status filters and the grid/list switch. The JLPT level tabs used to lead this row;
 * they now live in the page's CategoryBanner, in the same top-right corner every section puts them, so
 * the one control a learner reaches for constantly is never in a different place per screen.
 */
interface LearningControlsProps {
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder: string;
  /** Omit to hide the filter dropdown entirely — some content (e.g. Kanji) has no category data to
   * filter by, and a dropdown with nothing real behind it would just be a dead control. */
  category?: string;
  onCategoryChange?: (category: string) => void;
  categories?: string[];
  /**
   * Optional second dropdown for filtering by study status. Kept generic (value + option list) rather
   * than kanji-specific so any deck can opt in; omit it to hide the control entirely.
   */
  status?: string;
  onStatusChange?: (status: string) => void;
  statusOptions?: { value: string; label: string }[];
  layout: 'grid' | 'list';
  onLayoutChange: (layout: 'grid' | 'list') => void;
}

export function LearningControls({
  query,
  onQueryChange,
  searchPlaceholder,
  category,
  onCategoryChange,
  categories,
  status,
  onStatusChange,
  statusOptions,
  layout,
  onLayoutChange,
}: LearningControlsProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
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

        {statusOptions && onStatusChange && (
          <Select
            value={status}
            onValueChange={(next) => {
              playSoftClick();
              onStatusChange(next);
            }}
          >
            <SelectTrigger aria-label="Filter by study status" className="h-auto rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-3 py-2 pointer-coarse:py-3 text-sm text-slate-600 dark:text-slate-300 font-medium dark:hover:bg-slate-900">
              <SlidersHorizontal size={14} className="text-slate-400 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {statusOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
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
