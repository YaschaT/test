import { Sparkles } from 'lucide-react';

/** The closing motivational strip: deliberately the quietest surface on the page — low contrast, no
 * action, and the supplied mascot tucked into the right edge. */
export function BottomJourneyStrip({ message }: { message: string }) {
  return (
    <aside className="relative flex min-h-16 items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 pr-28 dark:border-hairline dark:bg-ink-900">
      <Sparkles size={22} className="shrink-0 text-iris-400" aria-hidden="true" />
      <p className="text-sm text-slate-500 sm:text-base dark:text-slate-400">{message}</p>
      <img
        src="/assets/dashboard/redesign/footer-mascot.webp"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-4 h-full w-auto object-contain"
      />
    </aside>
  );
}
