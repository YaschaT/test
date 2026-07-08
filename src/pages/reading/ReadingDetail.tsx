import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/Card';
import { Celebration } from '../../components/Celebration';
import { JapaneseText } from '../../components/JapaneseText';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ReadingQuestionPlayer } from '../../components/ReadingQuestionPlayer';
import { getReading } from '../../data/readings';
import { getVocabWord } from '../../data/vocabulary';
import { getGrammarPoint } from '../../data/grammar';
import { markReadingCompleted, recordQuizResult, useProgress } from '../../lib/progressStore';

interface ReadingPrefs {
  furigana: boolean;
  romaji: boolean;
  english: boolean;
  dutch: boolean;
}

export function ReadingDetail() {
  const { id } = useParams<{ id: string }>();
  const progress = useProgress();
  const [prefs, setPrefs] = useState<ReadingPrefs>({ furigana: true, romaji: false, english: true, dutch: true });
  const [showQuiz, setShowQuiz] = useState(false);
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);

  const passage = id ? getReading(id) : undefined;
  if (!passage) return <Navigate to="/reading" replace />;

  function handleQuizComplete(correct: number, total: number) {
    setResult({ correct, total });
    markReadingCompleted(passage!.id);
    recordQuizResult({ quizId: `reading-${passage!.id}`, skill: 'reading', level: progress.level, correct, total });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Link to="/reading" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ArrowLeft size={16} /> Back to reading
      </Link>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wide text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/40 rounded-full px-2 py-0.5">
            {passage.level}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 rounded-full px-2 py-0.5">
            {passage.difficulty}
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{passage.title.en}</h1>
        <p className="text-slate-500 dark:text-slate-400">{passage.title.nl}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ['furigana', 'Furigana'],
            ['romaji', 'Romaji'],
            ['english', 'English'],
            ['dutch', 'Dutch'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={prefs[key]}
            onClick={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))}
            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-colors ${
              prefs[key]
                ? 'bg-brand-600 border-brand-600 text-white'
                : 'border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card className="p-5 space-y-4">
        {passage.sentences.map((sentence, i) => (
          <div key={i} className="pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
            <JapaneseText segments={sentence.segments} showFurigana={prefs.furigana} className="text-lg" />
            {prefs.romaji && <p className="text-sm text-brand-600 dark:text-brand-300 mt-1">{sentence.romaji}</p>}
            {prefs.english && <p className="text-slate-700 dark:text-slate-200 mt-1">{sentence.en}</p>}
            {prefs.dutch && <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{sentence.nl}</p>}
          </div>
        ))}
      </Card>

      {(passage.vocabHighlightIds.length > 0 || passage.grammarHighlightIds.length > 0) && (
        <Card className="p-5">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Vocabulary & grammar in this passage</h2>
          <div className="flex flex-wrap gap-2">
            {passage.vocabHighlightIds.map((vid) => {
              const word = getVocabWord(vid);
              if (!word) return null;
              return (
                <span
                  key={vid}
                  className="jp-text text-xs font-medium rounded-full px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  {word.japanese} <span className="text-slate-400">— {word.meaning.en}</span>
                </span>
              );
            })}
            {passage.grammarHighlightIds.map((gid) => {
              const point = getGrammarPoint(gid);
              if (!point) return null;
              return (
                <Link
                  key={gid}
                  to={`/grammar/${gid}`}
                  className="jp-text text-xs font-medium rounded-full px-3 py-1 bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 hover:underline"
                >
                  {point.title}
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Comprehension questions</h2>
        {result ? (
          <Celebration
            correct={result.correct}
            total={result.total}
            onRetry={() => {
              setResult(null);
              setShowQuiz(true);
            }}
          />
        ) : showQuiz ? (
          <ReadingQuestionPlayer questions={passage.questions} onComplete={handleQuizComplete} />
        ) : (
          <PrimaryButton onClick={() => setShowQuiz(true)}>Start questions</PrimaryButton>
        )}
      </Card>
    </div>
  );
}
