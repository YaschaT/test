# Kotobox Homepage — Repository State After Teardown

Written 2026-07-16, after removing the old public homepage ("landing hero v3: lantern-spotlight")
to prepare for a complete redesign. Restore point: git tag `pre-homepage-redesign` (commit
`158c40b`) holds the last commit that still contains the old homepage.

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
