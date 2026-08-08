/**
 * Scores a spoken attempt at a set phrase by comparing what the speech recogniser heard with the line
 * the learner was asked to say.
 *
 * This is a *match* score, not a phoneme-level pronunciation grade: the browser gives us text, not
 * audio features, so what it really measures is "did a Japanese recogniser hear your line?". That
 * turns out to be a useful signal — mangled vowel length or a dropped particle usually comes back as
 * different text — but it can also be wrong, which is why the UI always shows the learner what was
 * heard next to the score instead of just a number.
 *
 * Two things make it fair enough to show:
 *  - every hypothesis is scored, not just the recogniser's first guess. Chrome hands back several
 *    alternatives plus an in-progress interim string, and the interim is often still in kana before
 *    the IME-style conversion picks kanji — which matches our kana-written phrases directly.
 *  - each hypothesis is scored against both the phrase's written form and its kana reading, taking the
 *    better of the two, so a recogniser that returns 大丈夫です for だいじょうぶです isn't punished when
 *    either form of the target lines up.
 */

/** Katakana → hiragana, so コーヒー and こーひー compare equal. */
function toHiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/**
 * Reduces a string to the characters that carry the reading: kana, kanji and the long-vowel mark.
 * Punctuation, spaces and the recogniser's stray latin all disappear, so 「あたためますか。」 and
 * "あたためますか" are the same attempt.
 */
export function toComparable(text: string): string {
  return toHiragana(text.normalize('NFKC')).replace(/[^ぁ-ゖー一-鿿]/g, '');
}

/** Classic edit distance, iterative with a single row — the strings here are one short sentence. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    previous = current;
  }
  return previous[b.length];
}

/**
 * How closely one heard string matches one target, 0–100.
 *
 * A target that appears whole inside the heard text scores 100: recognisers routinely tack on a
 * particle or run two utterances together, and "you said the line, plus something else" is not a
 * pronunciation mistake.
 */
export function similarity(heard: string, target: string): number {
  const a = toComparable(heard);
  const b = toComparable(target);
  if (!a || !b) return 0;
  if (a.includes(b)) return 100;
  const distance = levenshtein(a, b);
  return Math.max(0, Math.round((1 - distance / Math.max(a.length, b.length)) * 100));
}

export interface AttemptScore {
  /** 0–100, the best match across every hypothesis and target form. */
  score: number;
  /** The hypothesis that scored best, as the recogniser wrote it — shown back to the learner. */
  heard: string;
}

/**
 * Scores one recording attempt. `hypotheses` are the recogniser's guesses (alternatives + interim),
 * `targets` the acceptable written forms of the phrase (its ja and kana). Returns 0 with an empty
 * `heard` when nothing was picked up at all.
 */
export function scoreAttempt(hypotheses: string[], targets: string[]): AttemptScore {
  let best: AttemptScore = { score: 0, heard: '' };
  for (const hypothesis of hypotheses) {
    if (!hypothesis.trim()) continue;
    for (const target of targets) {
      const score = similarity(hypothesis, target);
      // First hypothesis to reach a score wins ties: the recogniser ranks its own alternatives, and
      // its top guess is the one worth showing back.
      if (score > best.score || (!best.heard && score > 0)) best = { score, heard: hypothesis };
    }
  }
  if (!best.heard) {
    const firstHeard = hypotheses.find((h) => h.trim());
    if (firstHeard) return { score: 0, heard: firstHeard };
  }
  return best;
}

/** Where a score sits: what the learner is told, and which colour the bar takes. */
export type ScoreBand = 'good' | 'close' | 'off';

export function scoreBand(score: number): ScoreBand {
  if (score >= 85) return 'good';
  if (score >= 60) return 'close';
  return 'off';
}
