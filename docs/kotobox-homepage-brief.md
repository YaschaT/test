# Kotobox Public Homepage — Design & Content Specification

**Direction: "Living Ink"** · Written 2026-07-16 · Status: **approved direction, not yet implemented**

This is the single source of truth for the new public homepage at `/`. It replaces the removed
lantern-spotlight landing page (teardown record: [kotobox-homepage-state.md](./kotobox-homepage-state.md)).
Implementation happens in a later session and must follow this brief exactly. Nothing in this
document may be "improved" into a generic SaaS pattern during implementation.

---

## 0. The one-paragraph thesis

Kotobox's homepage is a piece of contemporary Japanese editorial design about a single idea:
**fragmented studying becomes one connected world.** The whole page is built from paper, ink, and
typography — a warm washi ground, near-black ink type, one vermilion accent — and it carries one
signature object: the kanji **語** (*go* — "language, word", the "koto" in Kotobox), which is drawn,
scattered, assembled, and finally folded into the wordmark as the visitor scrolls. There are no
illustrations, no mascot on the marketing surface, no torii, no Mt. Fuji, no sakura, no WebGL. The
aesthetic risk is total commitment: typography and one evolving glyph carry the entire page.

**The homepage is daylight; the app is night.** The authenticated app keeps its night-indigo
"lantern" identity untouched. The marketing surface is its deliberate opposite — warm paper in
daylight. When real app screenshots appear (Section 6 of the page), the contrast is the story:
*"Outside, daylight. Inside, a quiet night room built for study."* This guarantees the required
visual independence without pretending the product looks like the homepage.

---

## 1. Positioning & message architecture

All eight required messages, mapped to page sections (§ = page section, defined in Part 4):

| # | Message | Where |
|---|---------|-------|
| 1 | What Kotobox is: one coherent environment for JLPT N5→N4 Japanese — vocabulary, kanji, grammar, reading, listening, spaced review, progress, and a daily plan | §2 Hero, §4 System |
| 2 | Who it's for: self-directed adult learners studying toward JLPT N5→N4 in short daily sessions | §2 Hero sub-line, §8 Motivation |
| 3 | Problem solved: fragmentation — five apps, no idea what to study next | §3 Problem |
| 4 | How the learning areas connect: one SRS queue, one plan, one progress model across all skills | §4 System |
| 5 | What a daily session feels like: pick a time → warm-up reviews → planned skill blocks → streak | §5 Session |
| 6 | Why an account is useful: optional; syncs progress across devices; app works without one | §9 Access |
| 7 | Currently free | §9 Access, nav CTA ("free" is in the CTA itself) |
| 8 | Paid plans may appear later — no invented prices or features | §9 Access (one honest sentence) |

**Honesty rules (hard constraints):**
- No fabricated statistics, user counts, testimonials, awards, ratings, or research claims.
- Do **not** print content counts (words/kanji/grammar items) — the library is growing and numbers
  would stale; say "a growing N5→N4 library," never a figure.
- Every product mechanic described must exist in the code today: SM-2-style SRS with four ratings
  (again/hard/good/easy), mastery = interval ≥ 21 days, study-plan calculator (10 min / 30 min /
  1 h / 2 h), warm-up from due reviews, streaks, weekly goal (7 days), XP levels with titles
  (Beginner → Master), achievement badges, EN+NL bilingual content, browser + Google TTS listening
  with select/dictation modes and 0.75×/1×/1.25× speeds, kanji stroke practice on canvas,
  sequential grammar path, furigana reading passages, localStorage-first progress with optional
  Supabase account sync.
- Speaking practice and the Progress page are **not built** — never mention them.

---

## 2. Design tokens

Scope every token to the homepage route root (a `data-surface="paper"` wrapper div), **not**
`:root` — the app's existing shadcn/Kotobox tokens must be untouched.

### 2.1 Color — "washi & sumi"

| Token | Hex | Role |
|-------|-----|------|
| `--paper` | `#F6F1E7` | Page ground (warm washi ivory) |
| `--paper-deep` | `#ECE5D4` | Alternating plates, cards, nav backdrop |
| `--ink` | `#191713` | Display type, the ink plate (§7) background |
| `--ink-soft` | `#3E3A33` | Body text |
| `--graphite` | `#6E675C` | Muted text, captions, hairlines at 40% |
| `--shu` | `#C73E1D` | Vermilion accent — large type, strokes, marks only |
| `--shu-deep` | `#A02E12` | Text-safe vermilion: links, small accent text, CTA hover |
| `--moss` | `#565B40` | Secondary accent, used at most twice on the whole page |

Rules:
- **One accent.** Vermilion is the only color that ever asks for attention. Moss exists for two
  quiet moments maximum (e.g., the "mastered ≥ 21 days" mark in §7). If a third accent feels
  needed, the composition is wrong.
