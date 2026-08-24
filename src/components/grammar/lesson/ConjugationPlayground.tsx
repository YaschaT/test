import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { GrammarBilingual } from '../GrammarBilingual';
import { speakJapaneseBrowser } from '../../../lib/tts/browserTts';
import type { GrammarFormKey, GrammarPlayground } from '../../../types';

function formKey(casual: boolean, past: boolean, negative: boolean): GrammarFormKey {
  return `${casual ? 'casual' : 'polite'}-${past ? 'past' : 'present'}-${
    negative ? 'negative' : 'affirmative'
  }` as GrammarFormKey;
}

function chip(active: boolean) {
  return `rounded-xl border px-3.5 py-2 text-[13px] font-bold transition-colors ${
    active
      ? 'border-brand-400/60 bg-brand-500/20 text-brand-100'
      : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/20 hover:bg-white/[0.08]'
  }`;
}

/**
 * Swap the pieces and watch the pattern conjugate.
 *
 * Every form on offer is authored (see data/grammarLessons.ts) rather than produced by a conjugation
 * routine — a morphology engine that is subtly wrong would teach the learner something subtly wrong.
 * Predicates hang off their topic, so the two slots can only ever build a sentence that means something.
 */
export function ConjugationPlayground({ playground }: { playground: GrammarPlayground }) {
  const [topicIndex, setTopicIndex] = useState(0);
  const [predIndex, setPredIndex] = useState(0);
  const [past, setPast] = useState(false);
  const [negative, setNegative] = useState(false);
  const [casual, setCasual] = useState(false);

  const topic = playground.topics[topicIndex];
  // Guards a topic switch landing on an index the new topic doesn't have.
  const predicate = topic.predicates[Math.min(predIndex, topic.predicates.length - 1)];
  const key = formKey(casual, past, negative);

  const sentence = `${topic.japanese}${predicate.forms[key]}。`;
  const spoken = `${topic.kana}${predicate.formsKana[key]}。`;
  const label = [
    casual ? 'Casual' : 'Polite',
    past ? 'Past' : 'Present',
    negative ? 'Negative' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div>
      <div className="rounded-2xl border border-brand-400/25 bg-gradient-to-br from-[#16224a] to-[#0d1428] p-5 sm:p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-300">{label}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {/* Keyed on the form so the sentence re-announces itself each time a toggle changes. */}
            <p key={key + predicate.japanese} className="jp-text text-2xl font-medium leading-snug text-white sm:text-3xl">
              {sentence}
            </p>
            <GrammarBilingual text={predicate.meaning[key]} className="mt-2" />
          </div>
          <button
            type="button"
            onClick={() => speakJapaneseBrowser(spoken)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-brand-400/40 bg-brand-500/20 px-4 py-2.5 text-[13px] font-bold text-brand-100 transition-colors hover:bg-brand-500/30"
          >
            <Volume2 size={15} aria-hidden="true" /> Play
          </button>
        </div>
        <p className="mt-4 border-t border-white/[0.08] pt-4 text-[13px] leading-relaxed text-slate-300 text-pretty">
          {playground.notes[key].en}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400 text-pretty">{playground.notes[key].nl}</p>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {playground.topicLabel.en}
          </p>
          <div className="flex flex-wrap gap-2">
            {playground.topics.map((t, i) => (
              <button
                key={t.japanese}
                type="button"
                aria-pressed={i === topicIndex}
                onClick={() => {
                  setTopicIndex(i);
                  setPredIndex(0);
                }}
                className={chip(i === topicIndex)}
              >
                <span className="jp-text">{t.japanese}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            {playground.predicateLabel.en}
          </p>
          <div className="flex flex-wrap gap-2">
            {topic.predicates.map((p, i) => (
              <button
                key={p.japanese}
                type="button"
                aria-pressed={p.japanese === predicate.japanese}
                onClick={() => setPredIndex(i)}
                className={chip(p.japanese === predicate.japanese)}
              >
                <span className="jp-text">{p.japanese}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Form</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={past} onClick={() => setPast((v) => !v)} className={chip(past)}>
            Past
          </button>
          <button
            type="button"
            aria-pressed={negative}
            onClick={() => setNegative((v) => !v)}
            className={chip(negative)}
          >
            Negative
          </button>
          <button
            type="button"
            aria-pressed={casual}
            onClick={() => setCasual((v) => !v)}
            className={chip(casual)}
          >
            Casual
          </button>
        </div>
      </div>
    </div>
  );
}
