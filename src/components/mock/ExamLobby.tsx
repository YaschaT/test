import { useState } from 'react';
import type { JlptLevel } from '../../types';
import { JLPT_LEVELS } from '../../types';
import { useProgress, type MockExamRecord } from '../../lib/progressStore';
import { EXAM_CONFIG, MOCK_SECTIONS, SCORING, SECTION_LABEL, examTotal } from '../../lib/mockExam';
import { SECTION_THEME } from './examTheme';
import { CategoryBanner } from '../learning/CategoryBanner';
import { playPrimaryAction, playSoftClick } from '../../lib/sound';

interface ExamLobbyProps {
  level: JlptLevel;
  onLevelChange: (level: JlptLevel) => void;
  onBegin: () => void;
}


const LEVEL_BLURB: Record<JlptLevel, { desc: string; kanji: string }> = {
  N5: { desc: 'Beginner', kanji: '初' },
  N4: { desc: 'Elementary', kanji: '基' },
  N3: { desc: 'Intermediate', kanji: '中' },
};

/**
 * The exam's front door: pick a level, see what the paper is made of, and start.
 *
 * Everything on it is measured — the banner's ring and rule are the learner's best scaled score at the
 * selected level, the paper's shape comes from `EXAM_CONFIG`, and the pass marks from `SCORING`. Those
 * differ per level (N5 is 32 questions in 24 minutes at 80/180; N3 is 37 in 30 at 95/180), so nothing
 * here is a fixed number printed into the layout.
 */
