---
target: Dashboard, Vocabulary, Kanji, Sidebar/navigation, Mobile layout (Kotobox app-wide review)
total_score: 30
p0_count: 0
p1_count: 2
timestamp: 2026-07-06T18-27-08Z
slug: r-navigation-mobile-layout-kotobox-app-wide-review
---
Method: dual-agent (Assessment A: design review · Assessment B: detector + browser evidence), run sequentially rather than simultaneously to avoid both driving the same shared browser session — each was fully isolated from the other's output until this synthesis.

## Design Health Score (Nielsen's 10 Heuristics)

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Live timer/streak/XP update correctly; compound filter state (level+category+search together) has no "N filters active" indicator |
| 2 | Match System / Real World | 4 | Authentic JLPT-leveled content, bilingual EN/NL pairing; solid, no issue |
| 3 | User Control and Freedom | 3 | Filters/search/toggles all reversible; "Progress" nav item is a real dead-end with no explanation on click |
| 4 | Consistency and Standards | 4 | Learning-state color vocabulary applied identically across Vocabulary/Kanji; solid |
| 5 | Error Prevention | 3 | No destructive actions in scope; category filter's reset option is labeled "Filter" identically to its own placeholder |
| 6 | Recognition Rather Than Recall | 3 | State badges always visible; icon-only grid/list toggle relies on tooltip, not label |
| 7 | Flexibility and Efficiency | 3 | Filters compose well; no keyboard shortcuts or bulk actions (reasonable for current scope) |
| 8 | Aesthetic and Minimalist Design | 3 | Real color/shadow discipline; Dashboard/Vocabulary/Kanji stat panels are near-identical, reads templated across pages |
| 9 | Error Recovery | 2 | No error paths reachable in scope; search empty-state is calm and actionable, but no evidence of any other recovery pattern |
| 10 | Help and Documentation | 2 | No onboarding/legend anywhere explaining the 4 learning-state colors; icon-only controls have no touch-accessible label |

**Total: 30/40 — Good** (28–35 band: solid foundation, address weak areas)

## Anti-Patterns Verdict

**LLM assessment (Assessment A):** Does not read as AI slop. Clears every classic tell: no gradient text, no side-stripe borders, glassmorphism used exactly once and deliberately (MascotBubble), no hero-metric template, no decorative eyebrows/numbered markers. The one soft tell: Dashboard/Vocabulary/Kanji share a near-identical shell (dark hero → stat row → filter row → grid), which risks feeling like "one page, three datasets" rather than three distinct destinations.

**Deterministic scan (Assessment B):** `detect.mjs` returned 1 finding (`broken-image` in `navIcons.tsx`) — confirmed false positive, it's a JSDoc comment mentioning `<img>` as prose, the file only contains real `<svg>` markup. Browser-overlay injection (`detect.js`) succeeded on all 3 pages and reported additional categories: `low-contrast` (multiple "white on white 1.0:1" instances), `ai-color-palette` (2 skill-icon gradients), `nested-cards` (3 instances), `gradient-text` and `bounce-easing` (both anchored to `body`), `dark-glow` and `gpt-thin-border-wide-shadow` (on Vocabulary/Kanji state cards).