- **No gradients anywhere.** Depth comes from paper layering (soft umbra shadows
  `0 24px 48px -24px rgb(25 23 19 / 0.18)`) and a single reusable grain texture (tiny SVG
  fractal-noise tile at ~4% opacity — same technique as the app's `torii-grain`, new instance).
- **No dark blue, no violet, no glassmorphism, no colored glows.** Those belong to the app.
- Indicative contrast (verify with a checker at build time): ink/paper ≈ 15:1 ✓; ink-soft/paper
  ≈ 9:1 ✓; graphite/paper ≈ 4.9:1 ✓ (small text OK); shu/paper ≈ 4.2:1 — **large text and
  graphics only**; shu-deep/paper ≈ 6:1 ✓ (small text OK); paper-on-ink ≈ 15:1 ✓.

### 2.2 Typography

Three families, loaded from Google Fonts (see Loading strategy for subsetting):

| Role | Face | Usage |
|------|------|-------|
| Display (Latin) | **Newsreader** (variable: optical size + weight axes, true italics) | H1–H2, pull quotes, the wordmark treatment. Set at high optical size (opsz ≥ 40), weight 420–500, tight leading (1.02–1.08), letter-spacing −0.015em. Italic reserved for the one emphasized phrase per section. |
| Text & UI (Latin) | **Hanken Grotesk** (400 / 500 / 700) | Body, buttons, nav, captions. Labels/eyebrows: 700, 12–13px, uppercase, +0.12em tracking (no separate mono face — one accessory removed). |
| Japanese display | **Shippori Mincho B1** (500 / 700) | The 語 glyph, word tiles, sentence modules — every visible Japanese character on the page. Fallback: Hiragino Mincho ProN, Noto Serif JP, serif. |

Type scale (fluid, `clamp()`):
- `--type-hero`: `clamp(2.8rem, 1.6rem + 5.2vw, 6.5rem)` — H1 only
- `--type-h2`: `clamp(2rem, 1.4rem + 2.4vw, 3.5rem)`
- `--type-lede`: `clamp(1.125rem, 1rem + 0.5vw, 1.375rem)`
- `--type-body`: `1.0625rem / 1.65` — measure capped at 62ch
- `--type-label`: `0.8125rem`
- Giant glyph (語): `clamp(14rem, 30vw, 30rem)` — a typographic object, not text
  (`aria-hidden`, real content never inside it)

**No Baloo 2 / Nunito on this page** (those are the app's voice). No Inter, Geist, Playfair,
Fraunces, Satoshi, Space Grotesk (removed deliberately in teardown / overused).

### 2.3 Grid & spacing

- Container: max-width **1240px**, side padding `clamp(20px, 5vw, 64px)`.
- **12-column grid** desktop, 6 columns ≤ 1024px, 4 columns ≤ 640px. Column gap 24px.
- Asymmetry is composed, not random: text blocks occupy columns 2–7 or 6–12 (never centered
  except §2 hero and §10 final); the stage/glyph occupies the opposing columns.
- Spacing scale: 8-based (`8/16/24/32/48/64/96/128`). Section rhythm:
  `--section-pad: clamp(96px, 8vw + 48px, 200px)` vertical.
- Hairline rules: 1px `--graphite` at 35% opacity; used only where they separate real content
  groups (e.g., the session timeline's steps), never as decoration.
- Radius: **2px** on plates and buttons (paper is cut, not rounded — deliberate departure from
  the app's rounded-2xl language; register this scale with the design-lint config for the
  homepage scope). Product-screenshot plates: 6px to match actual app corner cropping.

### 2.4 Materiality

- Paper grain: one shared SVG fractal-noise tile (inline data URI, ≈600 bytes), 4% opacity,
  multiply blend on `--paper` surfaces.
- Plates (cards): `--paper-deep` fill + grain + umbra shadow. On hover where interactive:
  shadow deepens and the plate translates −2px. Nothing "glows."
- Ink strokes (the 語 strokes, underlines, connection lines): SVG paths with
  `stroke-linecap: round`, drawn via `stroke-dashoffset`. Vermilion or ink only.

---

## 3. The signature system: the 語 Assembly

One object appears in five states across the page — this is the "living world" and the element
the page is remembered by. **Implementation: SVG + CSS transforms + GSAP. No WebGL** (decision
rationale in Part 6).

| State | Section | Behavior |
|-------|---------|----------|
| **Drawn** | §2 Hero | 語's first strokes draw themselves in ink on page load (CSS-only animation, ~2.4s, staggered `stroke-dashoffset`); the remaining strokes wait, faint at 8% opacity — the glyph is visibly *unfinished*. |
| **Scattered** | §3 Problem | The glyph's strokes drift apart into the field of paper scraps, each at a different parallax rate — the visual definition of fragmentation. |
| **Assembled** | §4 System | Across the four system chapters the strokes return one group at a time; word tiles, sentence modules, and the listening thread attach to it. By the chapter's end 語 stands complete with the world built around it. |
| **In use** | §5 Session | The completed glyph shrinks to a small ink seal that travels the session timeline as a progress mark. |
| **Folded** | §10 Final | The glyph folds/settles into the "Kotobox" wordmark next to the final CTA. |

Asset: **one hand-traced SVG of 語** with each of its 14 strokes as a separate `<path>` in correct
stroke order, grouped into radical groups (言 speech radical + 五 + 口). Trace from a licensed or
self-drawn source — do not bundle the KanjiVG dataset for one character; extract/redraw a single
glyph and credit accordingly. This one file is reused in all five states.

---

## 4. Page narrative — section by section

Every section specifies: goal, copy (final, not placeholder), composition, motion, real product
UI required, desktop, mobile, accessibility fallback, performance.

> Global CTAs (fixed wording, used verbatim everywhere):
> **Primary:** "Start learning for free" → `/register`
> **Secondary:** "Explore the platform" → smooth-scrolls to §4 (`#system`)
> Buttons: primary = ink fill, paper text, 2px radius, vermilion fill on hover/focus
> (`--shu-deep`), 200ms; secondary = 1px ink outline, ink text, paper-deep fill on hover.
> Focus-visible: 2px `--shu-deep` outline, 2px offset, everywhere.

### §1 · Navigation — "quiet masthead"

- **Goal:** orientation + persistent conversion path; never compete with the page.
- **Content:** wordmark "Kotobox" (Newsreader, ink, set as SVG outlines) · links: *The system*
  (`#system`), *A study day* (`#session`), *Inside the app* (`#inside`), *Free access*
  (`#access`) · right: *Log in* (text link, ink) + primary CTA (compact variant).
- **Composition:** single 64px row, transparent over the hero's paper.
- **Interaction:** after 80px scroll, gains `--paper` backdrop (solid, not blurred glass) +
  bottom hairline. On scroll-down it slides away; on scroll-up it returns (desktop and mobile).
  Link hover: vermilion ink-bleed underline (a 2px stroke that draws in from the left, 160ms).
- **Product UI:** none.
- **Desktop:** all links visible.
- **Mobile:** wordmark + "Log in" + primary CTA (shortened to "Start free" below 380px only if
  overflow forces it; try full label first). Section links collapse into a full-screen paper
  overlay behind a real `<button aria-expanded>` — overlay lists the four section links + both
  CTAs in display type.
- **Accessibility:** `<header><nav aria-label="Main">`, skip-link to `#main` first in DOM,
  ESC closes overlay, focus trapped while open, hide-on-scroll suppressed for keyboard focus
  within nav and under `prefers-reduced-motion`.
- **Performance:** scroll listener via one shared rAF-throttled observer; no layout reads in
  the handler.

### §2 · Opening — "Japanese, in one piece."

- **Goal:** thesis in three seconds: this is about ending fragmentation; it's calm, adult,
  beautifully made.
- **Copy:**
  - Eyebrow: `JLPT N5 → N4`
  - H1: **"Japanese, in one piece."** ("one piece" in Newsreader italic)
  - Lede: "Vocabulary, kanji, grammar, reading and listening — one connected practice instead
    of five scattered apps. Kotobox decides what you study next, so you can just study."
  - CTAs: primary + secondary.
  - Under-CTA line (graphite, small): "Free · works without an account · built for short
    daily sessions"
- **Composition:** asymmetric. H1 + lede + CTAs on columns 2–8, top-aligned to a generous
  band of whitespace. The giant 語 occupies columns 8–13, cropped by the right page edge and
  overlapping the H1's baseline zone by one line — type and glyph interlock rather than sit in
  separate halves. Ink strokes vermilion for the two most recent strokes, ink for the rest,
  unfinished strokes ghosted at 8%.
- **Motion:** load sequence, CSS-only (no JS dependency for first paint): (1) H1 lines rise
  from a baseline mask, 90ms stagger; (2) lede + CTAs fade up; (3) 語 strokes draw, 2.4s,
  overlapping step 1. That's all — no parallax in the hero, nothing loops.
- **Product UI:** none (the product appears later; the hero earns attention with the idea).
- **Desktop:** as composed.
- **Mobile:** H1 first, glyph moves behind/below the CTA block at reduced size
  (`clamp` floor 14rem, cropped by viewport right edge), overlap preserved; CTAs full-width
  stacked, 48px min touch height.
- **Accessibility:** H1 is real text, first heading; glyph `aria-hidden="true"`; masked-line
  animation must never leave text hidden if animations fail (default state = visible, animation
  only *adds* the mask — same principle the old page used). Reduced motion: everything static,
  語 shown at its "drawn so far" state.
- **Performance:** LCP element is the H1 (text) — no hero image, no video. Fonts preloaded
  (Part 8). Stroke animation is `stroke-dashoffset` on inline SVG — no rasters, zero CLS.

### §3 · The problem — "the scattered desk"

- **Goal:** name the pain precisely enough that the target learner feels seen.
- **Copy:**
  - Eyebrow: `THE PROBLEM`
  - H2: **"Five apps deep, and still not sure what to study next."**
  - Body (columns 2–6): "A flashcard app for vocabulary. A website for grammar. A dictionary in
    fourteen browser tabs. Videos for listening, a notebook for kanji. Each one fine on its own —
    and none of them talking to each other. So every evening starts with the hardest question in
    language learning: *what now?*"
- **Composition:** text block left (cols 2–6). Right and bleeding past the fold edge (cols
  7–13): the **scrap field** — 6–8 torn-paper scraps, each a typographic artifact of real
  fragmented studying (a flashcard scrap reading 水 / *water* / "again ×4"; a scribbled particle
  note "は vs が ???"; a browser-tab strip of dictionary tabs; a grammar-site bookmark; a
  half-finished stroke diagram). Scraps are typeset objects (Shippori + Hanken on paper-deep
  plates with torn-edge clip-paths) — **not illustrations**. Among them drift three displaced
  strokes of 語 in vermilion — the glyph has come apart here.
- **Motion:** scraps enter already scattered; on scroll they drift apart further at three
  different parallax rates (±6–14% of scroll delta) and rotate ±2°. The strokes drift with them.
  One-time, scroll-linked, GSAP ScrollTrigger scrub.
- **Product UI:** none.
- **Desktop:** as composed. **Mobile:** text first; scrap field becomes a single horizontal
  overflow-scroll band (real touch scroll, no JS carousel) with scraps at fixed positions.
- **Accessibility:** scraps are `aria-hidden` decoration; their "content" is atmosphere, and the
  body copy carries the meaning. Reduced motion: static scatter, no drift.
- **Performance:** scraps are DOM + CSS (clip-path), no images; parallax via transforms only.

### §4 · The system — "one world" (`#system`, secondary-CTA target)

- **Goal:** show *how the areas connect* — the page's centerpiece and the "living world" payoff.
- **Copy:**
  - Eyebrow: `THE KOTOBOX SYSTEM`
  - H2: **"Everything you learn becomes part of one world."**
  - Lede: "Kotobox isn't five tools taped together. Words, characters, grammar and listening
    feed one spaced-repetition memory and one daily plan — learn a word once, and every part of
    the system knows."
  - Four chapters (right column, scrolling past the sticky stage):
    1. **Vocabulary — tiles that keep their place.** "Every word is a card with kana, romaji
       and meaning — in English and Dutch. Words you know step back; words due for review step
       forward. Nothing gets lost in a deck you'll never reopen."
    2. **Kanji — characters built stroke by stroke.** "Learn each character the way it's
       written: stroke order, readings, and practice drawing it yourself, right in the app."
    3. **Grammar — patterns that click together.** "A guided path of grammar points, one
       unlocking the next. Each pattern comes apart into pieces you can see — and snaps into
       sentences you can build."
    4. **Listening — the thread through everything.** "Hear the words and sentences you've
       just learned, at your speed. Type what you hear, or pick what you heard — both count
       toward the same memory."
- **Composition (desktop):** two columns. Left (cols 1–7): the **sticky stage** — a fixed-height
  viewport panel where the Assembly lives. Right (cols 8–12): the four chapters scroll past as
  editorial text blocks. As each chapter enters, the stage transforms:
  1. *Vocabulary:* paper word tiles (real N5 items: 水 *water* · 友達 *friend* · 食べる *to eat*,
     with EN captions) snap into a loose lattice, each tile a paper plate with a slight CSS 3D
     tilt (`perspective: 1200px`, ≤6°) that settles flat as it locks in.
  2. *Kanji:* the displaced strokes of 語 fly home and the remaining strokes draw — the glyph
     completes, standing sculpturally behind the lattice.
  3. *Grammar:* three sentence modules — `[私は] [水を] [飲みます]` with EN gloss "I drink
     water" — slide in and physically join (dovetail notches in the plate shapes), connected by
     a drawn ink line to the 水 tile already in the lattice: *the word you learned is inside the
     sentence you built.*
  4. *Listening:* a vermilion thread draws through tiles → glyph → sentence, then resolves into
     a small waveform beside a play-triangle mark — stitching the world together.
  The finished tableau (tiles + glyph + sentence + thread) holds for a beat before the section
  releases.
- **Motion:** GSAP ScrollTrigger; the stage is `position: sticky` (not pinned-with-spacer —
  cheaper and more robust). Chapter transitions are scrubbed to scroll with `ease: none` on
  scrub values and short snap-to-chapter. Transforms and opacity only.
- **Product UI:** none directly (this is the conceptual layer; real UI comes next in §6) — but
  every tile/module uses **real content** from the product's data files, in the product's real
  EN(+NL where shown) format.
- **Mobile:** no sticky stage. Four stacked chapters, each with its own compact static tableau
  (the stage state that chapter *ends* on, pre-composed), stroke/snap animations play once on
  enter (IntersectionObserver), ≤600ms each.
- **Accessibility:** chapters are an ordered list (`<ol>`) semantically — this is a real
  sequence. All meaning is in the text; stage `aria-hidden`. Reduced motion: stage shows the
  final complete tableau throughout (desktop) / static tableaus (mobile); no scrub, no snap.
- **Performance:** the stage is one SVG + ~12 DOM plates; scrub handlers write only transforms.
  Budget: stage under 60 nodes. No canvas, no video.

### §5 · A study day — "thirty minutes, decided for you" (`#session`)

- **Goal:** make a session feel concrete, short, and pre-decided — the anti-"what now?".
- **Copy:**
  - Eyebrow: `A STUDY DAY`
  - H2: **"Tell it your time. It plans the rest."**
  - Intro: "Pick ten minutes or two hours. Kotobox splits your session across what's due and
    what's next — so the plan is done before you've opened a textbook."
  - Four numbered steps (numbering is real sequence — order carries information):
    1. **Choose your time.** "10 minutes, 30, an hour, two — the plan reshapes to fit."
    2. **Warm up with what's due.** "Reviews come first: the words and kanji your memory is
       about to let go of, resurfaced at exactly the right moment."
    3. **Learn what's next.** "Your remaining minutes go to new material across grammar,
       vocabulary, kanji, reading and listening — weighted, not random."
    4. **Close the loop.** "Finish and your streak, level and weekly goal move — real numbers
       from real work, nothing decorative."
- **Composition (desktop):** a horizontal session strip — four step plates on a shared
  baseline hairline (a timeline that reads as a paper scroll), the small 語 ink seal from the
  Assembly traveling along the hairline as scroll progresses. Section is scroll-pinned briefly
  while the strip pans horizontally (the page's single horizontal-scroll moment).
- **Motion:** GSAP ScrollTrigger pin + horizontal scrub, ~1.5 viewport-heights of scroll
  distance (short — a taste, not a commitment). Seal position = scrub progress.
- **Product UI:** step 1's plate embeds a **real reproduction of the study-plan duration
  control** (the 10 min / 30 min / 1 hr / 2 hrs segmented choice) as a static visual, styled
  as it truly appears in-app — labeled "from the app" in a caption.
- **Mobile:** no pinning. Vertical numbered steps, hairline runs vertically, seal omitted;
  steps reveal on enter.
- **Accessibility:** steps are `<ol>`; pinning skipped entirely for keyboard scrolling
  (content readable without it) and under reduced motion (vertical static layout, same as
  mobile). Horizontal pan never traps scroll: overshoot releases the pin.
- **Performance:** pin uses transform-based scrolling of an inner track; plates are DOM.

### §6 · Inside the app — "real interface, shown honestly" (`#inside`)

- **Goal:** prove the product is real and finished-feeling; bridge the paper world to the
  app's night world.
- **Copy:**
  - Eyebrow: `INSIDE THE APP`
  - H2: **"Daylight out here. A quiet night room in there."**
  - Lede: "The app has its own atmosphere — a calm, dark study space with one small light on
    what matters next. These are real screens, not mockups."
  - Captions (one per screen, graphite, factual):
    - Dashboard — "Your streak, today's plan, reviews due, and this week's goal — every number
      real."
    - Vocabulary — "Word cards that show their state at a glance: new, practicing, due, or
      mastered."
    - Kanji practice — "Draw each character yourself, stroke by stroke."
    - Grammar path — "One point unlocks the next — a path, not a pile."
    - Listening — "Choose select or dictation, set the speed, and train your ear on what you
      just learned."
- **Composition:** an asymmetric editorial plate arrangement (not a carousel, not a grid of
  equal cards): the Dashboard capture large on cols 1–8; Vocabulary and Kanji staggered on
  cols 8–13 at two different scales; Grammar and Listening in a second row offset the other
  way. Each capture sits on a paper plate with the deep umbra shadow, rotated ≤1.2°,
  straightening to 0° as it enters (paper settling on a desk). The dark app screens on warm
  paper create the section's drama — no other treatment needed.
- **Motion:** enter-once reveals (opacity + 24px rise + rotation settle, 650ms,
  90ms stagger). No parallax here — legibility wins.
- **Product UI (required, real):** five captures taken from the actual running app with
  realistic seeded progress (a believable mid-journey state: some streak, some due reviews,
  mixed card states — set up via real usage, not doctored DOM). Capture at 2× in the app's
  default theme. Re-capture whenever the app UI changes materially.
- **Desktop:** as composed. **Mobile:** single column, Dashboard first, each capture
  full-width; total section height capped by showing Dashboard + two more, with the remaining
  two behind a real "Show two more screens" disclosure button.
- **Accessibility:** every capture gets a full-sentence `alt` describing what the screen
  shows. Captions are visible text, not tooltips.
- **Performance:** AVIF with WebP fallback, `srcset` at 1×/2×, `loading="lazy"`,
  `decoding="async"`, explicit width/height (zero CLS). This section is the page's only
  image payload — budget ≤ 550KB total transfer at desktop sizes.

### §7 · Philosophy — "the ink plate"

- **Goal:** state the learning philosophy with conviction; give the page its one inversion.
- **Copy (set large, Newsreader, paper-on-ink):**
  - Eyebrow: `WHY IT WORKS`
  - Pull statement: **"Memory has a schedule. Kotobox keeps it."**
  - Supporting paragraphs (Hanken, paper at 80% on ink):
    "Every word, kanji and grammar point you study enters one spaced-repetition system. Rate
    yourself honestly — again, hard, good, easy — and it schedules the next encounter right
    before you'd forget."
    "Nothing here is called *mastered* until you've held it for three weeks. Progress you can
    trust beats progress that flatters." *(The word "mastered" carries a small moss underline —
    the page's single moss-accent use.)*
    "And everything is bilingual — English and Dutch, side by side, on every card."
- **Composition:** full-bleed `--ink` plate (the page's only dark section — warm near-black,
  emphatically **not** the app's navy). Text on cols 2–9. In the right margin, the 語 glyph
  appears once, paper-colored at 6% opacity, cropped by the plate edge.
- **Motion:** lines of the pull statement rise with the shared mask-reveal on enter. Nothing
  else moves.
- **Product UI:** none. **Desktop/mobile:** same composition, type scales down; padding holds.
- **Accessibility:** contrast paper-on-ink ≈ 15:1; the 80% body still ≥ 10:1. Reduced motion:
  static.
- **Performance:** pure DOM/typography.

### §8 · Motivation — "progress, not applause"

- **Goal:** reassure adults that gamification here is instrumentation, not a carnival.
- **Copy:**
  - Eyebrow: `STAYING WITH IT`
  - H2: **"Built for adults who want progress, not applause."**
  - Body: "Streaks, levels and badges exist in Kotobox — as instruments, not fireworks. A
    streak tells you the habit is holding. A level (Beginner up to Master) tells you the work
    is accumulating. A weekly goal — seven days, your call how many you hit — tells you the
    truth about your week. Quiet numbers, honestly earned."
  - Three instrument rows (typographic, on hairlines — not cards):
    - `STREAK` — "consecutive study days, with today counted the moment you study"
    - `LEVEL` — "earned from everything you complete — reviews, lessons, listening sessions"
    - `WEEKLY GOAL` — "days studied this week, out of seven"
- **Composition:** text block cols 2–7; the three instrument rows cols 2–11 as full-width
  hairline-separated rows (label left in tracked caps, description right) — ledger-like,
  deliberately undesigned against the rest of the page.
- **Motion:** rows reveal with the shared pattern. **Product UI:** none (the §6 Dashboard
  capture already showed these live; a caption cross-reference: "You saw them on the dashboard
  above.").
- **Mobile:** rows stack label-over-description. **Accessibility:** rows are a `<dl>`.
  **Performance:** trivial.

### §9 · Access — "free while it grows" (`#access`)

- **Goal:** answer money and account questions plainly; build trust by volunteering the
  future-pricing truth.
- **Copy:**
  - Eyebrow: `FREE ACCESS`
  - H2: **"Free now. Honest later."**
  - Three short paragraphs (no pricing cards, no feature matrix — prose, like a letter):
    "Kotobox is free while it grows. All of it — every word, character, lesson and listening
    session."
    "You don't even need an account: progress saves in your browser and you can start in
    seconds. Create a free account when you want your progress to follow you across devices."
    "Paid plans may exist one day, once there's clearly more here worth paying for. No prices
    to show you yet, and no surprises planned — learning you've already done stays yours."
  - Inline CTA: primary button + "or *log in* if you've been here before" (text link).
- **Composition:** narrow measure (cols 3–9), generous whitespace — the calmest section on the
  page. A single vermilion hanko-style seal mark (the 語 seal from §5, stamped at 24px) sits
  beside the heading as a quiet signature.
- **Motion:** reveal only. **Product UI:** none. **Mobile:** same, full-width text.
- **Accessibility/Performance:** trivial; links are real links.
- **Hard rule:** no invented tier names, prices, or feature lists — ever.

### §10 · Final — "begin with one word"

- **Goal:** convert, with the story's ending rather than a bigger louder banner.
- **Copy:**
  - H2 (display, large): **"Begin with one word."**
  - Line: "The first one takes about a minute. The system takes it from there."
  - Primary CTA + secondary text link "Explore the platform ↑" (back to `#system`).
- **Composition:** centered (the page's second and last centered block). Above the heading,
  the completed 語 folds down into the **Kotobox wordmark** — the glyph's strokes translate
  and fade into the SVG wordmark's letterforms (a choreographed crossfade + collapse, ~900ms,
  played once on enter). The story literally resolves into the brand.
- **Footer (same plate, below a hairline):** wordmark small · "Kotobox — JLPT N5→N4, in one
  piece." · links: Log in (`/login`) · Create account (`/register`) · The system (`#system`) ·
  no social icons, no sitemap theater.
- **Motion:** the fold, then nothing. **Product UI:** none.
- **Mobile:** identical, stacked. **Accessibility:** fold is decorative (`aria-hidden`
  wordmark animation layered over a real, always-visible text heading); reduced motion: static
  wordmark, no fold. **Performance:** SVG only.

---

## 5. Component architecture

```
src/pages/home/HomePage.tsx           — route component; lazy-loaded (restore the lazy()+Suspense
                                        pattern; Suspense fallback = plain --paper div, NOT slate-950)
src/components/home/
  HomeNav.tsx            HomeFooter.tsx (inside FinalSection)
  HeroSection.tsx        ProblemSection.tsx      SystemSection.tsx
  SessionSection.tsx     InsideSection.tsx       PhilosophySection.tsx
  MotivationSection.tsx  AccessSection.tsx       FinalSection.tsx
  stage/
    GoGlyph.tsx          — the 語 SVG; props: strokesDrawn (0–14), variant (hero|stage|seal|fold)
    AssemblyStage.tsx    — sticky stage + chapter timeline orchestration (§4)
    WordTile.tsx  SentenceModule.tsx  ListeningThread.tsx  PaperScrap.tsx
  primitives/
    Plate.tsx (paper card + grain + umbra)   Eyebrow.tsx   HomeCta.tsx (primary|secondary|compact)
    RevealGroup.tsx (shared enter-once mask/rise reveal)    InkLink.tsx (bleed underline)
  homeTokens.css         — all Part-2 tokens scoped under [data-surface="paper"]
src/lib/home/
  useHomeGsap.ts         — gsap.context + matchMedia wrapper (reduced-motion + mobile gating in
                           one place, mirroring the old page's proven cleanup pattern)
```

Rules: nothing in `src/components/home/` may be imported by the app, and the homepage imports
from the app only `react-router-dom` links and (optionally) the wordmark SVG asset. The design
tokens never touch `:root`.

## 6. "3D" scene architecture & WebGL decision

**Decision: no Three.js / React Three Fiber / WebGL on this page.** Rationale, recorded so it
isn't relitigated mid-build: the direction's materials (paper, ink, print) are intrinsically
planar; every ambition ("restrained 3D GUI, spatial elements, materiality") is achieved with a
**2.5D paper stage**: layered z-depth via composition and umbra shadows, CSS `perspective`
(1200px) with ≤6° tilts on tiles/plates, and SVG stroke drawing. This removes an entire
dependency tree (~150KB+ gz), a second render loop, GPU-compositing pitfalls on mid mobiles,
and the need for a WebGL fallback — the fallback *is* the implementation. Revisit only if a
future concept genuinely requires volumetric material (e.g., real ceramic/glass), which this
one does not.

**Depth token system:** `--z-scrap` (drifting, ±14% parallax) < `--z-tile` (settles flat) <
`--z-glyph` (the anchor, never parallaxes once assembled) < `--z-thread` (topmost stroke).
Shadows scale with layer: scraps 12px blur, tiles 24px, featured plates 48px.

## 7. Motion hierarchy & reduced motion

Three tiers, strictly ordered — lower tiers may never upstage higher ones:

- **Tier A — narrative (2 moments only):** the Assembly stage scrub (§4) and the session strip
  pan (§5). GSAP + ScrollTrigger, scrubbed, transforms/opacity only.
- **Tier B — reveals (one shared pattern):** enter-once mask/rise, 600–650ms,
  `cubic-bezier(0.16,1,0.3,1)`, ≤90ms stagger, implemented once in `RevealGroup`. Used by §3
  scraps' entry, §6 plates, §7 lines, §8 rows, §10 fold trigger.
- **Tier C — micro:** link ink-bleed underline (160ms), button hover fill (200ms), plate
  hover lift (2px). No infinite loops anywhere on the page; the only autonomous animation is
  the hero's one-time stroke drawing.

**Reduced-motion version (complete spec, not an afterthought):** under
`prefers-reduced-motion: reduce` — no pinning, no scrub, no parallax, no pan, no fold, no
stroke drawing. §4 stage shows the finished tableau; §5 renders the vertical layout; the hero
shows 語 at its partial-drawn state; all Tier B/C reduced to instant state changes (the
app-wide reduce block already enforces this globally). Content, order, and every piece of copy
identical. Implemented via `gsap.matchMedia` exactly as the previous page proved out.

## 8. Loading & performance strategy

- **Route:** lazy-load the homepage chunk (`lazy()` + Suspense, fallback `--paper` blank);
  GSAP lives only in this chunk. **Route JS budget ≤ 95KB gz** (GSAP core + ScrollTrigger ≈
  37KB of it).
- **Fonts:** preconnect (already present) + `<link rel="preload">` the two Latin faces.
  Newsreader: latin subset, weights via variable axis. Hanken Grotesk 400/500/700 latin.
  **Shippori Mincho B1 must be subset with the Google Fonts `text=` parameter** to exactly the
  JP glyphs on the page (語 + the tile/sentence/scrap characters — roughly 25 glyphs); a full
  JP font would be multiple MB and is forbidden. `font-display: swap`; hero H1 fallback metric
  (serif) tuned with `size-adjust` to minimize CLS.
- **LCP:** hero H1 text. Target **LCP < 2.0s** on a mid-tier mobile (Moto G class, 4G),
  **CLS < 0.05**, **INP < 200ms**. No images above the fold; §6 images lazy + dimensioned.
- **Main thread:** all scroll work in GSAP's single ticker; no `IntersectionObserver` per
  element (one shared observer via RevealGroup); grain is one shared data-URI.
- Verify with Lighthouse (mobile) before merge; numbers above are acceptance criteria.

## 9. Asset requirements

| Asset | Spec | Source |
|-------|------|--------|
| 語 stroke SVG | 14 ordered `<path>` strokes, grouped by radical; single file | Hand-trace/self-draw (license-clean); do not bundle KanjiVG wholesale |
| Kotobox wordmark SVG | Newsreader-set, converted to outlines | Generate from type |
| Paper grain tile | Inline SVG fractal noise ≈600B | New instance (same technique as app's grain) |
| Product captures ×5 | 2×, realistic seeded progress, current app theme; AVIF+WebP | Captured from the running app |
| Torn-edge clip paths ×3 | SVG `clipPath` variants for scraps | Drawn once, reused |

No stock photos, no illustration packs, no icon sets (the page uses zero icons except a play
triangle drawn inline in §4).

## 10. Content inventory (copy deck)

All final copy is written in Part 4 verbatim — headline, lede, body, captions, CTA labels,
under-CTA reassurance line, instrument rows, access letter, footer line. Language: **English**
(the EN+NL bilingual pairing is a *product* feature, visible in §6 captures and stated in §7;
a Dutch homepage translation is out of scope for v1 and tracked as an open item). Japanese
glyph inventory (for font subsetting): 語 水 友達 食 私 は を 飲 みます + kana appearing in
tiles/scraps — freeze the exact set during implementation and encode it in the font URL.

## 11. Implementation order (each step ships green)

1. **Scaffold:** route + lazy chunk, `homeTokens.css`, HomeNav, HomeFooter, all ten sections
   as static typeset content (full copy, real grid, no motion). Page is already shippable.
2. **Materiality pass:** plates, grain, umbra shadows, hairlines, torn scraps.
3. **語 asset + hero:** stroke SVG, CSS draw-in, hero load sequence.
4. **Product captures:** seed progress, capture, encode, place §6.
5. **GSAP layer:** add dependency, `useHomeGsap`, Tier B reveals, then §4 stage, then §5 pan,
   then §10 fold. Reduced-motion parity verified at each sub-step.
6. **Hardening:** mobile pass, keyboard/screen-reader pass, Lighthouse pass, design-lint
   config for the homepage radius scale, cross-browser (Safari sticky + clip-path checks).

Dependencies to add: `gsap` (^3.15). Nothing else — no three/R3F/drei, no lenis (native
scroll only; scroll hijacking is banned), no framer-motion (one motion system on the page).

## 12. Acceptance criteria

1. `/` renders the ten sections with the exact copy in Part 4; primary CTA routes to
   `/register`, secondary scrolls to `#system`; Log in routes to `/login`.
2. No dark-blue/violet app palette, no gradients, no glassmorphism, no icon-in-circle cards,
   no left-copy/right-dashboard hero, no carousel, on the marketing surface.
3. Every factual claim on the page is true of the shipped product; no counts, prices, stats,
   or testimonials appear.
4. All five §6 captures are real screenshots of the running app with plausible progress.
5. WCAG 2.1 AA: contrast per Part 2.1, full keyboard operability incl. nav overlay,
   skip-link, visible focus everywhere, correct heading order (exactly one h1), captures have
   descriptive alt text.
6. Reduced-motion: full content parity, zero pinning/scrubbing/parallax, verified by toggling
   the OS setting.
7. Performance on mid mobile: LCP < 2.0s, CLS < 0.05, INP < 200ms, route JS ≤ 95KB gz, image
   payload ≤ 550KB, JP font subset (not full family) confirmed in the network panel.
8. The authenticated app, login, and register are visually and functionally unchanged
   (spot-check `/dashboard`, `/login`, `/register`; homepage tokens scoped, not on `:root`).
9. `npm run build`, `npm run lint`, `npm test` all pass.
