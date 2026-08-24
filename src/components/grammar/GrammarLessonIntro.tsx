import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Volume2 } from 'lucide-react';
import { GrammarBilingual, Eyebrow } from './GrammarBilingual';
import { SentenceAnatomy } from './lesson/SentenceAnatomy';
import { RegisterLadder } from './lesson/RegisterLadder';
import { ContrastTable } from './lesson/ContrastTable';
import { ConjugationPlayground } from './lesson/ConjugationPlayground';
import { JapaneseText } from '../JapaneseText';
import { ProgressBar } from '../ui/ProgressBar';
import { getGrammarLessonExtras } from '../../data/grammarLessons';
import { drillsForPoint, TIER_NAME, tierGroups } from '../../lib/grammarDrills';
import { speakJapaneseBrowser } from '../../lib/tts/browserTts';
import type { GrammarPoint } from '../../types';

/** Real SRS state for this point, resolved by the page and passed in so this stays a pure view. */
export interface LessonMastery {
  /** 0–100 from the point's own SRS interval, or null when it has never been practised. */
  percent: number | null;
  /** "Review in 4 days" / "Due for review today", or null when there's no schedule yet. */
  dueLabel: string | null;
}

interface GrammarLessonIntroProps {
  point: GrammarPoint;
  lessonNumber: number;
  levelTotal: number;
  mastery: LessonMastery;
  onStart: () => void;
}

interface LessonTab {
  id: string;
  label: string;
  heading: string;
  sub: string;
  body: React.ReactNode;
}

/**
 * The lesson screen: the pattern taken apart, then studied from four angles, then a single way forward.
 *
 * Only the sections with real authored content appear. A point with no anatomy, politeness ladder or
 * lookalike table simply shows its examples — the step numbering and the tab strip are both built from
 * what actually exists, so there is never an empty panel or a "coming soon".
 */
