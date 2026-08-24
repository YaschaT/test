import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Timer, Volume2, X } from 'lucide-react';
import { GrammarBilingual } from './GrammarBilingual';
import { ChoiceDrillView } from './practice/ChoiceDrillView';
import { ListenPlayer } from './practice/ListenPlayer';
import { TypeDrillView } from './practice/TypeDrillView';
import { MistakeDrillView } from './practice/MistakeDrillView';
import { BuildDrillView } from './practice/BuildDrillView';
import { MatchDrillView } from './practice/MatchDrillView';
import { RoleplayDrillView, type RoleplayLine } from './practice/RoleplayDrillView';
import {
  GrammarSessionSummary,
  type TierStat,
  type WeakDrill,
} from './GrammarSessionSummary';
import {
  EXAM_SECONDS,
  drillsForPoint,
  normalizeTyped,
  ratingForAccuracy,
  reviewDueLabel,
  stableShuffle,
  tierGroups,
  typedMatches,
  TIER_NAME,
  TIER_UNLOCK,
} from '../../lib/grammarDrills';
import {
  getProgressSnapshot,
  getSrsCard,
  markGrammarCompleted,
  recordQuizResult,
  reviewItem,
} from '../../lib/progressStore';
import { getLearningProgress } from '../../lib/learningState';
import { calculateXp, XP_RULES } from '../../lib/xp';
import { playComplete, playCorrect, playWrong } from '../../lib/sound';
import { speakJapaneseBrowser } from '../../lib/tts/browserTts';
import type {
  GrammarDrill,
  GrammarDrillTier,
  GrammarPoint,
  Translatable,
} from '../../types';

interface GrammarPracticeProps {
  point: GrammarPoint;
  /** Where "Next lesson" goes — null when this is the last point in the course. */
  nextPoint: GrammarPoint | null;
  onExit: () => void;
  onOpenPoint: (id: string) => void;
  onBackToList: () => void;
}

type Phase = 'answering' | 'feedback';

interface AnswerState {
  selected: number | null;
  typed: string;
  showHint: boolean;
  built: number[];
  matched: number[];
  matchSel: number | null;
  matchBad: number | null;
  rpTurn: number;
  rpLog: RoleplayLine[] | null;
}

const EMPTY_ANSWER: AnswerState = {
  selected: null,
  typed: '',
  showHint: false,
  built: [],
  matched: [],
  matchSel: null,
  matchBad: null,
  rpTurn: 0,
  rpLog: null,
};

interface Feedback {
  ok: boolean;
  /** The answer it wanted, shown in the footer. Empty for items where the screen already shows it. */
  answerText: string;
  why: Translatable;
}

/** What the session banked, read back out of the store after it committed. */
interface Commit {
  xpEarned: number;
  masteryBefore: number;
  masteryAfter: number;
  dueLabel: string;
}

/** Kinds worth a second attempt: producing a sentence is a skill, and one miss shouldn't end it. */
const RETRYABLE = new Set(['type', 'build', 'roleplay']);

/**
 * The practice run: one drill at a time, up a ladder of tiers, with a footer that always says what
 * happened and what to do next.
 *
 * The ladder comes from lib/grammarDrills — hand-authored where a point has one, built from that
 * point's own examples and quiz where it doesn't. Everything the session reports at the end is
 * measured against a snapshot taken before it started, never estimated.
 */
