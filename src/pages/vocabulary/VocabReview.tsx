import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/Card';
import { Bilingual } from '../../components/Bilingual';
import { PrimaryButton } from '../../components/PrimaryButton';
import { SrsRatingButtons } from '../../components/SrsRatingButtons';
import { VOCABULARY } from '../../data/vocabulary';
import { reviewItem, useProgress } from '../../lib/progressStore';
import { buildReviewQueue } from '../../lib/reviewQueue';
import type { SrsRating } from '../../types';

export function VocabReview() {
  const progress = useProgress();
  const navigate = useNavigate();
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  // Queue is captured once per mount so it doesn't reshuffle mid-session as cards update.
  const queue = useMemo(() => buildReviewQueue(VOCABULARY, 'vocabulary', progress, 10), []); // eslint-disable-line react-hooks/exhaustive-deps

  const word = queue[position];

  function rate(rating: SrsRating) {
    reviewItem('vocabulary', word.id, rating);
    setReviewedCount((c) => c + 1);
    if (position + 1 < queue.length) {
      setPosition((p) => p + 1);
      setRevealed(false);
    } else {
      setPosition((p) => p + 1);
    }
  }

  if (queue.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Nothing to review right now</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-4">Come back later, or browse the full deck.</p>
        <Link to="/vocabulary" className="text-brand-600 dark:text-brand-300 font-semibold hover:underline">
          Back to vocabulary
        </Link>
      </div>
    );
  }

  if (position >= queue.length) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Review complete</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">You reviewed {reviewedCount} words.</p>
        <PrimaryButton onClick={() => navigate('/vocabulary')}>Back to vocabulary</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Link to="/vocabulary" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <ArrowLeft size={16} /> Exit review
        </Link>
        <span className="text-xs text-slate-400">
          {position + 1} / {queue.length}
        </span>
      </div>

      <Card className="p-8 text-center">
        <p className="jp-text text-4xl font-semibold text-slate-900 dark:text-white">{word.japanese}</p>
        {word.kana !== word.japanese && <p className="text-slate-400 mt-2">{word.kana}</p>}

        {revealed ? (
          <div className="mt-6 space-y-4 text-left">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-1">{word.romaji}</p>
              <Bilingual text={word.meaning} />
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3">
              <p className="jp-text text-slate-800 dark:text-slate-100">
                {word.example.segments.map((s) => s.text).join('')}
              </p>
              <p className="text-sm text-brand-600 dark:text-brand-300 mt-1">{word.example.romaji}</p>
              <Bilingual text={{ en: word.example.en, nl: word.example.nl }} className="mt-1" />
            </div>
          </div>
        ) : (
          <PrimaryButton onClick={() => setRevealed(true)} className="mt-6">
            Show answer
          </PrimaryButton>
        )}
      </Card>

      {revealed && <SrsRatingButtons onRate={rate} />}
    </div>
  );
}
