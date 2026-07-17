# Kotobox Homepage — Repository State After Teardown

Written 2026-07-16, after removing the old public homepage ("landing hero v3: lantern-spotlight")
to prepare for a complete redesign. Restore point: git tag `pre-homepage-redesign` (commit
`158c40b`) holds the last commit that still contains the old homepage.

**Update (2026-07-16, later session):** the design and content specification for the new
homepage was completed in [kotobox-homepage-brief.md](./kotobox-homepage-brief.md) —
direction **"Living Ink"**.

**Update (2026-07-16, implementation session): the homepage is BUILT and live at `/`.**
The sections below this one describe the teardown-era state and are kept as history.

## Implemented homepage (current state)

- **Route:** `/` lazy-loads `src/pages/home/HomePage.tsx` (Suspense fallback: plain paper div).
  The temporary `HomePlaceholder` was deleted. HomePage chunk: **52.3 kB gz JS** (GSAP included;
  budget was ≤95) + 4.75 kB gz CSS.
- **Files:** `src/components/home/` — `home.css` (the isolated design system, all tokens scoped
  under `[data-surface="paper"]`, never `:root`), `HomeNav`, ten section components
  (`HeroSection` … `FinalSection`), `primitives.tsx`, and `stage/` (`goStrokes.ts` — the
  hand-traced 14-stroke 語 path data; `GoGlyph.tsx` — the signature glyph in all its states).
- **Signature system:** 語 draws (7 strokes, CSS-only) in the hero → three displaced strokes
  drift through §3's torn-paper scrap field → completed stroke-by-stroke in §4's sticky
  Assembly stage (word tiles → glyph → dovetailed sentence modules 私は|水を|飲みます → vermilion
  listening thread + waveform, GSAP scrub + snap) → travels §5's pinned horizontal session strip
  as an ink seal → folds into the wordmark in §10 (once, on enter).
- **Real product UI:** five screenshots in `public/assets/home/` (AVIF + WebP, 1600×1000,
  ~300 kB total per format) captured from the running app with genuinely seeded localStorage
  progress (6-day streak, 21/74 words, mixed SRS states, Level 6). §5 also reproduces the real
  duration picker. **Re-capture when the app UI changes**: pipeline is a puppeteer-core +
  sharp script (seeds `kotoba-do:progress-v1`, shoots /dashboard, /vocabulary, /kanji/k-mizu,
  /grammar, /listening at 1440×900@2x) — it lived in the session scratchpad; rebuild from this
  description or from git history of this note if needed.
- **Fonts:** Newsreader + Hanken Grotesk (Latin) and Shippori Mincho B1 (subset via `text=` to
  the ~15 JP glyphs on the page) added to index.html. App fonts untouched.
