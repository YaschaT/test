import { JapaneseScene } from './JapaneseScene';

/**
 * The layer the lantern-spotlight reveals: the same night scene (identical geometry, so base and reveal
 * stay perfectly registered) washed in warm lantern light, with a constellation of Japanese words hanging
 * in the sky and the bird mascot waiting by the torii — sweeping the light across the dark literally
 * uncovers the words you'll learn. Every word shown is real N5 material from the app's own decks.
 */

const WORDS: Array<{ jp: string; top: string; left: string; size: string; opacity: number }> = [
  { jp: '水', top: '14%', left: '12%', size: 'text-4xl', opacity: 0.9 },
  { jp: 'ことば', top: '24%', left: '30%', size: 'text-xl', opacity: 0.7 },
  { jp: '道', top: '10%', left: '46%', size: 'text-3xl', opacity: 0.85 },
  { jp: '学ぶ', top: '20%', left: '64%', size: 'text-2xl', opacity: 0.75 },
  { jp: '友達', top: '34%', left: '8%', size: 'text-2xl', opacity: 0.7 },
  { jp: 'ありがとう', top: '38%', left: '40%', size: 'text-lg', opacity: 0.65 },
  { jp: '先生', top: '30%', left: '80%', size: 'text-2xl', opacity: 0.8 },
  { jp: '家族', top: '48%', left: '22%', size: 'text-xl', opacity: 0.6 },
  { jp: '日本語', top: '44%', left: '58%', size: 'text-3xl', opacity: 0.85 },
  { jp: 'おはよう', top: '56%', left: '72%', size: 'text-lg', opacity: 0.6 },
];

export function LanternScene() {
  return (
    <div className="absolute inset-0 bg-slate-950">
      <JapaneseScene />

      {/* warm lantern wash over the night */}
      <div className="absolute inset-0 bg-amber-400/10" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(252, 211, 77, 0.18), transparent 60%)' }}
      />

      {/* the word constellation */}
      <div className="absolute inset-0" lang="ja">
        {WORDS.map((w) => (
          <span
            key={w.jp}
            className={`absolute font-bold text-amber-100 ${w.size}`}
            style={{
              top: w.top,
              left: w.left,
              opacity: w.opacity,
              textShadow: '0 0 18px rgba(252, 211, 77, 0.55)',
            }}
          >
            {w.jp}
          </span>
        ))}
      </div>

      {/* the mascot, discovered in the light beside the torii */}
      <img
        src="/assets/dashboard/mascots/mascot-greeting.png"
        alt=""
        width={180}
        height={169}
        loading="lazy"
        decoding="async"
        className="absolute bottom-[6%] right-[16%] w-32 sm:w-40 h-auto drop-shadow-[0_16px_32px_rgba(0,0,0,0.6)]"
      />
    </div>
  );
}
