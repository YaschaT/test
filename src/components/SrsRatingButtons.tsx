import type { SrsRating } from '../types';

const RATINGS: { rating: SrsRating; label: string; classes: string }[] = [
  { rating: 'again', label: 'Again', classes: 'bg-red-500 hover:bg-red-600' },
  { rating: 'hard', label: 'Hard', classes: 'bg-amber-500 hover:bg-amber-600' },
  { rating: 'good', label: 'Good', classes: 'bg-brand-600 hover:bg-brand-700' },
  { rating: 'easy', label: 'Easy', classes: 'bg-emerald-500 hover:bg-emerald-600' },
];

export function SrsRatingButtons({ onRate }: { onRate: (rating: SrsRating) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {RATINGS.map(({ rating, label, classes }) => (
        <button
          key={rating}
          type="button"
          onClick={() => onRate(rating)}
          className={`rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-colors ${classes}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