- **Motion:** all GSAP work sits inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`
  (desktop-width-gated for stage/pan); static markup is always the finished state. Reduced
  motion verified via emulation: hero static-complete, session strip vertical, no pinning, no
  overflow. Tier B reveals come in three variants (mask/rise/settle) — no single repeated fade.
- **Design-lint:** the Living Ink palette/fonts/radii are registered in `.impeccable/config.json`
  (ignore-values + ignore-file for `home.css`), per the approved brief.
- **Verified:** `npm run build` / `lint` / `test` all green; `/login`, `/register`,
  `/dashboard` and all learning modules intact (the capture run exercised them); zero console
  errors; no horizontal overflow at 375/1280; nav overlay is a focus-trapped dialog with ESC.

## Design-director audit pass (2026-07-17)

A full audit against the brief (clarity, originality, storytelling, conversion, motion,
responsive, accessibility, engineering) was applied directly:

- **Copy honesty:** the SRS covers vocabulary + kanji only (`SrsItemType`), grammar is a
  completed-path model, and listening draws on all vocab/grammar example sentences (not
  progress-filtered) and records quiz results/XP, not SRS. The §4 lede, §4 grammar/listening
  chapters, §7 philosophy opener and §6 listening caption were rewritten to claim exactly that
  and no more.
- **Composition rhythm:** §5 and §8 headers now open from the right, so consecutive sections
  never repeat the same left-opening layout (L → L(stage) → R → L → ink plate → R → center).
- **Accessibility:** footer moved outside `<main>` (real contentinfo landmark); removed an
  aria-label that violated WCAG 2.5.3 Label-in-Name when the nav CTA shows its short mobile
  label (Lighthouse a11y now 100 with zero failing audits); small labels on paper-deep plates
  bumped from graphite to ink-soft for AA contrast; decorative scrollable scrap field given
  tabindex="-1"; fixed the hero eyebrow's no-op transform (inline box).
- **Performance:** route-level code splitting for the whole app — every page (auth + learning
  modules) is now a lazy chunk with suspense fallbacks (paper for `/`, ink for auth, in-shell
  null for app pages). Shared bundle: 814 → 574 kB min (235 → 171 kB gz); the old chunk-size
  warning is gone. Homepage font stylesheets load async (print→all swap + noscript fallback).
  All app routes re-verified working after the split.
- **Measured (Lighthouse 12, prod build, simulated mobile 4G):** Accessibility **100**;
  Performance ~**0.79** with **LCP ≈ 3.2 s**, FCP ≈ 2.6 s, CLS ≈ 0, TBT ≈ 370 ms (run-to-run
  variance 3.2–5.1 s on a loaded dev machine; pre-split it measured 4.1 s+).

### Unresolved / follow-ups

- **LCP target (< 2.0 s simulated mobile) is not reachable client-side-only.** The critical
  path is HTML → index chunk (171 kB gz) → lazy HomePage chunk; no further splitting shortens
  that chain. The real fix is prerendering `/` to static HTML at deploy (Vercel prerender or
  vite-ssg) so the hero paints before any JS — recommended next infrastructure step. Deferring
  the Supabase client out of the shared chunk (~30 kB gz) would also help but touches
  auth/sync timing, so it was deliberately not done in a homepage pass.
- **§4 stage in exotic viewports:** a mid-page hard refresh can briefly show tiles
  pre-assembly until the first scroll event; normal scrolling self-corrects. Cosmetic.
- **Dutch homepage translation** out of scope for v1 (EN only; the EN+NL pairing is visible in
  product captures).

## Current homepage route

- `/` renders `src/pages/HomePlaceholder.tsx` — a deliberately unstyled placeholder with the
  Kotobox name, "Homepage redesign in progress", and working links to `/login` and `/register`.
- The route is registered in `src/App.tsx`. The old route was lazy-loaded (code-split); the
  placeholder is a plain static import. When the new homepage lands, consider restoring the
  `lazy()` + `<Suspense>` pattern so marketing-page weight stays out of the app bundle.

## What was removed

**Files (all landing-only, ~1,300 lines):**
- `src/pages/landing/LandingPage.tsx` (route component; GSAP ScrollTrigger choreography)
- `src/components/landing/` — entire directory:
  `LandingNav`, `LandingHero`, `SpotlightLayers`, `LanternScene`, `JapaneseScene`,
  `SakuraParticles`, `ProblemSection`, `SolutionSection`, `ProductPreview`, `JourneySection`,
  `MotivationSection`, `PricingSection`, `FinalCTA`, `LandingFooter`, `FeatureCard`, `TiltCard`,
  `landingCta.ts` (marketing-scale CTA class strings)

**CSS removed from `src/index.css` (all landing-only):**
- `--font-geist` token in `@theme`
- `.font-playfair` / `.font-inter` utility classes
- `sakura-fall` keyframes + `.animate-sakura-fall`
- `lantern-breathe` keyframes + `.animate-lantern-breathe`
- Hero load choreography: `heroReveal` / `heroFadeUp` / `heroZoom` keyframes and
  `.hero-anim` / `.hero-reveal` / `.hero-fade` / `.hero-zoom`

**Dependencies / assets removed:**
- `gsap` uninstalled from package.json (only the landing page used it)
- Google Fonts trimmed in `index.html`: **Geist, Inter, Playfair Display** removed
  (landing-only faces)
- The old dark-blue treatment (`bg-slate-950` page shell + starfield night scenes) existed only
  inside the deleted landing components and the deleted Suspense fallback — no global style forced
  it, so nothing global needed to change.

## What was preserved (shared — do not delete)

- `src/components/Logo.tsx` — used by app sidebar (`Layout.tsx`) and auth pages
- `.torii-grain` CSS + all `torii-*` animations — used by the auth shell (`AuthShell.tsx`)
- **Fraunces** font load in `index.html` — auth pages use it via inline styles
- **Baloo 2 / Nunito** — the app's global display/body faces (`--font-display`, `--font-sans`)
- `.star-field` CSS — grammar constellation background, not landing
- Mascot PNGs under `public/assets/dashboard/mascots/` — the landing reused them, but they belong
  to the Dashboard
- All auth, routing, Supabase, progress-sync, SRS, and learning-module code — untouched
- `html { scroll-behavior: smooth }` — kept (the skip-to-content link in `Layout.tsx` uses in-page
  anchors); its comment no longer references the landing page

## Project architecture (relevant to the redesign)

- **Stack:** Vite 8 + React 19 + TypeScript, React Router 7 (`BrowserRouter` in `main.tsx`),
  Tailwind CSS v4 (CSS-first config via `@theme` in `src/index.css`), shadcn/ui primitives in
  `src/components/ui/` (Radix-based), lucide-react icons.
- **Routing:** public routes `/` (placeholder), `/login`, `/register`; everything else nests under
  `<Layout>` (sidebar app shell): `/dashboard`, `/grammar`, `/vocabulary`, `/kanji`, `/reading`,
  `/listening` (+ detail routes). No route guards — the app works logged-out with localStorage
  progress; accounts are optional (Supabase sync via `src/lib/progressSync.ts`).
- **Auth:** `src/lib/auth.ts` + `authStore.ts` (Supabase), pages in `src/pages/auth/`, visual
  shell in `src/components/auth/AuthShell.tsx` (dark ink + vermillion torii identity — this is the
  current "public surface" visual language that survived the teardown).
- **Design system:** `DESIGN.md` at repo root (tokens, radius scale, brand palette
  `--color-brand-50…900` blue/violet, accent `--color-accent-500` coral); shadcn theme variables
  recolored to Kotobox palette at the bottom of `src/index.css`. An `impeccable` design-lint hook
  runs on every file write and enforces DESIGN.md tokens.
- **Server:** small Express server (`server/index.ts`) for Google TTS only; irrelevant to the
  homepage.

## Available libraries and dependencies

- Runtime: react, react-dom, react-router-dom, @supabase/supabase-js, lucide-react, radix-ui,
  shadcn, class-variance-authority, clsx, tailwind-merge, tw-animate-css, express, dotenv,
  @google-cloud/text-to-speech
- Dev: typescript ~6.0, vite 8, tailwindcss 4, vitest 4 + @testing-library/react, eslint 10,
  tsx, concurrently
- **No animation library remains** — `gsap` was removed with the landing page. If the new homepage
  needs scroll/timeline animation, it must be re-added (and ideally code-split again).

## Build and validation commands

- `npm run dev` — web (vite, port 5173) + TTS server, via concurrently (`.claude/launch.json`
  has a `dev` entry for the browser preview)
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — eslint
- `npm test` — vitest (currently 1 file / 11 tests, `src/lib/studyPlanCalculator.test.ts`)

All four pass as of this teardown. Verified in the browser: `/` placeholder renders, `/login` and
`/register` render the full torii auth shell and accept input, `/dashboard` and learning routes
are unchanged, and the console shows no errors.

## Remaining technical risks

- **Bundle size warning:** the production JS bundle is ~815 kB minified (pre-existing; the landing
  page was the only code-split chunk). The new homepage should be lazy-loaded like the old one so
  the first-visit marketing page and the app don't inflate each other.
- **No route-level 404:** unknown paths render nothing inside the router; unchanged by this work
  but worth addressing sometime.
- **Placeholder is intentionally unstyled** — it inherits only the global body styles (slate
  background, Nunito). It is live at `/` in production once deployed, so the redesign should not
  linger.
- **Fonts:** if the new homepage wants its own display face, add it to the single Google Fonts
  `<link>` in `index.html` and register a `--font-*` token in `@theme`; don't reintroduce
  Geist/Inter/Playfair by habit — they were removed deliberately.
- **Deployment:** pushes to `main` auto-deploy via Vercel; the placeholder goes live on the next
  push.
