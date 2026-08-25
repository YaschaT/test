# Project Status — Kotobox (JLPT N5→N4 app)

## Reading — a reader instead of a glossed transcript (2026-08-25)

The library page taught the three rules of extensive reading — no dictionary, guess from context, skip
what slows you down — and then the reader opened with **English and Dutch both on by default**, printing
the answer under every sentence, in numbered cards. The interface argued against the method it had just
taught. That was the design problem; the styling was downstream of it.

**The reader** (`ReadingDetail.tsx`, `components/reading/`) is now the grammar screens' surface — one dark
card, a chrome bar at the top, a sticky control bar at the bottom — carrying a page of prose:

- **Continuous text, no rows.** No numbers, no cards, no per-sentence borders. Measure capped at 640px,
  line-height 2.1 so furigana has room.
- **The book face.** A new `.jp-serif` utility (`--font-jp-serif`) sets passages in mincho, which is what
  Japanese books actually use — the rest of the UI stays gothic. Deliberately a *system* stack (Hiragino
  Mincho ProN, Yu Mincho, then generic serif): a webfont CJK serif is several megabytes.
- **Meaning is a pull, not a push.** Three modes (`lib/readingPrefs.ts`, remembered between books):
  `hidden` (default — tap a line to open it, and the bar counts how many you needed), `dim` (on screen but
  quiet, brightening on the line you are on), `shown` (the old behaviour, for people studying rather than
  reading).
- **Tategaki.** A vertical toggle sets the passage top-to-bottom, right-to-left, at 34px (30px on a
  phone) — vertical columns spend the page's *width*, so the text can be set at something near a real
  book's size rather than borrowing the horizontal reader's. The `<ol>` is deliberately
  *not* a flex container: in `vertical-rl` a block's children already stack along the block axis, which
  runs right to left — the column order a real book has. Flex would run the passage downwards instead.
  Meanings move to one slab under the passage, since tategaki has nowhere to put them inline — and every
  line stays tappable there in all three modes, because the tap is the only way to fill that slab.
  The column box is capped well short of the viewport (46vh/520px, 34vh/320px on a phone): it is a fixed
  height, so anything taller hid the end of every column behind the sticky control bar, and the end of a
  column is the end of a sentence.
- **Read aloud** now plays the whole passage straight through, not only one sentence at a time.
- Reference material (about, vocabulary, grammar, other books at this level) moved out of the sidebar,
  where it competed with the text, into collapsibles after the book.

Everything the old reader did survives: position tracking with the 1.5s dwell, resume-where-you-stopped,
save, copy, restart, mark-as-read, the optional comprehension quiz, and the SRS re-entry on finishing.

**The library is shelves now.** Each Tadoku level is its own shelf: a labelled case with a heavier
bottom edge — the board — holding a row of covers that stand on it with a drop shadow, scrolling sideways
when the shelf holds more than fits. That is the honest cost of the metaphor (a grid shows everything at
once and a shelf does not), so each shelf says how many books it holds and how many of those are read.
The Tadoku chip row is gone with it: it filtered the exact axis the shelves already separate, so it was a
second control doing one job. The JLPT tabs still scope which books are on the shelves at all. `BookCover` is one shared component: painted art
where a book has it, and where it doesn't, the book's own Japanese title set in the book face on its level
tint — 4 of 32 books have art, and the emoji-in-a-box fallback was what made the shelf read as half
finished. Read books get a folded corner, in-progress books a bar across the cover, and the book you are
part-way through now sits above the shelf as a card with its own cover instead of a button label in the
banner.

**Two bugs worth naming.** The page is now a thin wrapper that reads the `:id` and renders a `<Reader>`
keyed on the book — React Router keeps the component mounted when only the param changes, so following
"More books at this level" carried the previous book's opened-lines count, quiz result and saved flag
across. (That one predates this rewrite; the counter just made it visible.) And the first pass used `text-slate-800 dark:text-slate-100` on the passage, which is
wrong on a card that is dark in *both* themes — in light mode the Japanese rendered dark-on-navy and was
effectively invisible. Fixed colours now, same as the grammar screens, and `BookCover` takes `onDark` for
the same reason. The control bar also went icon-only under `sm`, where labels wrapped it onto three rows
and it ate a quarter of a phone screen.

Validation: `tsc -b`, `eslint .`, `vite build`, `vitest` (293/293) all clean. Browser-verified on port 5199
in dark and light at 1280px and 375px: hidden/dimmed/shown, the opened-lines counter, tategaki column order
measured right-to-left (618 → 349px), prefs persisting across books, the shelf's read/reading/unread states
against real ids, and the control bar clearing the mobile tab bar. Shipped with a release-notes entry, so
the app tells people about it.

## What's new — announce once, keep the opportunity alive (2026-08-24, same day)

The first cut announced a release once and then treated it as spent. Three problems with that, all fixed
here:

**Closing is no longer the same as reading.** There are now two markers, not one. `release-announced`
records that the release has had its moment on screen, so it is never shown twice. `release-seen` records
that the learner actually engaged — opened the full panel, or followed the release's own call to action.
Escape and a backdrop click end the announcement without clearing the dot. People dismiss modals
reflexively, before reading; the cost of keeping a dot someone has already filed is one small dot, and the
cost of clearing it wrongly is losing the release for good. The asymmetry is the whole argument.

**Discovery moved to the door.** Each release names the `sections` it changed, and those nav items wear a
small dot until the learner opens them (`recordSectionVisit`, cleared by a deep link into the section too).
A badge on a door someone is already walking towards converts; a dialog asking them to context-switch at
app open does not. Both the sidebar and the mobile tab bar carry it, with `sr-only` text so it is not
colour alone.

**The announcement waits for a receptive moment.** It no longer fires on cold load, when the learner
arrived with an intention the announcement can only compete with. `markStudyMoment()` is called by the
three real end-of-session screens — `ReviewComplete`, `GrammarSessionSummary` and `ExamResults` — and the
surface then waits until the learner navigates away from the screen that reported it, so it never stacks
on a session summary that is itself worth reading. Session-scoped module state: "just finished studying"
is not worth persisting past the tab.

`visited` moved into a module store read through `useSyncExternalStore`, because it is written from a
route-change effect and that is the shape React actually wants for syncing an external system.

Validation: `tsc -b`, `eslint .`, `vite build`, `vitest` (293/293, 7 more in `releaseNotes.test.ts`) all
clean. Browser-verified end to end on port 5199: cold load shows no dialog but does show the Grammar badge
and the sidebar dot; visiting Grammar clears its badge and leaves the dot; finishing a practice run and
then navigating away raises the dialog; Escape closes it with the dot intact and it does not return on the
next navigation; opening the panel clears the dot. Zero console errors.

## What's new — release notes in the app (2026-08-24)

Learners had no way to know anything had changed. There is now a release-notes surface, and how loudly it
announces itself is tiered by how big the release is — a dialog on every patch trains people to close it
unread, which costs you the one time it mattered.

- **`patch`** — the sidebar entry's dot, and nothing else. Costs nothing to ignore.
- **`feature`** — `WhatsNewCard`, a dismissible card in the corner. Doesn't block the study the learner
  actually opened the app for.
- **`major`** — `WhatsNewDialog`, the one surface that interrupts, and it earns that by taking the learner
  straight to the thing that changed (`release.cta`).

**`WhatsNewNavItem`** is the permanent home, pinned above the account row rather than dropped into the
scrolling nav — with nine destinations above it a tenth falls below the fold on a laptop. The mobile top
bar carries its own entry, since the sidebar is desktop-only. Both lead to **`WhatsNewPanel`**: the full
history as a dialog rather than a route, so reading the changelog never costs you your place in a lesson.

**Content is hand-written per release** (`src/data/releases.ts`), not generated from commits — a learner
should read "practice climbs four tiers", not "Let the horizon have the width it was asking for". Five real
entries, EN + NL throughout, each change tagged New / Improved / Fixed. Only "New" carries colour, and it
borrows the identity indigo: the four learning-state colours stay locked to learning states.

**Who gets told what** (`src/lib/releaseNotes.ts`): the last-seen release id lives in the existing
namespaced storage. A learner with study history and no marker sees the newest release only — not the whole
back catalogue. A brand-new device is silently marked caught-up, because someone opening the app for the
first time has nothing to catch up on; `hasPriorActivity` is what separates the two, and it is frozen at
mount so finishing a first lesson can't pop a release note mid-session.

Designed first on a Claude Design canvas (three directions in situ, the panel, and a states sheet), which
is where the pinned-sidebar placement came from — the entry didn't survive being the tenth item in the nav.

Validation: `tsc -b`, `eslint .`, `vite build`, `vitest` (286/286, 16 new in `releaseNotes.test.ts`) all
clean. Browser-verified on port 5199 in dark and light at 1280×800 and 375×812: the major-release dialog on
load, "See all updates" into the panel with all five entries, dismissal clearing the dot, the sidebar dot
returning with "2 unread updates" for an older marker, the feature card in the corner (checked by
temporarily downgrading the tier), and the mobile header entry opening the panel. The splash sits at
`z-100` above the dialog's `z-50`, so a cold load still opens on the splash and reveals the dialog after.

## Grammar lesson & practice — the taught layer (2026-08-24)

Implemented the `Grammar Lesson & Practice.dc.html` design import. Grammar used to be a reference card
plus a two-question multiple-choice quiz; it is now a lesson that takes the pattern apart and a practice
run that climbs a ladder from recognising it to producing it under exam pressure.

**Lesson** (`GrammarLessonIntro.tsx`, `components/grammar/lesson/`)
- Chrome bar with the learner's real position in the level, and a **Mastery** readout that is the point's
  own SRS interval (`getLearningProgress`) with the date the scheduler actually set beside it — "New /
  First time through" until the point has been practised once.
- **Step 1 — Read the sentence:** `SentenceAnatomy` breaks the headline sentence into tappable chunks,
  each explaining the job it does (EN + NL), with TTS on the whole line.
- **Step 2 — four angles**, as a tab strip that only shows tabs with real content: Examples (furigana +
  audio), **Try the pattern** (`ConjugationPlayground` — swap topic and predicate, toggle past/negative/
  casual, and watch the form change), Politeness (`RegisterLadder`, casual/polite/formal), and Don't
  confuse (`ContrastTable`, the lookalikes + the stacking mistake).
- Watch-out card, then one sticky primary action.

**Practice** (`GrammarPractice.tsx`, `components/grammar/practice/`)
- Four tiers — **Recognise → Produce → Real life → Exam sprint** — with a segmented progress bar grouped
  by tier, a live XP counter, a combo counter, and an unlock banner the first time each tier opens.
- Eight drill kinds: multiple choice, listening (TTS + 0.6× replay), typing, spot-the-mistake, build-the-
  sentence tiles, match pairs, roleplay (a two-turn conversation where a wrong reply is logged, explained,
  and rolled back on retry), and JLPT-format items on a 25-second clock that grades a timeout as a miss.
- A footer that always says what happened: correct/not-quite, the answer it wanted, and **why**, bilingual.
  Producing kinds (typing, build, roleplay) offer "Try again" with the hint revealed.

**Everything reported is measured, not estimated** (`GrammarSessionSummary.tsx`). A baseline snapshot is
taken before the run; XP earned is the difference between two real `calculateXp` reads, mastery is shown
before → after, and the schedule line is read off the SRS card. The session now also **records a real quiz
result** (it never did before, so grammar answers earned no XP) and grades the SRS card from **first-try
accuracy** via `ratingForAccuracy` instead of the fixed `'good'` it always sent.

**Every point gets a real ladder** (`lib/grammarDrills.ts`). 〜です has the full hand-authored 18-drill
ladder from the design (`data/grammarLessons.ts`), including both roleplays and four JLPT items. Every
other point's ladder is **derived from its own authored content** — its quiz questions become the recognise
tier, its example sentences become typing and tile-ordering drills, and three or more examples also yield
a matching drill and two listening drills. Nothing is invented to fill a tier: the exam tier is only ever
hand-authored, and a tier that can't be built simply isn't shown. Current spread across the 42 points:
1 point at 18 drills, 12 at 10, 23 at 6, 4 at 5, 1 at 4. The 28 two-tier points are two-tier because they
carry only two example sentences — that is a content gap, not a code one.

`tilesFromSegments` chunks an example into orderable tiles from its furigana segments (kanji keeps its
okurigana, particles stand alone, loanwords stand alone, a one-character kana prefix keeps its kanji,
punctuation is a boundary), and returns null rather than forcing a bad split — so a sentence that doesn't
chunk into 3–7 tiles just doesn't get that drill. Also fixed the furigana grouping of 子供 in the 〜とき
example, which was segmented 子[こ]+供[ども].

**Notes.** Both cards dropped `overflow-hidden` — it was silently making each card its own scroll container
and stopping the sticky footers pinning; the image and header bar round their own corners instead. The
sticky bars sit at `bottom-20 md:bottom-4` so they clear the mobile tab bar (verified: bar bottom 732px,
nav top 746px at 375×812). All motion reuses the existing `prefers-reduced-motion`-gated utilities; no new
keyframes. `.jp-text` is applied only to strings that actually contain Japanese.

Validation: `tsc -b`, `eslint .`, `vite build`, `vitest` (270/270, 24 new in `grammarDrills.test.ts`) all
clean. Browser-verified on port 5199 at 1280×900 and 375×812, light and dark: the full 18-drill 〜です run
including a deliberate wrong answer, a mispaired match, a failed build with retry, a failed roleplay reply
with rollback, and a real 25-second exam timeout — plus a complete derived run on 〜ます/〜ません and the
derived build drill on 〜ましょう. The summary's +46 XP checks out exactly (13 first-try × 2 + 20 for the
point). Zero console errors beyond the headless AudioContext warning.

## Review session debrief — the end-of-session screen (2026-08-20)

Replaced the sober end of both SRS review sessions. It used to be a centred text block that restated the
one thing the learner already knew ("You studied 22 words this session") over four grade dots, then dead-
ended on a Back button — no bilingual pairing, no mascot, no reason to feel anything, and nowhere to go.

The new **`ReviewComplete`** (`src/components/review/ReviewComplete.tsx`) is shared by Vocabulary and
Kanji and answers what the session actually bought:

- **Hero** on the review's own `.review-card-surface` material: section mascot, bilingual title, an XP
  pill, a tiered EN/NL verdict line, and the signature **RingStat** showing session recall (share graded
  Good/Easy) — emerald with a bounded halo on a clean sweep of four or more cards.
- **Session trace:** one coloured mark per grade press, in the order pressed, wiping in left-to-right —
  the session replaying as an artifact. Shown from four cards up; below that the tally alone.
- **Stat row:** cards reviewed, time on cards, best run, met-for-the-first-time. All real.
- **"When these come back":** the standout. A horizon rail bucketing every graded card by the interval
  the scheduler *actually* assigned (Tomorrow / In 2–5 days / In 3 weeks / …), labelled from the real
  min–max days in each bucket, with the 21-day+ bucket in the mastered emerald.
- **"Worth another look":** the cards last graded Again or Hard, as chips linking to their detail pages —
  or a clean-sweep state. Plus **"Now mastered"** when cards crossed `MASTERED_INTERVAL_DAYS`.
- **One primary action:** "Another round · N words" when a queue can genuinely be rebuilt right now
  (`VocabReview` / `KanjiReview` own that check and remount the session via a round key), otherwise the
  exit link takes the single gradient button.

**Nothing is estimated.** `src/lib/reviewSummary.ts` captures a pre-session baseline (XP, which ids were
unseen, which were already mastered) and reads the horizon/mastery back out of the real SRS store
afterwards; XP earned is the difference between two real `calculateXp` reads, so it includes milestone
rungs. 9 new tests in `reviewSummary.test.ts` cover bucketing, re-grading the same card, mastery
attribution, XP, and the empty session.

Also fixed along the way: sessions now log every grade press and a best-run streak; time is stamped at
each grade rather than measured off the completion screen; all muted Dutch pairings moved from
`slate-400`/`slate-500` to the design system's real Muted Ink pair (the old pairing measured 2.6:1 light
and 3.4:1 dark — every text/background pair on the screen now clears 4.5:1); focus moves to the heading
when the grading controls unmount. Every `rc-*` animation lives inside the `prefers-reduced-motion:
no-preference` gate, so under `reduce` the classes are inert and the panels render at rest — verified by
enumerating the CSSOM.

Validation: `tsc -b`, `eslint .`, `vite build`, `vitest` (246/246) all clean. Browser-verified on
port 5199 in dark and light, at 1180px and 375px: a 24-card mixed session, a 16-card clean sweep (emerald
dial, "Nothing to redo", mastered chips), a first session with no prior schedule, and the browse-mode
"End of the deck" with a single graded card. Zero console errors beyond the headless AudioContext warning.

## N3 extension — batch 1: schema, 22-week path, first N3 content (2026-07-26)

Began extending the app from N5–N4 toward N3. Started with an inspection pass and an honest
**coverage audit** (`docs/coverage-audit.md`): confirmed there was **no existing N3 "bridge"** —
the type system was `'N5' | 'N4'` and zero N3 items existed. Also found two structural gaps the
brief needs: `KanjiCanvas` has **no authentic numbered stroke order** (it traces a system-font
glyph outline), and there is **no See→Trace→Copy→Recall** flow yet. Baseline content counts:
grammar 42 (30 N5 / 12 N4), kanji 30 (25/5), vocab 74 (64/10), readings 4 (2/2).

Shipped this batch:
- **Schema:** `JlptLevel` now `'N5' | 'N4' | 'N3'` (+ `JLPT_LEVELS`); widened the hardcoded
  `['N5','N4']` level tabs in LearningControls, Dashboard, GrammarList, ListeningHome. Redesigned
  the previously-unused `RoadmapWeek` type into a real curriculum + **MasteryGate** + `RoadmapUnit`
  model.
- **22-week learning path** (`src/data/roadmap.ts`): weeks 1–6 N5, 7–14 N4, 15–20 N3, 21–22
  consolidation/mocks. Core route 75–90 min/day, N3 stretch overlay +30–60 min. Weeks open on
  **mastery gates** (completion %, SRS retention, checkpoint accuracy — never elapsed time), with
  the 1/3/7/14/30 review cadence and mixed-review weeks (6/14/20/21/22). Content-ID arrays point
  at real items; "expansion pending" weeks carry finished objectives/gates but sparse ids on
  purpose (no placeholders).
- **Gate evaluator** (`src/lib/roadmapGate.ts`): pure `evaluateGate` / `isWeekUnlocked`.
- **First N3 content seed:** 11 vocab (`v-sekai`…`v-saikin`, verified against the Kaishi 1.5k
  deck; 経験 dropped as an existing N4 dup), 8 kanji (`k-sei-world`…`k-kei-relation`), 6 grammar
  points (`n3-*`: ようになる, ため(に), はず, おかげで/せいで, ば〜ほど, によると), and 1 graded
  reading (`r-ryuugaku`). All original content; deck used only for verification/mapping.
- **Tests:** `src/data/roadmap.test.ts` (13 new, 24 total) — 22 weeks, phase bands, budgets,
  review cadence, prerequisite ordering, **every roadmap content id resolves**, and gate
  unlock/pass behaviour.

The Kaishi deck was extracted to a reusable frequency-ordered JSON (1,500 unique words w/
sentences, furigana, audio filenames, pitch) in the session scratchpad — source for future vocab
batches. Validation: `tsc -b`, `eslint .`, `vite build`, `vitest` (24/24) all clean; N3 grammar
list + detail, N3 reading, and N3 kanji/level tabs verified in-browser (port 5199) with zero
console errors.

### Batch 2 — N4 grammar + N3 passive/causative (2026-07-26)

Filled the roadmap's placeholder grammar weeks with real content. Added **8 N4 grammar points**
(`n4-ageru-kureru`, `n4-morau`, `n4-potential`, `n4-volitional`, `n4-to-omou`, `n4-to-iu`,
`n4-teiru-state`, `n4-jita`) and **2 N3 points** (`n3-passive`, `n3-causative`), each with
structure, EN/NL meaning + explanation, two examples, a common-mistake note, and a 2-question
quiz. Grammar points are now **10 N5 / 12 N4 / 8 N3**. Wired them into roadmap weeks 10–13 (N4)
and 19 (N3), expanded the week-14 and week-20 mixed reviews, updated prerequisite chains, and
removed the "(planned)/expansion pending" wording from those weeks. `tsc`/`eslint`/`build`/
`vitest` (24/24) clean; the roadmap id-resolution test now covers all new ids. Verified in-browser:
N4 grammar list shows "12 of 12", N3 shows "8 of 8", and the new potential-form and causative
detail pages render with examples, TTS, and common-mistake cards — zero console errors.

### Batch 3 — vocab + kanji volume (2026-07-26)

Added **19 vocab** (7 N4: 場所/予定/用意/興味/用事/別/以上 · 12 N3: 情報/技術/変化/増える/減る/意見/
計画/確認/複雑/成功/失敗/努力) and **10 kanji** (7 N4: 場/用/意/変/化/計/味 · 3 N3: 予/定/情), each
with the full schema (kana, romaji, EN/NL, category, example sentence · on/kun readings, stroke
count, example words + sentence). 約束 and 機会 were skipped as existing N4 dups. Counts now —
vocab **64 N5 / 17 N4 / 23 N3** (104 total), kanji **25 N5 / 12 N4 / 11 N3** (48 total). Wired the
new items into vocab-thin roadmap weeks (9 N4; 15–18 N3). `tsc`/`eslint`/`build`/`vitest` (24/24)
clean; in-browser the N3 vocab tab shows all 23 words, kanji total reads 48, zero console errors.

### Batch 4 — graded readings (2026-07-26)

Added **2 original graded passages** that reinforce the new grammar: `r-birthday` (N4 —
giving/receiving, quoting, potential) and `r-kanji-study` (N3 — causative, passive, ば〜ほど,
おかげで, によると). Each has furigana + romaji + EN/NL, vocab/grammar highlight links to real ids,
and 3 comprehension questions. Readings now **2 N5 / 3 N4 / 2 N3** (7 total). Wired into roadmap
week 14 (N4 mixed review), week 18 (+`readingCompletion` gate) and week 20 (N3 mixed review).
`tsc`/`eslint`/`build`/`vitest` (24/24) clean; both passages, their furigana, linked-grammar panel
and comprehension-question wiring verified in-browser, zero console errors.

### Batch 5 — stroke order + See→Trace→Copy→Recall writing practice (2026-07-26)

Closed the writing-practice structural gap. New `src/data/strokeOrder.ts` holds **numbered
stroke-order data** on a normalized 0–100 grid with **authentic order and direction** (shapes
simplified to straight segments; documented as such) for a verified starter set of 9 basic N5
kanji (人大小山木日月火生). New `StrokeOrderDiagram` (SVG, numbered strokes + replay animation) and
`WritingPractice` (4-stage See → Trace → Copy → Recall stepper) replace the single free-draw
canvas in `KanjiDetail`. `KanjiCanvas` was extended (transparent overlay, optional font guide,
hideable controls, external reset, CSS-scale-correct pointer mapping) and reused. Kanji **without**
stroke data fall back to the accurate font-outline guide + an honest "not available yet" note, so
stroke order is never guessed. New `strokeOrder.test.ts` cross-checks every covered character's
stroke count against its `KanjiEntry.strokeCount` (this caught a wrong assumption — 聞 vs 文 — during
the build). Tests 27/27, `tsc`/`eslint`/`build` clean; See/Trace/Copy/Recall stages, the numbered
diagram, live tracing, and the fallback path all verified in-browser with zero console errors.

### Batch 6 — Learning Path page (2026-07-26)

Surfaced the 22-week roadmap in the app (it was data-only). New route `/path` + nav entry
("Learning Path", new `PathNavIcon`) and page `src/pages/path/LearningPath.tsx`: the two routes
(core 75–90 / N3 stretch +30–60), phase-banded week cards (N5/N4/N3/consolidation) with bilingual
theme, live per-skill progress chips (Grammar/Kanji/Vocab/Reading x/y from real progress + SRS),
mastery status icons (mastered/current/upcoming via `evaluateGate`), and expandable detail
(objectives, mastery-gate summary, checkpoint, review cadence). Framed as a **guide**, not a hard
wall — the app doesn't lock content, and checkpoint quizzes aren't wired yet, so "readiness" uses
the measurable content criteria and the checkpoint shows as a note. Phase palette uses only the
app's own hues (emerald/brand/amber/slate — the impeccable hook's violet AI-tell was removed).
`tsc`/`eslint`/`build`/`vitest` (27/27) clean; page, nav highlight, week expand/collapse and
progress chips verified in-browser, zero console errors.

### Batch 7 — stroke animation, N5 copy, checkpoint quizzes → gates (2026-07-26)

Three follow-ups from the user:
- **Stroke-order animation:** `StrokeOrderDiagram` now draws each stroke *along its path* in writing
  order (animated `stroke-dashoffset`, paths remount per run so they draw forward, never erase). The
  "See" stage auto-plays once; "Animate stroke order" replays. Verified in-browser: mid-draw a single
  stroke is partially drawn while later strokes wait.
- **N5 explicit in the path copy:** the Learning Path header/route cards now say the route *starts
  from N5 basics (weeks 1–6)*, completes N4 (7–14), then the N3 stretch (15–20). (N5 was always there
  as weeks 1–6; only the wording undersold it.)
- **Weekly checkpoints wired to the mastery gates:** new `weeklyCheckpoints: Record<number,number>`
  on `ProgressState` + `recordCheckpointResult`; `src/lib/checkpoint.ts` assembles each week's
  checkpoint from its grammar points' existing quizzes; `WeeklyCheckpoint` component (inline MC quiz,
  records best accuracy). `LearningPath` now feeds real scores into `evaluateGate`, so "mastered"
  reflects the **full** gate (content + checkpoint); vocab-only weeks with no questions fall back to
  content criteria. Verified in-browser: took week-1 checkpoint 4/4 → `weeklyCheckpoints {1:1}`
  persisted, surfaced as "Best: 100%" + "Retake checkpoint". New `checkpoint.test.ts` proves a passing
  checkpoint flips the gate. Tests 31/31, `tsc`/`eslint`/`build` clean, no console errors.

### Batch 8 — more N3 vocab & kanji volume (2026-07-26)

+14 N3 vocab (意味, 感じる, 求める, 過ぎる, 比べる, 進む, 絶対, 受ける, 起こる, 伝える, 結果, 原因, 状況,
能力) and +8 N3 kanji (感進受果原因能性), verified against the Kaishi deck / Jisho, deduped, original
example sentences (several reuse earlier N3 words like 努力/説明/必要 for reinforcement). Totals now:
grammar 10 N5 / 12 N4 / 8 N3 · vocab 64 / 17 / **37** · kanji 25 / 12 / **19** · reading 2 / 3 / 2.
`tsc`/`eslint`/`build`/`vitest` (31/31) clean; new kanji detail + N3 vocab tab verified in-browser,
no console errors.

### Batch 9 — Speaking page with a voice AI companion (2026-07-26)

New **Speaking** page (`/speaking` + nav, `SpeakingNavIcon`): a real spoken Japanese conversation
with "Koto", an AI fox companion — **no multiple choice**.
- **Voice in:** `src/lib/speech.ts` wraps the browser Web Speech API (`useSpeechRecognition`,
  `ja-JP`); Chrome/Edge only, so it feature-detects and falls back to a typed input on other browsers.
- **AI backend:** `server/index.ts` gained `/api/chat/status` + `/api/chat`, which call the Anthropic
  Messages API via `fetch` (no new dependency) with a Japanese-tutor system prompt. The key
  (`ANTHROPIC_API_KEY`, optional `ANTHROPIC_MODEL`, default `claude-haiku-4-5-20251001`) stays
  server-side — the browser only talks to our own endpoint. Replies are structured JSON
  (`ja/kana/romaji/en/feedback`) so the UI can show readings + translation + a gentle correction.
- **Voice out:** companion replies auto-play through the existing `useTtsPlayer` (browser/Google TTS);
  per-message replay button; Kana/Romaji/English toggles; topic-starter chips; Restart.
- **Graceful degradation:** with no key the page still shows Koto's greeting and a clear "add
  `ANTHROPIC_API_KEY`" card; input disabled. `src/lib/aiCompanion.ts` is the typed client.

Verified in-browser (Vite-only preview → not-configured path): page renders, greeting + mascot,
toggles reveal kana/romaji, mic button present, zero console errors. Server verified by running it:
`/api/chat/status`→`{available:false}`, `/api/chat`→`not_configured` (503), startup log reports state.
`tsc`/`eslint`/`build`/`vitest` (31/31) clean. **Not testable here:** the live AI reply + real mic
capture need the user's `ANTHROPIC_API_KEY` and a browser with mic permission — honest coverage gap.

### Batch 10 — Speaking scenarios + JARVIS-style avatar + rebrand to "Kai" (2026-07-26)

Follow-ups on the Speaking page from user feedback:
- **Real-life scenario picker** — new `src/data/scenarios.ts` (dependency-free so the server can import
  it too) with 9 role-plays: free chat, restaurant, train ticket, shopping, café, class, directions,
  hotel, clinic. Each supplies Kai's in-role opening line (shown instantly, no API call) and a
  `systemAddon`. The Speaking page opens on a scenario grid; picking one starts the conversation in
  role. `server/index.ts` `/api/chat` now takes a `scenarioId`, looks the role prompt up **server-side
  by id** (so the client can't inject system text), and appends it to the base prompt.
- **JARVIS-style avatar** — new `AiCore` component (glowing concentric rings + rotating HUD arcs +
  pulsing core, CSS-animated, `prefers-reduced-motion` respected, `active` state while
  thinking/speaking/listening). Replaced the fox `Mascot` in the chat; the companion is rebranded from
  the fox "Koto" to **"Kai"**, a sleek AI assistant (greeting + system persona updated).
- **"Turn it on"** — added an empty `ANTHROPIC_API_KEY=` line to the user's gitignored `.env` (value
  left blank — a key is a credential the user must paste themselves) and kept the clear in-app "Turn on
  Kai" card.

