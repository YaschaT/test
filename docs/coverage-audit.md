# Coverage Audit — N5 / N4 / N3

_Generated 2026-07-26 as the baseline for the N3 extension work. All counts are measured
directly from `src/data/*` and the progress/learning code, not estimated._

> **JLPT-level labels are estimates.** JLPT does not publish official vocabulary or kanji
> lists. Every `level: 'N5' | 'N4' | 'N3'` tag in this app is our best mapping against
> Genki I/II ordering, the Kaishi 1.5k frequency data, and common community lists. Treat
> them as study bands, not guarantees of what appears on a given exam.

## Headline finding

**There is no existing "N3 bridge."** The type system is `JlptLevel = 'N5' | 'N4'`
(`src/types/index.ts`), and a repo-wide search finds zero N3 content items. The only prior
mention of N3 is a note in `PROJECT_STATUS.md` explicitly stating the data model stops at N4.
Per the brief, N3 is therefore treated as **absent**, not merely incomplete, and this work
builds it from zero.

A second structural gap: authentic, numbered **stroke order does not exist**. `KanjiCanvas`
is a free-draw surface that shows a faint full-glyph outline from a system font as a tracing
guide — there is no per-stroke, numbered stroke path, and no staged See → Trace → Copy →
Recall flow. Both are required by the brief and are new build work, not edits.

## Coverage matrix (measured)

Legend: ✅ solid · 🟡 partial / thin · 🔴 absent

| Skill | N5 | N4 | N3 |
|---|---|---|---|
| **Grammar** | ✅ 30 points | 🟡 12 points | 🔴 0 |
| **Vocabulary** | 🟡 64 words | 🔴 10 words | 🔴 0 |
| **Kanji** | 🟡 25 | 🔴 5 | 🔴 0 |
| **Reading** | 🟡 2 passages | 🔴 2 passages | 🔴 0 |
| **Listening** | 🟡 derived, no dedicated items | 🟡 derived | 🔴 0 |
| **Writing (stroke order)** | 🔴 free-draw only, no numbered strokes | 🔴 | 🔴 |
| **Speaking / Write & Say** | 🟡 TTS + shadowing from sentences | 🟡 | 🔴 |

### What each cell means

- **Grammar** — `src/data/grammar.ts`, 42 points total. Each has structure, EN/NL meaning,
  explanation, natural examples with furigana + romaji, a common-mistake note, and a small
  quiz. This is the strongest content area. N5 is broad; N4 covers only ~12 of the ~80–90
  points a full N4 syllabus needs; N3 is empty.
- **Vocabulary** — `src/data/vocabulary.ts`, 74 words. Rich schema (kana, romaji, EN/NL,
  category, example sentence). Volume is far below a real N5 set (~600–800). The Kaishi 1.5k
  deck (1,500 frequency-ordered words with sentences, furigana, audio, pitch) is now
  extracted and deduplicated as the source for expansion.
- **Kanji** — `src/data/kanji.ts`, 30 entries with on/kun readings, example words, and an
  example sentence. `strokeCount` is a number only; there is **no stroke-path data**. N5
  needs ~100 kanji, N4 ~170 more, N3 ~370 more.
- **Reading** — `src/data/readings.ts`, 4 graded passages with furigana, vocab/grammar
  highlight links, and multiple-choice comprehension questions. Format is excellent; volume
  is minimal.
- **Listening** — `src/lib/listeningPool.ts` builds items on the fly from existing vocab and
  grammar example sentences and speaks them via the TTS system. There is no purpose-authored
  listening/dictation/shadowing content and no N-level tagging of listening difficulty.
- **Writing** — `KanjiCanvas.tsx` (free draw). No numbered stroke order; no trace stage.
- **Speaking** — `speaking` is a defined `SkillArea` surfaced in the study plan and driven by
  TTS shadowing; there is no dedicated prompt bank or "Write & Say" production content.

### Systems present that the 22-week path can build on

- **Progress store** (`src/lib/progressStore.ts`): streak, minutes-by-date, completed
  grammar/kanji/reading IDs, quiz results, and an **SRS** (`src/lib/srs.ts`) over vocab +
  kanji. This is enough to compute real **mastery gates** (completion %, quiz accuracy, SRS
  due count) without new plumbing.
- **Study plan calculator** (`src/lib/studyPlanCalculator.ts`): splits a daily minute budget
  across the six skills — directly reusable for the 75–90 min core / +30–60 min stretch split.
- **Roadmap type** (`RoadmapWeek` in `src/types/index.ts`) exists but is **unused** — free to
  redesign into the real curriculum + mastery-gate schema.

## Gaps the extension must close

1. Schema: add `'N3'` to `JlptLevel`; widen the ~5 hardcoded `['N5','N4']` level tabs.
2. A real **22-week learning path** with prerequisites, objectives, and **mastery gates**
   (not time-unlocks), plus the 1/3/7/14/30-day review cadence and weekly + mixed checkpoints.
3. Content volume: expand N4 to a fuller set and build N3 across all skills, in batches,
   sourced-and-verified but originally written.
4. Authentic **numbered stroke order** + a **See → Trace → Copy → Recall** writing flow.
5. Purpose-authored **listening/dictation/shadowing** and **speaking / Write & Say** banks.

Progression order follows Genki I (≈N5) → Genki II (≈N4) → N3 expansion, matching the brief's
week bands: 1–6 N5, 7–14 N4, 15–20 N3, 21–22 consolidation + mock assessments.
