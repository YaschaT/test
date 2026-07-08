# Kotobox — JLPT N5→N4 Study App

A local-first Japanese learning app: grammar, vocabulary (with spaced repetition), kanji (with a
handwriting-practice canvas), reading, and listening. All progress is stored in your browser's
`localStorage` — there is no account and no server-side database.

## Running the app

```bash
npm install
npm run dev
```

This starts **both** the frontend (Vite, on `http://localhost:5173`) and the small backend proxy
server (on `http://localhost:5174`) together. Open `http://localhost:5173` in your browser.

Other commands:

```bash
npm run build      # typecheck + production build
npm run test       # run the Vitest test suite (pure logic, e.g. the study-plan calculator)
npm run lint       # ESLint
npm run dev:web    # frontend only, no backend proxy
npm run dev:server # backend proxy only
```

You do **not** need any Google Cloud account, API key, or `.env` file to use the app fully — browser
text-to-speech works out of the box in Chrome/Edge/Safari.

## Text-to-speech: browser voice vs. Google Cloud voice

The Listening page can speak Japanese sentences aloud in two ways:

- **Browser voice** (default, no setup required) — uses your operating system/browser's built-in
  Japanese voice via the Web Speech API. Quality depends entirely on what voices your OS has
  installed. The app automatically prefers what looks like the most natural available voice, but you
  can pick a different one from the dropdown, and use "Test voice" to preview it before starting a
  session. If no Japanese voice is installed at all, the app tells you so and disables the Play button
  rather than pretending playback works.
- **Google Cloud voice** (optional, off by default) — proxies through the small local backend in
  `server/` to Google Cloud Text-to-Speech for more consistent, natural-sounding audio. This requires a
  Google Cloud project with the Text-to-Speech API enabled and a service account key. **The app works
  perfectly without ever setting this up** — the "Natural voice" option in the Listening page simply
  stays disabled with an explanation until it's configured.

### Setting up Google Cloud TTS (optional)

1. Create a Google Cloud project (or use an existing one) and enable the **Cloud Text-to-Speech API**.
2. Create a service account, grant it the Text-to-Speech API user role, and download its JSON key.
3. Save that JSON key somewhere under `server/credentials/` (this folder is gitignored — never commit
   the key file).
4. Copy `.env.example` to `.env` and fill in:

   ```bash
   GOOGLE_CLOUD_TTS_ENABLED=true
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./server/credentials/your-key-file.json
   GOOGLE_CLOUD_TTS_LANGUAGE_CODE=ja-JP
   GOOGLE_CLOUD_TTS_VOICE_NAME=
   ```

5. Restart `npm run dev`. The Listening page's "Natural voice (Google Cloud)" option will become
   selectable once the backend confirms it's configured.

Credentials are only ever read server-side (`server/googleTts.ts`); the frontend never sees an API key
or credential file — it only talks to our own `/api/tts` endpoint, which the backend proxies to Google.
This also means swapping to a different TTS provider later only requires changing `server/googleTts.ts`
and the one backend route, not any frontend code.

**Never commit `.env` or any file under `server/credentials/`** — both are already listed in
`.gitignore`.

## How the daily study plan works

On the Dashboard, "How much time do you have today?" lets you pick anywhere from 10 minutes to 4 hours
(slider or presets). The plan shown below it is generated live by
`src/lib/studyPlanCalculator.ts` — a pure, unit-tested function that:

- Skips categories entirely in short sessions (e.g. a 10-minute session only covers Vocabulary +
  Listening) rather than forcing tiny, useless time blocks into every category.
- Adds Grammar once you have ~25+ minutes, Kanji/Reading once you have ~55+ minutes, and Speaking once
  you have ~110+ minutes.
- Always sums exactly to your selected duration, rounded to clean 5-minute blocks.
- Shows a short note explaining which categories were skipped and why.

Your chosen duration is saved locally and restored next time you open the app.

## Project structure

```
src/
  components/   shared UI (Card, Mascot, Badges, Celebration, TTS pickers, ...)
  data/         static content: grammar.ts, vocabulary.ts, kanji.ts, readings.ts
  lib/          persistence, SRS scheduling, study-plan calculation, TTS services, sound effects
  pages/        one folder per section (grammar, vocabulary, kanji, reading, listening)
server/         small Express proxy used only for optional Google Cloud TTS
```

## Known limitations

- Speaking practice, quizzes/mock tests, and the roadmap/analytics phase are not built yet.
- The "daily guided session" that strings all six skills together in one flow is not built yet — the
  Dashboard's study plan links you to the relevant section pages instead.
- Google Cloud TTS setup has not been end-to-end tested against a real Google Cloud project in this
  environment (no credentials were available) — the disabled/missing-credentials path is fully tested;
  the configured-and-working path should be verified once real credentials are available.

See `PROJECT_STATUS.md` for the full, up-to-date build status.
