---
name: Kotobox
description: A calm, mascot-led JLPT N5→N4 study companion — real progress, not a carnival.
colors:
  twilight-indigo: "#3a54d6"
  twilight-indigo-light: "#4c6ef0"
  lantern-violet: "#6460e5"
  lantern-violet-deep: "#5050d5"
  ledge-indigo: "#3d3aa8"
  ember-coral: "#e8735c"
  surface-light: "#ffffff"
  surface-dark: "#0f172a"
  canvas-light: "#f8fafc"
  canvas-dark: "#020617"
  ink-light: "#0f172a"
  ink-dark: "#f1f5f9"
  muted-ink-light: "#64748b"
  muted-ink-dark: "#94a3b8"
  border-light: "#e2e8f0"
  state-new: "#3b82f6"
  state-practice: "#8b5cf6"
  state-review: "#f59e0b"
  state-mastered: "#10b981"
typography:
  display:
    fontFamily: "Baloo 2, Nunito, system-ui, Hiragino Sans, Noto Sans JP, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Nunito, system-ui, Hiragino Sans, Noto Sans JP, sans-serif"
    fontWeight: 400
  japanese:
    fontFamily: "Hiragino Sans, Noto Sans JP, system-ui, sans-serif"
rounded:
  sm: "0.6rem"
  md: "0.8rem"
  lg: "1rem"
  xl: "1.4rem"
  2xl: "1.8rem"
  3xl: "2.2rem"
spacing:
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.lantern-violet}"
    textColor: "#ffffff"
    rounded: "{rounded.2xl}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.surface-light}"
    rounded: "{rounded.2xl}"
    padding: "20px"
  badge-new:
    backgroundColor: "{colors.state-new}"
    textColor: "{colors.state-new}"
    rounded: "9999px"
---

# Design System: Kotobox

## 1. Overview

**Creative North Star: "The Night Lantern"**

Kotobox is a small, steady light held up in a dark, star-lit room — the mascot lantern-in-hand, guiding a
learner through one calm study session toward a real destination: genuine JLPT readiness. Every night-sky
hero panel, every glowing ring and card border, is that same lantern-light: present, warm, low-key. It
never shouts for attention, because the destination (being exam-ready) is the point, not the light itself.

This system explicitly rejects the "carnival" reading of gamification: loud confetti-everywhere, neon
progress bars, mascots that upstage the content, flat gray/white corporate dashboard chrome, and any
direct visual cloning of a single competitor. Streaks, XP, levels, and badges exist here, but they are
supporting instruments — quiet indicators of real progress, not the show.

**Key Characteristics:**
- Dark, night-sky atmosphere as the default stage; light mode is a fully-supported second reading of the
  same system, not an afterthought.
- Color communicates meaning, never decoration — a small, closed vocabulary (indigo primary, violet CTA,
  four semantic learning-state colors) reused everywhere rather than expanding per screen.
- Depth comes from soft colored glow, not gray elevation shadows.
- The mascot is present at key moments (hero greeting, level card, stat panels, celebrations) but is a
  companion in the scene, not a mascot-first interface.

## 2. Colors

A tight, closed palette: one indigo for identity and navigation, one violet for the single primary call to
action, one warm coral as a sparing secondary accent, and four fixed semantic colors that only ever mean
one thing each (a word's or kanji's learning state).

