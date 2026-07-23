import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, BookOpen, Volume2 } from 'lucide-react';
import { Bilingual } from '../Bilingual';
import { speakJapaneseBrowser } from '../../lib/tts/browserTts';
import type { GrammarPoint } from '../../types';

interface GrammarLessonIntroProps {
  point: GrammarPoint;
  lessonNumber: number;
  levelTotal: number;
  onStart: () => void;
}

/**
 * Lesson intro screen — structure + how-it-works and worked examples up top, then the full bilingual
 * meaning and the common mistake below, all over a faded night scene. Pressing Enter (or the button)
 * starts the practice.
 */
export function GrammarLessonIntro({ point, lessonNumber, levelTotal, onStart }: GrammarLessonIntroProps) {
  // Enter starts the lesson, matching the on-screen "Press Enter" hint — ignored while typing in a field.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== 'Enter' || e.repeat) return;
      if (e.target instanceof HTMLElement && e.target.closest('button, a, input, textarea')) return;
      e.preventDefault();
      onStart();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onStart]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141d36] via-[#0f1830] to-[#0b1222] p-6 lg:p-8">
      <img
        src="/assets/grammar/background-grammar.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 h-full w-full object-cover opacity-[0.22] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
      />

      <div className="relative">
        <Link
          to="/grammar"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/55 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to Grammar
        </Link>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-300">
          {point.level} Grammar · Lesson {lessonNumber} of {levelTotal}
        </p>
        <div className="mt-2 flex items-center gap-2.5">
          <h1 className="jp-text text-3xl lg:text-4xl font-bold text-white leading-none">{point.title}</h1>
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold text-slate-300">{point.level}</span>
        </div>
        <p className="mt-2 text-slate-300">{capitalize(point.meaning.en)}.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Structure + how it works */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-300">Structure</p>
            <p className="jp-text mt-2 text-lg font-semibold text-white">{point.structure}</p>

            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-brand-300">How it works</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{point.explanation.en}</p>
          </div>

          {/* Examples */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-300">Examples</p>
            <ul className="mt-3 space-y-3">
              {point.examples.map((ex, i) => (
                <li key={i} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="jp-text text-white leading-snug">{ex.segments.map((s) => s.text).join('')}</p>
                    <p className="mt-0.5 text-sm text-slate-400">{ex.en}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakJapaneseBrowser(ex.kana)}
                    aria-label={`Play example ${i + 1}`}
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 hover:bg-white/10 hover:text-brand-300 transition-colors"
                  >
                    <Volume2 size={15} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Full meaning + the mistake to avoid — the reference detail that rounds out the lesson. */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-300">
              <BookOpen size={13} aria-hidden="true" /> What it means
            </p>
            <div className="mt-2.5 leading-relaxed [&_p:first-child]:text-white [&_p:first-child]:font-medium [&_p:last-child]:mt-1 [&_p:last-child]:text-sm [&_p:last-child]:text-slate-400">
              <Bilingual text={point.meaning} />
            </div>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-300">
              <AlertTriangle size={13} aria-hidden="true" /> Common mistake
            </p>
            <div className="mt-2.5 leading-relaxed [&_p:first-child]:text-white [&_p:first-child]:font-medium [&_p:last-child]:mt-1 [&_p:last-child]:text-sm [&_p:last-child]:text-slate-400">
              <Bilingual text={point.commonMistake} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={onStart}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4c6ef0] to-[#3a54d6] px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_24px_-10px_rgba(58,84,214,0.9)] transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1222]"
          >
            Start lesson
          </button>
          <span className="text-sm text-slate-500">
            Press <kbd className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-xs font-semibold text-slate-300 font-sans">Enter ↵</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
