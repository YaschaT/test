import type { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './tooltip';

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
  size?: number;
  className?: string;
}

/** A small icon-only control (sidebar/mobile-header toggles: sound, music, theme) wrapped in a Tooltip so
 * its purpose is discoverable on hover/focus, not just from the icon glyph alone — consolidates styling
 * that was previously hand-repeated at each call site. */
export function IconButton({ icon: Icon, label, onClick, active = false, size = 18, className = '' }: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-pressed={active}
          className={`rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
            active ? 'text-brand-600 dark:text-brand-300' : 'text-slate-500 dark:text-slate-400'
          } ${className}`}
        >
          <Icon size={size} aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
