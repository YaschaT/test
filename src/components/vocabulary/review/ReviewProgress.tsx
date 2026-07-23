import { ProgressBar } from '../../ui/ProgressBar';

/** Thin session-progress bar shared by the review header and session rail — delegates to the app-wide
 * ProgressBar so it matches every other meter (grammar completion, level, achievements, cards). */
export function ReviewProgress({ value, className = '' }: { value: number; className?: string }) {
  return <ProgressBar value={value} className={className} label="Session progress" />;
}
