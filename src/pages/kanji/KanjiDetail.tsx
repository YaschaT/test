import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/Card';
import { Bilingual } from '../../components/Bilingual';
import { KanjiCanvas } from '../../components/KanjiCanvas';
import { SrsRatingButtons } from '../../components/SrsRatingButtons';
import { DisplayToggles, type DisplayPrefs } from '../../components/DisplayToggles';
import { ExampleSentenceCard } from '../../components/ExampleSentenceCard';
import { getKanji } from '../../data/kanji';
import { markKanjiLearned, reviewItem, useProgress } from '../../lib/progressStore';
import type { SrsRating } from '../../types';

export function KanjiDetail() {
  const { id } = useParams<{ id: string }>();
  const progress = useProgress();
  const [prefs, setPrefs] = useState<DisplayPrefs>({ furigana: true, romaji: true });
  const [rated, setRated] = useState<SrsRating | null>(null);

  const kanji = id ? getKanji(id) : undefined;
  if (!kanji) return <Navigate to="/kanji" replace />;

  const done = progress.learnedKanjiIds.includes(kanji.id);

  function handleRate(rating: SrsRating) {
    reviewItem('kanji', kanji!.id, rating);
    markKanjiLearned(kanji!.id);
    setRated(rating);
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Link to="/kanji" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
        <ArrowLeft size={16} /> Back to kanji
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="jp-text text-6xl font-semibold text-slate-900 dark:text-white">{kanji.character}</span>
          <div>
            <Bilingual text={kanji.meaning} />
            <p className="text-sm text-slate-400 mt-1">{kanji.strokeCount} strokes · {kanji.level}</p>
          </div>
        </div>
        {done && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 size={18} /> Learned
          </span>
        )}
      </div>

      <Card className="p-5 grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Onyomi</h2>
          <p className="jp-text text-slate-800 dark:text-slate-100">{kanji.onyomi.join('、 ')}</p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">Kunyomi</h2>
          <p className="jp-text text-slate-800 dark:text-slate-100">{kanji.kunyomi.join('、 ')}</p>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Example words</h2>
        <div className="grid grid-cols-2 gap-3">
          {kanji.exampleWords.map((w, i) => (
            <div key={i}>
              <p className="jp-text font-medium text-slate-900 dark:text-white">
                {w.word} <span className="text-xs text-slate-400">{w.kana}</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{w.meaning.en}</p>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Example sentence</h2>
          <DisplayToggles prefs={prefs} onChange={setPrefs} />
        </div>
        <ExampleSentenceCard example={kanji.exampleSentence} prefs={prefs} />
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Writing practice</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Trace {kanji.character} with your mouse or finger, then rate how well you remembered it.
        </p>
        <KanjiCanvas character={kanji.character} />
      </Card>

      <Card className="p-5">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Self-rating</h2>
        <SrsRatingButtons onRate={handleRate} />
        {rated && (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            Saved — this kanji is scheduled for review based on your rating.
          </p>
        )}
      </Card>
    </div>
  );
}