export function ExamLobby({ level, onLevelChange, onBegin }: ExamLobbyProps) {
  const progress = useProgress();
  const [rulesOpen, setRulesOpen] = useState(false);

  const config = EXAM_CONFIG[level];
  const scoring = SCORING[level];
  const total = examTotal(config);
  const best = progress.mockExams[level] as MockExamRecord | undefined;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <CategoryBanner
        category="mock"
        title="Mock Exam"
        subtitle="Challenge yourself, test your full knowledge."
        levels={
          <div role="tablist" aria-label="Exam level" className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1">
            {JLPT_LEVELS.map((lv) => (
              <button
                key={lv}
                role="tab"
                aria-selected={lv === level}
                onClick={() => {
                  if (lv === level) return;
                  playSoftClick();
                  onLevelChange(lv);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  lv === level ? 'bg-iris-500 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {lv}
              </button>
            ))}
          </div>
        }
      />

      {/* One column, read top to bottom: choose a level, see what that paper is, start it. The start
          button used to sit in a second column alongside the level cards, vertically centred against
          nothing — so the page's one action floated free of the choice it depends on, and changing level
          silently rewrote a button you had already read. Now it comes after the choice, and the line of
          facts between them is the thing that just changed. */}
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7 dark:border-hairline dark:bg-ink-900">
        <div>
          <Eyebrow>Pick your level · Kies je niveau</Eyebrow>
          {/* The chosen level's card takes the room: the two you aren't sitting shrink to their letter,
              which is all you need from them until you choose one. */}
          <div className="mt-3.5 flex h-44 items-stretch gap-2.5">
            {JLPT_LEVELS.map((lv) => {
              const active = lv === level;
              const rec = progress.mockExams[lv];
              const pct = rec ? Math.round((rec.bestScore / SCORING[lv].total) * 100) : 0;
              return (
                <button
                  key={lv}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    if (active) return;
                    playSoftClick();
                    onLevelChange(lv);
                  }}
                  className={`relative flex flex-col overflow-hidden rounded-3xl border p-4 text-left transition-[flex,background,border-color,box-shadow] duration-300 sm:p-5 ${
                    active
                      /* 1.5 : 1 : 1 — the chosen level still clearly leads, but across the card's full
                         width the old 2.4 turned it into a slab with a hole in the middle. */
                      ? 'flex-[1.5] border-iris-400/55 bg-gradient-to-br from-iris-600 to-iris-800 shadow-[0_18px_40px_-18px_var(--color-iris-500)]'
                      : 'flex-1 border-slate-200 bg-slate-50 hover:border-iris-400/40 dark:border-hairline dark:bg-white/[0.03]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="jp-text pointer-events-none absolute -bottom-8 -right-3 leading-none select-none"
                    style={{
                      fontSize: 130,
                      color: active ? 'rgba(255,255,255,0.10)' : 'color-mix(in oklab, var(--color-iris-400) 8%, transparent)',
                    }}
                  >
                    {LEVEL_BLURB[lv].kanji}
                  </span>

                  <span
                    className={`relative font-display leading-none font-semibold transition-[font-size,color] duration-300 ${
                      active ? 'text-[52px] text-white' : 'text-[32px] text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {lv}
                  </span>

                  <span
                    className={`relative mt-2.5 flex min-h-0 flex-1 flex-col overflow-hidden transition-opacity duration-300 ${
                      active ? 'opacity-100' : 'pointer-events-none opacity-0'
                    }`}
                  >
                    <span className="text-sm font-bold whitespace-nowrap text-slate-100">{LEVEL_BLURB[lv].desc}</span>
                    <span className="mt-auto flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
                        style={{ background: `conic-gradient(var(--color-brand-300) ${pct}%, rgba(255,255,255,.12) ${pct}%)` }}
                      >
                        <span className="grid h-[76%] w-[76%] place-items-center rounded-full bg-iris-900 text-[11px] font-black text-slate-200 tabular-nums">
                          {rec ? rec.bestScore : '—'}
                        </span>
                      </span>
                      <span className="text-[13px] whitespace-nowrap text-slate-300">
                        {rec ? 'your best so far' : 'no sitting yet'}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-slate-50 px-5 py-3.5 text-[15px] text-slate-500 dark:bg-white/[0.03] dark:text-slate-400">
            <span>
              <Strong>{total}</Strong> questions
            </span>
            <Sep />
            <span>
              <Strong>{config.minutes}</Strong> minutes
            </span>
            <Sep />
            <span>
              pass mark <Strong>{scoring.overallPass}</Strong>/{scoring.total}
            </span>
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              playPrimaryAction();
              onBegin();
            }}
            className="exam-sheen relative isolate w-full overflow-hidden rounded-[20px] border-0 bg-gradient-to-b from-[#6b78ff] to-[#3d4ce8] p-5 font-display text-xl font-semibold text-white shadow-[0_14px_34px_-14px_var(--color-iris-500),inset_0_1px_0_rgba(255,255,255,0.24)] transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="relative">Start the {level} exam</span>
          </button>
          <p className="mt-3 text-center text-[13.5px] leading-relaxed text-slate-400 dark:text-slate-500">
            Starts after a 3-second countdown. You can leave whenever you want.
            <br />
            Je kunt altijd stoppen.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,1fr)] lg:gap-8">
        <div>
          <Eyebrow>Inside the paper · In het examen</Eyebrow>
          <div className="mt-3.5 flex flex-wrap gap-2">
            {MOCK_SECTIONS.map((section) => {
              const theme = SECTION_THEME[section];
              const count = config.perSection[section];
              const got = best?.sectionBests?.[section];
              return (
                <div
                  key={section}
                  className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-2 pr-3.5 pl-2 dark:border-hairline dark:bg-white/[0.03]"
                >
                  <span
                    aria-hidden="true"
                    className="jp-text grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[10px] text-base font-bold"
                    style={{ background: `color-mix(in oklab, ${theme.hex} 13%, transparent)`, color: theme.hex }}
                  >
                    {theme.glyph}
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{SECTION_LABEL[section].en}</span>
                  {/* Shows the count until there's a sitting to report, then that sitting's mark. */}
                  <span
                    className="text-[12.5px] font-extrabold tabular-nums"
                    style={{ color: got == null ? undefined : theme.hex }}
                  >
                    {got == null ? (
                      <span className="text-slate-400 dark:text-slate-500">×{count}</span>
                    ) : (
                      `${got}/${count}`
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <Eyebrow>You walk away with · Je krijgt</Eyebrow>
          <ul className="mt-3.5 flex flex-col gap-2.5 text-sm text-slate-500 dark:text-slate-400">
            <Takeaway color="var(--color-brand-300)">A score out of {scoring.total}, broken down per part</Takeaway>
            <Takeaway color="var(--color-amber-300)">A rank card you can share</Takeaway>
            <Takeaway color="var(--color-emerald-400)">Your weakest part, named</Takeaway>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5 dark:border-white/[0.06]">
        <button
          type="button"
          onClick={() => setRulesOpen((open) => !open)}
          aria-expanded={rulesOpen}
          className="flex w-full items-center gap-2.5 text-left text-sm font-bold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <span
            aria-hidden="true"
            className={`inline-block text-lg leading-none transition-transform duration-200 ${rulesOpen ? 'rotate-90' : ''}`}
          >
            ›
          </span>
          {rulesOpen ? 'Hide exam rules · Verberg examenregels' : 'Exam rules & scoring · Examenregels en beoordeling'}
        </button>

        {rulesOpen && (
          <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <Rule en={`One sitting, ${config.minutes} minutes, no pause.`} nl={`Eén zitting, ${config.minutes} minuten, geen pauze.`} />
            <Rule en="Flag questions and return to them." nl="Markeer vragen en kom er later op terug." />
            <Rule en="Listening audio plays on demand." nl="Luisteraudio speel je zelf af." />
            <Rule en="Blanks score zero. No penalty for guessing." nl="Lege antwoorden tellen als nul. Gokken mag." />
            <p className="text-[13px] leading-relaxed text-slate-400 sm:col-span-2 dark:text-slate-500">
              Scored 0–{scoring.total}. To pass you need {scoring.overallPass}/{scoring.total} overall{' '}
              <em>and</em> the minimum in every section ({scoring.sections.map((s) => `${s.min}/${s.max}`).join(', ')}).
              Format and scoring follow the official JLPT; the questions are original practice items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-extrabold tracking-[0.16em] text-slate-400 uppercase dark:text-slate-500">{children}</h2>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-extrabold text-slate-900 tabular-nums dark:text-white">{children}</strong>;
}

function Sep() {
  return (
    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
      ·
    </span>
  );
}

function Takeaway({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
      {children}
    </li>
  );
}

function Rule({ en, nl }: { en: string; nl: string }) {
  return (
    <div>
      <p className="text-[15px] font-semibold text-slate-700 dark:text-slate-100">{en}</p>
      <p className="text-[13px] text-slate-400 dark:text-slate-500">{nl}</p>
    </div>
  );
}