### Primary
- **Twilight Indigo** (#3a54d6): navigation active-states, links, focus rings' base hue, the sidebar's
  "current level" accent. This is the identity color — used constantly, but always as a small solid element
  (a pill, an icon, an active-nav row), never as a large flooded surface.
- **Twilight Indigo Light** (#4c6ef0): a lighter step of the same hue for hover states, ring/outline color,
  and secondary emphasis where full-strength Indigo would be too heavy.

### Secondary
- **Lantern Violet** (#6460e5 → #5050d5, a subtle top-to-bottom gradient): the *one* primary call-to-action
  color across the entire app (Start Study Session, Learn/Review, Continue Learning). Deliberately a
  different, warmer hue from Twilight Indigo so the single most important action on any screen is
  unambiguous — there is exactly one violet gradient button meaning "the main thing to do here."
- **Ledge Indigo** (#3d3aa8): the CTA button's solid "pressed ledge" — a deep tone of the same violet family,
  never used as a standalone surface color.

### Tertiary
- **Ember Coral** (#e8735c): a warm, sparing secondary accent (streak-flame icon, isolated highlight
  moments). Used least of all the named colors — its rarity is what keeps it feeling special.

### Neutral
- **Surface White** (#ffffff) / **Surface Slate** (#0f172a): card backgrounds in light / dark mode.
- **Canvas Slate-50** (#f8fafc) / **Canvas Near-Black** (#020617): page background in light / dark mode —
  the "night sky" itself in dark mode.
- **Ink** (#0f172a light-mode text / #f1f5f9 dark-mode text): primary text color per theme.
- **Muted Ink** (#64748b light / #94a3b8 dark): secondary/supporting text — captions, helper lines, labels.
- **Hairline Border** (#e2e8f0 light / `oklch(1 0 0 / 10%)` translucent white in dark): card and divider
  borders. Dark mode borders are always translucent white over the dark surface, never a flat gray hex, so
  they read correctly against every dark surface shade in the system.

### Named Rules
**The Closed Vocabulary Rule.** No new named colors get introduced for a single screen. If a new UI element
needs color, it draws from this exact set (Twilight Indigo, Lantern Violet, Ember Coral, or one of the four
state colors) or it doesn't get color at all.

**The One Button Rule.** Lantern Violet appears on at most one button per screen — the single primary
action. A screen with two violet-gradient buttons has lost the point of the color.

### Learning State Colors (semantic, not decorative)
- **New** (#3b82f6, blue): content not yet studied.
- **Practice** (#8b5cf6, violet): studied at least once, interval still short.
- **Review** (#f59e0b, amber): due for review right now — the "needs attention" color.
- **Mastered** (#10b981, emerald): SRS interval ≥ 21 days (Anki's own "mature card" threshold) — genuine
  long-term retention, not a participation trophy.

**The Same Color, Same Meaning Rule.** These four colors are locked to these four meanings everywhere they
appear (card border/glow, state badge, progress bar fill). A blue border never means anything other than
"new" anywhere in the app.

## 3. Typography

**Display Font:** Baloo 2 (with Nunito, system-ui, Hiragino Sans, Noto Sans JP fallbacks)
**Body Font:** Nunito (same fallback stack)
**Japanese Font:** Hiragino Sans, Noto Sans JP, system-ui

**Character:** A rounded, friendly display face (Baloo 2) for headings paired with a warm, humanist body
sans (Nunito) — soft enough to feel approachable without tipping into childish, since every heading still
carries full weight (700) and tightened tracking (-0.01em) rather than a bouncy, oversized display treatment.

### Hierarchy
- **Display / Headline** (700 weight, `clamp(1.75rem, 1.1rem + 1.15vw, 2.75rem)` on the Dashboard hero,
  fixed `text-2xl`–`text-4xl` elsewhere, -0.01em tracking): page titles and the Dashboard's greeting. Fluid
  sizing is reserved for the Dashboard's most prominent headline; other pages use fixed Tailwind steps.
  h1–h3 always render in the Display font.
- **Stat Value** (700 weight, `clamp(1.25rem, 0.8rem + 1.2vw, 2.5rem)`): the large numbers in stat cards and
  ring displays (streak count, XP, words learned) — the numbers the whole "north star" metaphor is really
  about.
- **Section Title** (700 weight, `clamp(1rem, 0.82rem + 0.35vw, 1.375rem)`): card headers ("Your Study
  Plan", "Today's Path", "Achievements").
- **Body** (400–600 weight, 14–16px, Nunito): descriptions, helper text, card content. Long-form prose
  (grammar explanations, example sentences) targets 65–75ch line length.
- **Label / Metadata** (500–700 weight, 11–13px, often uppercase + tracked): state badges ("NEW",
  "REVIEW"), level tags ("N5"), section eyebrows.
- **Japanese Text** (`.jp-text` utility, Hiragino Sans/Noto Sans JP stack): every Japanese-language string in
  the app renders through this class so kanji/kana always use the CJK-correct font stack, never the Latin
  body font falling back awkwardly.

### Named Rules
**The Fluid-Headline Rule.** Only headline-level text (Dashboard hero title, stat values, section titles)
uses `clamp()` fluid sizing. Helper/label text stays at fixed Tailwind steps — scaling every line looked
inconsistent rather than premium when tried.

## 4. Elevation

Kotobox is flat by default. Cards rest on a 1px hairline border with no drop shadow at rest (`shadow-sm` at
most). Depth and emphasis are conveyed almost entirely through **soft colored glow** — a `box-shadow` tinted
to the current semantic color — rather than traditional gray elevation shadows. A "new" word card doesn't
sit "higher" than a "mastered" one; it glows a different color.

### Shadow Vocabulary
- **Card border glow, at rest** (e.g. `0 0 0 1px rgba(59,130,246,0.08), 0 6px 20px -8px rgba(59,130,246,0.35)`
  for the "new" state): a quiet, always-on tint so learning state reads at a glance across a full grid,
  before any hover.
- **Card border glow, hover/focus** (same hue, roughly double the opacity, e.g.
  `0 0 0 1px rgba(59,130,246,0.25), 0 10px 28px -6px rgba(59,130,246,0.55)`): confirms interactivity without
  changing the underlying color language.
- **CTA button ledge** (`0 4px 0 0 #3d3aa8, inset 0 1.5px 0 rgba(255,255,255,0.35)`): a solid "pressed ledge"
  beneath the Lantern Violet button — physical, not atmospheric; see Components below.
- **Celebration overlay** (`bg-slate-950/70` + `backdrop-blur-sm` behind the Level-Up dialog): the one
  moment the system goes darker and heavier than its normal flat language, because it's a genuine, rare
  milestone worth a beat of drama.

### Named Rules
**The Glow-Not-Gray Rule.** If an element needs to feel "lifted" or "important," reach for a colored glow
tied to its semantic meaning before reaching for a gray drop shadow. Gray shadows are reserved for the
default resting state of plain cards (`shadow-sm`) and nothing louder.

## 5. Components

### Buttons
- **Shape:** rounded-2xl (`1.8rem` per the radius scale; visually ~16px at the button's actual size).
- **Primary:** Lantern Violet gradient (#6460e5 → #5050d5, top to bottom), white text, bold, `px-5 py-2.5`.
  Sits on a solid Ledge Indigo (#3d3aa8) "shelf" beneath it at rest.
- **Hover / Focus:** lifts slightly (`-translate-y-0.5`) and brightens; focus-visible gets a 2px Twilight
  Indigo Light outline with 2px offset.
- **Active/Press:** drops back down (`translate-y-1`) and the ledge shadow disappears entirely — the visual
  read is a real button being pressed flat, not just a color change.
- **Disabled:** 40% opacity, ledge and hover effects removed entirely.

### Badges (Learning State)
- **Style:** small rounded-full pill, uppercase, bold, tracked-out label with a leading icon (Sparkles /
  BookOpen / Clock / CheckCircle2 for New / Practice / Review / Mastered).
- **Color:** background at 15% opacity of the state color, text at a lighter, more legible step of the same
  hue (e.g. `bg-blue-500/15 text-blue-300` for New).

### Cards / Containers
- **Corner Style:** rounded-2xl (`1.8rem`) as the default; the Dashboard's largest hero/stats panels step up
  to rounded-3xl.
- **Background:** solid Surface White / Surface Slate per theme — never a translucent glass effect.
- **Shadow Strategy:** flat at rest (`shadow-sm`); state-bearing cards (Vocabulary/Kanji word cards) add the
  colored glow described in Elevation instead of a heavier shadow.
- **Border:** 1px hairline, Hairline Border color per theme.
- **Internal Padding:** 20–24px desktop, 14–16px on compact/mobile card variants.

### Inputs / Search / Filters
- **Style:** rounded-xl, 1px hairline border, plain surface background — no heavy inset styling.
- **Focus:** the shared 2px Twilight Indigo Light focus-visible ring, same as every other interactive
  element (one focus treatment app-wide, not a per-component variant).
- **Segmented Tabs (level filters, grid/list toggle):** a bordered track holding a sliding "pill" indicator
  in Twilight Indigo that glides to the active option's real measured width — the app's one custom-built
  control beyond standard form fields.

### Navigation
- **Style:** left sidebar (desktop) / bottom tab bar (mobile), Nunito labels, Lucide icons at consistent
  stroke width. Active state is a solid Twilight Indigo pill background with white text/icon; inactive
  items are muted-ink with a subtle hover background. No badges, dots, or secondary indicators competing
  with the active-state pill.

### The Ring Stat (signature component)
A circular SVG progress ring (streak-vs-best, minutes-vs-goal, due-vs-deck-size) with the metric's icon
centered inside. Every ring value is a real, bounded ratio derived from actual progress data — never a
decorative or fixed-arc illustration. Scales fluidly via `clamp()` on its rendered size while the underlying
`viewBox` math stays fixed, so stroke width and icon scale together with zero distortion across breakpoints.

## 6. Do's and Don'ts

### Do:
- **Do** keep Lantern Violet to exactly one button per screen — the single primary action.
- **Do** let the four learning-state colors (blue/violet/amber/emerald) mean the same thing everywhere:
  card border, glow, badge, and progress-bar fill all agree.
- **Do** use colored glow, not gray drop shadow, whenever a card needs to feel emphasized or stateful.
- **Do** render every animation with a `prefers-reduced-motion: reduce` fallback — this is a hard
  requirement per PRODUCT.md, not a nice-to-have.
- **Do** keep every displayed number real — derived from actual stored progress, never a placeholder or
  illustrative example value.
- **Do** reserve the mascot for specific moments (hero greeting, level card, stat panels, celebrations,
  encouragement) rather than putting it on every surface.

### Don't:
- **Don't** ship "carnival" gamification — confetti, sound, or motion that overshadows the actual studying
  (PRODUCT.md's anti-reference: "the game overshadows the studying").
- **Don't** clone Duolingo's specific visual identity directly — inspired by the category, not a copy
  (PRODUCT.md anti-reference, named explicitly).
- **Don't** default to flat gray/white corporate SaaS dashboard chrome (PRODUCT.md anti-reference).
- **Don't** use `background-clip: text` gradient headlines, side-stripe colored borders, or glassmorphism as
  a default decorative treatment — none of these appear anywhere in the current system and none should.
- **Don't** introduce a new named color for a single screen; every color need routes through the closed
  palette above.
- **Don't** use a gray elevation shadow where a semantic colored glow would communicate more.
- **Don't** add dead buttons, fake data, or placeholder "coming soon" features without an honest lock/disabled
  treatment — every interactive element does something real.
