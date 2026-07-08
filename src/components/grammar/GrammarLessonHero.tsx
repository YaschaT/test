import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronDown } from 'lucide-react';
import { GrammarMascotImage } from './GrammarMascotImage';
import { PrimaryButton } from '../PrimaryButton';
import type { GrammarPoint } from '../../types';

interface GrammarLessonHeroProps {
  point: GrammarPoint;
  done: boolean;
  onJumpToQuiz: () => void;
}

/**
 * The lesson page's hero — same starfield + indigo identity as the path overview, so opening a point
 * feels like zooming into that same sky. The CTA scrolls to the quiz section already on this page
 * (matching the Dashboard's own "jump to section" pattern) rather than duplicating the quiz-start
 * control that already lives there.
 */
export function GrammarLessonHero({ point, done, onJumpToQuiz }: GrammarLessonHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 p-6">
      <div className="absolute inset-0 star-field" aria-hidden="true" />
      <div className="relative z-10">
        <Link to="/grammar" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
          <ArrowLeft size={16} aria-hidden="true" /> Back to grammar
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <GrammarMascotImage size={64} className="shrink-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="jp-text text-3xl sm:text-4xl font-bold text-white leading-tight">{point.title}</h1>
                <span className="text-xs font-bold uppercase tracking-wide text-white bg-white/10 rounded-full px-2 py-0.5">
                  {point.level}
                </span>
              </div>
              <p className="text-white/50 mt-1">{point.romaji}</p>
              <p className="text-white/80 mt-2 max-w-prose">{point.meaning.en}</p>
            </div>
          </div>
          {done && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 bg-emerald-500/15 rounded-full px-3 py-1 shrink-0">
              <CheckCircle2 size={16} aria-hidden="true" /> Completed
            </span>
          )}
        </div>

        <PrimaryButton onClick={onJumpToQuiz} className="mt-5">
          {done ? 'Review the quiz' : 'Jump to quiz'} <ChevronDown size={16} aria-hidden="true" />
        </PrimaryButton>
      </div>
    </section>
  );
}