export function GrammarPractice({
  point,
  nextPoint,
  onExit,
  onOpenPoint,
  onBackToList,
}: GrammarPracticeProps) {
  const [round, setRound] = useState(0);

  const drills = useMemo(() => drillsForPoint(point), [point]);
  const tiers = useMemo(() => tierGroups(drills), [drills]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('answering');
  const [firstTry, setFirstTry] = useState(true);
  const [answer, setAnswer] = useState<AnswerState>(EMPTY_ANSWER);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [results, setResults] = useState<Record<number, boolean>>({});
  const [weak, setWeak] = useState<WeakDrill[]>([]);
  const [combo, setCombo] = useState(0);
  const [unlockTier, setUnlockTier] = useState<GrammarDrillTier | null>(null);
  // Set when a drill is entered rather than from an effect, so the clock never costs an extra render.
  const [timeLeft, setTimeLeft] = useState<number | null>(() => (drills[0]?.exam ? EXAM_SECONDS : null));
  const [commit, setCommit] = useState<Commit | null>(null);

  const done = index >= drills.length;
  const drill: GrammarDrill | undefined = drills[index];
  const answered = phase === 'feedback';

  // Captured once per round, before anything is written, so the summary can report a real delta.
  const baseline = useRef({ xp: 0, mastery: 0 });
  useEffect(() => {
    const snapshot = getProgressSnapshot();
    baseline.current = {
      xp: calculateXp(snapshot),
      mastery: getLearningProgress('grammar', point.id, snapshot),
    };
  }, [point.id, round]);

  const firstTryCorrect = Object.values(results).filter(Boolean).length;

  /* ---- grading -------------------------------------------------------------------------------- */

  const grade = useCallback(
    (ok: boolean, answerText: string, why: Translatable) => {
      setTimeLeft(null);
      const clean = ok && firstTry;
      setResults((prev) => ({ ...prev, [index]: clean }));
      setCombo((prev) => (clean ? prev + 1 : 0));
      setFeedback({ ok, answerText, why });
      setPhase('feedback');
      if (ok) playCorrect();
      else playWrong();
    },
    [firstTry, index],
  );

  /** Remembers a miss once per drill — the list the summary shows as "worth another look". */
  const noteMiss = useCallback(
    (answerText: string, why: Translatable) => {
      if (!drill) return;
      setWeak((prev) =>
        prev.some((w) => w.id === drill.id) ? prev : [...prev, { id: drill.id, answer: answerText, why }],
      );
    },
    [drill],
  );

  const advance = useCallback(() => {
    const next = index + 1;
    const nextDrill = drills[next];
    if (nextDrill && (!drill || nextDrill.tier !== drill.tier)) setUnlockTier(nextDrill.tier);
    else if (!nextDrill) setUnlockTier(null);
    setIndex(next);
    setPhase('answering');
    setFirstTry(true);
    setAnswer(EMPTY_ANSWER);
    setFeedback(null);
    setTimeLeft(nextDrill?.exam ? EXAM_SECONDS : null);
  }, [drill, drills, index]);

  const retry = useCallback(() => {
    setPhase('answering');
    setFirstTry(false);
    setFeedback(null);
    setAnswer((prev) => ({
      ...prev,
      selected: null,
      typed: '',
      built: [],
      // Reveal the hint on a retry: the learner has already paid for the miss.
      showHint: true,
      // Drop the reply that missed so the transcript reads as the conversation really went.
      rpLog: prev.rpLog ? prev.rpLog.slice(0, -1) : null,
    }));
  }, []);

  /* ---- exam clock ----------------------------------------------------------------------------- */

  /**
   * One second per pass, and the timeout is graded from inside the callback rather than from a second
   * effect watching the clock hit zero — the countdown only ever writes state in response to time
   * actually passing.
   */
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || phase !== 'answering' || done || !drill) return;
    const id = window.setTimeout(() => {
      const remaining = timeLeft - 1;
      setTimeLeft(remaining);
      if (remaining > 0) return;
      const answerText =
        drill.kind === 'choice' || drill.kind === 'listen'
          ? drill.options[drill.answerIndex].japanese
          : '';
      noteMiss(answerText || drill.rule?.en || drill.why.en, drill.why);
      grade(false, answerText, {
        en: `Out of time — exam format gives you ${EXAM_SECONDS} seconds a question.`,
        nl: `Tijd voorbij — in examenformaat krijg je ${EXAM_SECONDS} seconden per vraag.`,
      });
    }, 1000);
    return () => window.clearTimeout(id);
  }, [done, drill, grade, noteMiss, phase, timeLeft]);

  /* ---- commit --------------------------------------------------------------------------------- */

  useEffect(() => {
    if (!done || commit) return;
    const total = drills.length;
    const correct = Object.values(results).filter(Boolean).length;

    recordQuizResult({
      quizId: `grammar-${point.id}`,
      skill: 'grammar',
      level: point.level,
      correct,
      total,
      completed: true,
    });
    markGrammarCompleted(point.id);
    // The grade the scheduler sees is the run the learner actually had, not a fixed "good".
    reviewItem('grammar', point.id, ratingForAccuracy(correct, total));

    const after = getProgressSnapshot();
    setCommit({
      xpEarned: calculateXp(after) - baseline.current.xp,
      masteryBefore: baseline.current.mastery,
      masteryAfter: getLearningProgress('grammar', point.id, after),
      dueLabel: reviewDueLabel(getSrsCard(after, 'grammar', point.id)?.dueDate) ?? 'Scheduled',
    });
    playComplete();
  }, [commit, done, drills.length, point.id, point.level, results]);

  /* ---- per-kind answer handling --------------------------------------------------------------- */

  const canSubmit = (() => {
    if (!drill || answered) return false;
    switch (drill.kind) {
      case 'choice':
      case 'listen':
      case 'mistake':
        return answer.selected !== null;
      case 'type':
        return normalizeTyped(answer.typed).length > 0;
      case 'build':
        return answer.built.length === drill.tiles.length;
      default:
        return false;
    }
  })();

  const submit = useCallback(() => {
    if (!drill || !canSubmit) return;
    switch (drill.kind) {
      case 'choice':
      case 'listen': {
        const ok = answer.selected === drill.answerIndex;
        const answerText = drill.options[drill.answerIndex].japanese;
        const why = ok
          ? drill.why
          : ((drill.kind === 'choice' && answer.selected !== null && drill.wrongWhy?.[answer.selected]) ||
            drill.why);
        if (!ok) noteMiss(answerText, drill.why);
        grade(ok, answerText, why);
        break;
      }
      case 'type': {
        const ok = typedMatches(answer.typed, drill.accepts);
        if (!ok) noteMiss(drill.accepts[0], drill.why);
        grade(ok, drill.accepts[0], drill.why);
        break;
      }
      case 'mistake': {
        const ok = answer.selected === drill.answerIndex;
        if (!ok) noteMiss(drill.fixed, drill.why);
        grade(ok, drill.fixed, drill.why);
        break;
      }
      case 'build': {
        const built = answer.built.map((i) => drill.tiles[i]).join('');
        const ok = built === drill.target.join('');
        if (!ok) noteMiss(drill.target.join(''), drill.why);
        grade(ok, drill.target.join(''), drill.why);
        break;
      }
      default:
        break;
    }
  }, [answer, canSubmit, drill, grade, noteMiss]);

  /* ---- footer call to action ------------------------------------------------------------------ */

  const isLast = index === drills.length - 1;
  const retryable = !!drill && !feedback?.ok && RETRYABLE.has(drill.kind);
  const ctaHidden = !answered && (drill?.kind === 'match' || drill?.kind === 'roleplay');

  const ctaLabel = answered
    ? feedback?.ok
      ? isLast
        ? 'See results'
        : 'Continue'
      : retryable
        ? 'Try again'
        : 'Got it'
    : 'Check';

  const ctaAction = useCallback(() => {
    if (!answered) submit();
    else if (retryable) retry();
    else advance();
  }, [advance, answered, retry, retryable, submit]);

  /* ---- keyboard ------------------------------------------------------------------------------- */

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || done) return;
      const inField = e.target instanceof HTMLElement && e.target.closest('input, textarea');
      if (e.key === 'Enter') {
        // The typing drill owns Enter while the field has focus — it submits through its own handler.
        if (inField && !answered) return;
        if (ctaHidden) return;
        e.preventDefault();
        ctaAction();
        return;
      }
      if (inField || answered || !drill) return;
      const slot = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 }[e.key.toLowerCase()];
      if (slot === undefined) return;
      if (drill.kind === 'choice' || drill.kind === 'listen') {
        if (slot < drill.options.length) {
          e.preventDefault();
          setAnswer((prev) => ({ ...prev, selected: slot }));
        }
      } else if (drill.kind === 'mistake' && slot < drill.tokens.length) {
        e.preventDefault();
        setAnswer((prev) => ({ ...prev, selected: slot }));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, ctaAction, ctaHidden, done, drill]);

  /* ---- summary -------------------------------------------------------------------------------- */

  function restart() {
    setRound((r) => r + 1);
    setIndex(0);
    setPhase('answering');
    setFirstTry(true);
    setAnswer(EMPTY_ANSWER);
    setFeedback(null);
    setResults({});
    setWeak([]);
    setCombo(0);
    setUnlockTier(null);
    setTimeLeft(drills[0]?.exam ? EXAM_SECONDS : null);
    setCommit(null);
  }

  const tierStats: TierStat[] = tiers.map((group) => ({
    tier: group.tier,
    firstTryCorrect: group.indices.filter((i) => results[i]).length,
    total: group.indices.length,
  }));

  if (done) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141d36] via-[#0f1830] to-[#0b1222] p-5 lg:p-8">
        {commit ? (
          <GrammarSessionSummary
            point={point}
            tierStats={tierStats}
            firstTryCorrect={firstTryCorrect}
            total={drills.length}
            xpEarned={commit.xpEarned}
            masteryBefore={commit.masteryBefore}
            masteryAfter={commit.masteryAfter}
            dueLabel={commit.dueLabel}
            weak={weak}
            nextPoint={nextPoint}
            onRestart={restart}
            onNext={() => nextPoint && onOpenPoint(nextPoint.id)}
            onBackToList={onBackToList}
          />
        ) : (
          <p className="py-12 text-center text-sm text-slate-400">Saving your session…</p>
        )}
      </div>
    );
  }

  if (!drill) return null;

  return (
    // Same as the lesson card: no overflow-hidden, or the sticky feedback bar cannot pin.
    <div className="relative flex flex-col rounded-3xl border border-white/10 bg-gradient-to-br from-[#141d36] via-[#0f1830] to-[#0b1222]">
      <SessionHeader
        tiers={tiers}
        results={results}
        index={index}
        drills={drills}
        xp={firstTryCorrect * XP_RULES.quizCorrectAnswer}
        combo={combo}
        timeLeft={drill.exam ? timeLeft : null}
        tierLine={`Tier ${tiers.findIndex((g) => g.tier === drill.tier) + 1} of ${tiers.length} · ${
          TIER_NAME[drill.tier].en
        }`}
        onExit={onExit}
      />

      <div className="px-5 pb-6 pt-7 lg:px-8">
        {unlockTier && (
          <div className="animate-review-reveal-in mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3.5">
            <span aria-hidden="true" className="text-lg leading-none">
              🔓
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-emerald-200">
                {TIER_NAME[unlockTier].en} unlocked
              </p>
              <GrammarBilingual text={TIER_UNLOCK[unlockTier]} size="sm" className="mt-1" />
            </div>
          </div>
        )}

        <DrillHeader drill={drill} />

        <div className="mt-7">
          <DrillBody
            drill={drill}
            answer={answer}
            answered={answered}
            setAnswer={setAnswer}
            onSubmit={submit}
            onGrade={grade}
            onMiss={noteMiss}
            onFirstTryLost={() => setFirstTry(false)}
          />
        </div>

        <p className="mt-6 flex items-start gap-2.5 text-[13px] text-slate-400">
          <img
            src="/assets/mascots/grammar.png"
            alt=""
            aria-hidden="true"
            className="h-6 w-6 shrink-0 object-contain"
          />
          <span className="text-pretty">{mascotLine(drill, answered, feedback?.ok, combo)}</span>
        </p>
      </div>

      {/* Feedback and the way forward, always reachable and clear of the mobile tab bar. */}
      <div
        className={`animate-review-reveal-in sticky bottom-20 z-20 mx-3 mb-3 mt-2 rounded-2xl border px-4 py-3.5 backdrop-blur md:bottom-4 lg:mx-5 lg:mb-5 lg:px-6 ${
          feedback
            ? feedback.ok
              ? 'border-emerald-500/30 bg-[#0a1a14]/95'
              : 'border-rose-500/30 bg-[#1c0c11]/95'
            : 'border-white/10 bg-[#0b1222]/95'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          {feedback ? (
            <div className="flex min-w-0 flex-1 items-start gap-3.5">
              <span
                aria-hidden="true"
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  feedback.ok ? 'bg-emerald-500 text-[#0b1120]' : 'bg-rose-500 text-[#2a0d14]'
                }`}
              >
                {feedback.ok ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
              </span>
              <div className="min-w-0">
                <p
                  className={`text-[15.5px] font-extrabold ${
                    feedback.ok ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {feedback.ok ? 'Correct' : 'Not quite'}
                </p>
                {feedback.answerText && (
                  <p className="jp-text mt-1 text-[17px] text-white">{feedback.answerText}</p>
                )}
                <GrammarBilingual text={feedback.why} size="sm" className="mt-1.5" />
              </div>
            </div>
          ) : (
            <p className="min-w-0 flex-1 text-[13px] text-slate-500">{footerHelp(drill)}</p>
          )}

          {!ctaHidden && (
            <button
              type="button"
              onClick={ctaAction}
              disabled={!answered && !canSubmit}
              className={`shrink-0 rounded-xl px-7 py-3.5 text-[15px] font-extrabold transition-[filter,transform] duration-150 ${
                answered
                  ? feedback?.ok
                    ? 'bg-emerald-400 text-[#0b1120] hover:brightness-110 active:scale-[0.98]'
                    : 'bg-rose-400 text-[#2a0d14] hover:brightness-110 active:scale-[0.98]'
                  : canSubmit
                    ? 'bg-gradient-to-b from-[#6460e5] to-[#5050d5] text-white shadow-[0_4px_0_0_#3d3aa8] hover:brightness-110 active:translate-y-1 active:shadow-none'
                    : 'cursor-not-allowed bg-white/[0.06] text-slate-500'
              }`}
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */

function SessionHeader({
  tiers,
  results,
  index,
  drills,
  xp,
  combo,
  timeLeft,
  tierLine,
  onExit,
}: {
  tiers: { tier: GrammarDrillTier; indices: number[] }[];
  results: Record<number, boolean>;
  index: number;
  drills: GrammarDrill[];
  xp: number;
  combo: number;
  timeLeft: number | null;
  tierLine: string;
  onExit: () => void;
}) {
  const urgent = timeLeft !== null && timeLeft <= 7;
  return (
    <div className="rounded-t-3xl border-b border-white/[0.07] bg-[#0b1222]/70 px-5 py-3.5 backdrop-blur lg:px-8">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Leave practice and go back to the lesson"
          className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:text-white"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* One segment per drill, grouped by tier — the whole session's shape at a glance. */}
        <div
          className="flex min-w-[160px] flex-1 gap-3"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={drills.length}
          aria-valuenow={index}
          aria-label="Practice progress"
        >
          {tiers.map((group) => (
            <div key={group.tier} className="flex gap-[3px]" style={{ flex: group.indices.length }}>
              {group.indices.map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < index
                      ? results[i]
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                      : i === index
                        ? 'bg-brand-500'
                        : 'bg-white/[0.12]'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3 text-[12.5px] font-bold">
          {timeLeft !== null && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 tabular-nums ${
                urgent
                  ? 'border-rose-500/40 bg-rose-500/15 text-rose-200'
                  : 'border-white/10 bg-white/[0.06] text-slate-200'
              }`}
            >
              <Timer size={13} aria-hidden="true" />
              0:{String(Math.max(0, timeLeft)).padStart(2, '0')}
            </span>
          )}
          <span className="text-emerald-400">+{xp} XP</span>
          <span className={combo >= 2 ? 'text-amber-400' : 'text-slate-500'}>×{combo}</span>
          <span className="tabular-nums text-slate-500">
            {Math.min(index + 1, drills.length)}/{drills.length}
          </span>
        </div>
      </div>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">{tierLine}</p>
    </div>
  );
}

