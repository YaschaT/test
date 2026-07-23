import { ArrowRight } from 'lucide-react';
import type { GrammarPoint } from '../../types';

interface GrammarContinueCardProps {
  point: GrammarPoint;
  onContinue: (id: string) => void;
}

/**
 * "Continue learning" hero — always the learner's genuine next-up grammar point (first incomplete),
 * regardless of which level tab is showing. An illustrated night scene sits behind the mascot on the
 * right; like the Dashboard hero it stays dark in both themes since it's a fixed illustration.
 */
export function GrammarContinueCard({ point, onContinue }: GrammarContinueCardProps) {
  const exampleJp = point.examples[0]?.segments.map((seg) => seg.text).join('') ?? '';
  const exampleEn = point.examples[0]?.en ?? '';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#17223e] via-[#111a31] to-[#0c1424] shadow-[0_20px_50px_-24px_rgba(2,6,23,0.9)]">
      {/* Night-scene illustration, faded into the card from the right. */}
      <img
        src="/assets/grammar/background-grammar.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-y-0 right-0 h-full w-[58%] object-cover object-center opacity-90 [mask-image:linear-gradient(to_right,transparent,black_38%)]"
      />

      {/* Mascot, sitting on the scene. */}
      <img
        src="/assets/grammar/mascotte-grammar.png"
        alt="Kotobox mascot"
        className="pointer-events-none select-none hidden md:block absolute right-6 lg:right-10 top-1/2 -translate-y-[58%] h-[150px] lg:h-[168px] w-auto drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
      />

      <div className="relative z-10 p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:max-w-[62%] lg:max-w-[58%]">
          {/* What you'll learn */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-300">Continue learning</p>
            <div className="mt-2 flex items-center gap-2.5">
              <h2 className="jp-text text-3xl lg:text-[2rem] font-bold text-white leading-none">{point.title}</h2>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-bold text-slate-300">{point.level}</span>
            </div>
            <p className="mt-2.5 text-sm text-slate-300">{capitalize(point.meaning.en)}.</p>

            <p className="mt-5 text-xs font-semibold text-brand-300">You will learn</p>
            <span className="jp-text mt-2 inline-block rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-slate-100">
              {point.structure}
            </span>
          </div>

          {/* Example */}
          <div className="sm:border-l sm:border-white/10 sm:pl-6">
            <p className="text-xs font-semibold text-brand-300">Example</p>
            <p className="jp-text mt-2 text-lg text-white leading-snug">{exampleJp}</p>
            <p className="mt-1.5 text-sm text-slate-400">{exampleEn}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onContinue(point.id)}
          className="group mt-6 md:mt-0 inline-flex w-full sm:w-auto md:absolute md:bottom-6 lg:bottom-8 md:right-6 lg:right-8 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#4c6ef0] to-[#3a54d6] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(58,84,214,0.8)] transition-[filter,transform] duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1424]"
        >
          Continue lesson
          <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