Verified in-browser: scenario grid + AiCore render, picking "restaurant" shows Kai's role opening and
the AiCore header with status, back button returns to the picker, no console errors. Server verified via
curl (status + scenario request both respond; scenarios module imports cleanly under tsx).
`tsc`/`eslint`/`build`/`vitest` (31/31) clean. Still not testable here: live AI reply + real mic (need
the user's key + mic permission).

### Batch 11 — free AI providers for Kai (2026-07-26)

User didn't want to pay for the companion, so the server is now **provider-agnostic**
(`server/index.ts`): `activeProvider()` auto-picks from env (Gemini key → Anthropic key → Ollama;
`AI_PROVIDER` forces one). Three backends, each returning the model's raw JSON text through the same
parse path:
- **Gemini** (`GEMINI_API_KEY`, default `gemini-2.0-flash`) — Google's **free tier, no credit card**;
  uses `responseMimeType: application/json` for clean structured replies.
- **Ollama** (`AI_PROVIDER=ollama`, `OLLAMA_MODEL=qwen2.5`, host `localhost:11434`) — **fully local,
  free, no key**; `format: 'json'`. `/api/chat/status` pings Ollama (1.2s timeout) so an un-running
  Ollama reports unavailable instead of hanging.
- **Anthropic** (paid) — kept as an option.

`/api/chat/status` now returns `{available, provider}`; the in-app "Turn on Kai" card and
`.env`/`.env.example` document the two free paths (values left blank — keys are the user's to paste).
Verified via curl: default → `{available:false, provider:null}`; forced Ollama with nothing running →
`available:false` + `request_failed` (graceful, no crash). Free-options card verified in-browser.
`tsc`/`eslint`/`build`/`vitest` (31/31) clean. Live reply still needs the user to set up one provider.

### Batch — N4 vocab & kanji volume (2026-07-30)

Quick low-effort content batch. +14 N4 vocab (音 力 特別 相談 連絡 案内 趣味 危険 残念 会話 質問 答え
夢 将来) and +6 N4 kanji (力 音 会 相 答 特) that reinforce them. Totals now: vocab 64/31/37,
kanji 25/18/19. Verified/deduped against the Kaishi deck; `tsc`/`eslint`/`build`/`vitest` clean; new
words + a kanji page verified in-browser.

### Batch — N3 vocab & kanji volume (2026-07-30)

Two more content batches. +14 N3 vocab (解決 満足 秘密 内容 判断 提案 参加 感謝 期待 意識 成長 活動
違う 足りる), then +8 N3 kanji (解 満 足 内 案 期 待 成) that reinforce them. Full schema on every
item (readings, stroke counts, two example words + a sentence each). Totals now: vocab 64/31/51 (146),
kanji 25/18/27 (70). Verified/deduped against the Kaishi deck; `tsc`/`eslint`/`build`/`vitest` (31)
clean; new N3 vocab + the new N3 kanji (e.g. 成 detail page) verified in-browser at :5199 — readings,
example words, furigana sentence and N3 badge all render, with the expected "stroke order not available
yet" font-outline fallback for the uncovered kanji.

### Batch — N4/N3 vocab, grammar installment, live-deploy + serverless AI (2026-07-30)

- **Vocab 524 → 1024** (N4 31 → 291, N3 51 → 291). `src/data/vocabularyExtraN4N3.ts` (gen_n4n3.py):
  facts from the **Core 2.3k** frequency deck; JLPT level **estimated by frequency band** (deck has no
  tags), labelled in the header. Same Tatoeba human-furigana + reading-match gate as the N5 import.
- **Grammar 30 → 42.** `src/data/grammarExtra.ts` (spread into `GRAMMAR_POINTS`): 12 conversation-first
  points — 8 N5 (ましょう, ませんか, が好き, てから, ています, ないでください, ほうがいい, より〜のほうが),
  4 N4 (ば, と, なら, てみる), full schema each. Hand-authored, original examples.
- **Deployed live** to Vercel (`https://test-ten-jade-63.vercel.app/`) by fast-forwarding `main`.
- **Serverless AI** (`api/chat.ts`, `api/chat/status.ts`, `api/_ai.ts`; `tsconfig.node` includes `api/`):
  the deployed site is static-only, so `/api/chat*` was 404 and Kai read "not configured" live. These
  Vercel functions port the fetch providers (Groq/Gemini/Anthropic) from `server/`. **Ollama, pykakasi
  furigana and edge-tts neural voice stay local-only** — live replies are ja+en(+feedback), browser TTS
  for audio. **Still needs the USER to set env vars in the Vercel dashboard:** `GROQ_API_KEY`
  (+ optional `AI_PROVIDER=groq`) for Kai, and `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (already in
  local `.env`) for login — the live bundle currently has no Supabase config baked in, so accounts are
  disabled. Claude cannot set secrets / access the Vercel dashboard.

### Fix — serverless functions crashed on the live deploy (2026-07-30)

The just-shipped Vercel functions were returning **`FUNCTION_INVOCATION_FAILED`** on the live site for
*both* `/api/chat` and `/api/chat/status` (verified via curl against the production URL). Root cause: with
`"type": "module"` in `package.json`, the handlers imported their siblings with **explicit `.ts`
extensions** (`from './_ai.ts'`, `from '../src/data/scenarios.ts'`) — Vercel's Node runtime serves the
compiled `.js`, so `./_ai.ts` doesn't exist at runtime and the module fails to load *before* the handler
body runs (which is why even `status.ts`, that only reads env vars, crashed). Fixed by importing with
**`.js` extensions** (`./_ai.js`, `../src/data/scenarios.js`) — the canonical nodenext-ESM pattern:
TypeScript resolves `.js` → the `.ts` source (so `tsc -b` stays clean), and Vercel resolves it at runtime.
`scenarios.ts` is dependency-free, so the whole `api/` graph now resolves. `tsc`/`eslint`/`build`/`vitest`
(31) clean. The functions still report `available:false` until the user sets `GROQ_API_KEY` in Vercel — but
they no longer 500; status now returns a clean JSON `{available:false, provider:null}` instead of crashing.

### Batch — N5 vocab bulk import + speaking scenarios (2026-07-30)

Big content push toward "8–9/10 content, real conversation ability". Two verified batches:

- **Vocab 146 → 524** (N5 64 → 442). Bulk-imported **378 N5 words** into a new file
  `src/data/vocabularyExtra.ts` (spread into `VOCABULARY`). Sourcing decision (user-approved):
  word/reading/meaning are **facts from a public JLPT N5 word list** (NihongoShark cramming deck),
  example sentences from **Tatoeba (CC BY 2.0 FR)** with the community **furigana transcriptions**
  (so kana is human-verified, not guessed); romaji derived from those readings; pykakasi only for
  romanisation. Quality gate: kanji headwords must appear as a **bracketed transcription token whose
  reading matches the deck reading (rendaku-tolerant)** — this guarantees the furigana matches the
  word *and* kills homograph mismatches (e.g. 回 "times" never matches 回す "to turn"); kana words
  need a particle/punctuation boundary. Dutch sentence translations used where Tatoeba has one (28);
  word-meaning `nl` falls back to the English gloss (no offline NL dictionary). Tatoeba files live in
  the session scratchpad (`.../scratchpad/tatoeba`), generator = `gen_vocab2.py`. `tsc`/`eslint`/
  `build`/`vitest` (31) clean; verified in-browser — 524 count, 電車 renders furigana + EN + NL.
- **Speaking 9 → 20 role-play scenarios** (`src/data/scenarios.ts`): +making-a-friend, phone call,
  konbini, pharmacy, post office, izakaya, hobbies, part-time interview, host-family dinner, hair
  salon, neighbour small talk. Hand-authored natural openings (ja/kana/romaji/en) + in-character
  `systemAddon` for Kai; file stays dependency-free (server imports it). Verified in-browser.
- **Offline Phrasebook + say-it-first drill** (`src/data/phrases.ts`,
  `src/components/speaking/Phrasebook.tsx`, new "Phrases" tab in `SpeakingPage`): 54 hand-authored
  conversational set phrases (greetings, thanks/manners, aizuchi, asking & clarifying, shopping &
  eating, plans) with verified kana/romaji + EN/NL. Tap to hear & shadow via the existing
  `useTtsPlayer` (browser TTS — **works with no AI key**); "Say it first" hides the Japanese so you
  produce it from the meaning, then reveal. This is the offline production-practice path the user
  asked for (they chose to leave the live AI aside for now). Verified in-browser.

Local resource decks discovered on the user's Desktop (`~/Desktop/Japanese 🇯🇵/`): Core2.3k,
Kaishi 1.5k (+v2.3), JLPT Tango N5 (1000/MIA), NihongoShark N5, N5 Kanji Top 80, **Set Phrases 1**
(205 conversational phrases — good for a shadowing phrasebook), full **Genki I** textbook+workbook
PDFs (grammar source). All extract locally with `python3 + zstandard/sqlite3`. **Still to reach
8–9/10 across every chapter:** more N4/N3 vocab (this batch was N5-focused per user), a conversational
**phrasebook + offline speaking drills** (Set Phrases + shadowing that works without the AI provider),
**grammar 30 → ~150** (Genki-based, hand-authored), and **kanji stroke order at scale** (KanjiVG).

**Remaining (future batches):** **production deployment of the AI features** (Kai/Ollama, edge-tts,
pykakasi are local-only — won't run on Vercel; needs a cloud provider like Groq + hosted TTS wired via
env vars); extend authentic stroke order beyond the 9 starter kanji (rest use the font-outline
fallback; full coverage would come from a KanjiVG import — **needs the user's OK to download that
dataset**); keep growing N4/N3 vocab & kanji volume; purpose-authored listening/dictation banks; merge
the open PR into main; recreate the deleted Supabase project for account sync. JLPT level tags are
estimates, labelled as such.

### Batch — core N5 kanji volume (2026-08-02)

Rebalanced the thinnest skill. Kanji was **70 entries against ~1,024 vocab words**, and 20 of the
most essential **N5 kanji were missing entirely** even though hundreds of N5 vocab lean on them
(time/date, people, body, transport, basic verbs). Added them in a new `src/data/kanjiExtra.ts`
(`KANJI_EXTRA`, spread into `KANJI_LIST` alongside the renamed `KANJI_CORE`, same pattern as the
vocab-extra files): **時 間 分 前 後 半 気 天 車 電 男 女 子 国 語 名 手 目 口 立**. Each has authentic
on/kun readings, stroke count, two example words (kana + EN/NL), and a furigana-segmented example
sentence with romaji + EN/NL. No id or character collisions with the existing 70. Kanji total
**70 → 90** (N5 25 → 45). `tsc`/`eslint`/`build`/`vitest` (31) all clean; verified in-browser —
kanji list header reads **0 / 90**, the 時 detail page renders readings/example words/furigana
sentence, and (as expected) uncovered kanji still show the honest "numbered stroke order isn't
available yet" fallback — that gap is the blocked **KanjiVG** batch. Zero console errors.

### Batch — N4 daily-life kanji volume (2026-08-02)

Continued the kanji rebalance into **N4** (was 18, the smallest of the three level sets). Appended
20 daily-life essentials to `kanjiExtra.ts` — places & travel **教 室 駅 道 町 市 地 図 海 空**,
health & money **体 病 院 銀**, and core action verbs **行 来 帰 持 作 使** — each backing vocab
already in the app. Full schema per entry (readings, stroke count, two example words, furigana
example sentence). No id/character collisions. Kanji total **90 → 110** (N4 18 → 38; now N5 45 /
N4 38 / N3 27). `tsc`/`eslint`/`build`/`vitest` (31) clean; verified in-browser — list header reads
**0 / 110**, the 駅 detail page renders (14 strokes · N4, example words, furigana sentence), zero
console errors. Stroke-order fallback still applies (KanjiVG batch remains blocked on download OK).

### Batch — N3 intermediate kanji volume (2026-08-02)

Finished the kanji rebalance by growing **N3** (was 27, the thinnest). Appended 20 intermediate
core kanji to `kanjiExtra.ts`: thought/speech verbs **思 考 言 知 動 働 住**, abstractions **事 物
者 業 全 明**, and change verbs **説 増 減 起 過 始 終** — several directly back existing N3 vocab
(説明→説, 増える→増, 減る→減, 起こる→起, 過ぎる→過). Full schema per entry. No id/character
collisions. Kanji total **110 → 130**, now level-balanced **N5 45 / N4 38 / N3 47**. `tsc`/`eslint`/
`build`/`vitest` (31) clean; verified in-browser — list header **0 / 130**, the 説 detail page
renders (14 strokes · N3, 説明/小説 example words, furigana sentence), zero console errors.

Kanji this session: **70 → 130 (+60)** across three batches (core N5, daily-life N4, intermediate
N3). Authentic numbered stroke order still covers only the original 9 kanji — the rest use the
font-outline fallback until the **KanjiVG** import (still needs the user's OK to download).

### Batch — graded reading passages (2026-08-02)

Readings were the most underweight content type (7, vs ~1,024 vocab / 130 kanji / 126 grammar).
Added **4 original passages** (`src/data/readings.ts`) that reinforce this session's new kanji and
existing grammar, each with furigana + romaji + EN/NL per sentence, valid vocab/grammar highlight
links, and 3 comprehension questions:
- `r-my-town` (N5, easy) — town/places kanji 町駅銀行病院図書館学校電車; grammar ますでした. Links
  v-byouin/v-densha/v-toshokan/v-benri.
- `r-studying-japanese` (N4, medium) — 勉強/漢字/教室/質問/試験, potential form + と思う. Links
  v-benkyou/v-shitsumon/v-shiken · n4-potential/n4-to-omou.
- `r-healthy-life` (N3, medium) — 運動/体重/増える/減る/走る, 〜ようになる + 〜ば〜ほど. Links
  v-undou/v-fueru/v-heru/v-genki · n3-you-ni-naru/n3-ba-hodo.
- `r-part-time-job` (N3, hard) — 働く/仕事/店長/忙しい, 〜ために + passive (任される) + おかげで.
  Links v-shigoto/v-isha · n3-tame-ni/n3-passive/n3-okage-sei.

Readings **7 → 11** (N5 3 / N4 4 / N3 4). A node check confirmed every cited vocab/grammar
highlight id resolves (so the "Vocabulary in this passage" count stays honest). `tsc`/`eslint`/
`build`/`vitest` (31) clean; verified in-browser — Reading list shows all 11, the A Healthy Life
passage renders furigana, both grammar chips (〜ようになる · 〜ば〜ほど) and all 4 resolved vocab
highlights, zero console errors. Not yet wired into the roadmap weeks (available in the Reading
section) — an optional low-risk follow-up.

### Batch — wire new readings into the roadmap (2026-08-02)

Surfaced the 4 new passages in the 22-week Learning Path (they were only in the Reading section).
Additive `readingIds` edits in `src/data/roadmap.ts`, placed by pedagogical fit into weeks that
lacked a reading, plus the level's mixed-review week:
- `r-my-town` → week 4 (places/family vocab) + week 6 (N5 mixed review).
- `r-studying-japanese` → week 9 (N4 vocab deepening) + week 14 (N4 mixed review).
- `r-healthy-life` → week 18 (ば〜ほど — passage uses 〜ようになる + 〜ば〜ほど) + week 20 (N3 review).
- `r-part-time-job` → week 19 (passive — passage uses 任される + ため/おかげで) + week 20 (N3 review).

Gates deliberately left unchanged (no new `readingCompletion` requirement) so unlock difficulty is
untouched — the readings show as guide chips only. The roadmap test just asserts referenced reading
ids resolve, so it stays green. `tsc`/`eslint`/`build`/`vitest` (31) clean; verified in-browser —
expanding week 19 on `/path` now shows a **Reading 0/1** chip that wasn't there before, zero console
errors.

### Batch — authentic stroke order for all 130 kanji via KanjiVG (2026-08-02)

Closed the last kanji gap. Previously only 9 hand-authored kanji had numbered stroke order; the
other 121 fell back to a font-outline guide + "not available yet" note. With the user's explicit OK
to download, imported **KanjiVG** (per-kanji SVGs, one `<path>` per stroke in writing order on a
109×109 canvas) for **all 130** kanji in `KANJI_LIST`.

Pipeline (all local, python3, no runtime deps): downloaded the 130 SVGs by codepoint, parsed each
stroke's cubic-bezier `d`, sampled it into points, simplified (Douglas–Peucker ε≈0.8), rescaled
109→0–100, and emitted the app's existing `Stroke[]` polyline format. This **reuses the entire
render pipeline unchanged** — `StrokeOrderDiagram` (numbered + animated draw), `WritingPractice`
(See→Trace→Copy→Recall), `KanjiCanvas` overlay — no component edits. `src/data/strokeOrder.ts`
regenerated in full (9 hand entries → 130 authentic; ~34 KB). A validation pass confirmed **all 130
KanjiVG stroke counts match the declared `strokeCount`** (0 mismatches), so `strokeOrder.test.ts`
(which asserts exactly that + on-grid points) now green-covers every kanji.

**Licence:** KanjiVG is CC BY-SA 3.0. Added attribution in the file header + new
`docs/kanjivg-attribution.md`, and the derived stroke-data file is marked as inheriting CC BY-SA 3.0
(share-alike). No KanjiVG files are redistributed verbatim — only the transformed polylines.

`tsc`/`eslint`/`build`/`vitest` (31) clean; verified in-browser — 説 (previously uncovered) now
auto-plays its stroke order: the writing SVG (viewBox 0 0 100 100) renders exactly 14 stroke paths,
the "not available" note is gone, zero console errors. The font-outline fallback path stays in the
UI for any future kanji added without stroke data.

### Batch — status filter on the Kanji page (2026-08-05)

Kanji only had level tabs + search; the category dropdown Vocabulary shows is deliberately hidden there
because kanji carries no category data (a dropdown with nothing real behind it would be a dead control).
Added the filter that kanji *does* have real data for: **study status**.

- **`src/lib/kanjiFilter.ts`** — `KanjiStatus` (`all` / `new` / `learning` / `due` / `mastered`), each
  mapped to a genuine SRS state via `getLearningState`, plus `filterKanji()` as the single source of
  truth for "which kanji are showing".
- **`LearningControls`** gained an optional, deck-agnostic status dropdown (`status` /
  `onStatusChange` / `statusOptions`), so Vocabulary can adopt it later without a rewrite.
- **The card session honours the filter.** Filters (level + status, not the search query) persist to
  localStorage and `KanjiDetail` rebuilds the same deck, so narrowing to N4 and tapping a kanji pages
  through those 38 — not all 130. Rebuilt from storage rather than navigation state so a refresh or a
  shared link still lands on a sensible deck, and it falls back to the full list if the filters would
  exclude the kanji you opened. The deck is captured once per session so grading a card (which changes
  its status) can't reshuffle the deck mid-session.
- Added a real empty state ("No kanji match these filters") instead of a blank grid.

`tsc`/`eslint`/`build` clean; `vitest` 69/69. Verified: "Learning" narrows 130 → 1 and the session opens
"1 of 1"; N4 gives 38 cards and "1 of 38" and survives a reload; "Mastered" shows the empty state; mobile
has no overflow.

### Fix — the Kanji *detail* page now IS the carousel (2026-08-05)

The previous batch put the carousel behind a new `/kanji/review` route, reachable only from the
"Learn/Review" CTA. Tapping a kanji in the grid still opened the **old static `/kanji/:id` page** — so
from the user's point of view nothing had changed, which is exactly what they reported. Their original
ask said "the Kanji **detailled** page", and that page was the one left untouched.

Reworked so both entry points run the same session:
- **`KanjiSession`** (`src/components/kanji/review/KanjiSession.tsx`) holds the shared session — carousel,
  grading, rail, study panel — with a `mode`:
  - `review` (`/kanji/review`): finite SRS queue, answer hidden until revealed, graded to advance.
  - `browse` (`/kanji/:id`): the **whole 130-kanji deck opened at the character you tapped**, answer
    shown, with Previous/Next (plus ←/→ keys and swipe) so you page straight through instead of going
    back to the grid. Grading still works in place.
- `KanjiReview.tsx` and `KanjiDetail.tsx` are now thin wrappers; the old static detail layout is gone.

**Bug caught while building:** browse mode initially synced the URL to the current card, but the page is
keyed on `:id`, so every page-turn remounted the session mid-slide and reset its counts. Dropped the
sync — the route param seeds the starting kanji and the URL stays on the one you opened.

`tsc`/`eslint`/`build` clean; `vitest` 69/69. Verified from the grid: tapping 日 opens the card session
(1 of 130), Next → 月 (2 of 130), Previous → 日, the study panel opens inline with stroke-order SVG, and
`/kanji/review` still behaves as the hidden-answer SRS queue. No mobile overflow.

### Batch — Kanji review carousel + bigger mascots (2026-08-05)

Two asks: make Kanji work like the Vocabulary review (card carousel, no going back to the grid between
characters), and size the mascots up.

**Kanji review session** (new `/kanji/review`, `src/pages/kanji/KanjiReview.tsx`). Previously the Kanji
CTA opened `/kanji/:id` — one character per page, back to the grid, repeat. It now opens a session with
the same header, carousel, grading controls and session rail as Vocabulary.
- **`ReviewCarousel` generalised** into `src/components/review/` — generic over the reviewed item with
  `renderCard` / `renderGhost` render props. **Vocabulary was migrated onto it too**, so the filmstrip
  motion has one implementation rather than a copy per deck (the old
  `vocabulary/review/ReviewCarousel.tsx` is deleted). `ReviewHeader` gained `title` / `exitTo`.
- **`KanjiReviewCard`** — front is the character alone (recall meaning + reading, which is what the JLPT
  asks); reveal shows meaning, on/kun readings and one example word.
- **`KanjiStudyPanel`** — the "extra info underneath" the user suggested: example words, example
  sentence and the full See→Trace→Copy→Recall `WritingPractice`, in a disclosure below the card.
  **Collapsed by default and keyed per card**, because an always-open stroke canvas would push the
  grading buttons off screen and slow the session. This is what removes the old round trip.
- Grading writes through `reviewItem('kanji', …)` + `markKanjiLearned`, same as the detail page, so SRS
  scheduling is unchanged. `/kanji/:id` is kept for deep links; the new route is declared before it so
  "review" isn't parsed as an id.

**Mascots sized up** — `MASCOT_BANNER_SIZE` 92 → 128. Each 512x512 file centres artwork that is rarely
square, so a landscape pose only fills ~72% of the box and read as undersized on the page.

`tsc`/`eslint`/`build` clean; `vitest` 69/69. Verified in-browser: reveal shows meaning + both readings,
the study panel opens inline with stroke-order SVG rendering, grading advances the carousel (2/10, 9
remaining, Good count 1), **Vocabulary review still works unchanged** after the shared-carousel
refactor, and mobile has no overflow. (Pre-existing, untouched: `src/index.css` design-hook findings for
`9999px` pill radii and `rgba(0,0,0,0.35)` shadows — not part of this change; the dev-console 502s are
the local `/api/*` endpoints with no server running.)

### Batch — per-category mascots, normalised to one consistent size (2026-08-05)

The user supplied 9 mascot illustrations in an untracked `Mascottes/` folder and asked to link each to
its category at a consistent size.

**The sizing problem wasn't CSS — it was the source files.** They arrived at 7 different aspect ratios
(473x381 landscape through 1024x1536 portrait) with wildly different transparent padding: `reading.png`
was 77% empty space vs `Grammar.png` at 48%. Rendered in one fixed box they'd have appeared at visibly
different scales. So each was **cropped to its alpha bounding box, scaled to fit, and centred on a
shared 512x512 transparent canvas** (`public/assets/mascots/`), which also cut the two 2.3 MB files to
~110 KB. A single fixed CSS box now renders every mascot identically.

- **`src/lib/mascots.ts`** — one registry mapping category → file (`MASCOTS`, `MascotName`) plus
  `MASCOT_BANNER_SIZE` (92), so filenames live in exactly one place.
- **`ModuleStatsHero`** — replaced the per-page `mascotSrc`/`mascotWidth`/`mascotHeight` props (which
  had drifted to 84x100 / 84x75 / 84x84) with a single `mascot` key; size is now fixed by the component
  and can't diverge. All images use `object-contain` so nothing distorts.
- **Wired:** grammar / vocabulary / kanji / reading / listening banners (previously grammar+listening
  both showed the greeting pose and kanji+reading both showed the map pose — now each is its own),
  Dashboard hero bubble, the dashboard journey strip (→ learning-path), plus new mascots on the
  **Learning Path**, **Mock Exam** and **Speaking** page headers.
- **Speaking judgement call:** the page header now uses the Speaking mascot for category identity, but
  `AiCore` is deliberately kept as Kai's avatar *inside* the live conversation — Kai is an AI assistant,
  not the bird. Easy to revert if the user prefers AiCore in the header.
- Removed the now-orphaned `ListeningMascotImage.tsx` and the unused `mascot-reading-map.png` /
  `mascot-vocabulary.png`. `mascot-greeting.png` (LevelUpDialog), `mascot-level-card.png` (sidebar) and
  `mascotte-grammar.png` (the Grammar continue-card scene) are still referenced and untouched.

`tsc`/`eslint`/`build` clean; `vitest` 69/69. Verified in-browser: every mascot loads (200/304), all
render at exactly 92x92, and each page shows its own correct artwork. (The `/api/*` 502s in the dev
console are the local AI/TTS endpoints with no server running — pre-existing, unrelated.)

### Fix — cross-device progress sync lost/mismatched data (2026-08-05)

User report: "when I log in to my account the saved data does not appear the same when I'm also logged
in desktop or iPad." Diagnosed three compounding bugs in `src/lib/progressSync.ts`, all data-losing:

1. **The cloud copy was never pulled on a restored session.** `syncProgressAfterSignIn` was only called
   from `LoginForm` / `RegisterForm` / `AuthCallback` — i.e. only when someone actively submitted the
   login form. Reopening an already-signed-in device (Supabase persists the session) skipped the pull
   entirely, so it showed stale `localStorage` progress *and* `useProgressSync` then pushed that stale
   copy over the newer cloud data. This is the main cause of the two devices disagreeing.
2. **Sync was last-write-wins.** Even when it did run, it called `replaceProgress(remote)`, discarding
   whatever this device had done.
3. **A failed read looked identical to "no data".** `fetchRemoteProgress` returned `null` both when the
   row was missing and on any error, and the caller responded by seeding the cloud from local — so one
   transient network/RLS failure could overwrite a good cloud copy.

Fixes:
- **New `src/lib/progressMerge.ts`** — `mergeProgress(a, b)` keeps the best of both. Learning progress
  is monotonic, so it unions completed grammar/kanji/reading ids and quiz history (by id), takes the
  most-recently-reviewed SRS card per key, max per-day minutes, best checkpoint accuracy, best mock
  score (with `passed` tied to that score), longest streak + most recent current streak, the higher
  JLPT level, and merges the same day's plan. Deliberately **commutative and idempotent** — both
  devices run it and push the result, so anything accumulating (e.g. summing minutes) would inflate
  forever; hence max, not sum.
- **`progressSync.ts` rewritten**: `useProgressSync` now pulls+merges on *every* signed-in mount
  (including restored sessions), **blocks pushes until that merge completes** so a stale device can't
  clobber the cloud, and re-merges on tab focus (throttled 30s) so a device left open picks up the
  other's work. `fetchRemoteProgress` now distinguishes `found` / `missing` / `error`, and an error
  aborts without writing.
- **Account isolation** (a risk the merge introduced): a new `progress-owner` localStorage key records
  which account the local copy belongs to. Guest → sign-in still merges (guest progress migrates, as
  designed), same account across devices merges, but a *different* account replaces instead — and
  starts clean if that account has no cloud row — so one user's progress can't bleed into another's on
  a shared device.

Tests **54 → 69**: new `progressMerge.test.ts` (10 — union/commutative/idempotent/no-minute-inflation/
SRS recency/quiz dedup/best scores/streak/level/session) and `progressSync.test.ts` (5, against a
mocked Supabase client — merge-not-replace, no-write-on-error, seed-when-missing, and the two
account-isolation cases). `tsc`/`eslint`/`build` clean; app verified loading with zero console errors
and guest mode unaffected.

**Coverage gap, stated honestly:** the true end-to-end flow (real account, real Supabase, two physical
devices) is not testable from here — it needs the user's credentials. The logic is covered by the
tests above; the user should confirm on their own desktop + iPad.

### Batch — banner simplified (info overload) + Reading overflow fix (2026-08-04)

User feedback: the unified banner "feels like some info overload with reviewed, done etc", and it
shouldn't be a heavy identical block on every page. It was carrying ~17 competing elements: ring +
headline + denominator + label + mascot + **3 chips each with an icon circle, a value, a label AND a
helper line**.

Distilled it to **one primary number + at most two quiet facts**:
- `ModuleStatsHero` rewritten: headline is now the clear focal point (text-4xl); `stats: StatChip[]`
  → `facts?: HeroFact[]` (value + short label only — no icon circles, no helper copy). `facts` is
  optional, so a page with nothing else worth saying shows none.
- Helper copy ("Ready to start", "Keep your streak", "Solid knowledge") deleted as filler.
- Per page: **Grammar 3 → 0** (its N5/N4/N3 chips duplicated the level tabs directly below —
  redundancy, not information), Vocabulary/Kanji 3 → 2 (Due + Mastered; "New" is implied by
  learned/total), Reading 3 → 2 (Books + Level), Listening 3 → 1 (Accuracy, and none until a session
  exists). A non-zero "Due" renders amber — the one actionable signal.
- Deleted the now-orphaned `LearningStatItem`.

**Bug found while verifying** (a real one, worth recording): `/reading` scrolled the whole page
sideways at ~1120px — content clipped, mascot and the third golden rule cut off. Root cause was the
app shell, not the banner: `Layout.tsx`'s content wrapper is a flex item, so it defaulted to
`min-width: auto` and refused to shrink below its content, overflowing its column by 160px. Fixed
with `min-w-0` on that wrapper (the canonical flex fix); also added `min-w-0` to each golden-rule
grid item, whose `truncate` (white-space: nowrap) Japanese line inflated the column's min-content.
Verified all five pages plus `/dashboard` at 1120px and 375px: no overflow anywhere. (`/dashboard`
has a pre-existing 2px sub-pixel rounding overflow, unrelated and untouched.)

`tsc`/`eslint`/`build` clean; `vitest` 54/54; zero console errors.

### Batch — unified module banner + hierarchy across all 5 skill pages (2026-08-04)

User asked to make the top banner "exactly the same" on Reading / Listening / Kanji / Vocabulary /
Grammar, fill every page (no width-constrained/empty pages), and give them all the same hierarchy as
the Grammar/Vocab reference. The five pages had drifted apart: Vocab/Kanji used a shared night-sky
stats panel; Grammar used a plain title + progress bar (no icon); Reading used a bespoke sky-accent
hero with the title *inside* it; Listening used a CSS-starfield hero with no stats and was locked to
`max-w-4xl` (visibly narrow).

Unified them onto **two shared components** (`src/components/learning/`):
- **`ModuleHeader`** — skill badge (`CategoryIcon`) + title + subtitle + optional right slot (CTA or
  readout). Now the single header on all five pages.
- **`ModuleStatsHero`** — the one night-sky banner: violet progress ring + counted-up headline +
  mascot + three stat chips (`LearningStatItem`, extended with an optional `%` suffix). Generalises
  the old `LearningStatsPanel` so it's no longer coupled to the SRS `LearningStats` type.

Every banner shows **real** data (per the "real data, always" principle — nothing fabricated):
Vocab/Kanji keep their SRS learned/new/due/mastered; Reading = words read + books/shelves/level;
**Grammar** = points completed / 42 with real per-JLPT-level chips (N5/N4/N3); **Listening** = real
session results derived from `quizResults` (sessions completed, correct answers, items heard,
accuracy %). Listening's `max-w-4xl` cap was removed so it fills the content column like the others.

Deleted the five now-orphaned components (`LearningStatsPanel`, `VocabularyHeader`, `KanjiHeader`,
`ListeningHero`, `GrammarOverviewHeader`) — each was single-page. Grammar keeps its Continue card and
lesson list below the new banner. `tsc`/`eslint`/`build` clean; `vitest` 54/54. Verified in-browser:
all five pages open to the identical header + banner, Listening now full-width, no page overflow,
zero console errors (a lingering Vite HMR warning for the deleted `ListeningHero` was a stale
dev-client artifact — a fresh tab and the production build are both clean).

### Batch — premium Apple-Books-style Reading library UI (2026-08-04)

Elevated the Tadoku library to award-winning polish (`/impeccable`): shelves became horizontal
cover-card **rails** (scroll-snap + right-edge mask fade + desktop scroll arrows), each Tadoku level
with its own colour identity, book cards as real 3:4 covers (faux spine, emoji cover art, level
badge, read-check). Verified light/dark/mobile, no overflow, 54/54 tests. (Banner from this pass was
subsequently replaced by the shared `ModuleStatsHero` in the unification batch above.)

### Batch — Reading reshaped into a Tadoku extensive-reading library (2026-08-04)

Reworked Reading from *intensive* study (flat grid of 11 passages, each gated on a comprehension
quiz) into a **Tadoku-style graded-reader library** modelled on tadoku.org/japanese — read a lot of
easy material, no dictionary, no test, track **volume** (books & words read). Three user-approved
decisions: quiz becomes **optional**, author **~20 new books**, grade on Tadoku's own **Level 0–5**
scale (finer than JLPT at the beginner end).

- **Data model** (`src/types/index.ts`): `ReadingPassage` gained `tadokuLevel: TadokuLevel` (new
  `0..5` type + `TADOKU_LEVELS`), authored `wordCount`, `coverEmoji`, optional `genre`; `questions`
  now optional in the UI (L0–L1 ship `[]`). Re-leveled the existing 11 passages (N5-easy→L1,
  N4→L2, N3→L3) and word-counted them by a reproducible non-punctuation-segment metric.
- **+20 original graded readers** (`src/data/readingsExtra.ts`, `READINGS_EXTRA` spread into
  `READINGS` — same pattern as vocab/kanji extras): L0×6, L1×5, L2×6, L3×3. Full furigana/kana/
  romaji/EN/NL per sentence, emoji covers, verified word counts; L2+ carry a short optional quiz
  (4 options each), L0–L1 none. Every vocab/grammar highlight id verified to resolve (script check).
  Readings **11 → 31** (L0 6 / L1 8 / L2 10 / L3 7).
- **Library page** (`ReadingList.tsx`, rebuilt): volume hero (total **words read** + 千語 milestone
  bar + books-read), the **three golden rules** (辞書を引かない · わからない所は飛ばす · つまらな
  ければ別の本へ), Tadoku **Level 0–5 filter** + colour-accented **shelves** (books sorted easiest-
  first by word count), emoji-cover book cards with word count + JLPT pill + read ✓. New
  `readingStats()` / `TADOKU_LEVEL_INFO` in `readings.ts` derive volume from `completedReadingIds`
  (no `ProgressState` schema change; XP unchanged).
- **Reading experience** (`ReadingDetail.tsx`): primary **"Mark as read"** (→ `markReadingCompleted`,
  words counted into the total) with a "Read" confirmation; the quiz demoted to an **optional
  "Check your understanding"** disclosure rendered only when the book has questions; hero shows the
  book's Tadoku level + word count + library words-read; a dictionary-free reading nudge; "More
  books at Level N" lists same-shelf siblings.
- **Pre-existing bug found & fixed:** grammar `ba-conditional` q1 listed `行けば` **twice** (only 3
  unique options); the mock-exam builder pulls these through, so its "exactly 4 options" test was
  silently flaky (random `shuffle`). Replaced the duplicate with `行きば`.
- **Tests** (`src/data/readings.test.ts`, new): every book has a valid Tadoku level, positive word
  count, a cover, unique book/question ids, in-range `correctIndex`, and resolving vocab/grammar
  highlights. `tsc`/`eslint`/`build` clean; `vitest` **54/54** stable across 3 runs (was flaky).
  Verified in-browser at :5199 — library hero/rules/filter/shelves; a L0 book shows **no** quiz and
  "Mark as read" bumps the counter to "11 words · 1/31 books" (persists across navigation); a L2
  book shows the optional quiz + mark-as-read; Level-2 filter narrows to the "Building up" shelf;
  furigana/toggles/vocab links render; zero console errors.

---

**App renamed from "Kotoba Do" to "Kotobox"** (user's choice, from a shortlist of catchy original names
tying into the fox mascot — "kotoba" = word + fox). The kanji wordmark (言葉道) next to the name was also
removed from the sidebar/mobile header, now just the logo mark + "Kotobox". This was a display-name-only
change: the internal `localStorage` key prefix (`kotoba-do:...`) was deliberately left unchanged so no
existing user progress was reset — renaming that prefix would have invalidated everyone's saved data.

Last updated after **the auth-fetch diagnosis + Google sign-in + welcome email pass (2026-07-19)**:
the register page's "Failed to fetch" was traced to the Supabase project itself being gone
(`rrbebdowcgrlryraxkad.supabase.co` returns NXDOMAIN — deleted or expired; nothing wrong in code).
**Blocked on the user**: follow `docs/kotobox-auth-setup.md` to recreate the project, update `.env` +
Vercel env vars, re-run the `user_progress` SQL, enable the Google provider, and paste the email
template. Shipped this session: friendly network-error copy in `friendlyAuthError` (no more raw
"Failed to fetch"), "Continue with Google" on both auth forms (`GoogleSignInButton`, official G mark,
paper-hairline secondary styling so the ink primary keeps the lead), `/auth/callback` route
(`AuthCallback.tsx`: waits for the OAuth session, runs the same `syncProgressAfterSignIn` as the email
forms, 8s no-session fallback to `/login` — verified in-browser), and a Living Ink welcome/confirm
email template (`docs/email-templates/welcome-confirm-signup.html`, table layout, inlined styles,
Georgia/Helvetica as email-safe stand-ins for Newsreader/Hanken Grotesk, all typographic chars as HTML
entities after a mojibake fix). The welcome email deliberately contains the login email but **never
the password** — emailing credentials is a security anti-pattern and Supabase doesn't expose them.
`tsc`/`lint`/`build`/`test` (11/11) clean; register error path + both auth pages verified in-browser.

Previous update — **the public homepage teardown (2026-07-16)**: the entire landing page at `/`
(lantern-spotlight hero and all sections below) was deleted to make room for a complete redesign.
`/` now serves a minimal placeholder with login/register links. Full teardown record (what was
removed vs. preserved, architecture notes, risks): `docs/kotobox-homepage-state.md`. The approved
design direction will land in `docs/kotobox-homepage-brief.md` next session — do not build a new
homepage before that. Restore point: git tag `pre-homepage-redesign`. The two landing sections
below are kept as history but describe **deleted** code.

## [REMOVED] Landing hero v3 — lantern-spotlight reveal (user's "Lithos" template, adapted)

The user supplied a highly specific hero template written for a geology brand ("Lithos": rock-strata
images, orange CTA, "Start Digging"). Its **mechanic and layout** were ported exactly; its **content** was
not (their own standing rules — bird mascot identity, no random orange CTA, Japanese night atmosphere —
outrank template fidelity):
- **`SpotlightLayers`** (new): a lantern of light trails the cursor (lerp 0.1, per the template) and
  reveals a second scene through a soft radial mask with the template's exact falloff stops. Implemented
  as a CSS `mask-image` with custom properties written from a rAF loop — visually identical to the
  template's canvas-`toDataURL`-per-frame approach but GPU-composited, with zero React re-renders during
  pointer movement. Falls back to (and parks at, on touch devices) a center position below the headline;
  radius is `min(260px, 42vw)` so phones aren't flooded by a desktop-sized spotlight.
- **`LanternScene`** (new): what the light uncovers — the same `JapaneseScene` geometry (so base and
  reveal stay pixel-registered) washed warm, plus a constellation of real N5 words (水, 友達, 日本語,
  ありがとう…) glowing in the sky and the bird mascot waiting by the torii. Sweeping the light literally
  uncovers the words you'll learn — the template's gimmick, given a reason to exist.
- **Hero layout per template spec**: centered two-line headline — Playfair Display italic "Your path
  appears" over tight Inter "one word at a time" (exact sizes/tracking/letter-spacing/stagger delays),
  bottom-corner paragraphs, `100dvh`, z-layers 10/30/50, Ken Burns zoom on the base scene, blur-rise/
  fade-up load choreography (CSS classes scoped inside the `prefers-reduced-motion: no-preference` block
  so reduced-motion users can never be stranded on the `opacity: 0` start state). "Move the light." copy
  is hidden below `sm` — it makes no sense without a cursor.
- **Nav per template**: frosted center pill (real section anchors, no fake "active" state), Playfair
  wordmark, white Sign Up → `/register`. Deviation: mobile shows Log in + Sign Up directly instead of the
  template's hamburger — fewer moving parts, every control one tap deep.
- **Kept**: all 8 sections below the hero (their most recent standing structural decision), TiltCard
  previews, honest pricing, all CTA routing. **Removed**: the depth-pass hero's floating card cluster and
  hero GSAP timeline/parallax (parallax would have de-registered the duplicated base/reveal scenes);
  GSAP now only drives the below-hero scroll reveals. Inter + Playfair Display added to the font link
  (template-specified; NOT the template's global `* { Inter }` rule, which would have overwritten the
  app's own fonts).

**Verification:** `tsc`/`eslint`/`build`/`test` (11/11) all clean. In-browser: spotlight verified
following the cursor (screenshot before/after hover + `--spot-x/y` custom-property readout), initial
parked glow correct, mobile 375px clean (readable headline, smaller spotlight parked below it, no
horizontal overflow), zero console errors, all 8 sections laid out below (6.8k px document). Known
tooling quirk, documented so nobody chases it later: the Browser pane's screenshot capture returns blank
white frames at scrolled positions on this long page even though DOM geometry, computed styles,
element-from-point hit tests, and the a11y tree all confirm correct dark rendering — the same pane also
misrendered wide-viewport captures earlier; treat its scrolled screenshots as unreliable here.

## [REMOVED] Public landing page at `/` (+ depth upgrade pass)

**Route restructure:** `/` is now the public marketing page; the Dashboard moved to `/dashboard`. All other
routes unchanged (`/login`, `/register`, `/vocabulary`, `/kanji`, `/grammar`, `/reading`, `/listening`,
detail/review routes). Touched for the move: `App.tsx` (routes + lazy-loaded landing), `lib/nav.ts`
(Dashboard path), `Layout.tsx` (wide-layout check + sidebar anchor links now `/dashboard#...`),
`AuthShell.tsx` (post-login exit transition and "Continue without an account" → `/dashboard`). Dashboard's
own hash-scrolling was already path-agnostic, so anchors kept working.

**Files:** `src/pages/landing/LandingPage.tsx` (assembly + all GSAP orchestration in one gsap.context,
wrapped in gsap.matchMedia so prefers-reduced-motion gets a fully static page) plus
`src/components/landing/`: LandingNav, LandingHero, JapaneseScene, SakuraParticles, TiltCard, FeatureCard,
ProblemSection, SolutionSection, ProductPreview, JourneySection, MotivationSection, PricingSection,
FinalCTA, LandingFooter, landingCta.ts. **GSAP installed with user permission** (scroll reveals fire once
via ScrollTrigger, hero entrance timeline, parallax scrub, depth-multiplied floating); **Three.js
deliberately not used** (CSS/SVG layering gives the depth without ~150KB of WebGL). The landing page is
code-split via React.lazy, so GSAP and the whole page live in their own chunk (~55KB gz) and the app
bundle stayed flat (~235KB gz).

**Nine sections, all real-data honest:** cinematic hero; problem (3 glass cards); solution (6 benefit-led
cards — every claim is a shipped feature); product preview (4 hand-built SVG/CSS miniatures of real screens
— crisp at any DPI, can't 404); N5→N4 journey (numbered milestone path — a genuine sequence — with kana
waypoints, map-reading mascot, origami-crane accent); motivation (6 real mechanics: streak, reviews due,
XP/levels, achievements, weekly goal, today's plan); honest pricing (Free lists only shipped features
including live account sync; Plus/Pro clearly "Planned" with genuinely disabled "Coming later" buttons and
a no-payments-exist footnote — deliberately did NOT promise "current free features stay free forever",
that's the user's business call, not mine to write); final CTA; footer. CTAs: Start learning free →
`/register`, Log in → `/login`, View demo → smooth-scrolls to the preview section (no separate demo build
exists, so no fake one is claimed), "Open your dashboard"/"continue without an account" → `/dashboard` for
returning guest-mode learners. Zero dead buttons; the only disabled ones are the two labeled "Coming
later".

**Depth/3D upgrade pass** (user's follow-up: "do not make it a basic 2D illustration page"; their fuller
brief was never actually pasted — the message contained a literal unfilled `[PASTE THE FULL BRIEF...]`
placeholder twice, so its inline requirements were treated as the brief, per their confirmation flow):
- `TiltCard` (new): pointer-tracked 3D tilt via ref + rAF (no re-renders), mouse-only, skips
  prefers-reduced-motion; the four product-preview frames rest at alternating ±4° perspective poses and
  lean toward the cursor. Verified working in-browser (tracked to rotateX 2.45/rotateY 2.8 on synthetic
  pointer, reset to resting pose on leave — note React delegates onPointerLeave via `pointerout`).
- Hero rebuilt as a floating study-card cluster: kanji card (水), +20 XP chip, and the "Today's plan" glass
  card posed at different static 3D angles around the mascot, each with a `data-float` depth multiplier
  GSAP turns into different drift amplitudes/phases; ground glow seats the mascot in the scene.
- `JapaneseScene` deepened: aurora glows, moon halo, hazy far ridge (atmospheric perspective), horizon haze
  band, stronger torii backlight, cinematic vignette.
- Ghost 道 kanji plane behind the journey section; visible chochin lantern silhouettes now source the
  motivation section's warm glows; film-grain (`torii-grain`) over the whole page; Geist (user-approved
  earlier for the landing) carries landing body/UI text while headings stay Baloo 2.
- The user's separate single-screen video-hero direction (Foldcraft template + CloudFront video) was
  explicitly dropped by them in favor of this 9-section version; Geist is the surviving piece of it.

**Verification:** `npx tsc -b`, `npx eslint .`, `npm run build` all clean. Browser-checked at 1100/1280px
and 375px — no horizontal overflow at either, headline-first + early-CTA order on mobile, tilt interaction
verified with synthetic pointer events, every link audited (all route to real destinations), zero console
errors on a fresh load. Known cosmetic tool-quirk only: the preview screenshot tool misrenders very wide
custom viewports (~1280+); DOM measurements confirm the layout is correct there.

(The depth-pass hero described above was reviewed by the user and superseded by the lantern-spotlight
hero v3 — see the section at the top. The below-hero sections it describes are unchanged and still live.)

Deployment: this repo is pushed to GitHub (`YaschaT/test`) over SSH and connected to Vercel for
auto-deploy-on-push. **Auto-push after verification is now the standing default** — every verified change
gets committed and pushed without waiting to be asked, so the live Vercel URL stays current. Supabase
project is wired up (real URL + publishable key in `.env` and Vercel env vars); the `user_progress` table +
RLS policies still need to be created by the user via the SQL given earlier before sync is fully live.

## Login/Register redesign — torii-gate scene (`/impeccable` + `/frontend-design`)

Explicit ask: throw out the auth page's previous visual style entirely (it had matched the rest of the
app's navy/starfield identity) and design something bold, modern, and "artsy" for 2026, using the existing
fox mascot for the animation and making it visually clear that signing in leads into the Dashboard.

Shaped and confirmed with the user before building (per `/impeccable craft`'s gate): a deliberate one-page
departure from the app's usual identity, tied to real subject material — the Kotobox logo's own "道"
(path/way) meaning, made literal.

**Design system for this page only** (not applied elsewhere):
- **Color** — ink-black canvas (`#0a0a0f`), a torii-vermillion signature accent (`#e34a33` / glow
  `#ff8a5c`, real Shinto shrine-gate colors, not arbitrary), the app's existing indigo demoted to a small
  secondary touch (segmented-tab indicator only). Registered as intentional design-system additions via
  `/impeccable hooks ignore-value` rather than silently drifting from `DESIGN.md`.
- **Type** — introduced "Fraunces" (expressive high-contrast display serif) for the one big headline,
  paired against the app's existing Nunito for actual form labels/inputs — a serif+sans contrast pairing,
  deliberately not another rounded Baloo-2-style bubble font.
- **Shape** — sharper, more editorial corners on inputs/buttons (`rounded-md`) instead of the app's usual
  candy-rounded pills, via new page-scoped components (`AuthSubmitButton`, restyled `FormField`/
  `GoogleButton`) rather than touching the app-wide `PrimaryButton` used on every other screen.

**`TorriiGateScene`** (new, `src/components/auth/`) — the signature: an illustrated torii gate (SVG) with
a warm vermillion glow behind its opening and the existing fox `Mascot` standing at the threshold. Takes a
`phase` prop:
- `'greeting'` — the resting scene, shown on arrival and left in place as the permanent left-column
  illustration (not a temporary splash that disappears): gentle breathing glow, mascot greets once on mount.
- `'entering'` — the exit choreography: the mascot shrinks/fades into the gate opening while a full-viewport
  vermillion flood overlay grows to fill the screen, then `AuthShell` navigates to the Dashboard. This is
  the concrete answer to "make it clear we're heading into a dashboard" — a physical, connected transition
  rather than an abrupt cut or a literal (and generic-SaaS-feeling) dashboard-preview screenshot.

**`AuthShell`** (rewritten) — owns the whole view lifecycle as one small state machine: `'splash'` (the
once-per-browser-session full-screen entrance, gated by the same `sessionStorage` flag as before) →
`'split'` (the normal asymmetric two-column layout: gate scene + oversized Fraunces headline on one side,
the actual form on the other, stacking on mobile) → `'exiting'` (the full-screen gate-entering transition
on successful sign-in, held for 750ms before the real `navigate('/')` call). `LoginForm`/`RegisterForm` no
longer navigate themselves — they call an `onAuthenticated` callback so `AuthShell` can play the exit
transition first.

Added a large, near-invisible (3.5% opacity) ghost "道" character behind the gate scene, plus a subtle
SVG fractal-noise film-grain texture over the whole page (`.torii-grain` in `index.css`) — both static,
not motion-gated — for a bit of the "artsy, not flat" texture the brief asked for.

**Verification:** `npx tsc -b`, `npx eslint .`, `npm run build`, `npm test -- --run` (11/11) all pass clean,
no console errors. Browser-checked both pages at mobile (375px), a mid desktop width (1100px, where the
split layout and hairline divider render correctly — note: the screenshot tool itself visually crops very
wide custom viewports like 1440px even though the underlying DOM/CSS grid measures correctly at that width,
confirmed via `preview_inspect`; this looks like a tool-capture quirk, not a real layout bug), and the exact
Fraunces headline wrapping on both the Login and Register copy. The exit-transition view was confirmed by
directly dispatching the `AuthShell` component's internal view-state (via its React fiber) rather than a
full real sign-in, since completing real email confirmation for a test account isn't possible from this
environment — the state machine itself is simple (one `useState`, one `setTimeout`) and low-risk, but this
is a real gap in true end-to-end coverage worth knowing about.

## Optional accounts (`/impeccable craft` — sign up / log in)

Shaped and confirmed with the user first: accounts are **optional**, not a gate — guest/local mode keeps
working exactly as before; signing in is an added entry point, not a wall. Backed by Supabase (the user's
choice over Firebase/custom, after a hosting-approach question).

**New library layer:**
- `src/lib/supabase.ts` — creates the client only when `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are
  present (`isSupabaseConfigured`); everything downstream degrades honestly (a real "Accounts are almost
  ready" banner, disabled submit) rather than failing silently or faking success when they're not set yet.
- `src/lib/auth.ts` — `registerWithEmail`/`signInWithEmail`/`signOut`/`sendPasswordReset`, throwing a clear
  `AuthNotConfiguredError` if called before the keys exist.
- `src/lib/authStore.ts` — a module-level `useSyncExternalStore` store (same pattern as `progressStore.ts`)
  resolving the real Supabase session once at load, then staying live via `onAuthStateChange`.
- `src/lib/progressSync.ts` + two new `progressStore.ts` exports (`subscribeProgress`, `replaceProgress`) —
  real cross-device sync, not just a one-time import: `syncProgressAfterSignIn(userId)` pulls the account's
  cloud progress onto this device if it has any, or seeds the cloud from this device's current (guest)
  progress if not — which naturally covers both "returning login, get my data" and "fresh sign-up, migrate
  my guest progress in" with one function. `useProgressSync()` (mounted once in `App.tsx`) pushes local
  progress changes to the cloud, debounced 2s, for as long as the user stays signed in.

**New UI:**
- `AuthMascotSplash` — the requested "mascot wakes up and greets you" loading moment: the existing fox
  `Mascot` component crossfades from its `sleepy` to `happy` mood (two stacked layers, opacity-only
  crossfade — no path-morphing needed) with a small settle-bounce, over the same dark starfield atmosphere
  as `GrammarHero`/`ListeningHero`. This is a deliberate one-off exception to the product register's
  "no page-load choreography" default — reduced-motion users see the correct final frame instantly (base,
  non-animated CSS states live outside the `no-preference` media block) instead of a static pause, and the
  choreography only plays once per browser session (`sessionStorage` flag), not every time someone toggles
  between the Log in/Register tabs.
- `AuthShell` — shared full-page shell for `/login` and `/register`: same starfield backdrop, a
  `SegmentedTabs` toggle wired to real route navigation (not local tab state, so the URL/back button/direct
  `/register` links all work), and a "Continue without an account" link back to guest mode.
- `LoginForm`/`RegisterForm` — real validation on blur (not every keystroke), inline error messages wired
  via `aria-describedby`, a real loading spinner mid-submit, a real server-error banner mapped to
  plain-language copy (`authValidation.ts`'s `friendlyAuthError`), and a real "check your email" state for
  when Supabase's email-confirmation setting means sign-up doesn't grant an immediate session.
- `GoogleButton` — genuinely disabled with a "Soon" label, not a dead button pretending to work; enable
  once Google OAuth is configured on the Supabase project's Auth providers.
- `AccountNavItem` — sidebar entry: "Sign in" when signed out, or the real email + a working sign-out button
  when signed in. Mirrored as a compact icon in the mobile header.

**Deliberately not built:** a full bidirectional merge engine for simultaneous multi-device edits (the sync
here is last-login/last-change-wins, which is honest and sufficient for a single-user progress tracker —
building CRDT-style conflict resolution wasn't asked for and would be substantial unrequested scope).

**Verification:** `npx tsc -b`, `npx eslint .`, `npm run build`, `npm test -- --run` (11/11) all pass clean.
Browser-checked: the splash's crossfade (confirmed by stalling its dismiss timer and screenshotting the
settled "happy, paw raised" frame mid-animation), toggling Login⟷Register doesn't replay the splash, blur
validation shows real inline errors, the unconfigured-Supabase banner and disabled submit/Google button
render correctly, and the whole flow at 375px (mobile) and desktop widths with no overflow. The Supabase
project itself (table + RLS policies) is not yet created — that's the user's next step; the code degrades
honestly until then.

## VocabularyCard reference-match + Listening v2 (`/impeccable` + `/frontend-design`)

User supplied two reference screenshots and asked to match the Vocabulary card "exactly pixel per pixel,
mostly the card" (their own scoping — search bar/filters/stat row from that reference were correctly left
untouched), calling out specifically that "the current hiragana is too big." Then asked for a second
Listening redesign pass against a much more elaborate reference (human avatar voice card, waveform, big
circular play + skip buttons, 2x2 answer grid, XP/combo sidebar, weekly streak calendar).

**`VocabularyCard` rewrite** (`src/components/vocabulary/VocabularyCard.tsx`):
- Japanese word text dropped from `text-3xl sm:text-[2rem]` to `text-xl sm:text-2xl` — the direct fix for
  "hiragana too big."
- Top-right now shows a solid indigo **NEW** badge (only for `state === 'new'`) or the real JLPT level as a
  gray pill, plus a real working save/star toggle (`src/lib/savedWords.ts`, new — a plain localStorage
  id-list, same pattern as every other small preference this app persists). Removed the decorative
  `Sparkles` corner icon and the separate icon-only state badge; state-color meaning is still carried by the
  card's existing border/glow.
- Bottom row now has a real audio-play icon button (`speakJapaneseBrowser`) plus either a non-interactive
  "+Learn" label (new words) or a real percent + `LearningProgressBar` for in-progress words — using the
  actual computed `progress` value, not the reference's invented "X / 5 steps" (no fixed step ceiling exists
  in the real SRS model, so that number would have been fabricated). Both buttons stop propagation so they
  don't trigger the card's own expand/collapse.

**Listening v2** (`src/pages/listening/ListeningHome.tsx` and new components) — triaged the reference
into three buckets rather than copying it wholesale:
- **Adopted as-is, real data:** answer options moved from a stacked list to a `2x2` grid; the small pill
  play button replaced by a big circular `BigPlayButton` (new) with `SoundRipple` built in so every call
  site gets it for free; a new `ListeningSessionProgress` sidebar card (real position ring + real running
  correct-count, via the same `RingStat` used everywhere else); `SessionComplete` now shows a real XP
  breakdown (`+{XP_RULES.listeningSession} XP session`, `+{correct * XP_RULES.quizCorrectAnswer} XP correct
  answers` — `XP_RULES` exported from `xp.ts` for this). Page layout widened to a `lg:grid-cols-[2fr_1fr]`
  two-column layout (question column + sidebar) on desktop, stacking cleanly on mobile.
- **Adapted, kept honest:** an **auto-play toggle** (new `listeningPrefs.ts`, persisted) — genuinely useful
  and fully real, unlike most of the rest of the reference.
- **Declined outright** (would have required fabricating data): the human avatar photo, a waveform
  visualization, ±10s skip controls, per-item hint text, per-skill daily-minute goals, a weekly streak
  calendar, and a "combo bonus" XP multiplier. None of these have real underlying data in this app's model.
- Preserved one deliberate, existing UX decision the reference contradicts: the Japanese sentence and
  translation stay hidden until after answering, even though the reference shows them upfront — revealing
  them early would turn "Listen & Select" into a read-along instead of a genuine listening-comprehension
  check. Pixel-matching yielded to correctness here.

**Verification:** end-to-end played a full scripted Listening session in the browser (including a real
level-up), confirmed the XP math on `SessionComplete` exactly matched real answers, and checked both the
new VocabularyCard and the new Listening layout at 375px, ~880px, and 1440px widths — no overflow, 2x2 grid
correctly collapses to one column on mobile, sidebar correctly stacks below the question card on mobile and
sits beside it on desktop. `npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test -- --run` all pass
clean (11/11 tests).

## `/frontend-design` — Listening redesign + Grammar signature touch

Flagged and did not run a suspicious `$ uipro init --ai claude` line appended to this request — not a real
tool in this project, matching an injection pattern already flagged twice earlier in this session.

Looked at both pages fresh before touching anything. Grammar had just been extensively rebuilt (learning
hub, animations) and was already solid — no rebuild warranted, just one tasteful addition. Listening,
by contrast, had never gotten a real visual pass: a plain light header, no hero, no atmosphere, and zero
visual connection to its own subject (sound) despite already having real playback state to draw from — the
clear priority for this pass.

**Listening — new hero + a real signature element, not a generic waveform:**
- **`ListeningHero`** (new): the same dark starfield hero identity as Grammar/Vocabulary/Kanji, replacing
  the old plain `SectionHeader`. No fake progress ring — listening sessions aren't a persistent per-item
  deck the way vocab/kanji/grammar are, so there's no real bounded ratio to visualize; inventing one would
  have broken the "real data, always" rule.
- **`ListeningMascotImage`** (new): same fallback-chain pattern as `GrammarMascotImage` — tries
  `mascot-listening.png` first, falls back to the existing greeting pose, never a broken-image icon.
- **`SoundRipple`** (new, the signature): concentric rings pulse outward from the Play button while audio
  is genuinely playing — sound visualized as light rippling into the same night sky every other page
  already lives in, rather than a generic audio-app waveform bar-chart. Ties the page's real subject to the
  app's existing identity instead of importing an unrelated aesthetic.
- **Found and fixed a real, pre-existing gap while wiring this up**: `useTtsPlayer`'s browser-voice path
  (the default mode, used by anyone without Google Cloud TTS configured) never actually set `status:
  'playing'` — it fired `speechSynthesis.speak()` and returned immediately, so the "playing" state only
  ever worked for the Google Cloud path. Fixed by adding `onstart`/`onend`/`onerror` callbacks to
  `speakJapaneseBrowser()` (`browserTts.ts`) and wiring them into `useTtsPlayer` (`ttsService.ts`). Without
  this fix, the new ripple would have silently never appeared for most real users.
- Voice mode selector moved into a proper `Card` (was a bare unstyled `div` before).

**Grammar — one signature touch, not a rebuild:** a thin gradient thread now runs behind each cluster's
rows in `GrammarPathList`, aligned exactly through the number-badge centers (`left-8` = 32px, matching the
badge's real geometry) and visible only in the gaps between cards, since each card's opaque background
occludes it elsewhere. A quiet nod to the "path" the list is already named after — the one deliberate risk
in an otherwise already-solid, recently-verified page, per "spend your boldness in one place."

**Verification:** confirmed via direct polling that the ripple appears in sync with real
`speechSynthesis.speaking` state (starts ~160ms after click, matching real TTS engine start-up, sustained
throughout, gone the moment speech ends — not a fixed-duration fake). Confirmed the Grammar thread aligns
with the badge center to within 1px via computed geometry, not eyeballing. Checked dark mode, light mode,
and mobile (375px) on both pages — no overflow, mascot correctly hidden on narrow widths matching the
existing convention. `npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test` all pass clean.
## `/impeccable animate` — ring draw-in + count-up + entrance stagger

Explicit ask: animate the progress rings filling in on load ("so we see the progress"), plus an open
invitation to add other gamified motion. Scoped to a shared-component change (touches every "category"
page automatically) plus a couple of consistency completions on Grammar's brand-new components.

**Core ask — `RingStat` draw-in** (`src/components/dashboard/RingStat.tsx`): the ring now animates from
empty to its real value on mount instead of snapping straight to the final state. Implemented as a
`stroke-dashoffset` CSS transition (1s, ease-out) rather than animating `stroke-dasharray` directly —
`dasharray` stays fixed at the full circumference; only the offset (a single interpolatable number) moves,
which is the standard robust technique for an animated SVG progress ring. Automatically respects
`prefers-reduced-motion` via the app's existing global transition-duration override — no extra code needed.
Since this is the one shared component behind every progress ring in the app, this single change covers
Dashboard's 4 stat cards, Vocabulary/Kanji's `LearningStatsPanel` ring, and Grammar's `GrammarHero` ring, all
at once.

**Added — `useCountUp` hook** (`src/lib/useCountUp.ts`, new): the numeric companion to the ring — counts up
from 0 (or the previous value, on later updates) using `requestAnimationFrame` and an ease-out-cubic curve,
so the number and the ring land together. Wired into the values sitting directly beside each ring: the four
`LearningStatItem` numbers (New to Learn / Review Due / Mastered / Longest Streak, shared by Vocabulary and
Kanji), `LearningStatsPanel`'s main learned-count, and Grammar's hero/stats-grid counts. Deliberately **not**
wired into Dashboard's `StatCard` — those values are pre-formatted strings ("82 min", "1 day") assembled in
`Dashboard.tsx`, and forcing them through a numeric counter would have meant a riskier parsing/reformatting
change to already-solid code for a page the user didn't specifically call out; Dashboard's rings still
animate via the shared `RingStat` fix regardless.
- Found and fixed a real lint error while building this: the React Compiler's `set-state-in-effect` rule
  flagged the `prefers-reduced-motion` branch calling `setValue` synchronously in the effect body — fixed by
  wrapping it in a `requestAnimationFrame` callback (an async boundary), matching a purity-rule fix pattern
  from earlier in this project.

**Also added (extending the same ask into "make it feel gamified")**: brought Grammar's brand-new
`GrammarStatsGrid` and `GrammarPathList`/`GrammarPointCard` up to the same entrance-stagger treatment
already established for the Dashboard's stat row and the Vocabulary/Kanji card grids (reusing the existing
`entranceAnimation.ts` helper — no new animation vocabulary introduced). The path list replays its stagger
when the All/N5/N4 filter changes (`key={filter}` on `GrammarPathList`), matching the same replay-on-switch
convention already used elsewhere. Deliberately did **not** add anything beyond this — no confetti, no new
sound, no page-choreography — per the same "one well-orchestrated experience beats scattered animations"
principle applied throughout this session's other `/impeccable animate` and `quieter` passes.

**Verification:** confirmed via computed styles that a fresh `RingStat` mount starts at
`stroke-dashoffset === stroke-dasharray` (fully hidden) and settles to the mathematically correct offset for
the real progress ratio (tested with real, non-zero grammar/vocabulary progress, not just the zero-state).
Checked Dashboard, Vocabulary, Kanji, and Grammar — all four render correctly with no console errors after a
clean dev-server restart. Checked mobile (375px) — no layout regressions. `npx tsc -b`, `npx eslint .`,
`npm run build`, and `npm test` all pass clean.

## Grammar overview: full redesign (circles → learning hub)

The user was explicit that the previous pass (hero + circle path, still using `GrammarNode`/
`GrammarPathSection`/`GrammarPath`) was not acceptable as a final design, even after the density fix from
the prior turn — it still read as "random circles in empty space." This was a full rebuild of the
overview's main content area, not a polish pass, while keeping all existing data/routes/quiz/progress
logic untouched.

**What replaced the circle path:** a real two-column "learning hub" —
- **Left column — `GrammarPathList` + `GrammarPointCard`**: the ordered grammar points as actual list
  rows (number, pattern, meaning, level badge, state badge, chevron), grouped into real N5/N4 clusters.
  Clicking a card *selects* it (updates the right column) rather than navigating immediately — a
  deliberate master-detail interaction, not a regression; the card's own CTA in the preview still does
  the real navigation.
- **Right column — `GrammarLessonPreview`**: shows whichever point is selected — meaning, first example
  sentence, a mascot tip line, and a real "Start lesson" / "Review lesson" button that links to
  `/grammar/:id`. Sticky on desktop so it stays visible while scrolling the path list.
- **`GrammarStatsGrid` + `GrammarStatCard`** (new): four real metrics under the hero — Completed,
  Practice available (remaining count), Review due, Next up. "Review due" is honestly always `0` —
  Grammar has no SRS/interval system behind it (confirmed by re-checking `progressStore.ts`: only a flat
  `completedGrammarIds` boolean array, no `srsCards` for grammar) — this was a deliberate, disclosed
  choice rather than fabricating a fake due-count to match the brief's suggested stat literally.
- **`GrammarStateBadge`** (new): three real per-item states — Completed, Practice (the one point
  genuinely up next), Locked (not yet reached, but still fully clickable — Kotobox's standing "no
  artificial locking" rule carries over unchanged). No separate "Review Due" or "Mastered" state on
  individual cards, for the same real-data reason as above.
- **`GrammarHero`** (rebuilt, not replaced): title/subtitle now live inside the dark hero panel itself
  (matching the Dashboard's own hero shape) instead of a separate plain header row above it. Added a real
  secondary "Review grammar" action that smooth-scrolls to the path section (mirroring the existing
  "jump to section" pattern already used elsewhere), alongside the existing "Continue" CTA.
- **Deleted**: `GrammarNode.tsx`, `GrammarPathSection.tsx`, `GrammarPath.tsx` (confirmed unimported
  elsewhere before removal) — the circle/constellation system in its entirety.
- **Kept unchanged**: `GrammarMascotImage.tsx` (already correctly falls back from the not-yet-added
  `mascot-grammar.png` to the existing blue/purple bird `mascot-greeting.png`, never the orange fox — this
  was already fixed in an earlier pass and confirmed still correct here), and the whole lesson detail page
  (`GrammarLessonHero`, `GrammarFormulaCard`, `GrammarMistakeCard`, `GrammarQuizCard`,
  `GrammarNextStepCard`) — already visually consistent with the new overview (same starfield hero, same
  card language), so no changes were needed there.
- **Found and fixed one real bug while verifying on mobile**: the new `GrammarStatCard`'s label
  (`truncate`) clipped "Practice available" to "Practice ava…" on the 2-column mobile grid — the same
  truncation defect fixed on the Dashboard's `StatCard` earlier this session. Fixed the same way: removed
  `truncate` in favor of wrapping.

**Verification:** desktop (1440px) and mobile (375px), dark and light mode. Confirmed: clicking a path
card updates the preview (including for locked items); the All/N5/N4 filter correctly shows/hides
clusters while preview selection persists independently; "Start lesson" navigates to the real detail
page; the mini quiz on the detail page still renders and accepts answers; zero horizontal overflow on
mobile (`scrollWidth === innerWidth`); a full dev-server restart confirmed zero console errors (the
in-session HMR "failed to reload" messages during the delete were stale-history from the old files, not a
live defect). `npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test` all pass clean.

**Remaining polish items** (not addressed in this pass, none blocking): the "Unlocks after earlier
points" helper text under locked cards truncates on the narrowest mobile widths; no literal
constellation-style connector lines between path items (dropped in the prior "quieter" pass for the same
reason — fragile position-tracking math across breakpoints); the four stats-grid cards could eventually
gain their own individual entrance animation, matching the Dashboard's stat-row treatment, if desired.


## `/impeccable layout` — Kanji page

Measured before touching anything, per the command's own assessment checklist (spacing consistency, squint
test, density). Two things worth noting from that pass:

**Real, fixed defect:** Kanji's filter/search row has one fewer control than Vocabulary's (no category
dropdown, since Kanji has no category data to filter by — an intentional, pre-existing omission). The
search input's `flex-1` rule, written with Vocabulary's fuller row in mind, stretched to fill all the extra
space this left on Kanji — measured at **859px wide**, a genuinely disproportionate control next to a
32px-tall icon and a few words of placeholder text. Root cause lives in the shared
`LearningControls.tsx` (used by both Vocabulary and Kanji), so fixed it there: capped the search input at
`sm:max-w-md` (448px) and added `sm:ml-auto` to the grid/list toggle so it still anchors to the row's right
edge instead of being left stranded once the search field stopped stretching. Re-verified Vocabulary
afterward — same fix reads correctly there too (its search field was less extreme before, but equally
uncapped), no regression, `sm:` prefix keeps mobile's `w-full` behavior untouched.

**Considered and deliberately left alone:** Kanji's page-level sections (header/hero/controls/grid) use a
flat, uniform `space-y-5` with no variation, which a generic layout checklist would flag as "no rhythm."
Didn't touch this — that flat vertical rhythm is the same convention used consistently across every major
page in the app (Dashboard, Vocabulary, Grammar, Reading, Listening all use similarly uniform page-level
spacing). Introducing varied spacing on Kanji alone would have fixed a textbook checklist item while
creating a real, visible inconsistency against every other page — the wrong trade.

**Verified:** desktop (1440px) and mobile (375px) on both Kanji and Vocabulary, dark mode. Search input
confirmed at 448px (was 859px) via direct measurement, toggle confirmed flush with the row's right edge.
`npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test` all pass clean.

## Full Grammar redesign — `/grammar` overview + `/grammar/:id` lesson pages

A large, explicit brief asking for a professional full redesign of both Grammar pages, not a small patch —
first did a real review pass (PROJECT_STATUS.md, both pages, Dashboard/Vocabulary/Kanji styling, shared
components, mascot assets, the grammar data model, and the quiz/progress logic) before writing any code.

**A key data-reality deviation from the brief, stated up front rather than faked:** Grammar's progress
model is a flat `completedGrammarIds: string[]` — no SRS, no per-item interval, no "review due" concept the
way Vocabulary/Kanji have. The brief asked for 5 node states (Completed / Current-Practice / Review Due /
Locked / Mastered); only 3 are backed by real data (Locked, Current/up-next, Completed), so only those 3 are
implemented. Inventing "Review Due" or a separate "Mastered" tier would have meant fake progress, which the
brief's own rules explicitly forbid.

**Mascot correction:** an earlier pass had wrongly fallen back to the SVG fox mascot when
`mascot-grammar.png` was missing. Fixed everywhere in Grammar (path's current-node indicator, overview hero,
lesson hero) via a new shared `GrammarMascotImage.tsx` — tries `mascot-grammar.png` first, falls back to the
existing `mascot-greeting.png` (the real blue/purple bird) on error, never the fox. Drop the real file in at
that exact path whenever it's ready; no code change needed.

### Components added (new `src/components/grammar/` folder, matching the existing per-module convention)

- `GrammarMascotImage.tsx` — the shared mascot-with-fallback logic (used 3 places)
- `GrammarNode.tsx` / `GrammarPathSection.tsx` / `GrammarPath.tsx` — split out of the density-fixed
  constellation from two turns ago; same wrapping-grid layout math, seeded jitter, and bounded glow pulse,
  just properly componentized instead of one file
- `GrammarHero.tsx` — new overview hero: RingStat progress, real completed/total count, mascot, and a real
  "up next" recommendation (first incomplete point in level order) with a Continue CTA — same shape as
  Vocabulary/Kanji's `LearningStatsPanel`
- `GrammarLessonHero.tsx` — lesson page hero: back link, title, level, romaji, a short real summary
  (`meaning.en`), mascot, and a CTA that scrolls to the quiz section already on the page
- `GrammarFormulaCard.tsx` — a real chip-based "formula" view of the structure string, splitting on `" + "`
  — verified safe against all 14 real structure strings in `src/data/grammar.ts` (100% match the same
  shape), with a plain-text fallback for anything that doesn't split cleanly
- `GrammarMistakeCard.tsx` / `GrammarQuizCard.tsx` — extracted from the old inline JSX, same logic
- `GrammarNextStepCard.tsx` — a real "next grammar point" (computed from `GRAMMAR_POINTS` array order) plus
  a link back to the path; no fake "practice/review" action since there's no review queue to send anyone into

**Deviations from the brief's exact component list** (both intentional, both noted rather than silently
skipped): route files stay `GrammarList.tsx` / `GrammarDetail.tsx` (renaming route components risks the
router for no real gain); skipped a separate `GrammarExampleCard` since `ExampleSentenceCard.tsx` is shared
with Kanji's detail page — polished that shared component instead (larger Japanese text, a subtle
brand-tinted glow per DESIGN.md's elevation rule) rather than forking a duplicate, and re-verified Kanji's
detail page still renders correctly afterward.

### A real bug caught during verification, not before

The lesson hero's scroll-to-quiz CTA and the actual quiz-start button both initially said "Start quiz" —
identical labels for two different actions. Caught by scripted interaction testing (clicking "Start quiz"
selected the wrong one of two matching buttons), not by inspection. Fixed: hero button now reads "Jump to
quiz" / "Review the quiz"; the quiz card's own button is the only one that still says "Start quiz."

### Verified

- Both pages, desktop (1440px) and mobile (375px), light and dark mode, no console errors on any of them.
- Clicked through a full real interaction: opened `/grammar/desu`, jumped to the quiz via the hero CTA,
  answered both real questions, finished — confirmed `markGrammarCompleted` fired
  (`completedGrammarIds: ["desu"]` in localStorage), the hero flips to "Completed" / "Review the quiz", and
  the overview page's path correctly shows that star as done with the mascot moved to the new current star.
- Confirmed the N5/N4 filter still shows/hides clusters correctly, and Kanji's shared
  `ExampleSentenceCard` still renders correctly after the shared-component polish.
- `npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test` all pass clean.

### Remaining polish items (not blocking, noted honestly rather than silently ignored)

- `mascot-grammar.png` still doesn't exist — everything currently shows the `mascot-greeting.png` fallback;
  drop the real file in whenever it's ready.
- The zigzag connector lines described in earlier Grammar work were already simplified to a single dashed
  guide-line per cluster (noted two turns ago); this pass didn't revisit that.
- Per the brief's own instruction, stopping here — not continuing to any other page.

## Grammar lesson detail page redesign

Everything Grammar-related touched so far this session was the *overview* (the constellation map). The
actual lesson page you land on after tapping a star — structure/meaning/explanation/examples/common
mistake/quiz — had been untouched since the original Phase 3 build and was plain stacked white cards with
no mascot, no hero, no visual identity at all. Confirmed scope with the user before touching anything, since
"the actual grammar page" could have meant either.

**What changed in `GrammarDetail.tsx`:**
- Added a hero panel reusing the exact same starfield background (`.star-field`) and indigo gradient
  (`#6f8ffc → #3a54d6`) as the constellation overview, so opening a point feels like zooming into that same
  sky rather than landing on an unrelated page. Title, level badge, romaji, and the structure formula now
  live here — "at a glance" facts, not buried in a body card.
- **Mascot avatar**: references `/assets/dashboard/mascots/mascot-grammar.png` (the user's requested asset,
  following the existing `mascot-{skill}.png` convention) — that file doesn't exist yet, so the `<img>` has
  an `onError` handler that swaps in the existing SVG `Mascot` (fox) component instead. Verified live: with
  no file present, the fox renders cleanly with zero broken-image icon. Once the user drops in the real PNG,
  it'll be picked up automatically — no code change needed.
- Split the old single cramped card (Structure + Meaning + Explanation jammed together) into: structure
  moved to the hero, and Meaning/Explanation given real breathing room with a divider between them in their
  own card — was flow, not just decoration, that the user asked for.
- Examples, Common Mistake callout, and the Mini Quiz section are unchanged in content/logic — only their
  position in the new hierarchy shifted slightly to read as a real sequence (facts → why → practice → test)
  rather than a flat stack of same-weight cards.

**Verified:** dark mode, light mode (hero correctly stays dark, matching the same convention used
everywhere else), mobile at 375px (no clipping, mascot/title/badge all wrap cleanly), and the mini-quiz flow
still starts and renders questions correctly. `npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test`
all pass clean.

## Night Constellation: density fix

The user asked for a UX/UI debug pass on the constellation shipped last turn, rather than accepting it as
done. Measuring it properly (not just eyeballing) confirmed a real, significant defect: the single-column
scatter used only **25.8% of the panel's width** and rendered at **1736px tall** for just 14 grammar points
— nearly 2 full screens of scrolling for content that used to fit compactly. This would have gotten
considerably worse as the grammar set grows toward the 60-100+ points discussed when this layout was
shaped, directly undermining the "design for scale" requirement that was explicitly agreed on.

**Root cause:** stars were positioned one-per-row with only a small ±22%-of-width horizontal jitter around a
center line — visually closer to a wobbly single file than a scattered night sky, and it wasted almost all
of the panel's horizontal space while scaling entirely in height.

**Fix:** rewrote `GrammarConstellation.tsx`'s layout from absolute-positioned single-column rows to a
wrapping `flex flex-wrap` grid — stars now flow left-to-right and wrap into new rows using the panel's full
width, with the same deterministic seeded offset (now a small `translateY` wobble applied via `transform`,
so it never affects the wrapped grid's own flow) keeping the "scattered stars," not "rigid table," feel. No
other behavior changed: same clusters, same real level-based grouping, same done/current/locked star states,
same bounded (non-infinite) glow pulse, same starfield background, same navigation.

**Verified with real measurements, not just a visual glance:**
- Panel height: 1736px → 503px (71% reduction).
- Horizontal space used: 25.8% → 78.3%.
- All 14 points across both N5/N4 clusters now fit in a single 900px viewport with **zero scrolling**, in
  both dark and light mode.
- Re-checked mobile (375px): clean 3-column wrap, no clipping, long titles still wrap to 2 lines correctly.
- Re-confirmed the N5/N4 filter still shows/hides the correct cluster, and star clicks still navigate to the
  right grammar detail page.
- `npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test` all pass clean.

## `/impeccable craft` — Grammar page: Night Constellation

Ran the actual `shape` → `craft` flow rather than jumping straight to code, since "a different gamified
layout" is a genuine creative/directional decision, not a small tweak. Presented a design brief (feature
summary, visual direction, layout strategy, key states, interaction model) and got explicit confirmation
before writing anything, per the command's hard gate. No native image-generation tool is available in this
harness, so the mock-generation step was explicitly skipped and the written brief served as the contract
instead.

**Confirmed direction (user picked from 4 options):** grammar points as stars in a dark night sky, grouped
into real JLPT-level clusters (N5, N4 — no invented categories, since `GrammarPoint` only has a `level`
field today), connected loosely rather than the old rigid 3-slot zigzag. Chosen specifically because it ties
into DESIGN.md's existing "Night Lantern" north star rather than reading as a generic skill-tree/Duolingo
clone — and because the grammar set will keep growing toward full N5–N4 coverage, the user also asked for
this to be built for that scale from day one, not just today's ~14 points.

**What changed:**
- New `src/components/GrammarConstellation.tsx` replaces `src/components/PathMap.tsx` (deleted — confirmed
  nothing else imported it first). `GrammarList.tsx` now passes `level` through to each node (previously
  passed as an opaque `badge` string) so the new component can group by it.
- Nodes are grouped into per-level cluster sections, each with a real, live "N5 · 6/10 mastered"-style
  label — not decorative copy. The existing All/N5/N4 filter now maps directly onto showing one or both
  clusters, so no functional behavior changed, only the visual layout.
- Star positions use a **deterministic seeded offset** per index (`Math.sin`-based hash, not
  `Math.random()`) — stable across re-renders and progress updates, reads as organic scatter rather than
  the old 3-position zigzag, without reshuffling every time state changes.
- The "up next" star's highlight is a **bounded two-cycle pulse** (`animation: star-glow-settle 1.4s ease-out
  2`) that settles into the same static glow the button already carries — deliberately not `infinite`,
  directly applying the lesson from the Listening/Grammar `quieter` passes earlier this session. Verified via
  computed style: `animation-iteration-count: 2`, not looping.
- Background is a **CSS-only starfield** (layered `radial-gradient` dots, tiled via `background-size`) rather
  than a static illustration, specifically so it scales correctly to any cluster height as the grammar set
  grows — no fixed-composition image to stretch or crop.
- Simplification accepted from the original brief: literal per-star constellation *connector lines* (an SVG
  path following each node's exact position) were replaced with the existing single dashed center guide-line
  per cluster, to avoid fragile position-tracking math across breakpoints for a first pass. Noted here rather
  than silently dropped.

**Verification:** confirmed live in dark mode, light mode (the panel correctly stays dark navy in light mode
too, matching the same convention already used by the Vocabulary/Kanji hero panels), and mobile (375px, no
clipping, long titles like "〜ました / 〜ませんでした" wrap cleanly). Confirmed the N5/N4 filter correctly
shows/hides individual clusters. Confirmed star navigation still routes to the correct grammar detail page.
`npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test` all pass clean.

## `/impeccable quieter` — Grammar page

Unlike the Listening pass, this one didn't need an `AskUserQuestion` round — the codebase itself showed a
concrete, well-evidenced intensity source, not an ambiguous one.

**What was found:** `PathMap.tsx` (the zigzag "chapter map" of grammar points, used only on this page) ran
an infinite `animate-path-pulse` glow — a breathing box-shadow ring, looping forever, on whichever node is
"up next." It's the single continuously-animating element on the page (checked `Mascot.tsx` too — the
bobbing mascot above the current node is a static image, not itself animated). Per PRODUCT.md's own brand
personality ("a calm study companion, not a carnival") and its explicit anti-reference to Duolideo-style
gamification, an animation that never stops for as long as you're on the page is exactly the kind of
"animation excess" `/impeccable quieter` targets.

**What was kept:** the per-skill gradient fill and colored drop-shadow on active/done nodes — this is a
deliberate, consistent design language shared with the Dashboard's "Today's Path" skill icons
(`SKILL_THEME`), not decoration invented for this page. Removing it would have eroded a real cross-page
identity system rather than reduced noise. The zigzag layout itself was also left alone — that's an
information-architecture choice ("original layout... not copied from any product," per the component's own
doc comment), not a loudness issue quieter.md's criteria actually target.

**Fix:** removed the `animate-path-pulse` class from the "current" node in `PathMap.tsx`, and deleted the
now-fully-unused `@keyframes path-pulse` / `.animate-path-pulse` utility from `index.css` (grepped first to
confirm no other consumer). The current node still reads clearly — it's already the only node with the
mascot rendered above it, on top of sharing the gradient fill with completed nodes — so removing the pulse
lost a redundant third signal, not the only one.

**Also noted, not touched:** the design hook flagged pre-existing `border-radius: 9999px` / shadow values in
`index.css` after this edit shifted line numbers. Checked them — they're the unrelated `.plan-slider`
custom range-input thumb styles (Dashboard's study-duration slider), already documented with their own
rationale comment, predating this task entirely. Left unchanged; out of scope for a Grammar-page pass.

**Verification:** confirmed via computed styles that the current node now reports `animation-name: none`.
Checked dark mode, light mode, and mobile (375px) — no regressions, node still reads clearly as "current."
`npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test` all pass clean.

## `/impeccable quieter` — Listening page

Read the command's own reference doc first: "quieter" doesn't mean boring — it means restraint with intent,
one clear hierarchy instead of everything shouting at once. Inspected the live page (source + browser, both
themes, correct/wrong answer states) before touching anything; nothing here failed the usual loudness
checks (saturation, contrast, motion, density) in isolation, so per the command's own "if unclear, ask"
rule, asked the user which specific areas felt too intense rather than guessing. Answer: the correct/wrong
answer feedback, the control-row clutter, and the overall color/accent repetition — all three turned out to
share one root cause.

**Root cause:** three unrelated controls (voice-provider toggle, exercise-mode tabs, playback-speed pills)
all used the identical solid `bg-brand-600` "active" pill in the same small area, so no single one read as
more important than the others — diluting the one accent color that's supposed to mean "this is the primary
choice." The answer-feedback layer stacked a solid pastel fill + colored border + icon + a `shake` animation
+ bold status text all at once for a single correct/wrong signal.

**Fix — established one clear hierarchy instead of removing anything:**
- Kept the Listen & Select / Dictation mode tabs (`SegmentedTabs`) as the one bold, solid-brand-600 element
  on the page — it's the actual primary choice (which exercise you're doing).
- Demoted the voice-provider toggle (`VoiceModeSelector.tsx`) and the speed pills (`ListeningHome.tsx`) from
  solid `bg-brand-600 text-white` to a quieter tinted-outline treatment
  (`bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300`) — still immediately shows which
  option is selected, no longer competes with the mode tabs for attention.
- Removed the bordered `Card` wrapper around the voice-mode settings block entirely — it's now an inline,
  borderless settings row rather than its own heavy boxed container, cutting one whole competing surface
  from the page before the actual quiz content.
- Answer feedback: removed the `animate-shake` flourish on wrong answers (decorative, not functional —
  border + icon + color already say "wrong" without needing motion), dropped the solid
  `bg-emerald-50`/`bg-red-50` fills in favor of just the colored border + icon + text (still completely
  clear, one less layer of color), and reduced the "Correct!" / "Not quite." status line from
  `font-semibold` to `font-medium` since it was restating what the row itself already shows.
- Deliberately left the actual quiz card's layout, the Play button, playback logic, and all functionality
  untouched — this was a visual-intensity pass, not a redesign.

**Verification:** checked both themes live, triggered both a correct and a wrong answer to confirm the
feedback still reads clearly at a glance without the extra motion/fill. `npx tsc -b`, `npx eslint .`,
`npm run build`, and `npm test` all pass clean.

## `/impeccable animate` — Dashboard load animation

Ran the actual `animate` command this time (per its reference doc: assess opportunities, pick one hero
moment rather than scattering motion everywhere, reuse the product's existing motion vocabulary). Rather
than inventing a new animation style, extended the exact pattern already built and verified for
Vocabulary/Kanji — same shared `src/lib/entranceAnimation.ts` helper, same `tw-animate-css` classes, no new
dependency, no new animation language to learn.

- **Page-level settle-in**: Dashboard's outer container gets the same one-time `animate-in fade-in-0
  slide-in-from-bottom-1` treatment as Vocabulary/Kanji, so navigating to any of the three main pages now
  feels consistent.
- **Staggered stat-card row**: the 4 top cards (Study Streak, Studied Today, Reviews Due, Weekly Goal) now
  animate in with the same 35ms-per-card stagger (capped, same helper) used for the Vocabulary/Kanji grids.
  Required widening two shared components: `Card.tsx` gained an optional `style` prop (needed to pass the
  per-card `animationDelay`), and `StatCard.tsx` gained an optional `index` prop mirroring
  `VocabularyCard`/`KanjiCard` exactly. `WeeklyGoalCard` forwards its own `index` through to the underlying
  `StatCard` call.
- **Replay trigger**: the stat-card grid is keyed on `progress.level` (`key={progress.level}`), so switching
  N5/N4 — Dashboard's equivalent of Vocabulary/Kanji's category switch — remounts the row and replays the
  stagger. Typing or any other interaction leaves it alone.
- Deliberately did **not** also stagger the Study Plan/Today's Path/Achievements row or the Today's Path
  step list — per the command's own guidance, one well-orchestrated moment beats scattering motion across
  every list on the page.

**Verification:** confirmed via computed styles that all 4 stat cards show `animation-name: enter`,
`duration: 0.3s`, `fill-mode: both`, with delays at 0/35/70/105ms. Confirmed clicking N4 forces a fresh DOM
node for the first card (`sameNode: false`) and resets its delay to 0s, proving the replay trigger works.
Checked desktop and mobile — no layout regressions. `npx tsc -b`, `npx eslint .`, `npm run build`, and
`npm test` all pass clean.

## Hero panel vertical-centering fix

The previous pass unified *which* stats the Vocabulary/Kanji hero panel shows, but the user correctly
flagged that the panels still didn't match — the actual bug was alignment, not content. Measured both
panels' internal element positions precisely (`getBoundingClientRect()` on the ring, mascot, and stat items
on both pages) before touching anything, rather than guessing from screenshots.

**Root cause:** `LearningStatsPanel`'s outer container (`min-h-[150px]`, plain block, not flex) let its
content row sit flush at the top by default. The row's own height is `tallest child + padding` — and the
tallest child is the mascot image, which is a different height per page (Kanji's `mascot-reading-map.png`
is 75px tall, Vocabulary's `mascot-vocabulary.png` is 100px tall). So Kanji's content row rendered at 123px
tall inside the 150px panel (27px of unstyled empty space below it), while Vocabulary's rendered at 148px
(nearly no empty space) — same panel height, visibly different vertical weight and spacing on each page.

**Fix:** added `flex items-center` to the panel container so the content row vertically centers within the
150px panel regardless of its own natural height, and added `w-full` to the row itself (needed once the
panel became a flex container, so the row keeps spanning the full width instead of shrinking to content
width). Two-line change, `src/components/learning/LearningStatsPanel.tsx` only.

**Verification:** measured both pages after the fix — the ring/mascot/stats row now sits at exactly 39px
from both the top and bottom edge of the 150px panel on **both** Vocabulary and Kanji, confirmed via direct
pixel measurement, not eyeballing. Checked desktop (1440px) and mobile (375px) screenshots on both pages —
no regressions. `npx tsc -b`, `npx eslint .`, and `npm run build` all pass clean.

## Hero banner parity + staggered card entrance animation

Two related requests: make the Vocabulary and Kanji hero stats panels structurally identical, and animate
the card grid in when switching level/category (not on every search keystroke).

**Hero banner parity.** Kanji's `LearningStatsPanel` showed 4 stat items plus a "% of all kanji" line;
Vocabulary showed 3 items with no percent line — flagged as an inconsistency in the critique. Investigated
`getLearningStats()` (`src/lib/learningState.ts`) before picking a direction: `longestStreak` there is
just `progress.streak.longest` — the exact same app-wide value already shown on the Dashboard's "Study
Streak" card, not a real per-skill metric — so showing it again on Kanji was redundant, not additive.
Matched Kanji to Vocabulary's leaner treatment (`showLongestStreak={false} showLearnedPercent={false}` in
`KanjiList.tsx`) rather than the other way around, since that also helps the mobile fold-push issue the
critique flagged, instead of making it worse.

**Staggered entrance animation**, using `tw-animate-css` (already installed from the earlier shadcn pass) —
no new dependency:
- New `src/lib/entranceAnimation.ts`: exports `ENTRANCE_ANIMATION_CLASSES` (`animate-in fade-in-0
  slide-in-from-bottom-2 fill-mode-both duration-300 ease-out`) and `getEntranceDelayMs(index)`, which
  staggers 35ms per card capped at index 12 (420ms max) so a 74-word list doesn't take seconds to settle.
- `VocabularyCard`/`KanjiCard` accept an optional `index` prop; when present, the entrance classes and an
  inline `animationDelay` apply. `VocabularyCardGrid`/`KanjiCardGrid` pass `index={i}` from their `.map()`.
- The actual "replay on switch, not on every keystroke" behavior comes from a React `key` on the grid
  component itself: `key={`${level}-${category}`}` on `<VocabularyCardGrid>`, `key={level}` on
  `<KanjiCardGrid>` (in their respective page files). Changing the key forces React to unmount/remount the
  whole grid subtree, which naturally replays each card's CSS entrance animation on mount — while typing in
  search (which isn't part of the key) leaves the existing DOM nodes alone, confirmed via direct node-identity
  check (see Verification).
- Also added a single (non-staggered) `animate-in fade-in-0 slide-in-from-bottom-1` to the outer page
  wrapper on both `VocabularyHome.tsx` and `KanjiList.tsx`, so navigating to either page via the sidebar
  gets one clean settle-in for the whole page, independent of the grid's own stagger. Scoped to just these
  two pages per the request; Dashboard was left untouched.
- Respects `prefers-reduced-motion` for free via the existing blanket override in `index.css`
  (`*, *::before, *::after { animation-duration: 0.01ms !important; ... }` under `(prefers-reduced-motion:
  reduce)`), no new accessibility work needed.

**Verification:** confirmed live in the browser — computed styles show `animation-name: enter`,
`duration: 0.3s`, `fill-mode: both` correctly applied; per-card `animation-delay` measured at 0ms, 35ms,
70ms... up to a capped 420ms across the first 20 cards, matching the stagger formula exactly. Confirmed
switching the level filter (Kanji, "All" → "N5") changes the rendered card count correctly and replays the
animation; confirmed typing into the search box does **not** replace the first card's DOM node (same
element reference before/after), so search never retriggers the animation. `npx tsc -b`, `npx eslint .`,
`npm run build`, and `npm test` all pass clean.

## Quick critique fixes: filter label, Kanji/Vocabulary CTA copy, mobile nav overflow

Deliberately scoped to exactly 3 items from the critique snapshot, per explicit instruction: no redesign,
no other screens touched, no localStorage reset, no large layout rewrites.

1. **Category filter's reset option no longer reads as a category named "Filter."** In
   `src/components/learning/LearningControls.tsx`, the `<SelectItem value="all">` label and the `<SelectValue>`
   placeholder both changed from `"Filter"` to `"All categories"` — matches the existing All/N5/N4 pattern
   already used by the level tabs beside it. Vocabulary is the only page this is visible on (Kanji has no
   category data, so it never renders this control).
2. **Kanji's CTA copy now matches Vocabulary's format.** Kanji previously read `"Learn 日"` / `"Review 日"`
   (bare character), while Vocabulary read `"Learn (10 new)"` / `"Review (3 due, 7 new)"`. Added the same
   due/new count computation to `KanjiList.tsx` (`getSrsCard` + `isCardDue`, mirroring Vocabulary's exact
   logic) and duplicated Vocabulary's small local `formatReviewLabel` helper rather than extracting a shared
   one, to keep the change contained to a single file. The link target itself (`/kanji/{id}` to the first
   queued kanji's detail page) is unchanged — only the label text changed.
3. **Mobile bottom nav no longer overflows its own viewport.** `Layout.tsx`'s 6-item bottom nav used
   `flex-1 min-w-16` per item — on a 375px-wide viewport, 6 × 64px minimum = 384px, 9px wider than the
   screen (confirmed by the critique's direct measurement). Changed `min-w-16` to `min-w-0` so `flex-1` can
   actually divide the real available width evenly; re-measured post-fix at `scrollWidth === clientWidth`
   (375 = 375), no overflow at any width.
4. Also added a small `pointer-coarse:py-3` bump to the category filter's `SelectTrigger` (same touch-target
   pattern already used by `SegmentedTabs` from the earlier polish pass), since it measured 32px tall in the
   critique — under the 44px guideline — and the fix was a one-class addition alongside the label change
   already being made to that same element.

**Explicitly not touched in this pass** (deferred, still open from the critique): the mobile stats-panel
fold-push on Vocabulary/Kanji, the un-badged locked Weekly Goal card, the possible dark-mode popover
contrast issue, and the first-run color-legend idea — none of these were "quickest fixes," all still need
explicit direction before being worked on.

**Verification:** `npx tsc -b`, `npx eslint .`, and `npm run build` all pass clean. Confirmed live in the
browser at 375×812: the category filter now shows "All categories," Kanji's CTA reads "Learn (10 new)"
and still links to the correct kanji detail page, and the bottom nav's `scrollWidth`/`clientWidth` match
exactly (no more horizontal overflow).

## `/impeccable critique` — app-wide UX/UI review (no code changes)

Ran the full dual-agent critique flow (Assessment A: design review, live-browser + source; Assessment B:
deterministic detector + browser-overlay evidence) against Dashboard, Vocabulary, Kanji, the sidebar/nav,
and mobile layout, per explicit instruction to review and score only — **not** to edit anything yet.

**Nothing in `src/` changed.** The only new artifact is the persisted snapshot at
`.impeccable/critique/2026-07-06T18-27-08Z__r-navigation-mobile-layout-kotobox-app-wide-review.md`, which
`/impeccable polish` can read later as a backlog.

**Headline result:** Nielsen heuristics 30/40 ("Good" band). Does not read as AI-generated — verified the
detector's `gradient-text`/`bounce-easing` flags were false positives (zero actual usages of `bg-clip-text`
or `animate-bounce` anywhere in `src/`, confirmed via grep) and most `low-contrast` flags were the detector
misreading text sitting on background *images* rather than solid colors. One flag was **not** dismissed and
still needs a manual check: a `text-brand-300` (~2:1 contrast) hit on a white surface, possibly the shadcn
Dialog's `--popover` token never being re-colored for dark mode during the earlier shadcn integration —
worth opening the Level-Up dialog in dark mode and inspecting that variable directly.

**Confirmed (cross-validated by both assessments independently):**
- Mobile stats panel on Vocabulary/Kanji pushes real content ~400px below the fold.
- Several controls (grid/list toggle, category filter trigger, level-filter tabs) measure 28–32px tall —
  under the 44px touch-target guideline. Note: a `pointer-coarse:` CSS rule already exists in
  `SegmentedTabs.tsx` from the earlier polish pass to address this on real touch devices, but neither this
  review nor that pass could confirm it actually engages on a real phone (only emulated viewports were
  available) — needs a real-device check, not necessarily new code.
- Mobile bottom nav is 384px of content (6 × 64px items) inside a 375px viewport — a small, real overflow.
- Category filter's reset menu item is labeled "Filter," identical to its own placeholder text.
- The Dashboard's "Weekly Goal" stat card is silently disabled (locked "View Progress" link) while sitting
  visually identical to its 3 working sibling cards — no visual signal distinguishes it until you read the
  small sublabel.

Full scoring (13 categories against the app's daily-paid-use potential), the priority-ranked fix list, a
1-hour plan, a 1-day plan, and a pre-launch checklist were all delivered directly in chat — not duplicated
here since none of it has been acted on yet.

**Verification after this step:** `npx tsc -b`, `npx eslint .`, and `npm run build` all still pass clean
(expected, since no source files were touched). Confirmed the dev server still renders correctly via a live
screenshot (Kanji page, mobile viewport) — no regressions from prior work.

## `/impeccable polish` pass (Dashboard, Vocabulary, Kanji) — what changed

Scoped polish pass per DESIGN.md/PRODUCT.md, found by gathering real browser evidence (screenshots +
computed-style/contrast checks in both themes and at mobile/desktop widths) rather than guessing — no
redesign, no new modules, no localStorage changes, no other screens touched.

1. **Fixed a real WCAG AA contrast failure in light mode.** The New/Practice/Review/Mastered badge text
   (`LEARNING_STATE_THEME` in `src/lib/learningStateTheme.ts`) used dark-mode-only light shades
   (`text-blue-300`, etc.) with no light-mode counterpart. Measured contrast against the actual rendered
   badge background: ~1.7:1 in light mode (badly failing the 4.5:1 minimum) despite reading fine in dark
   mode. Added light-mode-specific shades (`text-blue-700`, `text-violet-700`, `text-amber-800`,
   `text-emerald-700`, each paired with the existing `dark:text-*-300`), re-measured post-fix: 4.65–6.32:1,
   all passing. This affects every Vocabulary/Kanji card's state badge — the exact "make states visually
   clear" ask, just in light mode where it silently wasn't.
2. **Dashboard's 4 top stat cards were inconsistent.** Study Streak / Studied Today / Reviews Due used the
   shared ring-stat shape; Weekly Goal used a completely different layout (icon+label row, big number, linear
   bar) — the same conceptual weight (all 4 are bounded-ratio stats) getting different visual weight.
   `WeeklyGoalCard` now reuses `StatCard` (`src/components/dashboard/StatCard.tsx`) directly, so all 4 cards
   share one visual language; `StatCard`'s `sublabel` prop widened from `string` to `ReactNode` so the locked
   "View Progress" hint (with its lock icon) still fits the shared shape.
3. **Mobile stat-card labels were truncating mid-word.** In the 2-column mobile grid, `StatCard`'s
   `truncate` class clipped "Studied Today" → "Studied To…", "Reviews Due" → "Reviews D…", "All caught up!" →
   "All caught…". Removed `truncate` in favor of natural 2-line wrapping (this is short, fully-controlled
   copy, not unbounded user text, so wrapping is safe) — confirmed no more clipped labels via screenshot.
4. **`LearningStatsPanel`'s stat-item row wasted ~60% of horizontal width on mobile.** Vocabulary/Kanji's
   New/Review/Mastered(/Longest Streak) row used `flex flex-wrap`, which stacked each item as a full-width
   row even though each only needed ~45% of the width — inflating the panel's height above the fold. Changed
   to a `grid grid-cols-2` on mobile (`sm:flex sm:flex-wrap` unchanged above that), with `basis-full
   sm:basis-auto` so it reliably takes a full row in the parent's flex-wrap layout instead of getting
   squeezed beside the ring stat (the first version of this fix regressed into exactly that squeeze — caught
   by screenshot, fixed by forcing `basis-full`). Also removed `truncate` from `LearningStatItem`'s
   label/helper text (same reasoning as #3) since the narrower 2-column cells started clipping "Keep your
   streak" / "Solid knowledge" once the layout tightened. Net effect: same information, ~12% shorter panel,
   dramatically better horizontal balance, no clipped text.
5. **Touch targets on `SegmentedTabs`.** Segments measured 32px tall — under the 44×44px minimum. Added
   `pointer-coarse:py-3` / `pointer-coarse:p-3.5` so touch devices get a real 44px hit area while desktop's
   mouse-driven sizing stays exactly as-is (verified the compiled CSS rule exists; the preview tool's mobile
   emulation only resizes the viewport and doesn't set `pointer: coarse`, so the live size bump itself
   couldn't be screenshotted here — it's a standard, well-supported media feature that real phones report
   correctly).

**Explicitly investigated and left alone:** the Elevation section of DESIGN.md documents flat `shadow-sm`
cards as the *intended* look for plain containers (colored glow is reserved for state-bearing cards) — so
the Dashboard's flat card style is by design, not drift, and wasn't "fixed" into something louder. Card
hover/press states, CTA styling, and the badge/border/glow state-color system were already solid and left
untouched.

**Verification:** `npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test` all pass clean. Checked both
themes and mobile (375px)/desktop (1440px) widths for all three screens via live browser screenshots and
computed-style/contrast inspection, not just automated output.

## shadcn/ui UI elevation pass — what changed

Real `shadcn` CLI install (there was no shadcn skill or dependency in the project before this — checked
first rather than assuming), used as a component-quality/accessibility upgrade, not a visual reskin. The
brand (dark navy, purple/blue glow, mascot, gamified feel) was deliberately preserved throughout.

**Setup:** `npx shadcn@latest init` (Vite template, Radix base, CSS variables) — required adding a `@/*` →
`./src/*` path alias (`tsconfig.json`, `tsconfig.app.json`, `vite.config.ts`) since shadcn's generated
imports depend on it (dropped `baseUrl`, which TypeScript 6 deprecates — `paths` alone resolves relative to
the tsconfig file now). Added `card`, `badge`, `tabs`, `progress`, `input`, `select`, `tooltip`, `dialog`,
`scroll-area`, `toggle-group`, `toggle`, `separator` on top of the `button` init already creates.

**Caught and fixed two things the installer did that would have broken the brand if left alone:**
1. It imported `@fontsource-variable/geist` and set `--font-sans: 'Geist Variable'` in a second `@theme
   inline` block — since Tailwind v4 merges all `@theme` blocks, this would have silently overridden the
   app's actual `--font-sans: 'Nunito'...` (declared earlier in the same file) the next time anything
   referenced `font-sans`, replacing the brand's whole typeface. Removed the import and the override;
   uninstalled the now-unused `@fontsource-variable/geist` package.
2. Its default `:root`/`.dark` tokens were the library's stock neutral-gray OKLCH palette — exactly the
   "default shadcn gray/white UI" this task explicitly said not to ship. Recolored every token
   (`--background`, `--card`, `--primary`, `--border`, `--ring`, `--sidebar-*`, etc., both themes) to the
   app's actual hex palette (`--color-brand-*`, the slate-50/900/950 surfaces already used everywhere, the
   `#6460e5` CTA gradient) so every shadcn-based primitive inherits Kotobox's real colors automatically
   rather than generic grays. `shadcn/tailwind.css` and `tw-animate-css` (utility/animation classes, Radix
   `data-state` variants) were additive and needed no changes.
3. A related, unprompted lint fix: shadcn's own components export a `cva()` variants function alongside the
   component (e.g. `export { Button, buttonVariants }`), which trips `react-refresh/only-export-components`
   under this project's ESLint config. `allowConstantExport` doesn't cover it (that option only exempts
   literal constants, not functions), so scoped the rule off entirely for `src/components/ui/**/*.tsx` —
   inherent to every shadcn-generated file, not something worth annotating file-by-file.

**Real integrations (not just installed-and-unused):**
- **`SegmentedTabs.tsx`** (the sliding-pill control from the previous pass, used for Vocabulary/Kanji level
  filters + grid/list toggle, Grammar's level filter, Listening's mode toggle, the Dashboard's N5/N4 switch)
  now builds on Radix's `ToggleGroup` primitive instead of plain buttons — real `radiogroup`/`radio` ARIA
  semantics and roving-tabindex keyboard navigation (verified the ARIA roles directly; couldn't fully
  verify arrow-key nav through this session's synthetic-event testing, but Radix's roving focus group is
  well-established, heavily-used library behavior). The custom sliding indicator, colors, and click sound
  are all unchanged.
- **`LevelUpDialog.tsx`** now composes `Dialog`/`DialogPortal`/`DialogOverlay` (from `ui/dialog.tsx`) with
  Radix's raw `Dialog.Content` — real focus trap, scroll lock, and Escape-to-close, none of which the
  original hand-rolled version had (verified: Escape now genuinely closes it). The default shadcn overlay
  is a subtle 10%-black dim; overridden to the original design's more dramatic 70%-dark + blur since this is
  a full-screen celebration moment, not a routine form dialog.
- **`LearningControls.tsx`**'s category filter is now a `Select` (`ui/select.tsx`) instead of a native
  `<select>` — fully themed popover instead of the OS's own dropdown chrome.
- **New `ui/IconButton.tsx`**: wraps the sidebar/mobile-header icon toggles (sound, music, theme) in a
  `Tooltip` so their purpose is discoverable on hover/focus, not just from the glyph. `SegmentedTabs`' own
  icon-only segments (grid/list view) get the same tooltip treatment.
- **New `ui/SectionHeader.tsx`**: consolidates the "icon + title + subtitle" header markup that was
  independently hand-repeated in Grammar, Reading, and Listening; Vocabulary/Kanji keep their own header
  components since those also carry a CTA button.
- **`LearningStateBadge.tsx`** and **`LearningProgressBar.tsx`** now render through `ui/badge.tsx` /
  `ui/progress.tsx` (Radix `Progress`) respectively, keeping the exact same per-state colors — same look,
  now backed by the shared primitives instead of one-off markup. `ui/progress.tsx` gained an
  `indicatorClassName` prop (a standard, well-known escape hatch) since the base component hardcodes the
  indicator to a single `bg-primary` color and this needs a different color per learning state.
- **`Layout.tsx`**'s sidebar nav now uses `ScrollArea` (themed scrollbar) instead of plain
  `overflow-y-auto`, and `Separator` in place of an ad-hoc `border-t` divider.
- **`TooltipProvider`** wraps the app root in `App.tsx` (required once for any `Tooltip` to work).

**Deliberately not created:** `ui/StatCard.tsx` — the existing `dashboard/StatCard.tsx` and
`learning/LearningStatItem.tsx` already cover this need well; a redundant duplicate would just be dead
weight. `ui/Card.tsx`/`Button.tsx`/`Tabs.tsx` as *separate* custom files — the shadcn CLI already created
these at the requested paths (lowercase, matching shadcn's own convention so future `npx shadcn add
--overwrite` stays compatible). The installed `Tabs` primitive (Radix tabbed content panels) has no natural
fit yet — nothing in the app switches between content panels the way `Tabs` is for, as opposed to filtering
a list (which is what `SegmentedTabs` already handles) — so it's available and themed but not force-fit
into a fake use.

**Files added:** `components.json`, `src/components/ui/*` (13 files from `npx shadcn add` + `IconButton.tsx`
+ `SectionHeader.tsx`), `src/lib/utils.ts` (shadcn's `cn()` helper). **Files changed:** `tsconfig.json`,
`tsconfig.app.json`, `vite.config.ts` (path alias), `index.css` (theme tokens recolored, Geist removed),
`eslint.config.js` (scoped rule override), `SegmentedTabs.tsx`, `LevelUpDialog.tsx`, `LearningControls.tsx`,
`LearningStateBadge.tsx`, `LearningProgressBar.tsx`, `Layout.tsx`, `App.tsx`, `GrammarList.tsx`,
`ReadingList.tsx`, `ListeningHome.tsx`. **Package changes:** added shadcn's Radix/cva/clsx/tailwind-merge
stack + `tw-animate-css`; removed the unused `@fontsource-variable/geist`.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build`, `npm test` (11 tests) all pass clean (build now
warns about a >500kB chunk, expected after adding the Radix packages — not worth code-splitting for an app
this size, noting rather than "fixing" with premature complexity). In-browser on a clean dev-server restart
(zero console errors): confirmed the ToggleGroup-based tabs still filter/toggle correctly and show correct
`radiogroup`/`radio` ARIA roles; confirmed the Dialog's Escape-key close and its 70%-dark overlay via
computed styles (a couple of screenshots during this were confused by a previously-documented viewport-
size screenshot-tool artifact — resolved by re-testing at the "desktop" preset, not a real rendering bug);
confirmed the new Select opens, lists real categories, and filters on selection; confirmed the Tooltip
shows on hover; confirmed Grammar/Reading/Listening headers render via the new shared `SectionHeader`;
checked mobile (375×812) on Vocabulary and Kanji — no overflow, all controls usable. `localStorage` progress
and preferences confirmed intact throughout.

## Level-up dialog + CTA recolor + animated tabs + background music — what changed

Five requested items in one pass:

**1. Level-up celebration.** New `LevelUpDialog.tsx` — a real modal (not a toast), shown via a new
`useLevelUp(level)` hook (`src/lib/useLevelUp.ts`) that follows the exact same pattern as the existing
`useStreakPulse`: it remembers the level from a ref initialized to the *current* level on mount, so it only
fires on a genuine in-session increase and never on a page reload recalculating an already-earned level
(level is a pure derived value from XP, see `xp.ts` — nothing about it is "new" just because the page
loaded). Confetti (50 pieces, random color/size/rotation/timing) is built as real DOM nodes inside a
`useEffect` rather than routed through React state/render — this project's stricter React Compiler lint
rules flag both "impure calls during render" (so `Math.random()` can't live in a `useMemo`/lazy `useState`
initializer) and "synchronous setState in an effect" (so it can't be generated in the effect body via
`setState` either); a one-shot decorative DOM effect sidesteps both cleanly. Confetti's fall animation
lives in `index.css` inside the existing `@media (prefers-reduced-motion: no-preference)` block, so it's
skipped entirely under that OS setting, matching every other animation already in this file. The dialog
reuses `playMilestone()` from the existing sound engine and auto-dismisses after 6s (or on click/backdrop
click). Mounted once in `Layout.tsx` so it can appear regardless of which page the user is on when a
review/quiz push them over a level boundary.

**Verification note:** rather than editing the hook to fake a trigger, exercised the real mechanism —
imported the actual running `progressStore` module in the browser console and called its real
`markGrammarCompleted`/`resetAllProgress` exports directly, the same functions `GrammarDetail.tsx` calls,
to genuinely cross a level boundary (0 → 100 XP = Level 2). First couple of attempts showed no dialog; this
turned out to be a real timing lesson, not a bug: firing 5-10 mutations in one synchronous script block
lets React batch them into a single render, so the hook only ever sees the *final* level and never notices
it passed through intermediate ones — exactly what happens if you reset-then-immediately-relevel in the
same tick. Adding a short delay after the reset (so its render commits before the level-crossing mutations
run) reproduced a clean single-step level-up every time, confirmed via DOM inspection (heading text,
mascot `src`, button label, and a `.animate-confetti-fall` count of exactly 50) and visually in a screenshot
taken back-to-back with the trigger call. Also confirmed the 6s auto-dismiss actually fires (the dialog was
gone on a follow-up check with no manual dismissal), and confirmed a plain page load never shows it. Reset
progress back to empty afterward — this was an isolated preview-tool browser profile, not real user data.

**2. CTA recolor, app-wide.** Previously (see below), the reference's violet gradient was deliberately
scoped to just the Study Plan card's button, reasoning that recoloring the shared `PrimaryButton` would be
a de facto rebrand affecting 25+ call sites. Explicit instruction this pass to "put this on every call to
action" reverses that judgment call — updated `PRIMARY_BUTTON_CLASSES` (`src/lib/buttonStyles.ts`) itself to
the sampled gradient (`#6460e5` → `#5050d5`, ledge `#3d3aa8`), so every CTA in the app (Learn/Review on
Vocabulary and Kanji, Continue Learning, Start Study Session, quiz/reading/listening actions, etc.) now
matches automatically. Removed the now-redundant `.study-plan-cta` scoped override (`index.css`,
`StudyPlanCard.tsx`) since the shared style already matches it.

**3. Vocabulary stats panel trim.** `LearningStatsPanel` (shared by Vocabulary and Kanji) gained two opt-out
props, `showLongestStreak` and `showLearnedPercent` (both default `true`). Vocabulary passes `false` for
both — streak is already shown on the Dashboard and didn't need repeating here, and the raw learned count
reads fine without a restated percentage. Kanji's panel is untouched (still shows both).

**4. Animated segmented tabs, everywhere.** New shared `src/components/SegmentedTabs.tsx` — a single-select
control with a sliding "pill" indicator that animates to the active option's real measured position
(via `offsetLeft`/`offsetWidth` on the actual button, so it lines up exactly even across differently-sized
labels), plus a press-scale and a soft click sound, replacing plain instant-swap buttons everywhere this
exact pattern existed: the Vocabulary/Kanji level filter and grid/list toggle (`LearningControls.tsx`),
Grammar's level filter (`GrammarList.tsx`), Listening's "Listen & Select / Dictation" mode toggle
(`ListeningHome.tsx`), and the Dashboard hero's N5/N4 switch (`Dashboard.tsx`'s `LevelToggle`, via a new
`variant="glass"` skin so it still reads correctly on the dark hero image instead of looking like a
mismatched light card). Left Listening's speed chips and `DisplayToggles`' furigana/romaji chips alone —
those are a structurally different pattern (independent multi-select pills, not a single-select segmented
track), not "the same component."

**5. Background music.** New `src/lib/music.ts` + `useBackgroundMusic.ts` hook, following this project's
established "no external audio files" convention (same as `sound.ts`) — a slow, wandering ambient loop
generated with the Web Audio API over a real Japanese pentatonic scale (Hirajoshi/"In" scale, semitone
offsets 0-1-5-7-8 from D4) rather than a generic major scale, with an occasional soft high chime for a
light "gamified" sparkle, mixed quietly under the sound-effect volume. Off by default and never autoplays
— a returning user who left it on has their preference read from `localStorage` on load, but actual
playback only resumes on their first click/keypress in the new session (browsers suspend fresh
`AudioContext`s until a real gesture; handled by a one-time `pointerdown`/`keydown` listener in `music.ts`).
A new toggle button (`Music2` icon) sits next to the existing mute button in both the sidebar and mobile
header in `Layout.tsx`, persisted the same way as the sound-effects toggle.

**Files added:** `LevelUpDialog.tsx`, `useLevelUp.ts`, `SegmentedTabs.tsx`, `music.ts`,
`useBackgroundMusic.ts`. **Files changed:** `Layout.tsx` (level-up wiring, music toggle x2), `buttonStyles.ts`,
`index.css` (confetti keyframe, removed dead `.study-plan-cta`), `StudyPlanCard.tsx`, `LearningStatsPanel.tsx`,
`VocabularyHome.tsx`, `LearningControls.tsx`, `GrammarList.tsx`, `Dashboard.tsx`, `ListeningHome.tsx`.

Verified: `npx tsc -b`, `npx eslint .` (which correctly caught the confetti implementation's first draft —
`Math.random()` inside a `useMemo` is an impure-during-render violation under this project's React Compiler
lint rules — fixed by moving confetti generation into a `useEffect` that builds real DOM nodes imperatively
instead), `npm run build`, `npm test` (11 tests) all pass clean. In-browser on a clean dev-server restart:
confirmed the sliding-tab indicator on Vocabulary, Kanji, Grammar, Listening, and the Dashboard hero all
animate to the real button position; confirmed the CTA gradient (`linear-gradient(#6460e5, #5050d5)`,
checked via computed style) renders on Vocabulary/Kanji/Dashboard; confirmed Vocabulary's panel has exactly
3 stat items (no Longest Streak, no percent line) while Kanji's still has 4 + percent; confirmed the music
toggle flips `aria-pressed`, persists to `localStorage`, and produces zero console errors when starting the
audio engine; checked mobile (375×812) end to end. The sidebar renders both a desktop and a mobile-header
copy of several controls (dark-mode toggle, now also the music toggle) simultaneously in the DOM, one
hidden by CSS depending on viewport — plain-selector clicks intermittently landed on the hidden copy,
producing a few false "it didn't work" moments that direct DOM inspection (checking which copy actually has
`offsetParent`) resolved each time; not a real bug, just a re-occurring test-tooling gotcha worth remembering
for next time. `localStorage` progress, sound, and the new music preference all confirmed intact throughout.

## Kanji redesign + full-width layout + outer glows — what changed

Three follow-up fixes/extensions to the Vocabulary redesign above, requested together:

**1. Full-width layout (the "too much white space" fix).** `Layout.tsx`'s `<main>` only dropped its
`max-w-5xl` constraint for the Dashboard route (`isDashboard`) — every other page, including the just-built
Vocabulary page, was capped at 1024px and centered, leaving large empty margins on wider screens even
though the new stats panel/card grid were built to fill available width like the Dashboard's own cards.
Widened the condition to `isWideLayout` (now `/`, `/vocabulary`, `/kanji`), and bumped both card grids'
breakpoints to use the freed-up space (Vocabulary: up to `2xl:grid-cols-5`; Kanji: up to `2xl:grid-cols-6`,
since kanji cards are more compact). Detail/session pages (`/kanji/:id`, `/vocabulary/review`, Grammar,
Reading, etc.) were untouched and correctly kept their narrower reading-focused width — confirmed by
visiting `/kanji/k-hi` after the change.

**2. Kanji page redesign.** The reference image was originally a Kanji mockup repurposed for Vocabulary;
now applied back to the real Kanji page. Rather than duplicating the Vocabulary components, generalized the
shared shell into `src/components/learning/` (`LearningStatsPanel`, `LearningStatItem`, `LearningControls`,
`LearningStateBadge`, `LearningProgressBar`) and a shared data layer (`src/lib/learningState.ts`:
`getLearningState`/`getLearningProgress`/`getLearningStats`, parameterized by `SrsItemType` so the exact
same SM-2-based new/practice/review/mastered logic now backs both Vocabulary and Kanji). `vocabularyStats.ts`
and the new `kanjiStats.ts` are thin per-feature wrappers over that shared engine — `VocabularyCard`/
`VocabularyCardGrid` needed no logic changes. `vocabStateTheme.ts` was renamed to `learningStateTheme.ts`
(`LEARNING_STATE_THEME`) for the same reason.

New Kanji-specific pieces: `KanjiHeader`, `KanjiCard`, `KanjiCardGrid` (`src/components/kanji/`). Since a
real per-kanji detail page already exists (`/kanji/:id`, with writing practice and self-rating), `KanjiCard`
is a real `<Link>` to that page rather than Vocabulary's inline-expand — a better fit than reinventing
detail-in-grid for content that already has a proper home. The header's CTA reuses the existing
`buildReviewQueue` (already generic over item type) to find the first due-or-new kanji and routes straight
to it, labeled with that kanji's own character (e.g. "Review 生") — an honest single-item action rather than
a fake batch "review session" link that doesn't exist for Kanji. Kanji has no category data, so the
category filter dropdown was deliberately omitted (`LearningControls`' filter prop is optional precisely so
Kanji doesn't get a dropdown with nothing real behind it) rather than the app's rule. Stats panel reuses
`mascot-reading-map.png` (already transparent from an earlier pass) rather than the Vocabulary mascot, so
the two screens feel related but not identical.

**3. Outer glows.** The original Vocabulary spec asked for state-colored glows and this pass only shipped
colored borders — fixed by adding real `box-shadow` glow (always-on at low opacity, stronger on hover) per
state to `LEARNING_STATE_THEME` (blue/violet/amber/emerald, matching each state's existing border color),
applied to both `VocabularyCard` and `KanjiCard`. Also added a matching brand-colored glow to the active
level tab in `LearningControls` (the spec's "soft glow around selected tab").

**Files added:** `src/lib/learningState.ts`, `src/lib/learningStateTheme.ts`, `src/lib/kanjiStats.ts`,
`src/components/learning/*` (5 files), `src/components/kanji/*` (3 files). **Files removed** (superseded by
the shared `learning/` versions): `src/lib/vocabStateTheme.ts`, `VocabularyProgressBar.tsx`,
`VocabularyStateBadge.tsx`, `VocabularyStatItem.tsx`, `VocabularyStatsPanel.tsx`, `VocabularyControls.tsx`.
**Files changed:** `Layout.tsx` (width condition), `VocabularyCard.tsx`/`VocabularyCardGrid.tsx` (updated
imports, glow classes, wider grid), `VocabularyHome.tsx` (use shared components), `vocabularyStats.ts`
(now a thin wrapper), `pages/kanji/KanjiList.tsx` (rewritten).

Verified: `npx tsc -b`, `npx eslint .`, `npm run build`, `npm test` (11 tests) all pass clean. Saw a batch
of stale `[vite] Failed to reload ... does not provide an export` console errors mid-session from HMR
churning through the rapid file deletions — confirmed via a full dev-server restart (not just a page
reload) that these were leftover HMR history, not real errors: zero console errors from a cold start on
both `/vocabulary` and `/kanji`. In-browser at 1440×1000: both pages now fill the available width (verified
Dashboard, Grammar/Reading/Listening detail pages, and `/kanji/:id`/`/vocabulary/review` were untouched and
still correctly narrow). Confirmed via computed `box-shadow` values (not just visual inspection) that the
glow is real and state-colored, confirmed Kanji card click navigates to the real `/kanji/:id` detail page,
confirmed at mobile (375×812) both pages stack cleanly with no overflow and the glow is visible (amber ring
around a "Review" card vs. blue on "New" cards). `localStorage` progress confirmed intact throughout.

## Vocabulary page redesign — what changed

Rebuilt the Vocabulary page (`/vocabulary`) to match the dark, gamified, mascot-led style of the reference
screen (a "Kanji" mockup — same UX/UI system requested for Vocabulary specifically), replacing the old
plain two-column word list. Kanji, Grammar, Reading, Listening, routing, and localStorage were untouched.

**New components** (`src/components/vocabulary/`): `VocabularyHeader`, `VocabularyStatsPanel`,
`VocabularyStatItem`, `VocabularyControls`, `VocabularyCardGrid`, `VocabularyCard`,
`VocabularyStateBadge`, `VocabularyProgressBar`. `VocabularyHome.tsx` now just composes these.

**New data layer** (`src/lib/vocabularyStats.ts`, `src/lib/vocabStateTheme.ts`): every number on the page is
derived from real progress data, nothing hardcoded —
- **Word state** (`getVocabWordState`): `new` (no SRS card yet) → `review` (card exists and is due) →
  `practice` (card exists, not due, interval under 21 days) → `mastered` (interval ≥ 21 days — the same
  "mature card" threshold Anki uses, not an arbitrary number).
- **Per-card progress bar**: `min(100, interval / 21 × 100)`, so it fills up naturally as the same real SRS
  interval that decides the state grows.
- **Stats panel**: Words Learned (SRS cards that exist / total vocabulary), New to Learn, Review Due,
  Mastered all come from the same per-word state function; Longest Streak reuses `progress.streak.longest`
  (the same value the Dashboard already shows) rather than inventing a vocabulary-specific streak that
  doesn't exist in the data model.

**Color system**: new=blue, practice=violet, review=amber, mastered=emerald — one consistent color per
state applied to the card border/glow, the state pill, and the progress bar, so the grid reads at a glance.

**Assets**: reused `hero-background.png` (already used for the Dashboard hero) as the stats panel's night-
sky background rather than creating a near-duplicate image, keeping the two screens visually related. New
mascot pose added — the user pasted a new "laughing, wings-down" bird image for this panel; like every
other mascot image provided this session, it had a baked-in checkerboard instead of real transparency
(`hasAlpha: no`), so it went through the same `make_transparent.py` pipeline before being saved as
`public/assets/dashboard/mascots/mascot-vocabulary.png`.

**Sound**: reused the existing `src/lib/sound.ts` engine (Web Audio API, already gates on `isSoundEnabled()`
from `localStorage`, already used by Quiz/Reading/Listening/Celebration) rather than building a new
`src/utils/sounds.ts` from scratch — added five exports (`playSoftClick`, `playCardTap`, `playPrimaryAction`,
`playSuccessPop`, `playReviewPing`) reusing the file's existing `playTones` helper. Wired: `playSoftClick`
on level tabs/filter dropdown/grid-list toggle, `playCardTap` on card expand, `playPrimaryAction` on the
"Review"/"Learn" CTA. `playSuccessPop`/`playReviewPing` are exported and ready but have no wired call site
yet — there's no isolated "just mastered this one word" or "just reviewed this one word" event on this page
to attach them to honestly (mastering/reviewing happens inside the existing `/vocabulary/review` session
flow, not on this grid), so they weren't force-fit to avoid a sound firing for the wrong reason. No sound
fires on page load or on hover, only on click/tap, per the requirement.

**Deliberate deviation from the reference:** the reference mockup shows level tabs for All/N5/N4/N3/N2/N1,
but this app's real data model only has N5 and N4 (`JlptLevel = 'N5' | 'N4'`) — there is no N3–N1 content.
Built tabs for All/N5/N4 only rather than adding three tabs that would filter to an empty grid every time,
which the project's standing "no dead buttons" rule rules out even under this task's "pixel-match the
reference" instruction.

**Interaction**: clicking a card toggles an inline expanded detail (romaji, bilingual meaning, example
sentence — the same content `VocabReview.tsx`'s reveal state already shows), so the grid is genuinely
useful for browsing, not just decorative. The "Filter" control is a real native `<select>` of the existing
vocabulary categories (styled to match, not a custom dropdown) — functions correctly, avoided the extra
accessibility surface area of a from-scratch popover under time pressure. Grid/List view is a real, working
toggle (List reuses the same `VocabularyCard`, laid out horizontally).

**Files changed:** `src/pages/vocabulary/VocabularyHome.tsx` (rewritten), `src/lib/sound.ts` (5 new
exports, engine unchanged). **Files added:** the 8 components above, `vocabularyStats.ts`,
`vocabStateTheme.ts`. **Assets added:** `public/assets/dashboard/mascots/mascot-vocabulary.png`.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build`, and `npm test` (11 tests) all pass clean. In-browser:
desktop (1440×1000) and mobile (375×812) both checked — level tabs, search, category filter, grid/list
toggle, card expand, and the Review/Learn CTA (routes to the existing `/vocabulary/review` session) all
confirmed working via direct interaction, not just visual inspection. Checked light mode (cards render on
a real white background with colored borders — a screenshot color artifact briefly looked like a tint but
computed styles confirmed pure white `rgb(255,255,255)`) and confirmed the stats panel deliberately stays
dark in both themes, matching the Dashboard hero's existing "always dark" treatment. Confirmed `/kanji` and
`/vocabulary/review` still render with zero console errors — nothing else in the app was affected. Zero
console errors throughout. `localStorage` progress (`kotoba-do:progress-v1`) and the sound-enabled flag
both confirmed intact.

**Remaining polish items** (not blocking, flagging for a future pass if wanted): `playSuccessPop`/
`playReviewPing` are unused pending a real per-word mastery/review moment to attach them to; the category
filter is a native select rather than a custom-styled popover with a "Filter" icon+label that stays
constant (native selects show the chosen value instead, which is arguably more informative but slightly
different from the reference's exact look).

## Study Plan card: CTA color — what changed

Previous pass deliberately kept "Start Study Session" on the app's own brand blue rather than the
reference's violet-indigo, reasoning that `PrimaryButton` is shared by 25+ call sites across the whole app
and recoloring it would be a de facto rebrand. User pushed back directly: the call-to-action still didn't
match the reference color they provided, and asked for it to be fixed. Reinterpreted this as "make this one
button match," not "leave it as a mismatch for cross-page consistency" — so applied the fix as a scoped
override rather than a global token change: added a `.study-plan-cta` class in `index.css` (unlayered CSS,
so it reliably wins over the `@layer utilities`-based Tailwind classes it sits alongside — same technique
already proven working for `.plan-slider`'s thumb override) with `background-image: linear-gradient(to
bottom, #6460e5, #5050d5)`, both stops pixel-sampled directly from the reference screenshot, plus a matching
darker ledge-shadow color (`#3d3aa8`) so the button's existing tactile press-depth effect still reads as one
coherent color instead of a violet face with a leftover blue shadow. Explicitly preserved the `:active`
shadow-removal behavior (`.study-plan-cta:active { box-shadow: none }`) so the "flatten on press" tactile
feel isn't lost. Applied only to this one `<PrimaryButton>` instance via its `className` prop
(`StudyPlanCard.tsx`) — every other primary button in the app (Achievements' "Continue Learning", Grammar/
Reading/Listening/Quiz actions, etc.) is untouched and still uses the app's own brand blue.

Verified: `npx tsc -b`, `npx eslint .` both pass clean. In-browser, confirmed via computed styles that
`background-image` resolves to `linear-gradient(rgb(100, 96, 229), rgb(80, 80, 213))` — an exact match to
the sampled reference values. Checked side-by-side with the Achievements card's still-blue "Continue
Learning" button to confirm the scoped override didn't leak elsewhere. Verified at 1440×1200 and mobile
(375×812), zero console errors, `localStorage` progress confirmed intact.

## Study Plan card: typography/sizing fix — what changed

User flagged the rebuilt Study Plan card as still not matching the reference on "color, typography, and
sizing." Measured the reference screenshot directly (pixel-sampled colors, scanned the preset-pill row for
color transitions to get real dimensions) rather than eyeballing, and compared against the live card's
computed styles. Found three concrete, fixable gaps:

- **Preset pills were far shorter than the reference** (`py-1.5` ≈ 32px tall vs. the reference's ≈44px) —
  bumped to `py-3` (measured 44px in-browser afterward, matches). Also switched the inactive pill style
  from a bordered outline to a plain filled background (`bg-slate-100 dark:bg-slate-800/70`, no border),
  matching the reference's flat-pill look.
- **The duration value was too small and not bold enough** to read as the card's headline number (30px at
  this width vs. the reference's ~36–38px) — bumped to `text-3xl sm:text-4xl font-extrabold` (measured
  36px in-browser).
- **The slider thumb was a tiny, plain native OS control** — the reference shows a large white disc with a
  colored ring. `accent-color` alone only controls the fill color, not the thumb's size/shape, so added a
  `.plan-slider` CSS class with `::-webkit-slider-thumb` / `::-moz-range-thumb` overrides (22px white disc,
  5px brand-colored ring, drop shadow) in `index.css`.

**Judgment call on color, made explicitly rather than silently picking a side:** the reference's exact
accent hue (a violet-leaning indigo, ~`#4b4bdc`, sampled directly from the pasted screenshot) differs from
Kotobox's own established brand blue (`--color-brand-600: #3a54d6`, defined in `index.css`). That brand
color and the `PrimaryButton`'s tactile press-depth style aren't unique to this card — they're the same
tokens/component used for every primary action across the entire app (Grammar, Vocabulary, Kanji, Reading,
Listening, Quiz, SRS rating buttons, nav active states — 25+ call sites, confirmed via `grep`). Recoloring
just this card to match the mockup's one-off hue would make its slider/pills/button visibly clash with the
"Continue Learning" button one card over, and with every other screen in the app — worse for the product
than being slightly off from an external reference on hue alone. Kept the app's own brand color; fixed
everything measurable (sizing, weight, layout) that doesn't carry that cross-page cost. Flagging this so
the user can say "change the brand color everywhere" if that's actually what's wanted — that would be a
deliberate, app-wide rebrand decision, not a one-card fix.

**Files changed:** `StudyDurationPicker.tsx` (value size/weight, pill sizing/fill, slider class), `index.css`
(new `.plan-slider` thumb styles).

Verified: `npx tsc -b`, `npx eslint .` both pass clean. In-browser at 1440×900/1200 and mobile (375×812):
pills measured 44px tall (was 32px), value measured 36px/800-weight (was 30px/700), slider thumb renders
as a large ringed disc instead of the native default, pill row wraps cleanly on mobile with no overflow.
Zero console errors, `localStorage` progress confirmed intact.

## Final mascot poses + Study Plan card simplification — what changed

User pointed at two specific source files for the final mascot poses (both already present in the asset
pack, not new uploads this time): `Rework images/bird-map.png` for the bottom journey strip, and
`01_mascots_png_transparent/main-mascotte.png` for the hero — a different pose than the wings-spread bird
used previously (now reserved for the sidebar level card only). Both source files had the same
baked-in-checkerboard problem as every other file in this pack (`hasAlpha: no` despite looking transparent
in a viewer), so both went through the same `make_transparent.py` pipeline. Outputs: footer mascot
1019×911 (unchanged ratio from the previous `bird-map.png` pass, so `BottomJourneyStrip.tsx`'s existing
84×75 sizing needed no change); hero mascot 908×854 (a new, more square-ish pose than before), so
`MascotBubble.tsx`'s `<img>` dimensions were adjusted from 134×120 to 128×120 to match without stretching.

**Study Plan card**: removed the separate "Balanced Plan" side panel entirely per explicit instruction
(`StudyPlanCard.tsx`) — along with its now-dead supporting code, `calculateBalancedPlanSplit()` and the
`BalancedPlanSplit` type in `dashboardStats.ts`, and the `balancedSplit` prop/import chain through
`Dashboard.tsx`. Restyled `StudyDurationPicker.tsx` to match the reference's typography: the "How much
time do you have today?" label now sits on its own line above a large bold duration value (reusing the
existing `.text-fluid-stat-value` class already used for the stat cards, rather than inventing a new size,
so it's visually consistent with the rest of the dashboard), instead of the old small inline label+value
row. The card's bottom hint line was restyled with a small amber `Zap` icon to match the reference's "⚡
Recommended…" treatment, while keeping the real numbers it already showed (`{totalMinutes} min ·
{sections} sections`) rather than swapping in the reference's fictional item-count metric — changing the
underlying unit from minutes to "items" would have meant replacing `calculateStudyPlan`'s real
time-based allocation logic with a fabricated one, which conflicts with this project's standing "no fake
data" rule; matched the visual treatment (label placement, big bold value, icon+hint styling) instead.

**Files changed:** `MascotBubble.tsx`, `BottomJourneyStrip.tsx` (no dimension change needed, confirmed),
`StudyPlanCard.tsx`, `StudyDurationPicker.tsx`, `dashboardStats.ts`, `pages/Dashboard.tsx`. Assets replaced:
`public/assets/dashboard/mascots/mascot-greeting.png`, `mascot-reading-map.png`.

Verified: `npx tsc -b`, `npx eslint .` both pass clean (no leftover unused imports/props after removing
the balanced-plan code path). In-browser at 1440×900 and mobile (375×812): both new mascots render fully
transparent with no checkerboard or distortion, Study Plan card shows the simplified single-panel layout
with the large duration value, zero console errors, `localStorage` progress confirmed intact.

## Sidebar level card mascot swap — what changed

Immediately after the mascot transparency fix (below), the user pasted the wings-spread scarf mascot again
alongside a screenshot of the sidebar's `Level N` card, asking to replace that card's mascot with "the
clear image I just provided." The sidebar card was still showing a different, older, low-resolution
(96×85) mascot pose (holding a star wand) that had never been swapped in this pass. The newly-pasted image
arrived as a `.webp` (1254×1254, RGB, no alpha) — same baked-in-checkerboard issue as before, not real
transparency — so it went through the same `make_transparent.py` pipeline (neutral-grey color mask +
border flood-fill + edge feather + bbox crop), verified `hasAlpha: yes` afterward, then replaced
`public/assets/dashboard/mascots/mascot-level-card.png` (now 1174×1052, matching the same pose already
used for `mascot-greeting.png`). No component code changes were needed — `SidebarLevelCard.tsx` already
renders this image at a fixed `w-24 h-24 object-contain`, and the new asset's aspect ratio (≈1.116) is
within a rounding error of the old one (≈1.129), so nothing stretches or repositions.

Verified in-browser at 1440×900: the sidebar's Level card now shows the clear, transparent mascot with no
checkerboard and no distortion. Zero console errors, `localStorage` progress confirmed intact. No source
changes meant the prior pass's `tsc -b` / `eslint` / `build` results still stand.

## Mascot transparency fix — what changed

User supplied two new, higher-quality mascot poses (bird reading a map; bird with wings fully spread
wearing a scarf) and asked to replace the current images, flagging that they should be transparent.
Checked with `sips -g hasAlpha -g space` on both source files
(`kotobox_dashboard_claude_ready_assets/Rework images/bird-map.png`, `bird-variation.png`) and confirmed
the user's suspicion: **`hasAlpha: no`** on both. The checkerboard pattern visible in an image viewer was
baked in as literal opaque grey/white pixels, not a real alpha channel — so dropping these files in as-is
would have shown a visible grey checkerboard box behind the bird in the app.

No ImageMagick was available, so installed Pillow/numpy/scipy (`pip3 install --user`) and wrote a small
one-off script to convert them properly:
1. Sampled pixel colors to characterize the checkerboard (neutral grey, no color cast, ~247–254 range) vs.
   the bird's actual artwork (warm-toned whites, tan map paper, all with a clear color cast) — confirmed a
   reliable, separating test.
2. Built a "neutral-grey-and-bright" candidate mask, then flood-filled it from the image's outer border
   (`scipy.ndimage.label` connected components) so only pixels actually connected to the outer background
   get erased — this guards against punching a transparent hole inside the character even if some interior
   pixel coincidentally matched the color test (e.g. a white highlight in the eye).
3. Applied a light Gaussian blur to the alpha channel for edge feathering, then cropped to the bounding box
   to trim the fully-transparent margin.
4. Re-verified with `sips -g hasAlpha`: both outputs now `hasAlpha: yes`, and visually inspected both for
   holes/artifacts before using them.

**Files replaced** (`public/assets/dashboard/mascots/`): `mascot-reading-map.png` ← processed
`bird-map.png` (exact pose match, used in `BottomJourneyStrip.tsx`); `mascot-greeting.png` ← processed
`bird-variation.png` (wings-spread dynamic pose, used in the hero's `MascotBubble.tsx` since that's the
more prominent slot). `mascot-level-card.png` (sidebar) was left untouched — no replacement was provided
for that pose.

Both consuming components had their `<img>` `width`/`height` corrected to the new files' actual aspect
ratios so nothing stretches or squashes: `MascotBubble.tsx` 148×104 → 134×120 (new ratio ≈1.117, matching
the 1175×1052 processed file); `BottomJourneyStrip.tsx` 104×61 → 84×75 (new ratio ≈1.119, matching the
1019×911 processed file — this pose is much closer to square than the old artwork, hence the smaller,
more compact footprint).

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. In-browser at 1440×900 and mobile
(375×812): both mascots render with fully transparent backgrounds, no checkerboard, no distortion, correct
scale in both the hero and the bottom journey strip. Zero console errors. `localStorage` progress
(`kotoba-do:progress-v1`) confirmed intact (streak, level, minutesByDate, srsCards all present).

## Real reference art assets wired in — what changed

The user supplied the actual finished illustration files this time (not a mockup screenshot to
approximate) at
`kotobox_dashboard_claude_ready_assets/Rework images/`: `Background hero.png`, `background footer.png`,
`background sidepanel.png`, `bird-map.png` / `bird-variation.png` (mascot pose variants), and a full
`kotobox_stats_icons_svg_pack/` (gradient icon SVGs purpose-built for the 4 stat cards, in both a
small-icon size and a large baked-ring size).

**Copied into `public/assets/kotobox-dashboard/generated/`:**
- `hero-background.png` ← `Background hero.png` — now the Dashboard hero's background image, replacing
  the earlier hand-built `hero-illustration.svg`.
- `footer-background.png` ← `background footer.png` — now the bottom journey strip's background,
  replacing the earlier hand-built `journey-path-illustration.svg`. This one is already composed with a
  plain dark left side, so it sits directly behind the mascot/text at full opacity rather than needing a
  low-opacity blend.
- `sidepanel-background.png` ← `background sidepanel.png` — new: added as the `SidebarLevelCard`'s
  background (it was a flat gradient before), with a dark gradient scrim on top so the white level/XP
  text stays readable over the illustration.
- `stats-icons/*.svg` ← the pack's `01_small_icons/` — used as the icon inside each stat card's ring,
  replacing plain Lucide icons (flame/book/check/calendar) with the purpose-made gradient versions.

**Deliberately not used as-is:** the pack's `02_large_ring_icons/` (the versions with the ring baked into
the same SVG) — those rings are fixed at a static arc, not tied to any real value. This app's rings show a
genuine derived ratio (streak vs. personal best, minutes studied vs. today's goal, due cards vs. total
deck), which was an explicit "real data, not decorative" requirement from earlier in this project. Used
the small plain icons instead, inside the existing dynamic `RingStat` component, so the icon art is real
but the ring itself still reflects actual progress.

**Real bug found and fixed while wiring this in:** the stat-card ring's responsive size
(`clamp(52px, 4vw, 78px)`, added in the previous pass) only reached its intended ~78px desktop size above
a ~1950px-wide viewport — at ordinary desktop widths (1120–1440px) it was still sitting near the 52px
mobile floor because the `vw` coefficient was too small. Caught by testing the actual "desktop" preset
(1120px), not just the 1600px comparison width. Reworked the formula
(`clamp(52px, 35px + 2.7vw, 78px)`) so it reaches the full 78px by ~1600px and the 52px floor by ~640px,
verified by reading the computed ring size directly in-browser at both widths.

**Files changed:** `Dashboard.tsx` (hero background src, stat icons, removed now-unused Lucide imports),
`BottomJourneyStrip.tsx`, `SidebarLevelCard.tsx`, `StatCard.tsx` (ring clamp formula, added `title`
tooltips on the label/sublabel since they still truncate on narrower desktop widths where four cards
share the row). Deleted the two now-orphaned generated SVGs (`hero-illustration.svg`,
`journey-path-illustration.svg`) after confirming via `grep` they're no longer referenced anywhere.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. In-browser at 1600×1000: hero and
footer now show the actual provided artwork, stat card icons show the real gradient glyphs. Caught and
ruled out a false alarm along the way — a screenshot at a custom 1600/1601px viewport showed a large dark
gap on the right that looked like a layout regression; direct DOM measurement (`main-content` width,
`scrollWidth` vs `clientWidth`, no horizontal overflow) confirmed the real page fills correctly and a
same-content screenshot at the "desktop" preset size rendered with no gap — concluded it's a screenshot-
capture artifact specific to certain custom dimensions, not a real bug, and moved on rather than chasing a
phantom. Mobile (375px) re-checked for the ring/icon/gap changes — no overflow, gradient icons render
correctly at the smaller size, footer illustration crops sensibly. Zero console errors, zero failed
network requests; `localStorage` progress confirmed intact.

## Measured pixel-match pass — what changed

Feedback: stop approximating — measure the actual live dashboard against the reference image and fix
concrete gaps, not just "make it feel closer." Did this literally: read computed sizes from the running
app via the browser rather than eyeballing.

**Measured before changing anything:**
| Element | Was | Reference target given | Fixed to |
|---|---|---|---|
| Stat card ring | 52px | ~80–90px | 78px desktop (52px floor on mobile via `clamp()`) |
| Stats row gap | 12px | ~16–20px | 16–20px (`gap-4 sm:gap-5`) |
| Main 3-card row gap | 12px | ~16–20px | 16–20px |
| Today's Path icon tile | 28px (smaller than the 36px number circle) | matched pairing | 40px, now matches the enlarged 40px number circle |
| Achievements featured badge | 56px | visually dominant | 72px |

**Files changed:** `src/components/dashboard/RingStat.tsx` (added a `displaySize` prop so the ring can be
large on desktop and small on mobile via one CSS `clamp()` — the SVG's own `viewBox` scaling handles
stroke width and icon proportionally, no distortion, no second component instance needed),
`StatCard.tsx`, `TodayPathCard.tsx`, `AchievementCard.tsx`, `pages/Dashboard.tsx` (icon sizes, grid gaps,
outer page gap). No new assets were needed this pass — this was a sizing/spacing correction on the
already-rebuilt structure, not new illustration work.

**Verified with direct measurement, not assumption:** re-read the computed stat-card height afterward —
it settled at 162px, above the suggested 115–130px range. Traced why rather than just shrinking padding
blindly: the 4 stat cards sit in a CSS grid with default row-stretch, and the Weekly Goal card's own
content (label + big number + progress bar + the new "View Progress" line) is intrinsically taller than a
plain ring card, so all four stretch to match it. Reduced padding once to compensate, confirmed the
remaining gap is genuinely content-driven rather than excess padding, and left it — cutting the "View
Progress" text to hit an arbitrary pixel number would be the wrong trade.

**Remaining known differences from the reference, stated plainly rather than hidden:**
- Main content width (measured 1329px at a 1600px viewport) vs. the reference's implied ~1480px — this
  reflects the earlier explicit decision to let the Dashboard fill available width rather than hard-cap
  it (requested in a prior turn after the layout left dead space on a wide monitor); reintroducing a cap
  would resurface that dead-space complaint.
- Hero height (measured 278px) is well above the "~175–190px" range given in this request, but matches
  the actual reference *image's* own proportions (hero occupies roughly 27% of the reference screenshot's
  height) — kept the image as the literal source of truth over the numeric guideline where the two
  conflicted.
- The achievement badge grid is mostly grey/locked for the real account behind this session (1 of 8
  earned) versus the reference's colorful demo-data grid — genuine, honest state, not a bug.
- The bottom banner's mountain/torii/dotted-path is a generated SVG illustration (documented in the
  previous pass), not the reference's original artwork, which isn't present in this project's asset pack.
- Did not switch numeric displays to the reference's literal demo values (Level 12, 580/900 XP, 48 items,
  etc.) — kept real derived data throughout. The values shown don't affect any of the structural/spacing
  gaps this pass measured and fixed, and swapping to hardcoded numbers would cut against every prior
  "no fake data" instruction in this project without addressing what was actually asked for here (sizing
  and spacing fidelity).

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. Checked in-browser at 1600×1000
(reference canvas size) and 375×812 (mobile) with fresh screenshots after each change, not from memory —
mobile confirmed no overflow from any of the enlarged desktop sizing (ring, icon tiles, badge, gaps all
scale down cleanly via responsive classes/`clamp()`). Zero console errors; `localStorage` progress
confirmed intact.

## Hero-illustration subtlety fix — what changed

Sent a direct side-by-side screenshot comparison (reference vs. live app). The structural rebuild (Study
Plan layout, Today's Path icons, Achievements actions, etc.) matched well, but the hero background's moon
and torii were far too bold — bright, large, and saturated — compared to the reference's muted,
background-level night atmosphere.

Fixed in `public/assets/kotobox-dashboard/generated/hero-illustration.svg`:
- Moon: radius 26→16, glow radius 60→35, glow opacity .55→.28 — now a small quiet accent, not a bright
  focal circle.
- Torii: group opacity .92→.38, glow opacity .35→.14, darker/less saturated wood-color gradient — now
  reads as distant atmosphere, not a bold foreground illustration.
- Hill ridges: opacity roughly halved across all three layers (.55/.72/.9 → .22/.32/.4) — the reference's
  hero has almost no visible mountain texture, just a smooth gradient.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. Re-screenshotted at 1600×1000
(matching the reference's own canvas) and compared directly — moon and torii now read as quiet background
atmosphere rather than bold foreground shapes, much closer to the reference's mood. Mobile (375px)
re-checked — unaffected (the illustration crops to a narrow slice there regardless). Zero console errors;
`localStorage` progress confirmed intact.

## Exact-reference rebuild — what changed

Asked to match the reference mockup (`dashboard-overview-reference.png`) as closely as possible rather
than an approximation, with explicit permission to prioritize visual fidelity over backend completeness
(use display values / UI-only affordances where the data model doesn't fully support a feature yet,
rather than omitting it).

**Hero:** taller (`min-h-[230px] md:min-h-[255px]`, was ~180–210px), mascot much bigger (92×65 → 148×104),
bigger speech bubble, bigger title (fluid clamp raised to 1.75rem–2.75rem, was 1.5rem–2.5rem). Fixed a
real bug this surfaced: the hero's generated background (`hero-illustration.svg`) had its moon positioned
where it now collided with the taller hero's "Edit Goals" button — moved the moon down/right in the SVG,
verified clear in-browser.

**Study Plan card:** restructured from stacked to the reference's actual two-column block — duration
slider/presets on the left, "Balanced Plan" panel on the right of the *same row*, with a bulleted
New/Review list instead of one inline line. The side-by-side split only activates at `2xl:` — this card
is one of three columns, so it stays narrow until quite wide viewports; splitting earlier (tried `sm:`
first) caused the "How much time..." label to wrap word-by-word in the squeezed column at ~1280px,
caught and fixed by checking a real laptop-width screenshot, not just desktop.

**Today's Path:** added the reference's "View Path" header action and a small colored skill-icon badge
per step (reusing `SKILL_THEME`) next to each numbered/state circle — previously only the number circle
existed. **Achievements:** added "View All" (header) and "View All Achievements →" (footer) actions,
bigger featured-badge panel. Both new sets of view-all/view-path buttons perform a real action (scroll
their own card into view) rather than linking to pages that don't exist — per the "no dead buttons"
standard held throughout this project, balanced against the new instruction to show the UI even where
the underlying feature (a dedicated path/achievements page) isn't built.

**Stat cards & Weekly Goal:** bigger padding/ring/numbers to match the reference's roomier proportions;
added the reference's "View Progress" affordance to the Weekly Goal card, shown honestly disabled (muted,
lock icon) since there's no Progress page yet, consistent with the sidebar's existing "Soon" treatment.

**Bottom banner:** bigger (min-height 100px → 125px), bigger mascot, illustration opacity raised so the
dotted path/torii reads more clearly.

**Trade-off, stated plainly:** loosening padding back up to match the reference's roomier feel (explicitly
requested — "cards are too compressed", "do not cram the content") reintroduces a small amount of scroll
that earlier passes had eliminated. At 1600×1000 (matching the reference image's own canvas) the page is
now ~70px taller than the viewport. This is the correct trade-off given the explicit instruction to
prioritize matching the reference's spacing over the earlier zero-scroll constraint.

**Bug caught and fixed during verification:** the stat cards' bigger padding/gap caused "Studied Today" /
"Keep it going!" to visually overflow past the card's right edge in the 2-column mobile grid (text set to
`whitespace-nowrap` with no room). Fixed with responsive padding (`p-3.5 sm:p-5`) and `truncate` instead
of `nowrap` on the label/sublabel lines, verified clean on a real mobile screenshot afterward.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. In-browser at 1600×1000 (matching
the reference's own canvas), 1280×900 (laptop), and 375×812 (mobile) — screenshotted and compared each
against the reference directly, not just glanced at. Confirmed real interactions: "Continue Learning"
routes to `/vocabulary` for the real featured badge; Grammar page confirmed unaffected (different, narrower
page width, chapter-map still intact). Zero console errors throughout; `localStorage` progress confirmed
intact.

**Remaining known gaps vs. the reference** (flagged, not hidden): the achievement badge grid will look
mostly locked/grey for a real user with limited progress (1/8 earned here) versus the reference's
demo-data-colorful grid — this is correct, honest behavior (real data, not staged), not a bug. The
bottom banner's mountain/torii is a generated illustration, not the reference's original artwork (not
present in this project's asset pack).

## Fluid typography — what changed

Asked whether text could also scale continuously with screen size, the way the layout now does, rather
than jumping at fixed breakpoints.

Added a small, named set of reusable fluid-type classes to `src/index.css` (per the earlier working
agreement to prefer reusable classes over ad-hoc sizes), each using CSS `clamp(min, preferred, max)`
so the size grows and shrinks continuously with viewport width instead of snapping between 2–3 fixed
steps: `.text-fluid-hero-title`, `.text-fluid-hero-sub`, `.text-fluid-stat-value`,
`.text-fluid-section-title`, `.text-fluid-milestone`. Applied to the Dashboard's headline-level text —
the hero greeting and subtitle, each stat card's primary number, the three section-card titles, the
Achievements featured badge title, and the bottom strip's message/milestone text. Deliberately **not**
applied to small helper/label text (card sublabels, badge counts, etc.) — scaling every line tends to
look inconsistent rather than premium, so those stay at their normal fixed Tailwind sizes.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. Measured the actual computed
`font-size` of the hero title directly (not just eyeballed) at three widths: 24px at 375px (mobile, floors
at the class's minimum), 35.68px at 1440px (mid-range, matches the clamp formula's calculated value
exactly), 40px at 2000px (ceilings at the class's maximum) — confirms it's genuinely continuous, not
just an extra breakpoint step. Zero console errors; `localStorage` progress confirmed intact.

## Fill-viewport-height fix — what changed

Feedback (with a real screenshot on a wide, ~1024px-tall window): after the width fix, the Dashboard now
correctly filled the browser horizontally, but a large empty dark gap appeared below the bottom strip —
the content itself had a fixed, content-driven height (from all the earlier compact-spacing passes) that
didn't grow to use extra vertical room on taller screens, so it just looked unfinished/cut short rather
than reaching the bottom of the window.

**Root cause:** every section in `Dashboard.tsx` sat in normal block flow with heights driven purely by
their own content/padding — there was no mechanism for the layout to *use* extra vertical space when the
viewport was taller than the content's natural height, only ways to make the content itself smaller or
bigger.

**Fix:** restructured the Dashboard's root as a flex column (`flex flex-col md:h-full`, matching `<main>`'s
own resolved height) with the hero, stats row, and bottom strip pinned to their natural size
(`shrink-0`) and the middle three-card row (Study Plan / Today's Path / Achievements) set to grow
(`md:flex-1 md:min-h-0`). That middle row now absorbs any extra vertical space — its cards get taller and
the bottom strip is pushed down to sit flush with the bottom of the viewport, instead of leaving raw page
background exposed underneath it. Scoped to `md:` only, so mobile keeps its original natural-height
stacked scroll (a phone screen isn't the "dead space" case this was fixing).

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. In-browser: at a 2000×1024 window
(matching the reported screenshot), measured the gap below the bottom strip directly — 16px, exactly
`<main>`'s own bottom padding, i.e. genuinely zero leftover dead space now. Re-checked at 1440×900 (strip
sits flush at the bottom, cards visibly taller). Checked a deliberately short 1440×700 window to confirm
this doesn't break the opposite case: the flex row gracefully falls back to a normal scrollbar with no
clipped or overlapping content (measured content height 811px against a 700px viewport). Mobile (375px)
confirmed unaffected — still a natural stacked scroll, since the fix is `md:`-scoped. Zero console errors;
`localStorage` progress confirmed intact.

## Full-width + taller footer fix — what changed

Feedback (with a real Chrome screenshot on a wide monitor): the Dashboard content still stopped well
short of the browser's right edge, leaving a large empty gap, and the bottom journey strip felt too short.

**Width fix:** the previous `max-w-[1500px]` cap on the Dashboard's `<main>` (from the earlier
scale/width pass) was itself now the bottleneck on wide displays — it was sized for ~1440–1920px screens,
but the reported screenshot was a ~2000px-wide window with ~340px of unused space beyond that cap.
Removed the cap for the Dashboard route entirely (other pages still keep `max-w-5xl`, per "Dashboard
only") — content now runs edge-to-edge with just consistent 32px side padding, confirmed via computed
style at a 2000px viewport (main content measured exactly 1744px = full width minus the 256px sidebar and
32px×2 padding).

**Footer height:** increased padding (`py-3.5` → `py-5`), added `min-h-[100px]` (was ~66–80px effectively
before), enlarged the mascot (60×35 → 84×49) and both text lines, so it reads as a proper closing section
rather than a thin bar.

**Trade-off, stated plainly:** the taller footer reopens a small amount of the vertical space just
reclaimed in the previous fit-to-viewport pass. Rather than silently shrinking the footer back down,
spacing was trimmed a little further elsewhere (page gaps, section-card padding, stat-card padding) to
partially compensate. Net result, measured directly rather than assumed: still zero scroll at the 900px
viewport height already confirmed working, and at a deliberately small 800px window the real content
height is 811px (an 11px overshoot) — a minor edge case for unusually short browser windows, called out
here rather than hidden, and easy to trim further on request if it matters for a specific target screen
size.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. In-browser: confirmed content now
fills full width at 2000px and 1440px viewports with no empty gap and consistent padding to the edge;
confirmed still zero-scroll at 900px height; footer visibly taller and more prominent at both widths.
Mobile (375px) re-checked — unaffected, still reads cleanly. Zero console errors; `localStorage` progress
confirmed intact.

## Generated illustration pass — what changed

The previous hero background (clean gradient + torii + moon, no hills) and the footer's small inline
icon strip (flat triangle "mountain" + a plain dashed line + basic torii lines) were both flagged as too
simple/placeholder-like compared to the reference's richer illustrated mood.

Per instruction, since the reference's exact source art isn't in this project's asset pack, two new
custom illustrations were generated and saved to `public/assets/kotobox-dashboard/generated/`:

- **`hero-illustration.svg`** — the new hero background. Built with actual illustration technique rather
  than flat shapes: three layered hill/mountain ridges at different depths (each its own gradient +
  opacity, darkest/nearest at the very bottom), a moon with a soft multi-stop glow, a torii gate rendered
  with a wood-tone gradient and a soft blurred rose glow behind it (sitting *into* the nearest hill layer
  for real depth), an ambient purple radial glow across the upper-right sky, and scattered stars of
  varying size/opacity (a couple with their own soft glow via `feGaussianBlur`). Replaces the earlier
  no-hills version — the previous "hills look like a wave" problem is avoided here by keeping every hill
  layer low-contrast, anchored to the very bottom of the frame, and behind/blended with the torii and
  glow rather than spanning the vertical center of the hero.
- **`journey-path-illustration.svg`** — the new footer illustration: layered hills, a winding dotted trail
  (a curved stroke with round "stepping-stone" dots, a couple of them glowing) leading toward a torii
  gate with its own soft glow, plus a few faint stars. Used as a low-key full-bleed background
  (`opacity-80`) behind the strip's existing mascot/text/milestone content, replacing the old
  `JourneyIcons` inline-shapes component entirely.

Both are hand-built SVG (this environment has no raster image generation available), using gradients,
layered opacity, and blur filters specifically so they read as finished illustrations rather than flat
placeholder geometry — matching the "dark navy, subtle mountains, soft moon, small stars, torii
silhouette, soft purple/blue depth" brief.

**Cleanup:** the two backgrounds these replaced (`public/assets/dashboard/backgrounds/hero-atmosphere.svg`
and the reused `night-landscape.svg`) were no longer referenced anywhere, so they were deleted rather than
left as dead files — confirmed via `grep` before removal and a clean rebuild after.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean, zero failed network requests (no
broken asset paths after the cleanup). In-browser at 1440×900: hero shows visible layered hills, a
glowing torii, and a glowing moon while the greeting text stays fully readable; footer shows the dotted
path leading toward its own glowing torii on the right, behind the message/milestone text. Mobile (375px)
re-checked for both — the hero's hills/torii still read at the cropped aspect, and the footer's path/glow
shows through subtly on the right without crowding the mascot or text. Zero console errors throughout;
`localStorage` progress confirmed intact.

## Fit-to-viewport pass — what changed

Feedback: the whole Dashboard should be visible without scrolling — matching the reference, which fits
hero through footer on one screen.

Measured the real problem first rather than guessing: at a 1440×900 browser, the Dashboard's total
content height was **1062px** — roughly 160px taller than the viewport, forcing a scroll to see the
bottom strip. Traced this to the previous pass's larger reference-matching type scale and padding, which
was appropriately sized per-element but never checked against a real vertical budget.

Trimmed spacing and sizing throughout, in order of impact:
- Hero: padding `p-6 md:p-8 lg:p-9` → `p-4 md:p-5`, title `text-3xl md:text-4xl` → `text-2xl md:text-[32px]`,
  mascot 124×87 → 92×65, no more fixed `min-h`.
- Stat cards: padding and ring size reduced, primary number `text-2xl md:text-[28px]` → `text-lg sm:text-xl md:text-2xl`.
- Section cards (Study Plan / Today's Path / Achievements): padding `p-6 space-y-5` → `p-3.5 space-y-2.5`;
  Today's Path step circles 48px → 36px with tighter row spacing; Achievements featured badge and grid
  images/padding reduced proportionally.
- Bottom journey strip: padding `py-5` → `py-3`, mascot 84×49 → 60×35.
- All inter-section gaps (`space-y-6`/`gap-4`/`gap-5`) tightened to `space-y-3`/`gap-3`.
- The page's own top/bottom padding is now slightly smaller specifically on the Dashboard route (other
  pages unaffected, keeping the "Dashboard only" scope).

None of this touched the underlying data/logic — only Tailwind sizing classes.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. In-browser: measured real content
height (not just eyeballed) at three viewport heights — fits with zero scroll at 900px and 800px, and
even at a deliberately small 650px window the true content height is **790px**, comfortably under what
any realistic browser window (after tabs/address bar chrome) provides. Confirmed visually at 1440×900 that
the hero, all four stat cards, all three section cards, and the bottom strip are simultaneously visible
with no scrollbar, while still reading as spacious rather than cramped. Mobile (375px) re-checked — still
scrolls naturally there (expected; the "fits on screen" requirement is a desktop concern, matching the
reference mockup which was itself a desktop screenshot) and reads cleanly. Zero console errors;
`localStorage` progress confirmed intact throughout.

## Hero background + footer fix pass — what changed

Feedback: the hero banner background and the bottom strip ("footer") still didn't match the reference.

**Hero background root cause:** the hero was reusing `night-landscape.svg` (the same background as the
bottom strip), which includes two large hill/mountain silhouette paths across its full width. The
reference hero has no mountains at all — just a clean dark gradient, a torii silhouette, a moon, and a
few stars. Because the hero is much wider than tall, `object-cover` was scaling that image up enough that
the hill curves became clearly visible as a wavy light-purple band across the hero, which is exactly what
was flagged as "wrong background."

Fixed by creating a **new, dedicated background** (`public/assets/dashboard/backgrounds/hero-atmosphere.svg`)
sized for a wide/short hero (1600×320 instead of 1600×500) with only the elements the reference actually
shows: sky gradient, a soft purple glow, the torii silhouette, a moon, and scattered stars — no hills.
Positioned and iterated in-browser (the moon initially overlapped the N5/N4 + Edit Goals buttons; nudged
left/down until clear in a live screenshot check).

**Footer root cause:** the bottom strip was reusing the same full `night-landscape.svg` at low opacity as
a stand-in for the reference's dedicated mountain/dotted-path/torii icon row, which doesn't exist in this
project's asset pack. Replaced with a small **coded SVG icon strip** (`JourneyIcons`, inline in
`BottomJourneyStrip.tsx`): a simple two-peak mountain glyph, a dotted connecting line, and a small torii
glyph — positioned between the message text and the milestone number, matching the reference's layout
order (mascot → message → mountain/path/torii → milestone). Hidden below `md:` since there's no room for
it alongside the message text on mobile without crowding (mirrors the same "mascot does not dominate"
mobile constraint used elsewhere).

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. In-browser at 1440px: hero now
shows a clean gradient + torii + moon + stars with no visible mountain band, and the moon confirmed clear
of the toggle/Edit Goals buttons; footer now shows the mountain → dotted line → torii icon strip between
the message and the milestone text, matching the reference's composition. Mobile (375px) re-checked — the
hero's decorative background is mostly cropped out of view at that aspect ratio (acceptable: the
requirement was "hero remains readable," which it does), and the footer's icon strip is hidden below
`md:` rather than being squeezed illegibly small. Zero console errors throughout;
`localStorage` progress confirmed intact.

**Remaining polish item:** the mountain/torii glyphs in the footer are simple coded shapes, not the
reference's original raster artwork (that specific asset file isn't in this project's pack) — could be
swapped for a closer match if that art is regenerated later.

## Dashboard scale/width fix pass — what changed

The first Dashboard redesign pass was structurally right but visually too small/narrow compared to the
reference — flagged with a real side-by-side comparison screenshot and a full-browser screenshot showing
a large empty gap on the right side of the screen.

**Root cause found and fixed:** `src/components/Layout.tsx`'s `<main>` element had `max-w-5xl mx-auto`
(1024px) applied globally — on a real desktop monitor this left roughly half the browser width empty,
which was the dominant cause of the "too narrow / too much empty space / feels like a compact widget"
feedback. Fixed by making the width conditional on route: the Dashboard (`/`) now gets
`max-w-[1500px]`, every other page keeps the original `max-w-5xl` — confirmed by screenshotting Grammar
after the change and seeing it untouched, per "redesign only the Dashboard."

**Typography and spacing scaled up** to match the reference more closely: hero title/mascot/bubble text
all larger with a taller hero section; stat cards bigger (64px→56px-on-mobile ring, larger primary
numbers, more padding); section card padding and title size increased; Today's Path circles/text bigger;
Study Plan's CTA button bigger and full-width; Achievements featured badge box bigger.

**Sidebar now includes all 10 reference nav rows** (previously only the 6 real module routes were
shown, to avoid dead links). Resolved by splitting them into two groups:
- The original 6 (Dashboard/Grammar/Vocabulary/Kanji/Reading/Listening) — unchanged `NavLink`s.
- 4 new rows below a thin divider: **Review** (a real link to `/vocabulary`, where SRS review actually
  lives), **Achievements** and **Study Plan** (real deep-links to those exact sections on the Dashboard,
  via a URL hash + a `useEffect` that scrolls to the matching element — works from any page, not just
  when already on the Dashboard), and **Progress** (shown disabled with a small "Soon" tag, since no
  analytics/progress page exists yet — genuinely nothing to link to, so it's honestly marked unavailable
  rather than wired to a fake destination). None of the four are dead buttons; three do something real,
  one is honestly disabled.
- Sidebar active-state is now a solid indigo pill (`bg-brand-600 text-white`) instead of a pale tint,
  matching the reference's contrast, and item height/padding increased.
- The sidebar Level card got bigger (larger mascot, larger type) to match the reference's presence.

**Achievements featured-badge CTA reworked:** the reference shows a "Claim" button; since there's no
reward-claim mechanic (by design, per the earlier phase), the CTA is a real **"Continue Learning"** button
that routes to whichever page actually earns progress toward that specific badge (e.g. routes to
`/vocabulary` for the Vocabulary Builder badge) — added a `route` field to each entry in
`src/lib/badges.ts`. Once a badge is earned, the CTA is replaced by a plain "Earned!" state (nothing left
to claim).

**Bottom journey strip enriched:** added the missing English subtitle line, and reused the existing
`night-landscape.svg` background (already used in the hero, and the only background asset in this
project's pack) at low opacity behind the milestone text so its torii/hill silhouette reads through —
the reference's dedicated mountains/dotted-path/torii illustration file isn't present in this project's
asset pack (`kotobox_dashboard_claude_ready_assets/`, at the project root; the literal path named in the
request, `public/assets/kotobox-dashboard/...`, doesn't exist on disk), so rather than inventing a new
image file, the real existing background asset was reused and a plain coded dashed-line divider added for
the "path" motif. Also fixed a real mobile bug found during verification: the strip's `flex-wrap` layout
let the milestone text visually crowd the mascot on narrow screens — changed to an explicit `flex-col` on
mobile / `flex-row` on `sm:` and up, verified clean on both breakpoints afterward.

**Mobile regression caught and fixed:** bumping the stat-card primary number to the requested larger size
caused values like "3 days" to wrap onto two lines in the narrow 2-column mobile grid. Fixed with a
responsive type scale (`text-xl sm:text-2xl md:text-[28px]`) plus `whitespace-nowrap`, verified clean at
375px afterward.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. In-browser at 1920px and 1440px
desktop widths: Dashboard now visibly fills the browser (confirmed main content computed width is exactly
1500px on a 1920px viewport, versus roughly 750px effective width before this fix); all four sidebar
"Soon"/real-link states checked (clicking "Review" from the Dashboard landed on `/vocabulary`; clicking
"Achievements" from `/vocabulary` navigated back to `/#achievements-section` and scrolled to the right
card; "Progress" confirmed genuinely disabled, not just styled to look disabled); Achievements'
"Continue Learning" button confirmed routing to `/vocabulary` for the real featured badge. Mobile (375px)
re-checked after both fixes above — stat cards and the bottom strip both read cleanly with no overlap or
wrapping issues, zero console errors throughout. Grammar page re-checked and confirmed to still use the
original narrower width and layout, untouched by this pass. `localStorage` progress confirmed
byte-for-byte intact throughout (streak, SRS cards, quiz results).

Quality check results: `npx tsc -b` — clean. `npx eslint .` — clean. `npm run build` — clean production
build.

**Remaining polish items:** the bottom journey strip's illustration is a reused background + a coded
dashed line rather than a dedicated mountains/torii graphic, since that specific asset file isn't in this
project's pack — a real one could replace it later if generated. The "Review" sidebar link currently
points at `/vocabulary` (where SRS reviews live today) rather than a dedicated review-only view.

**Next recommended screen:** none picked yet — awaiting approval before extending this visual language to
other pages or continuing to Speaking (Phase 8).

## Dashboard overview redesign — what changed

Requested as a scoped, Dashboard-only visual rebuild using a new asset pack the user generated
(`kotobox_dashboard_claude_ready_assets/`, at the project root — its own README/prompt call it
"Claude-ready assets"), following a reference screenshot at `00_reference/dashboard-overview-reference.png`
inside that folder. Only the subset of assets actually needed was copied into `public/assets/dashboard/`
(mascot PNGs, the 8 badge SVGs, and the night-landscape background SVG) — the source folder is left in
place as reference material but nothing imports from it directly.

**New sections built:** hero greeting (night-landscape background + waving mascot + speech bubble +
JLPT-level toggle + "Edit Goals" that scrolls to the real Study Plan card), 4 stat cards with real
circular-progress rings (Study Streak vs personal best, Studied Today vs today's chosen goal, Reviews Due
vs deck size, Weekly Goal bar), a restyled Study Plan card (same underlying duration slider/presets and
`calculateStudyPlan` logic as before — untouched), a new Today's Path card (a real, sequential rendering of
today's calculated plan plus a Warm Up/reviews step), a rebuilt Achievements card (featured badge + full
grid using the pack's real medal SVGs), and a closing "bottom journey strip" with a real XP-to-next-level
count. The sidebar also got new line-icon nav artwork from the same pack and a new Level/XP card above the
streak footer (`SidebarLevelCard`), since the sidebar is persistent chrome shown in the reference on every
page — its content wasn't touched beyond that.

**Design decisions made along the way (flagged for visibility, not hidden in the diff):**

- The reference mockup showed **XP, a Level, a Weekly Goal ring, and a badge "Claim" button** — none of
  which existed in `ProgressState`. Asked the user how to handle this rather than guessing; they chose
  "real derived XP/Level, no fake reward economy." Implemented as a pure function
  (`src/lib/xp.ts::calculateXp`) over real completions (grammar points, vocabulary SRS cards, kanji,
  reading passages, listening sessions, quiz correct-answers) — never stored, never a schema field, so it
  can't drift from real progress. Level = `floor(xp / 100) + 1`, with a small cosmetic title ladder
  (Beginner → Learner → Explorer → …). Weekly Goal is a real count of the last 7 calendar days with any
  minutes logged (`src/lib/dashboardStats.ts::studyDaysInLastWeek`). The badge "Claim" button was dropped
  entirely (no reward to claim) — the featured achievement slot just spotlights whichever real badge is
  closest to completion.
- The reference's "Daily Goal: 60 items" selector (20/40/60/80/100) was **not** rebuilt as a parallel fake
  control — the app's real study-plan logic is minutes-based (10 min–4 hrs, already unit-tested against
  exact worked examples), so the existing `StudyDurationPicker` was kept as-is inside the restyled card
  rather than inventing a second, disconnected items-based system.
- The reference's "Balanced Plan" New/Review percentage is a **real derived ratio** — Review % = today's
  actual due SRS count; New % = real remaining (never-learned) content across today's plan skills
  (`calculateBalancedPlanSplit`), not a hardcoded 40/60.
- "Today's Path" step done/current/later states reflect genuine signals available on the Dashboard alone
  (SRS caught-up for the Warm Up step; full lifetime mastery for content skills) rather than per-day
  per-skill completion, since building the latter would require adding completion hooks to five other
  pages — out of scope for a "Dashboard only" phase. Documented here rather than silently approximated.
  Every step with a real route stays clickable regardless of state (no artificial locking, consistent with
  the Grammar chapter-map phase); a plan step for a skill with no built page yet (Speaking) renders as a
  plain, clearly-labeled "Coming soon" row instead of a dead link.
- The reference's sidebar nav list included Review/Progress/Achievements/Study Plan as separate links —
  those pages don't exist yet, so they were **not** added (would be dead routes). Only the 6 real routes
  (Dashboard/Grammar/Vocabulary/Kanji/Reading/Listening) got the new icon artwork.
- The reference's footer bell/settings/user-avatar row wasn't built — no notifications or accounts exist in
  this app, so that row would have been fake chrome. The existing working sound-mute/dark-mode toggle row
  was kept unchanged.

**Bug caught and fixed during verification:** the featured-achievement box and bottom journey strip
initially used `brand-950`, a shade that doesn't exist in this project's color scale (`--color-brand-50`
through `--color-brand-900` only) — Tailwind silently dropped the dark-mode gradient class, leaving a
light gradient bleeding through in dark mode with low-contrast text. Caught via an in-browser screenshot
check, fixed by using `brand-900` (defined) instead.

Verified: `npx tsc -b`, `npx eslint .`, `npm run build` all pass clean. In-browser: Dashboard renders
correctly in both dark and light mode at desktop and mobile (375px) width with zero console errors;
changing the duration preset live-recalculates Today's Path and the stat cards (spot-checked 30 min →
Vocabulary/Grammar/Listening 10 min each, matching the documented worked example); clicking a Today's Path
step navigates to the real page (checked Grammar, landed on the existing chapter/path-map view unaffected);
Listening page and its sidebar (now with new nav icons + Level card) confirmed unaffected; `localStorage`
progress (streak, SRS cards, quiz results, completed IDs) confirmed byte-for-byte intact throughout.

Quality check results: `npx tsc -b` — clean, zero errors. `npx eslint .` — clean, zero errors/warnings.
`npm run build` — clean production build.

**Remaining polish items** (not blockers, just noted for a future pass): the mascot speech-bubble message
only has three fixed variants (due-reviews / active-streak / fresh-start) rather than a larger rotating
set; the Today's Path "fully mastered" done-state is a lifetime-mastery proxy rather than true per-day
tracking (documented above); Achievement badge tooltips are native `title` attributes (no custom hover
card) for now, consistent with how the original Badges component worked.

**Next recommended screen:** none picked yet — this phase was scoped to the Dashboard only per explicit
instruction. Awaiting approval before extending this same visual language to other list pages (Vocabulary/
Kanji/Reading/Listening still use the pre-redesign look) or continuing to Speaking (Phase 8).

## Chapter/path map phase — what changed

Requested from a moodboard-direction message ("collectible badge/chapter map energy") — the user picked
"Build a chapter/path map" specifically, out of a clarifying question, rather than a new mascot/typography
round.

- **New reusable component** `src/components/PathMap.tsx` — an original zigzag node layout (left/center/
  right alternating, dashed vertical guide line down the middle) rather than a flat grid or a copy of any
  specific product's skill tree. Each node is a rounded clickable circle:
  - **Done** — filled with the skill's gradient color + a checkmark icon.
  - **Up next** (first not-done node) — same filled gradient, plus a soft pulsing ring
    (`.animate-path-pulse`, added to `src/index.css` inside the existing `prefers-reduced-motion:
    no-preference` block so it's fully disabled for users who need reduced motion) and the fox mascot
    perched above it.
  - **Not yet reached** — dashed outline, muted number, no fill.
  - **Deliberately not locked** — every node stays clickable regardless of state, since gating navigation
    would change how the app actually works; only the visual state communicates progress. This was a
    conscious decision documented in the component's own JSDoc.
- **Wired into Grammar first** (`src/pages/grammar/GrammarList.tsx`) as the pilot module — kept the
  existing header (category badge, title, completion count) and the All/N5/N4 level-filter chips exactly
  as they were, only replaced the `Card` grid with `<PathMap skill="grammar" nodes={...} onSelect={...} />`.
  Navigation now goes through `useNavigate()` (imperative, since `PathMap` takes an `onSelect(id)` callback)
  instead of wrapping each item in a `<Link>`.
  Other list pages (Vocabulary, Kanji, Reading, Listening) were **not** touched this pass — Grammar was the
  explicitly requested first example.

Verified: `npx tsc -b`, `npx eslint .`, and `npm run build` all pass clean (zero errors — the component and
page rewrite from the interrupted prior session were already correct, no fixes were needed). In-browser:
Grammar page renders the path map correctly with real progress data (point 4, `〜たいです`, correctly shown
as completed out of order while 1–3 show not-started, and point 1 correctly highlighted as "up next" with
the pulsing ring + mascot) — clicking a node navigates to the right grammar detail page. Mobile (375px)
checked — zigzag layout stays readable and uncluttered, bottom tab bar unaffected. Dashboard re-checked and
fully unaffected (streak, studied-today minutes, study plan, badges all intact) — zero console errors
throughout.

## Second visual-identity pass — what changed (moodboard-inspired, not copied)

Requested after seeing a Duolingo-style moodboard for inspiration only — explicitly not to copy its
mascot, logo, colors, or screens. Five changes:

1. **Typography** — added Google Fonts "Baloo 2" (rounded display weight) for all `h1`/`h2`/`h3`, and
   swapped body text from Inter to "Nunito" (also rounded, more readable at small sizes than Baloo 2
   would be). Japanese text is unaffected — `.jp-text` has higher CSS specificity than the bare element
   selectors, so kana/kanji headings (e.g. grammar point titles) correctly keep the Japanese font stack
   instead of falling back to Baloo 2.
2. **Logo polish** (`src/components/Logo.tsx`) — same torii-gate mark as before, slightly larger corner
   radius and an added gloss highlight for more shine/depth.
3. **Mascot replaced: panda → full-body fox spirit** (`src/components/Mascot.tsx`) — same prop interface
   (drop-in replacement), but a full standing/sitting creature now: pointed ears, bushy two-tone tail,
   a body with a cream belly patch and small paws, and — the one brand-tie-in accessory — a small indigo
   scarf (ties it to the app's own color identity rather than a generic fox). Warm orange/cream palette
   is deliberately distinct from Duolingo's owl (different animal, different silhouette, different
   colors) and from the previous panda (which was itself already original, just felt flat/childish).
4. **Category icon badges** (`src/components/CategoryIcon.tsx`) — changed from rounded-square to fully
   circular badges, matching the moodboard's rounder "chapter icon" feel; same six per-skill gradient
   colors as before.
5. **More tactile primary buttons** (`src/lib/buttonStyles.ts`) — increased corner radius
   (`rounded-xl` → `rounded-2xl`), bumped to bold font weight, and added an inset top-highlight gloss line
   alongside the existing bottom press-ledge shadow, for a rounder/bouncier "game button" feel.

Verified: `npx tsc -b`, `npx eslint .`, and `npm run build` all pass clean. In-browser: Dashboard (new
fox mascot, rounded headings, circular badges, tactile "Start studying" button all confirmed rendering
correctly, zero console errors), Listening page (circular category badge, tactile Play button, both TTS
modes unaffected, zero console errors), mobile layout (375px) checked on Dashboard — duration
slider/presets, study plan list, and buttons all still readable and uncluttered. Progress confirmed
intact throughout (streak, SRS cards, quiz results all unchanged from before this pass) — nothing here
touched `localStorage` schema.

## Known limitation from this pass

Time-boxed given the usage-limit warning: the fox mascot's proportions were designed and reasoned about
carefully but only checked via one in-app screenshot pass (not the isolated large-scale render-and-adjust
loop used for the panda's muzzle fix last time). If it looks off at a specific size on closer inspection,
it's the next thing to refine.

## Visual identity polish phase — what changed

Requested because the previous panda mascot "felt too childish and too flat." Five focused changes:

1. **Original logo/brand mark** (`src/components/Logo.tsx`) — a minimal torii-gate silhouette (two legs +
   two crossbars) in a rounded gradient square. Deliberately a *separate* element from the mascot (logo
   = brand chrome in the nav/favicon, mascot = companion character on the Dashboard/celebrations), the
   way most modern products keep those two identities distinct. `道` (dō) means "way/path", and a torii
   marks the entrance to a path — an original nod to the app's own name rather than a literal
   illustration. Replaced the leftover default Vite favicon with a static version of the same mark.
2. **Panda mascot redesign** (`src/components/Mascot.tsx`) — same character, same prop interface (drop-in
   replacement, nothing else needed to change), but rebuilt with soft gradients (radial gradient on the
   head, gradient on the dark patches), a radial-gradient muzzle patch that blends instead of showing a
   hard sticker edge, gloss highlights on the head and eyes, a small catchlight in each pupil, and a soft
   grounding shadow beneath the character. This is what took it from "flat clipart" to a "premium
   sticker" look — verified visually by rendering it at 300px in isolation before and after the muzzle
   fix (the first pass had a visible hard-edged muzzle patch; fixed with a radial gradient fade).
3. **Category icon badges** (`src/components/CategoryIcon.tsx` + `src/lib/skillTheme.ts`) — each of the
   six skills (Grammar, Vocabulary, Kanji, Reading, Listening, Speaking) now has its own gradient-badge
   icon (indigo, emerald, amber, sky, violet, rose respectively) with a soft shadow + inner gloss
   highlight. Used in the Dashboard's study-plan list and each module's page header — deliberately *not*
   added to the sidebar nav, since colored badges there would compete with the active-state highlight and
   add clutter rather than clarity.
4. **Tactile primary buttons** (`src/components/PrimaryButton.tsx` + `src/lib/buttonStyles.ts`) — a
   "press-depth" style: a solid bottom shadow-ledge at rest, a slight lift on hover, and the button
   flattens down (translate + shadow removal) on press, giving a satisfying game-like click without
   copying any specific product's exact button style. Applied to every genuine single primary action
   across the app (Dashboard "Start studying", Grammar/Reading "Start quiz/questions", quiz Next/Finish,
   Vocabulary review Show-answer/Review-link, Listening Play/Check/Next/Start-new-session) — deliberately
   *not* applied to segmented controls or multi-choice actions (level toggle, filter chips, SRS
   Again/Hard/Good/Easy, voice/mode toggles), since those aren't "the one primary action" and making
   everything chunky would itself become visual noise.
5. **Medal-style badges** (`src/components/Badges.tsx`) — earned badges now render as a gold/amber
   gradient medal circle (distinct from the app's indigo brand color, so it reads as a reward rather than
   more UI chrome) with a gloss highlight; unearned badges show a small lock icon overlay instead of just
   reduced opacity, communicating "locked" more explicitly.

All five verified with `npx tsc -b`, `npx eslint .`, `npm run build`, and `npm run test` passing clean,
plus in-browser checks (including a full server restart to rule out stale HMR errors, which came up
twice during this pass and both times turned out to be transient — confirmed via a fresh server + tab
producing zero console errors) across Dashboard, all six module pages, Listening (both TTS modes, both
practice modes), a full Grammar quiz run-through, and mobile layout (375px) for Dashboard and Listening.
Progress (SRS cards, completed grammar, learned kanji, quiz results, streak) confirmed intact throughout
— nothing in this phase touched `localStorage` schema or reset anything.

## How to run the app

```bash
cd "/Users/yaschatorfs/Desktop/Application Japanese N5-N4"
npm install      # only needed once, or after pulling new deps
npm run dev      # starts BOTH the Vite frontend (http://localhost:5173) and the backend proxy (5174)
```

Other commands:
```bash
npx tsc -b       # typecheck only
npx eslint .     # lint only
npm run test     # Vitest — currently the study-plan calculator's test suite (11 tests)
npm run build    # full production build (typecheck + vite build) — currently passes clean
npm run dev:web    # frontend only, no backend
npm run dev:server # backend proxy only
```

Node.js v24.18.0 and npm 11.16.0 are installed on this machine (not present at project start — installed
via the official nodejs.org pkg installer).

## What changed in this phase

1. **Original panda mascot** (`src/components/Mascot.tsx`) — replaced the earlier abstract
   speech-bubble character with an original panda (rounded head, dark ears/eye-patches in a navy-indigo
   tied to the app's palette rather than flat black, expressive eyes, three moods: neutral/happy/sleepy,
   optional streak-flame accessory). Same component interface as before, so it's a drop-in replacement —
   no other file needed to change. Used in the sidebar, mobile header, and Dashboard greeting.
2. **Custom study duration planner** — see dedicated section below.
3. **Browser TTS voice picker, Google Cloud TTS backend prep, sound effects, badges, celebration
   screens, streak-pulse feedback, and most micro-interactions were actually built in the *previous*
   session (before this one) and were already verified working** — this phase's request substantially
   overlapped with that earlier work. What was genuinely new/changed this phase beyond the mascot and
   duration planner:
   - Broadened hover/press micro-interactions (hover-lift + shadow + active-press scale) onto the
     clickable Grammar/Kanji/Reading list cards, which previously only had a color-transition hover.
   - Added a global `prefers-reduced-motion: reduce` CSS safety net (forces all transition/animation
     durations to ~0) so every hover/press/keyframe effect in the app respects that OS preference, not
     just the handful of keyframe animations that were already scoped to `no-preference`.
   - Added a real README (the file was still the default Vite template) with full run instructions and
     Google Cloud TTS setup steps.
   - Added a `test` npm script and a real Vitest suite for the new study-plan calculator.
4. **Dashboard rewrite** to host the duration picker and use the calculated plan instead of the old
   fixed `src/data/studyPlan.ts` (deleted — nothing else referenced it).

## How the custom study duration planner works

New file: `src/lib/studyPlanCalculator.ts` — a pure, unit-tested function,
`calculateStudyPlan(minutes)`, completely independent of any component (per the "reusable helper, not
hardcoded in the dashboard" requirement).

- Range: 10–240 minutes, slider step 5 minutes. Presets: 10 min, 30 min, 1 hr, 2 hrs, 3 hrs.
- Each skill has a *weight* (Grammar/Vocabulary highest, Kanji/Reading next, Listening/Speaking lowest)
  and a *minimum minutes to include* threshold (Vocabulary/Listening from the very first minute, Grammar
  from ~25 min, Kanji/Reading from ~55 min, Speaking from ~110 min) — this is what makes short sessions
  skip categories instead of forcing tiny useless blocks into all six.
- Minutes are distributed proportional to weight among included skills, rounded to clean 5-minute
  blocks, then any rounding drift is corrected by nudging the most over/under-allocated category so the
  plan **always sums to exactly the requested duration**.
- Verified to match the user's own worked examples exactly:
  - 10 min → Vocabulary 5, Listening 5
  - 30 min → Vocabulary 10, Grammar 10, Listening 10
  - 60 min → Grammar 15, Vocabulary 15, Kanji 10, Reading 10, Listening 10
  - 120 min → Grammar 25, Vocabulary 25, Kanji 20, Reading 20, Listening 15, Speaking 15
- `src/lib/studyPlanCalculator.test.ts` (11 Vitest tests): exact matches for the four anchors above,
  "always sums to the requested total" and "never a block under 5 min" checked across the *entire*
  10–240 range in 5-minute steps, "category count never decreases as duration grows", and the
  skipped-categories note wording.
- The Dashboard (`src/pages/Dashboard.tsx`) shows a slider + preset chips
  (`src/components/StudyDurationPicker.tsx`), persists the chosen duration to `localStorage`
  (`src/lib/studyDurationPref.ts`), and live-recomputes the plan on every change. Skipped skills are
  shown greyed-out with "skipped today" rather than removed, so the full six-skill picture is still
  visible. "Start studying" navigates to the first *included* skill that has a real route (falls back to
  Grammar) — verified this correctly goes to `/vocabulary` for a 10-minute plan (Grammar excluded) and
  `/grammar` for a 2-hour plan.

## How browser TTS works

`src/lib/tts/browserTts.ts` wraps the Web Speech API:
- `useJapaneseVoices()` — a `useSyncExternalStore` hook exposing the live list of installed Japanese
  voices. Fixed a real bug here: `getVoices()` often returns empty on the very first call right after
  page load (voices load asynchronously) and `'voiceschanged'` doesn't fire reliably in every browser —
  there's a bounded poll fallback (0/150/500/1500ms) in addition to the event listener.
- `pickBestJapaneseVoice()` — best-effort heuristic (prefers voices with "google"/"kyoko"/"enhanced"/
  "premium"/"neural" in the name, then non-local/network voices, then just the first available) since
  browsers don't expose an actual quality signal.
- The selected voice is saved to `localStorage` and restored on reload; `src/components/tts/
  BrowserVoiceSelector.tsx` provides the dropdown, shows "Using: <voice name>", a "Test voice" button,
  and friendly fallback copy ("No Japanese browser voice found...") when the list is empty.
- The Play button is `disabled` (not silently a no-op) whenever no voice is available or Google Cloud
  mode is selected but unconfigured — never a dead button.

## How Google Cloud TTS can be added later (currently optional/off)

A small Express backend (`server/index.ts` + `server/googleTts.ts`, run via `tsx`) exposes:
- `GET /api/tts/status` → `{ available: boolean, reason?: 'disabled' | 'missing_config' }`
- `POST /api/tts` → returns `audio/mpeg` bytes, or `503 { error: 'not_configured' }` if not set up

The frontend (`src/lib/tts/googleTts.ts` + `src/lib/tts/ttsService.ts`) never talks to Google directly
and never sees credentials — it only calls our own `/api/tts*` routes (proxied by Vite's dev server so
there's no CORS setup needed). Generated audio is cached per `text+rate` in memory for the session so
replaying a sentence doesn't re-call the API. `src/components/tts/VoiceModeSelector.tsx` shows "Natural
voice (unavailable)" and disables that option — with the exact copy requested: *"Natural voice uses
Google Cloud Text-to-Speech when configured. Without it, Kotobox falls back to your browser's Japanese
voice. Voice quality depends on the selected provider and available Japanese voices."* (copy text itself
updated in-app to say "Kotobox" too.)

To actually enable it later: enable the Cloud Text-to-Speech API on a GCP project, create a service
account + JSON key (stored under the gitignored `server/credentials/`), copy `.env.example` to `.env`
and fill in `GOOGLE_CLOUD_TTS_ENABLED=true`, `GOOGLE_CLOUD_PROJECT_ID`, and
`GOOGLE_APPLICATION_CREDENTIALS`. Full steps are in `README.md`. Swapping to a different TTS provider
later only means editing `server/googleTts.ts` and the one route — the frontend interface
(`useTtsPlayer`) doesn't change.

**What still needs setup from you:** nothing, to keep using the app as-is. Only if you want the Google
Cloud "natural voice" option: a GCP project with billing enabled, the Text-to-Speech API turned on, and
a service account key. This was **not** end-to-end tested against a real Google Cloud project in this
environment (no credentials available) — the disabled/missing-config path is fully verified; the
actually-configured path should be smoke-tested once you have real credentials.

## What UX/gamification improvements were added

- **Badges** (`src/components/Badges.tsx`) — 8 badges derived entirely from real progress data (grammar
  points completed, words learned via SRS cards, kanji learned, reading passages completed, listening
  sessions logged). No separate fake tracker; earning one is just crossing a real threshold.
- **Celebration screens** (`src/components/Celebration.tsx`) — shared across Grammar quiz, Reading quiz,
  and Listening session-complete, with mascot mood tied to score, consistent "nice work" copy
  (`src/lib/encouragement.ts`), and a fade/scale-in entrance animation.
- **Streak-pulse feedback** — the streak counter briefly pulses (plus a synthesized chime) when the
  streak actually increments, via `src/lib/useStreakPulse.ts`.
- **Sound effects** (`src/lib/sound.ts`) — correct/wrong/complete/milestone tones synthesized with the
  Web Audio API (no external audio files), wired into `QuizPlayer`, `ReadingQuestionPlayer`, and
  Listening's answer checks. Mute toggle in the sidebar, persisted locally, defaults to on but subtle.
- **Encouraging/honest empty and skipped states** — e.g. the study plan explicitly explains *why* a
  category was skipped rather than just omitting it silently.
- Fixed two real, previously-unnoticed gaps while wiring all this up: the Dashboard's "Start today's
  session" button pointed at a `/session` route that was never built (now points at a real, relevant
  page), and Reading comprehension results were never persisted anywhere (now saved via
  `recordQuizResult` + a new `completedReadingIds` field).

## Known limitations

- Speaking practice, quizzes/mock tests, and the roadmap/analytics phase are not built yet (by design —
  paused for approval).
- The "daily guided session" that strings all six skills into one flow (original Phase 2) is still not
  built; the Dashboard's plan links to individual section pages instead.
- Google Cloud TTS's "configured and working" path is untested against a real project (see above) — only
  the disabled/unconfigured path has been verified in this environment.
- `npm run test` currently only covers the study-plan calculator; the SRS scheduler, streak logic, etc.
  are exercised through manual browser verification rather than automated tests.

## Quality checks performed this phase

`npx tsc -b`, `npx eslint .`, `npm run build`, and `npm run test` all pass clean with zero
errors/warnings. In-browser, with zero console errors throughout: Dashboard (mascot, badges, level
toggle, duration picker at 10 min/30 min/1 hr/2 hr — all matched expected distributions exactly, chosen
duration persists across refresh), Listening page (voice selector, Test voice, Play button disabled
states, Google Cloud shown correctly as unavailable via a live `/api/tts/status` check, answer
correct/wrong feedback with sound), sound mute toggle (persists, icon updates), "Start studying" routing
(verified it goes to `/vocabulary` when Grammar is excluded and `/grammar` when included), Vocabulary
page (unaffected, confirmed still working), and mobile layout (375px) for the Dashboard, duration picker,
and badges grid.

## Next recommended phase

Awaiting user approval. When approved, recommended order:
1. Phase 8 — Speaking (Web Speech recognition, mirroring the Listening module's fallback pattern).
2. Phase 2 — Daily learning flow, now that all six content skills exist and the duration planner already
   computes a real per-skill plan to drive it.
3. Phase 9 (Quizzes/mock tests) and Phase 10 (Roadmap/analytics) — both can reuse `QuizPlayer` and
   existing data rather than inventing new content.

## Prompt to paste next time to continue

```
Continue building the Kotobox Japanese N5→N4 app in
"/Users/yaschatorfs/Desktop/Application Japanese N5-N4". Read PROJECT_STATUS.md first for full context.

The app was renamed from "Kotoba Do" to "Kotobox" and the visual identity pass is done and verified: fox
mascot (not a panda anymore), original torii logo, circular category badges, tactile press-depth buttons,
rounded gamified typography (Baloo 2 / Nunito), custom study duration planner, sound effects, medal-style
badges, celebrations, micro-interactions, reduced-motion support. Continue with Phase 8 (Speaking),
Phase 2 (Daily learning flow), Phase 9 (Quizzes/mock tests), and Phase 10 (Roadmap/analytics), in that
order. Same rules as before: no fake placeholder features, verify everything by actually running the app
and clicking through it (not just typecheck/build), fix errors before moving on, keep the UX calm/clean/
responsive, and update PROJECT_STATUS.md again before ending the session if we hit limits again.
```

### Feature — JLPT Mock Exam (gamified, 2026-08-02)

Built the biggest missing capability: a **timed, JLPT-style mock exam**. New `/mock` route + "Mock Exam"
nav entry (`MockTestNavIcon`). Designed under the impeccable skill against the project's own design
system (twilight-indigo brand, Nunito/Baloo, generous rounding) and PRODUCT.md's "calm confidence, not
carnival" rule — gamified but measured, and **every number is real** (no fabricated stats).

**Architecture** — a self-contained three-phase state machine in `src/pages/mock/MockTest.tsx`:
- **Lobby** (`components/mock/ExamLobby.tsx`): level selector (N5/N4/N3) showing real best score + pass
  dot per level, a format panel (question count / minutes / 60% pass line + per-section counts), and the
  personal-best callout. Begin/Retake CTA.
- **Runtime** (`components/mock/ExamRuntime.tsx`): immersive focus mode — sticky countdown timer (amber
  under 20%, red pulse under 30s, auto-submits at 0), segmented section-colored progress bar, one MCQ at a
  time with the JP stimulus large, A–D options, **full keyboard support** (1–4/A–D select, ←/→ navigate,
  F flag), flag-for-review, a jump-anywhere question palette, and an inline exit/finish confirm (warns on
  unanswered). No mid-exam answer reveal — real-exam feel.
- **Results** (`components/mock/ExamResults.tsx`): animated `ScoreRing` (SVG sweep with a pass-line tick),
  pass/fail verdict vs the real 60% line with mascot mood, per-section breakdown bars, "New personal best"
  + "+N XP" pills, and a collapsible full answer review (correct/your-choice/explanation, colour-coded).
  One confetti burst **on pass only** (mirrors LevelUpDialog; disabled under reduced motion).

**Content & data** — `src/lib/mockExam.ts` assembles each paper from real content: vocab reading→meaning,
kanji→meaning, authored grammar `quiz` items, and authored reading-comprehension questions; distractors
are same-level, deduped; sizes sit safely under every pool (N5 30Q/20m, N4 35Q/25m, N3 36Q/30m). Scoring
+ per-section tally are pure functions. Persistence: new `mockExams` field on ProgressState +
`recordMockExamResult`, which also logs a `mock-test` QuizResult so its correct answers feed the **derived
XP** score automatically (verified: sidebar XP went 0 → 4 after a 2-correct attempt). Spread-safe migration.

**Tests** — `src/lib/mockExam.test.ts` (14 new, 45 total): exact size, every section filled, 4 unique
options + in-range correct index per question, stable section order, and scoring (100% → pass, all-null →
0). `tsc`/`eslint`/`build`/`vitest` (45) all clean; MockTest is code-split (8 KB gz).

**Verified in-browser** (N5): lobby, exam runtime (question render, answer-select highlight, live timer,
question palette, flag), the finish-confirm dialog, and the results screen (amber ring at the scored %,
"Not quite yet" verdict, section bars, personal-best + XP pills, answer review) — zero console errors. The
fail path correctly shows **no** confetti (calm-not-carnival). The pass path is the same components with a
green ring, "You passed!" copy, and the confetti burst.

### Mock Exam — official JLPT alignment + listening + UX fixes (2026-08-02)

Reworked the mock exam to follow the **official JLPT** format & scoring (sourced from jlpt.jp: the
test-sections and pass-mark pages), keeping our own original questions (official items are copyrighted).

- **Official 0–180 scaled scoring** (`src/lib/mockExam.ts`, `scoreExamOfficial`): each scoring section's
  raw accuracy maps onto its real range, and passing now requires the **overall pass mark AND every
  sectional minimum** — N5 80/180 (≥38/120, ≥19/60), N4 90/180 (same), N3 95/180 (≥19 in each of three
  0–60 sections). A section can drag a high total to a fail (`failedOnSection`), exactly like the real test.
- **Official section grouping:** N5/N4 combine Language Knowledge (Vocab/Grammar) + Reading into one
  0–120 section + Listening 0–60; N3 splits Language Knowledge / Reading / Listening (0–60 each).
- **New Listening section:** hears a same-level example sentence (browser TTS via `useTtsPlayer`), pick the
  meaning; transcript is hidden with a "show transcript" fallback for no-audio browsers. Auto-plays once.
- **Official timing** shown for reference (N5 90m / N4 115m / N3 140m); our condensed paper keeps a
  proportionate clock. Lobby states the scoring rule; footer credits jlpt.jp, notes questions are original.
- Results is now an **official-style score report:** scaled /180 ring with the pass-mark tick, per-scoring-
  section scaled scores + sectional pass/fail chips with the minimum marked on each bar, plus a raw
  content breakdown. Persistence switched to `bestScore` (0–180) + official `passed`.

**UX/UI audit fixes (mobile):**
- **Bottom nav** was squashing 9 items (`flex-1`) into overlapping labels; now each item has a fixed
  readable width and the bar scrolls horizontally (`Layout.tsx`).
- **Exam timer was hidden** on mobile: the exam's `sticky top-0` header collided with the app's mobile
  header (`h-14 sticky top-0`); changed to `top-14 md:top-0`, and `begin()` scrolls to top so the section
  eyebrow isn't clipped.

`tsc`/`eslint`/`build`/`vitest` (49, +3 official-scoring/listening tests) clean. Verified in-browser on
desktop and mobile, light + dark: lobby (official format), runtime (listening play + transcript fallback,
visible timer), and the official score report (scaled 10/180 example, sectional "needs 38 / needs 19"
chips). Zero runtime console errors (earlier PASS_THRESHOLD entries were stale mid-edit HMR).

### Deploy + SPA-routing fix (2026-08-03)

Shipped the session's 8 commits to production: fast-forwarded `main` to `n3-extension-batch-1` (a3eb11a
→ e411ffc) so Vercel auto-deployed the kanji expansion, KanjiVG stroke order, the 4 readings + roadmap
wiring, and the Mock Exam. Verified the new bundle live (contains the "Mock Exam"/"Proefexamen" nav).

Found a **pre-existing SPA-routing bug**: every non-root deep link (`/mock`, `/kanji`, `/grammar`, …)
returned Vercel's 404 — the app only worked when entered at `/` and navigated client-side; refresh /
bookmark / share broke. Added `vercel.json` rewriting all non-`/api` paths to `index.html` (commit
6b68de6). After redeploy, verified live: all 10 routes → 200 serving the app shell, `/api/chat/status`
still 200 (functions preserved), and `/mock` loads the exam directly in-browser. Production URL:
`https://test-ten-jade-63.vercel.app`.

### Fix — live login (2026-08-03)

Login was dead on production: the Vercel build lacked `VITE_SUPABASE_*` env vars (only in the gitignored
local `.env`), so the deployed Supabase client was `null`. User chose the committed-fallback fix — baked the
public project URL + `sb_publishable_` anon key into `src/lib/supabase.ts` as a fallback (safe: RLS-gated,
ships client-side anyway; a real `.env` still overrides). Commit 458e726, deployed. Verified live: config in
the bundle, login page renders functional with no "account service" error, zero console errors. (Google
OAuth may still need enabling in the Supabase dashboard per earlier notes; email/password works.)

### Reading redesign — cover shelf + measured progress (2026-08-07)

Applied the `reading redesign/` drop (approved mockup + banner mascot, award mascot, four book covers)
to the Reading pages. Full-size sources are gitignored like the dashboard drop; `public/assets/reading/`
carries alpha-trimmed mascots and 640px WebP covers (63 KB for all four).

**The mockup showed three numbers with nothing behind them**, so they were built rather than faked:
per-book position (`readingPositions`) and words read per day (`readingWordsByDate`), both in the synced
`ProgressState` with merge rules in `progressMerge.ts` (deepest position per book, later timestamp for
ordering, max-per-day so repeated syncs can't inflate). `ReadingDetail` records position with an
IntersectionObserver — a sentence counts only after holding 60% of the viewport for **1.5 s**, because
without the dwell a five-line book on a tall display was marked fully read in the frame it rendered.
Words are credited by the *difference* in the high-water mark, apportioned from the authored word count;
both ends round off the same curve, so finishing a book credits exactly its word count and a re-read
credits nothing. New `src/lib/readingProgress.ts` holds the selectors (`bookPercent`, `pickNextRead` —
resume beats suggest, and the two are labelled differently on screen).

**Data:** `ReadingPassage` gained `titleJa` (required, written at each book's own level — kana with
spaced phrasing at L0–L1, kanji from L2) and optional `cover`. All 31 books got a Japanese title, and
the shelf and reader now lead with it. Three covers matched existing books; the fourth had no book, so
**`rx-onigiri-picnic` ("おにぎりの ピクニック", L1, 34 words)** was written as an original reader — the
library is now 32 books. `TADOKU_LEVEL_INFO` gained `short` for the filter chips, and `readingMinutes()`
estimates time at a deliberately slow 20 words/min.

**Page:** `ReadingList` rebuilt to the mockup — night hero (JLPT tabs + Continue-reading block + words
today / books completed), Tadoku chips **derived from the selected level** (the two filters are
near-perfectly correlated, so no combination resolves to an empty shelf), and a responsive cover grid
with bookmark toggle and per-book progress. Books without art keep the tinted emoji cover at the same
aspect ratio. The golden-rules strip moved below the shelf. `ReadingDetail`'s finished state now shows
the crowned award mascot.

Validation: `tsc -b`, `eslint .`, `vite build` clean; **vitest 167/167** (17 new — cover files verified
by glob so a renamed artwork fails the suite, Japanese titles script-checked, word-crediting maths, and
the resume/suggest picker). Verified in-browser at both themes, mobile + desktop, zero console errors:
reading two sentences of a 37-word book showed 40% and 15 words, then finishing it moved the tally to
exactly +11. Deployed (commit 2972d5a).

### Speaking redesign — Kai's pick, resumable role-plays, scored phrase drill (2026-08-08)

Applied the `Speaking with Kai.dc.html` design import to `/speaking`. The mockup's landing page is a
hero built around one recommended scenario, a "pick up where you stopped" list, and a filtered library
of the 20 role-plays — none of which had data behind it, so the data was built rather than mocked.

**Progress (synced, in `ProgressState` with merge rules in `progressMerge.ts`):** `speakingSessions`
(turns as a high-water mark per scenario, latching `completed` at the scenario's turn goal, plus Kai's
last line), `phraseScores` (best match per phrase, max-merged) and `speakingTurnsByDate` (feeds the
"spoke N of the last 7 days" strip; credited by the *difference* in turns so re-opening a scenario
can't inflate it). A turn is recorded on Kai's **reply**, not on send — a message that never got an
answer shouldn't move the scenario forward. Selectors live in `src/lib/speakingProgress.ts`
(`pickNextSpeak` — an unfinished conversation always beats a new suggestion; `scenarioState`,
`weakestPhrase`, `agoLabel`).

**Transcripts** (`src/lib/speakingTranscripts.ts`) are local-only and deliberately *not* synced: what's
learned belongs on every device, a chat log doesn't. Opening a scenario restores its thread, so
"resume" reopens the actual conversation; "Restart" clears both the thread and the turn count.

**Scenario data** (`src/data/scenarios.ts`): all 20 gained `level` (N5×9 / N4×9 / N3×2), `difficulty`
(1–3, the card's dots), `minutes`, `turnGoal` and `phraseCategory` — the last links a role-play to the
set phrases it actually uses, which is what the Phrases tab's drill offers.

**Pronunciation scoring** (`src/lib/pronunciation.ts` + tests): the Phrases tab records an attempt and
scores it against the line. It's a *match* score, not a phoneme grade — the browser gives text, not
audio — so every attempt shows what was heard next to the number. Two things keep it fair:
`useSpeechRecognition` now collects **all** hypotheses (`maxAlternatives = 4` plus interim strings,
which are often still kana before the recogniser converts to kanji), and each is scored against both
the phrase's written form and its kana reading. A phrase with no attempt shows an empty bar and "—"
rather than an invented number.

**Copy that couldn't be backed was replaced, not kept:** the mockup's "Kai noticed you hesitate on
counters" became the learner's actual lowest-scoring recorded phrase (and, with nothing recorded yet,
a count of the set phrases this role-play uses). The week strip and the "pick up where you stopped"
list render only once they have something real in them. The old setup/on-device banners collapsed into
one `EngineNote` chip that folds away when Kai is working and opens itself when he isn't.

### Boot screen — a loader that reports real work (2026-08-08)

Applied the `Loader v2.dc.html` design import as the app's cold-start screen (`src/components/BootLoader.tsx`),
mounted in `App` and shown only for a first load of an in-app route — the marketing homepage and auth
screens keep their own paper canvas and have nothing to boot.

**The bar is not on a timer.** `src/lib/boot.ts` defines boot as five weighted promises: the app shell,
`document.fonts.ready`, the route's lazy chunk (signalled by a `ScreenReady` component *inside* the
route's Suspense boundary, so it fires only once the chunk has rendered), the Supabase session check,
and the first cloud merge (`whenFirstSyncSettled()`, new in `progressSync.ts`; guests skip it). The
percentage is the share of weight that has actually settled, so it stalls where the app stalls, and the
mockup's four statuses map onto which step is outstanding. Two guards keep that pleasant: the value is
eased with a floor of `MIN_SWEEP_MS` (850 ms) so a warm cache sweeps instead of flashing, and
`MAX_BOOT_MS` (6 s) dismisses the screen regardless — the app underneath is already usable, and a
loader that can trap someone is worse than one that rounds up at the end.

**Two deviations from the mockup, both deliberate:**
- *Palette.* The design arrived in its own purple (#0E0A20 / #6D4AE0 / #B79BFF). DESIGN.md's Closed
  Vocabulary Rule forbids new named colors for one screen, so the composition is kept exactly and
  painted in the existing night-sky set — Canvas Near-Black, Lantern Violet, iris-400 — via the theme
  CSS variables. The boot screen now resolves *into* the app instead of into a second brand.
- *Pacing.* The mockup held ~3.7 s of celebration after 100%; that was demo pacing for a looping
  preview. In product this runs on every cold load, so it's 260 ms hold → 700 ms burst → 520 ms fade.

**Things a static mockup couldn't surface, fixed here:** `requestAnimationFrame` doesn't run in a
background tab, so a boot that finished there would replay the whole sweep and burst whenever someone
finally looked — if the tab was ever hidden, the screen now just steps aside. The burst's fixed
`scale(26)` covered a laptop but read as a violet ball on a large display, so the end scale is computed
per screen from the viewport diagonal (`--boot-reach`). And Tailwind v4 emits translate utilities as
the separate `translate` property, which composed with the parallax `transform` and pushed the ghost
percentage a full half-width off centre; it's centred with `transform` alone now.

**Asset:** the design's `badge.png` exceeds the design MCP's 256 KiB read cap (its C2PA metadata alone
filled the response), so `public/assets/brand/badge.webp` was cut from the repo's own 1024px logo
source instead — masked to the badge's circle, alpha-trimmed, 512px, 39 KB.

Motion is fully gated: every keyframe lives inside `prefers-reduced-motion: no-preference`, and under
`reduce` the component also skips the burst outright rather than letting the global animation
kill-switch snap six circles to their end frame and flash the viewport.

### Section banners — one header for all six section pages (2026-08-08)

Applied the `Section Banners.dc.html` import. New `src/components/learning/SectionBanner.tsx` replaces
the stacked `ModuleHeader` + `ModuleStatsHero` pair (both deleted) on Grammar, Vocabulary, Kanji and
Listening, and the bespoke headers on Learning Path and Speaking — six pages, one band each: progress
ring + section icon, title, the one number that page is about, a kanji watermark (文 語 字 聴 話 道), an
optional CTA, and a rule along the bottom edge repeating the ratio at full page width. The pair it
replaces cost ~230px before any content and printed the section's name twice.

**Every number is the page's real stat**, reusing the existing selectors: grammar points completed,
`getLearningStats` for vocabulary/kanji, recorded session results for listening (with accuracy folded
into the sentence, which is what the ring measures), the first unlocked-and-unmastered week for the
path, and new `speakingTotals()` for "N conversations with Kai · M played through". The mockup's ring
percentages (2%, 4%) didn't match its own captions — those were dressing, and the real ratios are drawn
instead, including 0.

**Colour comes from `SKILL_THEME`, not the mockup's six new hexes** — same families (blue, green,
amber, purple, pink), but now one source of truth shared with the sidebar and dashboard icons. Learning
Path, which isn't a `SkillArea`, uses `--color-iris-500`. The CTA is `PRIMARY_BUTTON_CLASSES` rather
than the mockup's bespoke pill: same blue-violet, no second button shape forked across six pages.

**Two banners ship without a CTA, on DESIGN.md's One Button Rule.** Grammar's `GrammarContinueCard` and
Speaking's "Kai's pick" hero already carry the identical primary action a few hundred pixels below,
each with far more context (the lesson name and an example; the scenario and its opening line). Two
violet gradient buttons doing the same thing on one screen is exactly what that rule exists to stop —
and the Speaking pair would have disagreed on wording too, the banner saying "Start speaking" over a
hero saying "Continue speaking". Restoring either is one `action` prop.

Listening's CTA scrolls to the exercise rather than resetting `sessionKey`: the exercise is always live,
so a banner button that silently discarded a half-finished session would be a trap. Learning Path's
opens the current week and scrolls to it (`roadmap-week-N` ids added to the week cards).

**Follow-up (same day, user feedback):** three changes to `SectionBanner`.

1. **The N5/N4/N3 toggle now lives in every banner**, top-right, where the Dashboard hero puts it — so
   the control a learner reaches for constantly is in the same place on every screen. Grammar's tabs
   moved up out of the page body; Vocabulary's and Kanji's moved out of `LearningControls` (whose level
   props are gone — that row is now search + filters + layout only); Speaking's scenario filter lifted
   from `Library` to the hub, and its "N role-plays" line now counts what the filter is showing.
   Listening gained a real one (it previously hard-used `progress.level`; the pool is per-level, so the
   session key includes it and changing level starts a fresh session). Learning Path's filters the
   route by phase — its phases *are* the levels — with consolidation living under "All".
2. **Taller**: `min-h-40 sm:min-h-44` with more padding, ~206px against the previous ~164px, which is
   also what makes room for the toggle row.
3. **The strokes animate in.** The ring already drew itself (RingStat, 1s); now the rule along the
   bottom edge grows from zero on the first frame, and the hairline along the top sweeps in from the
   left (`banner-sweep`, inside the `prefers-reduced-motion: no-preference` block like every other
   keyframe in the app).

**Reading joins the banner system (2026-08-09):** `ReadingList`'s bespoke night-sky hero — painted
scenery, banner mascot, book-led headline — is replaced by the same `SectionBanner` the other six
sections wear, so all seven now share one header. Sky-blue accent from `SKILL_THEME.reading`, 読
watermark, "N of 32 books read · M words today" (the words line appears only once there are any), the
N5/N4/N3 toggle in the same top-right corner, and a Continue/Start reading CTA still pointed at
`pickNextRead`'s actual book. The hero's one loss is the book *name* in the header; the shelf below
carries the half-finished book with its own progress bar, which is where a reader looks for it anyway.

**Grammar's continue card removed (2026-08-09):** `GrammarContinueCard` — the last night-sky hero left
on a section page — is deleted, so Grammar now reads banner → lesson list like every other section. The
banner takes back the "Continue lesson" CTA that had been withheld precisely because the card duplicated
it, still resolving to `currentPoint`. The lesson list already marks the current lesson with an arrow and
a highlighted row, so the next lesson is still obvious without the card restating it. Both
`/assets/grammar/` images stay — `GrammarLessonIntro` and `GrammarPractice` still use them.

**Sidebar icons matched to their banners (2026-08-09):** the six LEARN nav icons now carry exactly the
colour their section's banner uses. Their colour is baked into the supplied WebP artwork (they don't
inherit `currentColor`), so each was re-hued in place to `SKILL_THEME[skill].from` — hue replaced,
the artwork's own saturation and value untouched, so every highlight and shadow survives. Grammar blue,
Vocabulary green, Kanji amber, Reading sky, Listening violet. Speaking is real inline SVG rather than
artwork, so it just reads the value: it was hardcoded `text-brand-400` (blue) against a pink banner and
now takes `SKILL_THEME.speaking.from` directly.

Dashboard, Learning Path and Mock Exam stay greyscale — they aren't skills, and that neutrality is what
separates the two top-level destinations and the assessment from the six coloured LEARN entries.
`ai-tutor.webp` is untouched: nothing references it. Re-running the re-hue is the step to repeat if
`SKILL_THEME` ever changes; originals are in git history.

### Mock Exam redesign — four screens (2026-08-09)

Applied the `Mock Exam.dc.html` import across the whole flow: lobby → **countdown (new)** → exam → score
report. The scoring engine (`mockExam.ts`) is untouched — the mockup scored `correct/32 × 180` with a
flat 80 pass, which would have thrown away the official model, so every number on screen still comes
from `EXAM_CONFIG`/`SCORING` (N5 32Q/24m/80, N4 36Q/27m/90, N3 37Q/30m/95) and `scoreExamOfficial`.

**Lobby** (`ExamLobby`): the Mock Exam banner is the shared `SectionBanner` — extended with an optional
`titleSuffix` (模擬試験) and an optional `value`, so a section with no headline number yet renders its
detail line alone. Ring and bottom rule are the learner's best scaled score at the selected level.
Bilingual mascot line off the real best (first sitting / points short / cleared it), the design's
expanding level cards with per-level best rings, a per-level stat line, the sheen Start button,
"Inside the paper" chips, "You walk away with", and collapsible rules that quote that level's real
sectional minimums.

**Per-section marks are real, not decorative.** `MockExamRecord` gained `sectionBests` — the per-section
tally **of the sitting that set `bestScore`**, not a per-section high score, because a best-of across
different sittings adds up to a paper nobody sat and would disagree with the headline beside it.
Merged accordingly in `progressMerge`.

**Countdown** (`ExamCountdown`, new): three seconds with a draining ring, 試 ghost and a halo thrown off
per digit. It exists because the clock doesn't stop once it starts — this is the last moment leaving is
free. The paper is built *before* the countdown so the pause is a pause, not a loading spinner.

**Exam** (`ExamRuntime`): restyled to the design — full-width time bar, three-column header, question
pane, numbered options, right-rail answer sheet with legend and blanks count, bilingual confirm
dialogs. Dark in both themes on purpose: for twenty-odd minutes it's the only thing on screen. All
existing behaviour kept (timer + auto-submit, flags, keyboard, listening audio and transcript), plus
Escape now asks to leave. The runtime reports `secondsUsed` so the rank card can show real time.

**Results** (`ExamResults`): verdict box, counting-up score, per-section bars that fill in sequence,
the weakest part named, rank card with a real clipboard share, mascot line, retake/back. The mockup
dropped the official sectional pass/fail — that's kept, because you can clear the overall mark and
still fail on one section's minimum, and the report has to say so. `ScoreRing` is deleted (unused).

**Two fixes found while verifying:** the countdown called the parent's `setPhase` from inside a
`setCount` updater — updaters run during render, so React warned and the phase change landed in the
wrong commit; the tick is now counted outside React. And the share button silently did nothing where
the Clipboard API is blocked (it is, in some embedded browsers) — it now falls back to showing the
line to copy by hand, and still never claims a copy that didn't happen.

### Category Banner groundwork — SRS everywhere + milestones (2026-08-09)

Started the `Category Banner.dc.html` import. **The banner itself is blocked on artwork** (see below);
the two subsystems it needs are built and shipped.

**SRS extended to every section.** `SrsItemType` widens from vocabulary/kanji to also cover grammar,
reading, listening and speaking, and each section now records a real review at its natural completion
point: finishing a grammar practice (`GrammarDetail`), finishing a book (`ReadingDetail`), answering a
listening item in either exercise (`ListeningHome`, rated by correctness), and playing a role-play
through to its turn goal (`SpeakingPage`, guarded on the exact turn that reaches it so a longer chat
doesn't re-schedule). `getLearningState`/`getLearningStats` were already generic over item type, so
every category now yields a genuine learned / due-for-review / still-to-learn split — which is what the
new banner's four stat chips need. Verified in the browser: answering one listening question wrote
`listening:lv-v-hai`, finishing the 〜です practice wrote `grammar:desu`.

**Milestones** (`src/lib/milestones.ts` + tests): one repeating rung per category ("Learn 10 new kanji",
"Complete 5 listening sessions"), each counting something already recorded, so nothing new is stored and
nothing can drift. They repeat rather than run out — 13 kanji reads as 3/10 toward the next ten — so a
banner never goes blank once you're good at a section. XP is paid per completed rung and folded into
`calculateXp`, staying derived like the rest of the app's XP.

**Blocked: 19 of the design's 21 images can't be imported.** The design MCP's `get_file` caps at
256 KiB and returns truncated data past that — the 9 backgrounds (2172×724), the 9 mascots and
`icon-xp-milestone.png` (1254×1254) all come back with no usable image data, the same failure as the
loader badge. Only `icon-streak.png` and `icon-xp.png` survived; both are in `public/assets/banner/`
waiting. The banner is a painted-background design with per-category light directions and pixel-tuned
mascot placement, so building it without the art would be building a different component.

### Category Banner — the artwork landed, all nine banners replaced (2026-08-09)

The design's artwork arrived in `Redesign banner - claude design/`, so `CategoryBanner` is built and
`SectionBanner` is deleted. Every category page now wears the painted night scene with its own mascot
standing in it: Learning Path, Grammar, Vocabulary, Kanji, Reading, Listening, Speaking and the Mock
Exam lobby.

**Assets** were far too heavy to ship raw — 17.3 MB of PNG across 9 backgrounds (2172×724), 9 mascots
and the milestone gem. Re-encoded into `public/assets/banner/` as WebP at the sizes they actually draw
at (backgrounds 1800px wide, mascots alpha-trimmed to 560px tall so each stands flush on its own ground
line, gem at 192px): **17.3 MB → 885 KB**, 1.1 MB for the folder including the two PNG icons.

**Every number is measured**, via the two subsystems built just before this: the ring and `done / total`
are mastered items over the section's real pool, learned / review / to-learn are the app's own SRS
states (`categoryStats.ts`), and the milestone is a repeating rung off recorded progress. Verified
live — after completing one grammar lesson and answering one listening item, Grammar read `1 learned`
of 42 and Listening `1 learned` of 1,122.

**Layout deviates from the mockup's fixed canvas.** The design is 1400×330 with pixel-tuned absolute
offsets per category; the app's banner is fluid. So the scene is `object-cover object-right` with the
same left-to-right scrim, the mascot is anchored to the bottom edge at 46% (it stands on the painted
ground at any width), the copy column is capped at 40% so it never runs under the mascot, and the
milestone card is pinned bottom-right from `lg` and falls into flow below on smaller screens. The
per-category light-direction shading table isn't needed — each mascot already carries its own lighting,
and one drop-shadow reads correctly against all nine scenes.

The N5/N4/N3 control lives in the top-right strip beside streak and XP, keeping it in the same corner
on every screen. Dashboard keeps its own hero (a separate approved design); its background and mascot
are installed and ready if it should switch too.

### Splash screen — the Claude Design piece, paced by the real boot (2026-08-13)

Replaced `BootLoader.tsx` with `SplashScreen.tsx`, built from the claude.ai/design **Splash Screen**
composition: the violet field wakes, Kai rockets up through the frame on a motion-blur trail, overshoots
and settles inside an XP ring as confetti clears, the wordmark rises, and a dark wipe hands off to the
dashboard.

**The brief was that the animation must not get rushed and must adapt to the connection.** The design
ships as a 7.5s demo on a 2× loop — far too long for something seen on every load — so the authored cue
table is kept **verbatim** in `src/lib/splashTimeline.ts` and only the *playhead speed* changes:

- **Warp.** Each of the six scenes gets a production duration; the playhead runs it at
  `authored / production`. Retiming this way instead of rewriting the offsets keeps the shape of every
  move (the overshoot, the elastic settle, the stagger) intact. Floor: **2.86s**.
- **Gates.** The playhead *stops* at two frames until real work catches up — before the first spark
  streak (waiting for Kai's artwork to decode) and on the Charge/Ready boundary (waiting for the boot).
  Both frames were chosen because every one-shot there has either not started or already finished, so a
  hold reads as breathing, not freezing. Caps 1.8s / 5.2s, hard bail-out at 9s straight to the wipe.
- **The ring is `min(authored sweep, real progress)`** — whichever is *slower*. Warm cache: the
  animation paces it, so it sweeps instead of snapping. Slow link: the truth paces it, so it stalls
  exactly where the network stalls. Never ahead of the work, never faster than it looks good.

`lib/boot.ts` grew an `art` step (mascot `decode()`, preloaded from `index.html` so the request starts
before the bundle parses), a `BootFrontId` grouping, `observeBoot()`, and `getConnectionGrade()` —
Save-Data / 2G drops the ghosts, confetti and most motes but **never shortens a beat**, on the theory
that a slow link usually means a modest device too.

**Two deviations from the mockup, both deliberate.** (1) Painted in the app's palette: the design's four
field stops sit almost exactly on the existing `iris-*` ramp and its `#FFA320` is the amber the app
already spends on XP, so the map is near-lossless and the splash resolves *into* the app. (2) Nothing on
it is decorative progress — the mockup's `+5 XP` / `streak 1` chips are dropped (boot is the one moment
the app doesn't know either number), the three loader segments now carry the three real boot fronts
(app / screen / data), and the tagline slot carries the live boot status.

**Split clocks:** one-shots are driven from JS; the idle bob, sway, bloom and mote drift are CSS loops
(motes as two counter-rotating layers, not 26 animated elements) — so a gate hold stays alive and the
splash isn't stealing main-thread time from the boot it is covering.

`avatar.png` was unimportable again, exactly as the design-import notes predicted (256 KiB cap consumed
by the C2PA block; 1024×1024 but zero pixel data). Cut `public/assets/brand/splash-mascot.webp` (403²,
46 KB) from `banner/mascot/kanji.webp` instead — Kai with the gold star wand, the only pose without a
subject-specific prop. Source art tops out at 403px, so the stage scale is capped at 1.35.

Validation: `tsc -b`, `eslint .`, `vite build` clean; **228 tests pass**, 20 of them new in
`splashTimeline.test.ts` covering the floor, the warp, both gates, the cap, the bail-out, the
long-frame jump guard, the ring's two pacing regimes, and that nothing is in flight at either gate
frame. Verified in-browser at desktop and mobile: full composition renders, preload fires as a single
`link` request, splash hands off to the dashboard, zero console errors.

#### Splash — restored to the design's own fidelity (2026-08-13)

Feedback: the animation was too fast, and the XP chips and sound effects were missing. All three are
now as authored.

- **Pacing is 1:1 with the design.** `PRODUCTION` is now `{ ...AUTHORED }`, so the composition plays at
  its full **7.5s**; the earlier 2.86s warp is gone. The warp machinery stays (it is what makes the
  table adjustable), but every `speedAt` returns 1. `MAX_TOTAL_MS` raised 9s → 14s to leave room for
  the gates on top of a 7.5s piece.
- **XP chips are back**, both of them, with the mockup's own labels, geometry (`chipX/chipW/chipFs` per
  layout) and 240px rise. They run as **fire-and-forget CSS**, started when the playhead crosses their
  cue, rather than sampled per frame: the "streak 1" chip is still in the air at the work gate
  (`3.92 + 1.25 = 5.17 > 4.8`), so sampled against the playhead it would hang there half-risen through
  a slow boot. The design eases position with easeOutCubic and derives opacity from the *eased* value,
  which no single CSS timing function reproduces — so that curve is sampled into the keyframes at each
  tenth and played back linearly.
- **The full sound kit** is ported verbatim to `src/lib/splashSound.ts`: synthesised WebAudio, no asset
  files — master gain 0.55 into a convolver loaded with a 1.1s decaying-noise impulse at 0.22 wet, and
  all seven scene cues (spark, launch, land, chip ×2, chime, handoff) plus the nine-step semitone run
  under the ring sweep. Cues fire on authored-time crossings with the design's own 0.5s jump guard, so
  a waking background tab can't dump a scene of audio at once.

**Caveat on the audio:** browser autoplay policy blocks an AudioContext with no prior user gesture, and
a splash runs before the visitor has touched anything. The design solved this with a "Tap for sound"
button, which an app splash has nowhere to put. The context is created, a resume is attempted, and the
first pointer/key event resumes it — so expect silence on a first-ever visit and sound on later ones in
browsers that keep a media-engagement score. Skipped entirely under reduced motion.

**The avatar is now the right face.** `avatar.png` itself is unreachable — the 256 KiB transport cap is
consumed by a 29 KB C2PA block plus the header, and the stream ends with **zero IDAT rows**; the
`shots/` frames are blank too. The user identified the source artwork as the repo's own
`navigation-image.png`, so `splash-mascot.webp` is now cut from that: keyed on chroma (saturation
> 0.58, plus a brightness rule for the white belly) with interior holes flood-filled, rather than
circle-masked, so the crest above the disc survives. 657² native, 55 KB, 21.7% transparent — an
inscribed circle is 21.5%, which is the check that the cut landed on the disc and not out in its
bloom. The earlier full-body Kai (wand pose, cut from `banner/mascot/kanji.webp`) is gone.

Tests 228 → **233** (chips fire inside Charge and outlive the gate; the 16 sound cues are ordered and
in-range; pacing is 1:1 and the floor is 7500ms). `tsc -b`, `eslint .`, `vite build`, `vitest` clean.

### The splash now plays on the way in from login/register (2026-08-14)

The loader covered the cold load but never the one moment it was built for: **arriving in the app from
the auth screens.** Logging in, creating an account, or choosing "Continue without an account" is a
client-side navigation, which doesn't remount the app — and `SplashScreen` reads the URL once, at mount,
so it never knew the handoff had happened. The dashboard simply appeared, mid-load.

`requestSplash()` (lib/boot.ts) now bumps a **splash run counter**, which `App` uses as the component's
remount key, so each run gets a genuinely fresh timeline, sound kit and refs rather than a half-reset
one. It's called immediately before `navigate('/dashboard')` at all four entry points — login, register,
guest continue (`AuthShell.enterApp`) and the Google OAuth callback — in the same handler, so the two
updates batch and the splash is already covering the screen when the dashboard mounts behind it.

The run is a real boot, so its steps re-arm rather than reporting stale completions: `requestSplash`
re-opens the **screen** step (the dashboard chunk has never been downloaded in this tab), and
progressSync re-opens the **data** step itself at the instant it starts a sign-in merge — deliberately
not from `requestSplash`, because a gate closed on the *hope* of a sync would hold the splash open for
its whole 5.2s cap if none ever started. Focus re-merges still don't count as boot work.

One consequence worth knowing: the splash's sound kit is normally muted on a cold load (no prior user
gesture), but this run follows a click, so **the login handoff is the one splash that will actually be
audible.**

Tests 233 → **236** (`src/lib/boot.test.ts`: run counter + subscribers, and the screen step re-arming).
`tsc -b`, `eslint .`, `vite build`, `vitest` clean; verified in-browser that /login shows no splash, that
"Continue without an account" mounts it over the dashboard, and that a cold /dashboard still does.

### Splash: avatar framing and the authored loader (2026-08-15)

Re-read the Claude Design source (`Splash Screen.dc.html`, `splash-scene.jsx`, `animations-v3.jsx`) and
closed the two places our port had drifted from it.

**Kai was 1.56× too big.** The composition draws `avatar.png` at `layout.av` (396 desktop / 560 mobile)
inside a ring of 488/684 diameter, so the artwork's *own framing* — how much of that square the mark
fills — is what sets his size. Our `splash-mascot.webp` was alpha-trimmed to the mark's own edges, so it
filled 100% of the box: the ring hugged his head and the crest crossed it. Rebuilt at the source
artwork's framing instead — a 1024² canvas with the 657px mark centred at (516, 487.5), i.e. 64% of the
box, exactly where `navigation-image.png` places it (49.6 KB). That also restores the meaning of the
composition's `50% 60%` transform origin: 60% down this box is the underside of the head, which is the
pivot the squash-and-stretch was drawn around.

**The loader is the design's again.** It had been moved early (Settle + 0.35) and rewired to show live
per-front boot progress. It is back in its authored slot: the row fades up at Ready + 0.2, then the
three segments fill **one after another**, each starting 0.42s after the last (`Ready + 0.35 + i*0.42`
→ `+0.95 + i*0.42`), finishing at Ready + 1.79 — a hair before the handoff wipe. Each segment is still
capped by its real front (`min(authored, real)`), which is invisible in the ordinary case (the work gate
has passed, so all three are complete) and stops a segment short only on a boot that stalled past its
cap. The tagline slot keeps the live boot status rather than the mockup's "A little every day": the
design shows the tagline in Ready, which is *after* the gate, so on a slow connection it would arrive
only once the waiting was over.

Tests 236 → **237** (the loader fills sequentially, starts no earlier than the end of the ring sweep, and
is full before the wipe). `tsc -b`, `eslint .`, `vite build`, `vitest` clean. Verified by freezing the
playhead at Ready + 0.1 / +0.8 / +1.6 in both formats: Kai sits inside his ring with air around him, and
the dashes fill one, then two, then three. The login handoff from the previous session still fires.
