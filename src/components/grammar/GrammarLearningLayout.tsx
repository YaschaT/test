import type { ReactNode } from 'react';

interface GrammarLearningLayoutProps {
  path: ReactNode;
  preview: ReactNode;
}

/**
 * Two-column "recommended path + lesson preview" desktop layout, stacking to a single column on
 * mobile (path first, preview below the selected item) — the same responsive-collapse convention used
 * elsewhere in Kotobox rather than a bespoke breakpoint scheme.
 */
export function GrammarLearningLayout({ path, preview }: GrammarLearningLayoutProps) {
  return (
    <div className="grid lg:grid-cols-[1.5fr_1fr] gap-5 items-start">
      <div className="min-w-0">{path}</div>
      <div className="min-w-0">{preview}</div>
    </div>
  );
}