function DrillHeader({ drill }: { drill: GrammarDrill }) {
  const KIND_LABEL: Record<GrammarDrill['kind'], string> = {
    choice: 'Multiple choice',
    listen: 'Listening',
    type: 'Type it',
    mistake: 'Spot the mistake',
    build: 'Build the sentence',
    match: 'Match pairs',
    roleplay: 'Roleplay',
  };
  const tone = drill.exam
    ? 'border-rose-400/40 text-rose-300'
    : drill.kind === 'listen'
      ? 'border-violet-400/40 text-violet-300'
      : drill.kind === 'roleplay'
        ? 'border-teal-400/40 text-teal-300'
        : 'border-brand-400/40 text-brand-300';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className={`rounded-lg border bg-white/[0.05] px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.14em] ${tone}`}
        >
          {drill.exam ? 'JLPT format' : KIND_LABEL[drill.kind]}
        </span>
        {drill.scenario && <span className="text-[12.5px] text-slate-400">{drill.scenario.en}</span>}
      </div>
      {/* Only Japanese text goes through .jp-text — an English heading in the CJK stack reads wrong. */}
      <h2
        className={`mt-4 text-xl font-extrabold text-white sm:text-2xl ${
          hasJapanese(drill.instruction.en) ? 'jp-text' : ''
        }`}
      >
        {drill.instruction.en}
      </h2>
      {/* The Dutch instruction only earns a line when it is genuinely different text. */}
      {drill.instruction.nl !== drill.instruction.en && (
        <p className="mt-1 text-sm text-slate-400">{drill.instruction.nl}</p>
      )}
      {drill.subhead && (
        <p className="mt-2.5 text-[15px] text-slate-300 text-pretty">{drill.subhead.en}</p>
      )}
    </div>
  );
}