export function GrammarLessonIntro({
  point,
  lessonNumber,
  levelTotal,
  mastery,
  onStart,
}: GrammarLessonIntroProps) {
  const extras = getGrammarLessonExtras(point.id);
  const [tab, setTab] = useState(0);

  const drills = useMemo(() => drillsForPoint(point), [point]);
  const tiers = useMemo(() => tierGroups(drills), [drills]);

  const tabs: LessonTab[] = [];
  tabs.push({
    id: 'examples',
    label: 'Examples',
    heading: 'Hear it in use',
    sub: 'Sentences written for this pattern, with the reading over every kanji.',
    body: <ExampleList point={point} />,
  });
  if (extras?.playground) {
    tabs.push({
      id: 'pattern',
      label: 'Try the pattern',
      heading: 'Change the pieces',
      sub: 'Swap words and forms — every form on offer is one a native speaker would use.',
      body: <ConjugationPlayground playground={extras.playground} />,
    });
  }
  if (extras?.registers) {
    tabs.push({
      id: 'politeness',
      label: 'Politeness',
      heading: 'Same idea, three distances',
      sub: 'Which one you pick depends entirely on who you are talking to.',
      body: (
        <RegisterLadder
          lines={extras.registers}
          onSpeak={(line) => speakJapaneseBrowser(line.japanese)}
        />
      ),
    });
  }
  if (extras?.contrast) {
    tabs.push({
      id: 'confuse',
      label: 'Don’t confuse',
      heading: `What ${point.title.replace(/^〜/, '')} is not`,
      sub: 'The lookalikes that trip learners up at this level.',
      body: <ContrastTable contrast={extras.contrast} />,
    });
  }
  const activeTab = tabs[Math.min(tab, tabs.length - 1)];

  // Enter starts the practice, matching the on-screen hint — ignored while a control has focus.
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

  // Step numbering follows what actually renders: with no anatomy section, the tabs are step 1.
  const anatomyStep = extras?.anatomy ? 1 : 0;
  const tabStep = anatomyStep + 1;

  return (
    /* No overflow-hidden on this card: it would make itself the scroll container for the sticky
       action bar below and stop it pinning. The image and the header bar round their own corners
       instead. */
    <div className="relative flex flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-[#141d36] via-[#0f1830] to-[#0b1222]">
      <img
        src="/assets/grammar/background-grammar.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full select-none rounded-3xl object-cover opacity-[0.22] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]"
      />

      {/* Lesson chrome: where you are in the level, and the way back. */}
      <div className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-t-3xl border-b border-white/[0.07] bg-[#0b1222]/70 px-5 py-3.5 backdrop-blur lg:px-8">
        <Link
          to="/grammar"
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-white/55 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Grammar
        </Link>
        <div className="flex min-w-[180px] flex-1 items-center gap-3">
          <ProgressBar
            value={(lessonNumber / levelTotal) * 100}
            onDark
            className="h-1 flex-1"
            label={`${point.level} lesson progress`}
          />
          <span className="shrink-0 text-xs font-bold tabular-nums text-slate-400">
            Lesson {lessonNumber} of {levelTotal}
          </span>
        </div>
      </div>

      <div className="relative z-10 px-5 pb-6 pt-8 lg:px-8">
        {/* Title + what this point is worth to the learner right now. */}
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="jp-text text-3xl font-bold leading-none text-white lg:text-4xl">
                {point.title}
              </h1>
              <span className="rounded-md border border-brand-400/30 bg-brand-500/15 px-2 py-1 text-[10.5px] font-bold tracking-[0.1em] text-brand-300">
                {point.level}
              </span>
            </div>
            <p className="jp-text mt-2.5 text-slate-300">{point.structure}</p>
          </div>
          <div className="shrink-0 text-right">
            <Eyebrow tone="muted">Mastery</Eyebrow>
            <p className="mt-1 text-2xl font-extrabold text-emerald-400">
              {mastery.percent === null ? 'New' : `${mastery.percent}%`}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {mastery.dueLabel ?? 'First time through'}
            </p>
          </div>
        </div>

        <GrammarBilingual text={point.explanation} className="mt-7 max-w-[70ch]" />

        {extras?.anatomy && (
          <section className="mt-11">
            <StepHeading step={anatomyStep} title="Read the sentence" hint="Tap any part to see the job it does." />
            <div className="mt-5">
              <SentenceAnatomy
                sentence={extras.anatomy.sentence}
                kana={extras.anatomy.kana}
                tokens={extras.anatomy.tokens}
              />
            </div>
          </section>
        )}

        <section className="mt-12">
          <StepHeading step={tabStep} title={activeTab.heading} hint={activeTab.sub} />

          {tabs.length > 1 && (
            <div className="mt-5 flex gap-1.5 overflow-x-auto border-b border-white/[0.08] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  aria-current={i === tab ? 'true' : undefined}
                  onClick={() => setTab(i)}
                  className={`-mb-px shrink-0 border-b-2 px-3.5 py-2.5 text-[13.5px] font-bold transition-colors ${
                    i === tab
                      ? 'border-brand-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Keyed on the tab so switching re-runs the reveal instead of swapping content in place. */}
          <div key={activeTab.id} className="animate-review-reveal-in pt-6">
            {activeTab.body}
          </div>
        </section>

        <section className="mt-11 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
          <Eyebrow tone="amber" className="flex items-center gap-1.5">
            <AlertTriangle size={13} aria-hidden="true" /> Watch out
          </Eyebrow>
          <GrammarBilingual text={point.commonMistake} className="mt-2.5 max-w-[70ch]" />
        </section>
      </div>

      {/* The one way forward. Sticky so it is always reachable, lifted clear of the mobile tab bar. */}
      <div className="sticky bottom-20 z-20 mx-3 mb-3 mt-2 rounded-2xl border border-white/10 bg-[#0b1222]/95 px-4 py-3.5 backdrop-blur md:bottom-4 lg:mx-5 lg:mb-5 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-white">Ready to use it?</p>
            <p className="mt-0.5 text-[13px] text-slate-400">
              {drills.length} steps · {tiers.map((g) => TIER_NAME[g.tier].en.toLowerCase()).join(' → ')}
            </p>
          </div>
          <button
            type="button"
            onClick={onStart}
            className="inline-flex shrink-0 items-center gap-2.5 rounded-xl bg-gradient-to-b from-[#6460e5] to-[#5050d5] px-6 py-3.5 text-base font-semibold text-white shadow-[0_4px_0_0_#3d3aa8] transition-[filter,transform] duration-150 hover:brightness-110 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1222]"
          >
            Start practice
            <kbd className="rounded-md bg-white/20 px-1.5 py-0.5 font-sans text-[11px] font-semibold">
              Enter ↵
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
}

function StepHeading({ step, title, hint }: { step: number; title: string; hint: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Eyebrow>Step {step}</Eyebrow>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <p className="mt-1.5 text-sm text-slate-400">{hint}</p>
    </div>
  );
}

function ExampleList({ point }: { point: GrammarPoint }) {
  return (
    <ul className="divide-y divide-white/[0.055]">
      {point.examples.map((ex, i) => (
        <li key={i} className="flex items-start justify-between gap-4 py-4">
          <div className="min-w-0">
            <JapaneseText segments={ex.segments} className="text-lg leading-loose text-white" />
            <p className="mt-1.5 text-sm text-slate-300">{ex.en}</p>
            <p className="text-[13px] text-slate-400">{ex.nl}</p>
          </div>
          <button
            type="button"
            onClick={() => speakJapaneseBrowser(ex.kana)}
            aria-label={`Play example ${i + 1}`}
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition-colors hover:bg-white/10 hover:text-brand-300"
          >
            <Volume2 size={15} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