**Adjudication (parent synthesis, cross-checked against source):**
- `gradient-text` and `bounce-easing`, both flagged on `body` rather than any real element: confirmed false positives via direct grep — zero usages of `bg-clip-text`, `background-clip`, or `animate-bounce`/`bounce` anywhere in `src/`. The detector is matching Tailwind/tw-animate-css's compiled utility-class *definitions* in the stylesheet, not actual applied usage.
- Most `low-contrast` "white on #ffffff" findings: false positives — these are text elements sitting on dark hero *images* (`hero-background.png`, `footer-background.png`) or `dark:`-scoped classes the detector's static heuristic doesn't resolve against theme state or background images. Assessment A independently confirmed these are legible in live screenshots.
- **One `low-contrast` finding is a genuine open question, not dismissed**: `text-brand-300` (~#9db6ff) on `#ffffff` at 2.0:1. Every other `text-brand-300` usage in source is paired with a `dark:` variant (`text-brand-600 dark:text-brand-300`), which shouldn't render on a literal white surface. The likely real cause: the shadcn `Dialog`'s `bg-popover` token may not have been re-colored for dark mode during the earlier shadcn integration, so the Level-Up dialog (which uses `dark:text-brand-300`-style accents) could be rendering on an inadvertently near-white popover surface in dark mode. **Needs a direct check**: open the Level-Up dialog in dark mode and inspect the computed `--popover` value.
- `dark-glow` and `gpt-thin-border-wide-shadow` on Vocabulary/Kanji cards: these are the intentional, documented learning-state glow system (DESIGN.md's "Glow-Not-Gray Rule"), applied consistently by design, not decorative copy-paste. Correctly detected pattern, not a bug — but worth knowing a generic heuristic does flag it, since "hairline border + soft shadow" is also a known generic-AI tell in isolation; here it's earned by consistent semantic use.
- `ai-color-palette` (cyan/purple gradients) on 2 small 40×40px skill-icon badges (`TodayPathCard`): real, minor, low-risk given their small size and non-dominant placement — worth a quick check that these aren't literally the most common default AI gradient pairs, but not urgent.
- `nested-cards` (3 instances): mostly earned/intentional (an accent-tinted panel inside a card is a legitimate pattern, not a duplicate-card mistake) but worth a fast visual sanity check on the sidebar's level card specifically.

**Cross-validated by both assessments independently:**
- Touch targets: Assessment B measured grid/list toggle at 32×32px, category filter trigger at 32px tall, level-filter radios at 28–32px tall — all under the 44px minimum — matching Assessment A's persona-based finding for the same elements exactly.
- Mobile bottom nav: Assessment B measured 6 items × 64px = 384px content width inside a 375px viewport (~9px overflow) — matching Assessment A's independent DOM measurement.

## Priority Issues

**[P1] Mobile stats panel pushes real content below the fold on Vocabulary/Kanji.**
Why it matters: the lowest-effort daily touchpoint (a quick phone check) is taxed the most — a user scrolls past ~400px of stats she mostly already knows before reaching a single word/kanji card.
Fix: collapse to a compact single-row summary on mobile by default, expandable on tap.
Suggested command: /impeccable layout

**[P1] Category filter's reset option is labeled "Filter" — identical to its own placeholder.**
Why it matters: reads as a category named "Filter" rather than "show everything," directly working against recognition-over-recall.
Fix: rename to "All categories," matching the existing All/N5/N4 pattern beside it.
Suggested command: /impeccable clarify

**[P2] Weekly Goal stat card is silently disabled while visually identical to 3 working cards.**
Why it matters: sits in the single most-viewed real estate in the app (Dashboard top row); a curious user hits a dead cursor state with no visual warning, undermining trust exactly where first impressions form.
Fix: add the same small "Soon" badge treatment already used correctly on the sidebar's disabled Progress nav item.
Suggested command: /impeccable polish

**[P2] Possible dark-mode contrast regression in the Level-Up dialog's popover surface.**
Why it matters: if confirmed, light-toned dark-mode-only text (`text-brand-300`) is rendering on a near-white surface at ~2:1 contrast, failing WCAG AA at a genuine celebration/high-visibility moment.
Fix: inspect the computed `--popover`/`--popover-foreground` CSS variables in dark mode; likely a missed retoken from the shadcn integration pass.
Suggested command: /impeccable audit

**[P2] Mobile bottom nav overflows its viewport by ~9px (6 items × 64px in a 375px-wide screen).**
Why it matters: confirmed via direct measurement on two independent passes; not catastrophic but a visible seam on the one screen width most users will actually use.
Fix: narrow item width slightly or reduce icon+label padding at the smallest breakpoint.
Suggested command: /impeccable adapt

**[P3] No onboarding for the 4 learning-state colors (blue/violet/amber/emerald = New/Practice/Review/Mastered).**
Why it matters: the color system is the single strongest part of the design, but nothing teaches a first-time user what a bare color glow means before they've read every badge once.
Fix: a one-time, dismissible 4-color legend on first Vocabulary visit (localStorage-gated).
Suggested command: /impeccable onboard

## Persona Red Flags

**Jordan (confused first-timer):** First action is clear within 5 seconds (single violet CTA). Red flag: 4 learning-state colors are never explained anywhere in scope. Red flag: sidebar's "Progress" nav item is plausibly-named and clickable-styled but is a dead end with only a small "Soon" tag as warning.

**Casey (distracted mobile user):** Red flag: real content sits ~400px below the fold behind a stats panel on Vocabulary/Kanji. Red flag: bottom nav overflows its own viewport by ~9px (measured). Red flag (conditional): several controls measure 32×32px against a 44px accessibility guideline — a `pointer-coarse` CSS rule exists in source to address this on real touch devices, but neither assessment could confirm it engages correctly on an actual phone (only emulated viewports were available).

**Self-directed JLPT learner (daily use, wants genuine exam-readiness signal):** Positive: N4 filter returns genuinely N4-level content, "Mastered" is tied to a real SRS interval threshold, not arbitrary taps. Red flag: no composite "how close to exam-ready" signal exists anywhere in scope — only per-skill counts a learner must mentally aggregate themselves, despite this being the stated product north star.

## Minor Observations

- Kanji CTA reads "Learn 日" (bare character) vs. Vocabulary's "Learn (10 new)" (count) — inconsistent format between near-identical headers.
- Dashboard's "Reviews Due" ring divides due/total-deck-size; at 0 due with a growing deck this reads visually as "empty/nothing done" despite the correct "All caught up!" sublabel.
- Achievement card's progress bar uses a literal `bg-gradient-to-r` fill — one of very few actual gradients in an otherwise gradient-disciplined system; worth confirming it's intentional.
- Kanji's mobile stats panel shows 5 data points (vs. Vocabulary's 3, streak hidden) — deliberate per source comment, but means Kanji's fold-push problem is measurably worse than Vocabulary's.

## Questions to Consider

1. If exam-readiness is the stated north star, why does the Dashboard's top row lead with Streak and Weekly Goal (engagement metrics) rather than any composite readiness signal?
2. Could the mobile stats panel collapse to one line after first-view-per-session, expanding only on tap, to get Casey to real content faster without losing its value on first visit?
3. Would a one-time, dismissible 4-color legend meaningfully improve recognition without breaking the "calm, no carnival" tone?