function PromptCard({
  japanese,
  english,
  onSpeak,
}: {
  japanese?: string;
  english?: Translatable;
  onSpeak?: () => void;
}) {
  if (!japanese && !english) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-[#0c1222] px-6 py-5">
      <div className="min-w-0">
        {japanese && <p className="jp-text text-2xl font-medium leading-relaxed text-white">{japanese}</p>}
        {english && (
          <>
            <p className={`text-sm text-slate-300 ${japanese ? 'mt-2' : ''}`}>{english.en}</p>
            <p className="mt-0.5 text-[13px] text-slate-400">{english.nl}</p>
          </>
        )}
      </div>
      {onSpeak && japanese && (
        <button
          type="button"
          onClick={onSpeak}
          aria-label="Play the prompt"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition-colors hover:bg-white/10 hover:text-brand-300"
        >
          <Volume2 size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

interface DrillBodyProps {
  drill: GrammarDrill;
  answer: AnswerState;
  answered: boolean;
  setAnswer: React.Dispatch<React.SetStateAction<AnswerState>>;
  onSubmit: () => void;
  onGrade: (ok: boolean, answerText: string, why: Translatable) => void;
  onMiss: (answerText: string, why: Translatable) => void;
  onFirstTryLost: () => void;
}

function DrillBody({
  drill,
  answer,
  answered,
  setAnswer,
  onSubmit,
  onGrade,
  onMiss,
  onFirstTryLost,
}: DrillBodyProps) {
  // Both shuffles are seeded on the drill id, so the pool never rearranges itself under the learner.
  const pool = useMemo(
    () => (drill.kind === 'build' ? stableShuffle(drill.tiles.map((_, i) => i), drill.id) : []),
    [drill],
  );
  const rightOrder = useMemo(
    () => (drill.kind === 'match' ? stableShuffle(drill.pairs.map((_, i) => i), drill.id) : []),
    [drill],
  );

  switch (drill.kind) {
    case 'choice':
      return (
        <>
          <PromptCard
            japanese={drill.promptJapanese}
            english={drill.exam ? undefined : drill.promptEn}
          />
          <ChoiceDrillView
            options={drill.options}
            answerIndex={drill.answerIndex}
            selected={answer.selected}
            answered={answered}
            hideHints={drill.exam}
            onSelect={(i) => setAnswer((prev) => ({ ...prev, selected: i }))}
          />
        </>
      );

    case 'listen':
      return (
        <>
          <div className="mb-4">
            <ListenPlayer
              onPlay={() => speakJapaneseBrowser(drill.audioKana)}
              onPlaySlow={() => speakJapaneseBrowser(drill.audioKana, 0.6)}
            />
          </div>
          <ChoiceDrillView
            options={drill.options}
            answerIndex={drill.answerIndex}
            selected={answer.selected}
            answered={answered}
            onSelect={(i) => setAnswer((prev) => ({ ...prev, selected: i }))}
          />
        </>
      );

    case 'type':
      return (
        <>
          <PromptCard
            japanese={drill.promptJapanese}
            english={drill.promptEn}
            onSpeak={
              drill.promptJapanese ? () => speakJapaneseBrowser(drill.promptJapanese ?? '') : undefined
            }
          />
          <TypeDrillView
            drill={drill}
            value={answer.typed}
            answered={answered}
            showHint={answer.showHint}
            onChange={(typed) => setAnswer((prev) => ({ ...prev, typed }))}
            onSubmit={onSubmit}
            onToggleHint={() => setAnswer((prev) => ({ ...prev, showHint: !prev.showHint }))}
          />
        </>
      );

    case 'mistake':
      return (
        <MistakeDrillView
          drill={drill}
          selected={answer.selected}
          answered={answered}
          onSelect={(i) => setAnswer((prev) => ({ ...prev, selected: i }))}
        />
      );

    case 'build':
      return (
        <>
          <PromptCard english={drill.promptEn} />
          <BuildDrillView
            drill={drill}
            pool={pool}
            built={answer.built}
            answered={answered}
            onPush={(i) => setAnswer((prev) => ({ ...prev, built: [...prev.built, i] }))}
            onPop={(i) => setAnswer((prev) => ({ ...prev, built: prev.built.filter((x) => x !== i) }))}
          />
        </>
      );

    case 'match':
      return (
        <MatchDrillView
          drill={drill}
          rightOrder={rightOrder}
          matched={answer.matched}
          selectedLeft={answer.matchSel}
          badRight={answer.matchBad}
          onLeft={(i) => setAnswer((prev) => ({ ...prev, matchSel: i, matchBad: null }))}
          onRight={(pairIndex) => {
            if (answer.matchSel === null) return;
            if (answer.matchSel === pairIndex) {
              const matched = [...answer.matched, pairIndex];
              setAnswer((prev) => ({ ...prev, matched, matchSel: null, matchBad: null }));
              if (matched.length === drill.pairs.length) {
                onGrade(true, '', drill.why);
              }
            } else {
              const mispaired = drill.pairs[answer.matchSel];
              onFirstTryLost();
              // Names the pair that went wrong and what it actually means — the drill's own `why` is
              // about the pattern, which isn't what the learner got wrong here.
              onMiss(mispaired.japanese, {
                en: `This one means “${mispaired.meaning.en}”`,
                nl: `Deze betekent “${mispaired.meaning.nl}”`,
              });
              setAnswer((prev) => ({ ...prev, matchBad: pairIndex, matchSel: null }));
            }
          }}
        />
      );

    case 'roleplay': {
      const opening: RoleplayLine = {
        who: 'partner',
        japanese: drill.turns[0].npc.japanese,
        gloss: drill.turns[0].npc.meaning.en,
      };
      const log = answer.rpLog ?? [opening];
      return (
        <RoleplayDrillView
          drill={drill}
          log={log}
          turnIndex={answer.rpTurn}
          answered={answered}
          onSpeak={(kana) => speakJapaneseBrowser(kana)}
          onChoose={(choiceIndex) => {
            const turn = drill.turns[answer.rpTurn];
            const choice = turn.choices[choiceIndex];
            const nextLog: RoleplayLine[] = [
              ...log,
              { who: 'you', japanese: choice.japanese, gloss: choice.hint.en },
            ];
            const correctReply = turn.choices.find((c) => c.ok)?.japanese ?? '';

            if (!choice.ok) {
              onFirstTryLost();
              onMiss(correctReply, choice.why ?? drill.why);
              setAnswer((prev) => ({ ...prev, rpLog: nextLog }));
              onGrade(false, correctReply, choice.why ?? drill.why);
              return;
            }

            if (answer.rpTurn + 1 < drill.turns.length) {
              const next = drill.turns[answer.rpTurn + 1];
              setAnswer((prev) => ({
                ...prev,
                rpTurn: prev.rpTurn + 1,
                rpLog: [
                  ...nextLog,
                  { who: 'partner', japanese: next.npc.japanese, gloss: next.npc.meaning.en },
                ],
              }));
              speakJapaneseBrowser(next.npc.kana);
            } else {
              setAnswer((prev) => ({ ...prev, rpLog: nextLog }));
              onGrade(true, '', turn.why);
            }
          }}
        />
      );
    }

    default:
      return null;
  }
}

/** Kana, kanji or full-width punctuation — enough to decide whether a string belongs in .jp-text. */
function hasJapanese(text: string): boolean {
  return /[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff00-\uff9f]/.test(text);
}

function footerHelp(drill: GrammarDrill): string {
  if (drill.kind === 'match') return 'Pair them all to continue.';
  if (drill.kind === 'roleplay') return 'Pick the reply that fits the situation.';
  if (drill.kind === 'choice' || drill.kind === 'listen') return '1–4 to pick · Enter to check';
  return 'Enter to check';
}

function mascotLine(
  drill: GrammarDrill,
  answered: boolean,
  ok: boolean | undefined,
  combo: number,
): string {
  if (answered) {
    return ok ? 'That is how a native would say it.' : 'Everyone loses this one first. You will not next time.';
  }
  if (drill.exam) return 'Exam pace: read the sentence once, commit, move on.';
  if (drill.kind === 'roleplay') return 'Read their line first — it tells you which politeness to mirror.';
  if (drill.kind === 'listen') return 'Listen twice before you look at the options.';
  if (combo >= 3) return 'Three in a row. Careful — this one hides a trap.';
  return 'Getting it right slowly beats guessing fast.';
}
