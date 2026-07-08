/** Shared "nice work" microcopy so every quiz/review screen sounds consistent, not generated per-component. */
export function getEncouragement(correct: number, total: number): string {
  if (total === 0) return 'Nice work!';
  const ratio = correct / total;
  if (ratio === 1) return 'Perfect! Excellent work.';
  if (ratio >= 0.7) return "Nice work — you're getting the hang of this.";
  if (ratio >= 0.4) return "Good effort. A bit more practice and you'll have it.";
  return 'Keep going — every review makes this stick a little more.';
}
