import { Play, RotateCcw } from 'lucide-react';
import { Card } from '../Card';
import { PrimaryButton } from '../PrimaryButton';
import { RingStat } from '../dashboard/RingStat';
import { ROUND_LABEL, type ListeningRound } from '../../lib/listeningRounds';
import { XP_RULES } from '../../lib/xp';

interface SessionResultsProps {
  rounds: ListeningRound[];
  /** One entry per round the learner resolved, oldest first. */
  log: boolean[];
  correct: number;
  heartsLeft: number;
  maxHearts: number;
  /** True when the session ended because the hearts ran out rather than because it was finished. */
  ranOutOfHearts: boolean;
  onReplay: (japanese: string) => void;
  playbackAvailable: boolean;
  onRestart: () => void;
}

/** Ring colour follows the app's learning-state vocabulary: mastered / needs review / missed. */
function ringColor(accuracy: number): string {
  if (accuracy >= 75) return '#10b981';
  if (accuracy >= 50) return '#f59e0b';
  return '#ef4444';
}

export function SessionResults({
  rounds,
  log,
  correct,
  heartsLeft,
  maxHearts,
  ranOutOfHearts,
  onReplay,
  playbackAvailable,
  onRestart,
}: SessionResultsProps) {
  const answered = log.length;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const played = rounds.slice(0, answered);
  const formats = new Set(played.map((round) => round.kind));
  const missed = played.filter((_, index) => !log[index]);

  // The two components of the session's XP, named — the completion bonus only lands on a session actually
  // played to the end, so an abandoned or heart-ended run showing the same total would be a lie.
  const answerXp = correct * XP_RULES.quizCorrectAnswer;
  const bonusXp = ranOutOfHearts ? 0 : XP_RULES.listeningSession;

  const title = ranOutOfHearts
    ? `${maxHearts} got past you.`
    : accuracy >= 75
      ? 'Your ear held up.'
      : 'Some of it landed.';

  const body = ranOutOfHearts
    ? 'Ending early is not a loss — you now know exactly which lines to attack. Every one of them is back in your review queue.'
    : accuracy >= 75
      ? `You answered ${correct} of ${answered} across ${formats.size} ${formats.size === 1 ? 'format' : 'formats'}. Sleep on it: that is when sounds settle.`
      : 'Vocabulary is rarely the problem here — endings and particles are. The slow replays below will do more for you than new words will.';

  return (
    <div className="grid animate-celebrate items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-5">
        <Card className="flex flex-wrap items-center gap-8 p-7">
          <RingStat progress={answered > 0 ? correct / answered : 0} color={ringColor(accuracy)} size={120} strokeWidth={9} displaySize="150px">
            <span className="flex flex-col items-center">
              <span className="text-4xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
                {accuracy}%
              </span>
              <span className="text-[10px] font-black tracking-[0.1em] text-slate-500 dark:text-slate-400">
                EAR ACCURACY
              </span>
            </span>
          </RingStat>

          <div className="flex min-w-[16rem] flex-1 flex-col gap-5">
            <div className="space-y-2">
              <p className="text-[11px] font-black tracking-[0.15em] text-brand-600 dark:text-iris-400">
                {ranOutOfHearts ? 'SESSION ENDED · HEARTS OUT' : 'SESSION COMPLETE'}
              </p>
              <h2 className="font-display text-3xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
              <p className="max-w-[56ch] text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                {body}
              </p>
            </div>

            <dl className="flex flex-wrap gap-2.5">
              <ResultStat value={`${correct}/${answered}`} label="CORRECT" />
              <ResultStat value={`${heartsLeft}`} label="HEARTS LEFT" tone="text-red-500" />
              <ResultStat value={`+${answerXp + bonusXp}`} label="XP EARNED" tone="text-brand-600 dark:text-iris-400" />
              <ResultStat value={`${formats.size}/4`} label="FORMATS" tone="text-emerald-500" />
            </dl>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              +{answerXp} XP from correct answers
              {bonusXp > 0 ? ` · +${bonusXp} XP session bonus` : ' · no session bonus — the run ended early'}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-[10px] font-black tracking-[0.14em] text-slate-500 dark:text-slate-400">ROUND BY ROUND</h3>
          <ul className="mt-1">
            {played.map((round, index) => (
              <li
                key={round.key}
                className="flex items-center gap-3.5 border-t border-slate-200 py-3 first:border-t-0 dark:border-hairline"
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[11px] font-black ${
                    log[index]
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/15 text-red-600 dark:text-red-400'
                  }`}
                >
                  {log[index] ? '✓' : '✕'}
                </span>
                <span className="jp-text min-w-0 flex-1 text-[17px] text-slate-800 dark:text-slate-100">
                  {round.item.japanese}
                </span>
                <span className="hidden shrink-0 text-[11px] font-bold tracking-[0.06em] text-slate-500 sm:block dark:text-slate-400">
                  {ROUND_LABEL[round.kind].toLowerCase()}
                </span>
                <button
                  type="button"
                  onClick={() => onReplay(round.item.japanese)}
                  disabled={!playbackAvailable}
                  aria-label={`Replay ${round.item.japanese}`}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 dark:border-hairline dark:text-slate-300 dark:hover:border-iris-400"
                >
                  <Play size={12} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="flex flex-col items-center gap-3 p-6 text-center">
          <img
            src="/assets/banner/mascot/listening.webp"
            alt=""
            aria-hidden="true"
            className="h-28 w-auto object-contain"
          />
          <p className="text-[13.5px] font-bold leading-relaxed text-slate-700 dark:text-slate-200">
            {ranOutOfHearts
              ? 'We stop here. Same time tomorrow, starting with the ones that got past you.'
              : accuracy >= 75
                ? 'Good session. The sounds you caught today are the ones you will catch at speed next month.'
                : 'Steady. Endings before vocabulary next time.'}
          </p>
        </Card>

        <Card className="p-6">
          <h3 className="text-[10px] font-black tracking-[0.14em] text-slate-500 dark:text-slate-400">BACK TOMORROW</h3>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            {missed.length > 0
              ? 'The lines your ear missed. They are already scheduled to come back.'
              : 'Nothing missed — a clean run. Every line moves out to a longer interval.'}
          </p>
          {missed.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {missed.map((round) => (
                <li
                  key={round.key}
                  className="jp-text rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm text-slate-700 dark:border-hairline dark:bg-ink-800 dark:text-slate-200"
                >
                  {round.item.japanese}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <PrimaryButton onClick={onRestart} className="w-full justify-center">
          <RotateCcw size={16} aria-hidden="true" /> Another {rounds.length} rounds
        </PrimaryButton>
      </div>
    </div>
  );
}

function ResultStat({ value, label, tone = 'text-slate-900 dark:text-white' }: { value: string; label: string; tone?: string }) {
  return (
    <div className="flex min-w-[7rem] flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-hairline dark:bg-ink-800">
      <dd className={`text-lg font-black tabular-nums ${tone}`}>{value}</dd>
      <dt className="text-[10px] font-black tracking-[0.1em] text-slate-500 dark:text-slate-400">{label}</dt>
    </div>
  );
}
