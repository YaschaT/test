import { Flame, Volume2, Check, Star } from 'lucide-react';
import { TiltCard } from './TiltCard';

/**
 * Stylized in-app previews — hand-built miniatures of four real screens (Dashboard, Vocabulary, Kanji,
 * Listening) rather than raster screenshots, so they stay crisp at every DPI and can never 404. Every
 * element shown mirrors something the app actually does today; the internals are aria-hidden illustrations
 * with the accessible description carried by each figcaption. Each frame rests at a slight perspective
 * angle (mirrored toward the grid's center) and leans toward the cursor via TiltCard — real objects in
 * space, not flat screenshots in boxes.
 */

function PreviewFrame({
  children,
  caption,
  restRotateY,
}: {
  children: React.ReactNode;
  caption: string;
  restRotateY: number;
}) {
  return (
    <TiltCard restRotateY={restRotateY}>
      <figure
        data-reveal
        className="group rounded-2xl border border-white/10 bg-slate-900/80 overflow-hidden hover:border-brand-500/40 hover:shadow-[0_20px_50px_-16px_rgba(76,110,240,0.45)] transition-[border-color,box-shadow] duration-200"
      >
        <div aria-hidden="true" className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/8">
          <span className="w-2 h-2 rounded-full bg-white/15" />
          <span className="w-2 h-2 rounded-full bg-white/15" />
          <span className="w-2 h-2 rounded-full bg-white/15" />
        </div>
        <div aria-hidden="true" className="p-5 h-52 select-none pointer-events-none">
          {children}
        </div>
        <figcaption className="px-5 pb-4 text-sm font-semibold text-white/70">{caption}</figcaption>
      </figure>
    </TiltCard>
  );
}

export function ProductPreview() {
  return (
    <section id="preview" className="relative py-20 sm:py-28 scroll-mt-16">
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[70%] h-[50%] rounded-full bg-brand-600/10 blur-3xl pointer-events-none"
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <h2 data-reveal className="text-3xl sm:text-4xl font-extrabold text-white text-balance max-w-3xl">
          A real product, not a promise.
        </h2>
        <p data-reveal className="mt-4 text-white/60 max-w-2xl">
          Everything below is in Kotobox today — free, in your browser, no install.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-5">
          <PreviewFrame restRotateY={-4} caption="Dashboard — your whole day at a glance">
            <div className="rounded-xl bg-slate-950 star-field p-4">
              <p className="text-lg font-extrabold text-white">こんばんは！ 🌙</p>
              <p className="text-xs text-white/55 mt-0.5">Let's make progress toward JLPT N5 today.</p>
              <div className="mt-3 flex gap-2">
                <span className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white">
                  <Flame size={11} className="text-accent-500" /> 5 days
                </span>
                <span className="rounded-lg bg-white/10 px-2 py-1 text-[11px] font-bold text-white">49 min today</span>
                <span className="rounded-lg bg-brand-600 px-2 py-1 text-[11px] font-bold text-white">N5</span>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/80">
                Vocabulary review <Check size={13} className="text-emerald-400" />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/80">
                Grammar — 〜てもいいです <span className="text-brand-300 font-bold">+20 XP</span>
              </div>
            </div>
          </PreviewFrame>

          <PreviewFrame restRotateY={4} caption="Vocabulary — spaced-repetition flashcards">
            <div className="rounded-xl border border-brand-500/30 bg-slate-950 p-4 shadow-[0_0_24px_-8px_rgba(76,110,240,0.5)]">
              <div className="flex items-start justify-between">
                <span className="rounded-md bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">New</span>
                <Star size={14} className="text-amber-300" />
              </div>
              <p className="mt-3 text-2xl font-bold text-white" lang="ja">
                すみません
              </p>
              <p className="text-xs text-white/50 mt-0.5">sumimasen</p>
              <p className="text-sm text-white/80 mt-2">excuse me; I'm sorry</p>
              <div className="mt-3 flex items-center gap-2">
                <Volume2 size={14} className="text-brand-300" />
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
                </div>
                <span className="text-[10px] font-bold text-white/50">33%</span>
              </div>
            </div>
          </PreviewFrame>

          <PreviewFrame restRotateY={-4} caption="Kanji — readings, meanings, stroke practice">
            <div className="flex gap-4 h-full">
              <div className="flex items-center justify-center w-24 rounded-xl border border-white/10 bg-slate-950 text-6xl font-bold text-white" lang="ja">
                水
              </div>
              <div className="flex-1 space-y-2 py-1">
                <p className="text-sm font-bold text-white">water</p>
                <p className="text-xs text-white/60" lang="ja">
                  くん: みず ・ おん: スイ
                </p>
                <div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] text-white/70">
                  お<span className="text-brand-300 font-bold">水</span>をください。 — Water, please.
                </div>
                <div className="rounded-lg border border-dashed border-white/20 px-2.5 py-1.5 text-[11px] text-white/50">
                  ✍️ Draw it stroke by stroke
                </div>
              </div>
            </div>
          </PreviewFrame>

          <PreviewFrame restRotateY={4} caption="Listening — hear it, then prove you understood">
            <div className="flex flex-col items-center gap-3 pt-2">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-b from-[#6460e5] to-[#5050d5] text-white shadow-[0_0_28px_-4px_rgba(100,96,229,0.8)]">
                <Volume2 size={22} />
              </span>
              <p className="text-[11px] text-white/45">Tap to play</p>
              <div className="grid grid-cols-2 gap-2 w-full">
                <span className="rounded-lg border border-emerald-400/50 bg-emerald-400/10 px-2.5 py-1.5 text-[11px] text-emerald-200 text-center">
                  I walk to school.
                </span>
                <span className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] text-white/70 text-center">
                  This road is safe.
                </span>
                <span className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] text-white/70 text-center">
                  It's raining today.
                </span>
                <span className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] text-white/70 text-center">
                  I meet my friend.
                </span>
              </div>
            </div>
          </PreviewFrame>
        </div>
      </div>
    </section>
  );
}
