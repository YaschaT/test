import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { playSoftClick } from '../lib/sound';

export interface SegmentedTabOption<T extends string> {
  value: T;
  label: ReactNode;
  ariaLabel?: string;
}

interface SegmentedTabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedTabOption<T>[];
  className?: string;
  /** Tighter padding for icon-only segments (e.g. the grid/list view switch). */
  dense?: boolean;
  size?: 'sm' | 'md';
  /** 'light' matches the app's normal card chrome; 'glass' is for sitting on a dark illustrated
   * background (the Dashboard hero) where a white card would clash. */
  variant?: 'light' | 'glass';
  /** Sets an accessible label on the group, for standalone toggles not already inside a labeled region
   * (e.g. the Dashboard's N5/N4 switch). Omit when the surrounding UI already provides context. */
  groupLabel?: string;
}

const TRACK_CLASSES: Record<'light' | 'glass', string> = {
  light: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
  glass: 'border-white/15 bg-white/5',
};

const INACTIVE_TEXT_CLASSES: Record<'light' | 'glass', string> = {
  light: 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100',
  glass: 'text-slate-300 hover:text-white',
};

/**
 * A single-select segmented control with a sliding "pill" indicator that glides to the active option
 * (measured from the real DOM node, so it lines up exactly even though options can have different widths)
 * instead of just swapping a background class — used everywhere the app has a small group of mutually
 * exclusive options (level filters, view toggles, playback mode/speed, the Dashboard's N5/N4 switch) so
 * they all share one tactile, consistent interaction instead of each screen reimplementing plain buttons.
 *
 * Built on Radix's ToggleGroup primitive (`type="single"`) rather than plain buttons — gets real
 * roving-tabindex arrow-key navigation between segments and correct `radiogroup`-style ARIA semantics for
 * free, while the sliding indicator, colors, and sound stay fully custom. Radix's `type="single"` allows
 * deselecting the active item (calling onValueChange with `""`); that's ignored here since this control is
 * a "pick exactly one" filter, not an optional toggle — passing the same `value` back keeps it controlled
 * and Radix simply leaves the current selection in place.
 */
export function SegmentedTabs<T extends string>({
  value,
  onChange,
  options,
  className = '',
  dense = false,
  size = 'md',
  variant = 'light',
  groupLabel,
}: SegmentedTabsProps<T>) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const activeIndex = options.findIndex((o) => o.value === value);

  useLayoutEffect(() => {
    const el = buttonRefs.current[activeIndex];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [activeIndex, options.length]);

  useLayoutEffect(() => {
    function reposition() {
      const el = buttonRefs.current[activeIndex];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  }, [activeIndex]);

  function select(next: string) {
    if (!next) return; // Radix reports "" when a single-type item is deselected — ignore, one must stay active.
    if (next !== value) playSoftClick();
    onChange(next as T);
  }

  const padding = dense
    ? 'p-2 pointer-coarse:p-3.5'
    : size === 'sm'
      ? 'px-3 py-1.5 pointer-coarse:py-3'
      : 'px-4 py-1.5 pointer-coarse:py-3';
  const fontSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={value}
      onValueChange={select}
      aria-label={groupLabel}
      className={`relative inline-flex rounded-xl border p-1 ${TRACK_CLASSES[variant]} ${className}`}
    >
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 rounded-lg bg-brand-600 shadow-[0_0_0_1px_rgba(58,84,214,0.3),0_0_16px_-2px_rgba(58,84,214,0.7)] transition-all duration-200 ease-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
      {options.map((option, i) => {
        const item = (
          <ToggleGroupPrimitive.Item
            key={option.value}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            value={option.value}
            aria-label={option.ariaLabel}
            className={`relative z-10 ${padding} rounded-lg ${fontSize} font-semibold transition-colors active:scale-95 duration-150 outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
              value === option.value ? 'text-white' : INACTIVE_TEXT_CLASSES[variant]
            }`}
          >
            {option.label}
          </ToggleGroupPrimitive.Item>
        );
        // Icon-only (dense) segments have no visible text label, so a tooltip is the only way to discover
        // what they do — text segments already show their own label and don't need one.
        if (!dense || !option.ariaLabel) return item;
        return (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>{item}</TooltipTrigger>
            <TooltipContent>{option.ariaLabel}</TooltipContent>
          </Tooltip>
        );
      })}
    </ToggleGroupPrimitive.Root>
  );
}
