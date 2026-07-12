import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  copy: string;
  /** Tailwind classes for the icon badge, letting each card carry its skill's real in-app color. */
  iconClasses?: string;
}

/**
 * Shared glass card for the problem and solution sections — glassmorphism is deliberate here (explicitly
 * part of the confirmed landing brief), not a default. Benefit-led copy goes in `copy`; the icon badge
 * color ties each card to the same skill colors the real app uses.
 */
export function FeatureCard({ icon: Icon, title, copy, iconClasses = 'bg-brand-500/15 text-brand-300' }: FeatureCardProps) {
  return (
    <div
      data-reveal
      className="rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-6 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-[0_16px_40px_-16px_rgba(76,110,240,0.35)] transition-all duration-200"
    >
      <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${iconClasses}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-white/60 leading-relaxed">{copy}</p>
    </div>
  );
}
