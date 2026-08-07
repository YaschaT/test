import { useEffect, useRef, useState } from 'react';
import { Mic, Send, Volume2, Loader2, RotateCcw, Sparkles, Info, ChevronLeft, Cpu } from 'lucide-react';
import { Card } from '../../components/Card';
import { AiCore } from '../../components/speaking/AiCore';
import { Phrasebook } from '../../components/speaking/Phrasebook';
import { useSpeechRecognition } from '../../lib/speech';
import {
  getCompanionStatus,
  sendCompanionMessage,
  CompanionError,
  type ChatTurn,
  type CompanionReply,
} from '../../lib/aiCompanion';
import { isWebGpuAvailable, browserAiReply, type LoadProgress } from '../../lib/browserAi';
import { COMPANION_SYSTEM } from '../../lib/companionPrompt';
import { getSavedVoiceMode, useTtsPlayer } from '../../lib/tts/ttsService';
import { getNeuralTtsStatus, playNeural, type NeuralVoice } from '../../lib/tts/neuralTts';
import { SCENARIOS, type Scenario } from '../../data/scenarios';
import { MASCOTS, MASCOT_BANNER_SIZE } from '../../lib/mascots';

type Msg =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'companion'; reply: CompanionReply };

function newId() {
  return Math.random().toString(36).slice(2);
}

function openingReply(scenario: Scenario): CompanionReply {
  return { ...scenario.opening, feedback: '' };
}

// 'cloud' = a provider key is set on the host (fast, best); 'browser' = no key but WebGPU is available,
// so Kai runs on-device; 'none' = no key and no WebGPU, so we show setup guidance. null = still checking.
type Engine = 'cloud' | 'browser' | 'none' | null;

export function SpeakingPage() {
  const [engine, setEngine] = useState<Engine>(null);
  const [modelProgress, setModelProgress] = useState<LoadProgress | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState({ kana: false, romaji: false, en: true });
  const [tab, setTab] = useState<'chat' | 'phrases'>('chat');

  const speech = useSpeechRecognition('ja-JP');
  const tts = useTtsPlayer(getSavedVoiceMode());
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevListening = useRef(false);
  const [neuralAvailable, setNeuralAvailable] = useState(false);
  const [neuralVoice, setNeuralVoice] = useState<NeuralVoice>('ja-JP-NanamiNeural');

  useEffect(() => {
    // Prefer a cloud key if the host has one; otherwise run on-device when WebGPU is available.
    getCompanionStatus().then((cloud) => setEngine(cloud ? 'cloud' : isWebGpuAvailable() ? 'browser' : 'none'));
    getNeuralTtsStatus().then((s) => setNeuralAvailable(s.available));
  }, []);

  // Speak Kai's line with the natural neural voice when available; fall back to the browser voice.
  function speak(text: string) {
    if (neuralAvailable) {
      playNeural(text, { voice: neuralVoice }).catch(() => tts.play(text, 1));
    } else {
      void tts.play(text, 1);
    }
  }

  useEffect(() => {
    if (prevListening.current && !speech.listening && speech.transcript.trim()) {
      setDraft((d) => (d ? `${d} ${speech.transcript}` : speech.transcript).trim());
      speech.reset();
    }
    prevListening.current = speech.listening;
  }, [speech.listening, speech.transcript, speech]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function pick(s: Scenario) {
    setScenario(s);
    setMessages([{ id: newId(), role: 'companion', reply: openingReply(s) }]);
    setDraft('');
    setError(null);
  }

  function backToScenarios() {
    if (speech.listening) speech.stop();
    setScenario(null);
    setMessages([]);
    setDraft('');
    setError(null);
  }

  function restart() {
    if (!scenario) return;
    if (speech.listening) speech.stop();
    setMessages([{ id: newId(), role: 'companion', reply: openingReply(scenario) }]);
    setDraft('');
    setError(null);
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading || engine === 'none' || engine === null || !scenario) return;

    const next: Msg[] = [...messages, { id: newId(), role: 'user', text: content }];
    setMessages(next);
    setDraft('');
    setError(null);
    setLoading(true);

    const history: ChatTurn[] = next.map((m) =>
      m.role === 'user' ? { role: 'user', content: m.text } : { role: 'assistant', content: m.reply.ja },
    );

    try {
      let reply: CompanionReply;
      if (engine === 'browser') {
        // On-device: first call downloads/compiles the model (progress shown), then runs locally.
        const system = scenario.systemAddon ? `${COMPANION_SYSTEM}\n\n${scenario.systemAddon}` : COMPANION_SYSTEM;
        reply = await browserAiReply(system, history, setModelProgress);
        setModelReady(true);
        setModelProgress(null);
      } else {
        reply = await sendCompanionMessage(history, scenario.id);
      }
      setMessages((m) => [...m, { id: newId(), role: 'companion', reply }]);
      speak(reply.ja);
    } catch (e) {
      // A cloud key that vanished mid-session → re-route to on-device if we can, else show setup.
      if (e instanceof CompanionError && e.message === 'not_configured') {
        setEngine(isWebGpuAvailable() ? 'browser' : 'none');
      } else {
        setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      }
      setModelProgress(null);
    } finally {
      setLoading(false);
    }
  }

  const speaking = tts.state.status === 'playing';
  const coreActive = loading || speaking || speech.listening;
  const status = loading ? 'Thinking…' : speaking ? 'Speaking…' : speech.listening ? 'Listening…' : 'Ready';
  const liveTranscript = speech.listening
    ? `${draft}${draft ? ' ' : ''}${speech.transcript}${speech.interim}`.trim()
    : draft;

  const codeChip = 'rounded bg-slate-100 dark:bg-slate-800 px-1';
  // Shown only when there's no cloud key AND no WebGPU (so on-device isn't possible either).
  const notConfiguredCard = engine === 'none' && (
    <Card className="p-4 flex gap-3">
      <Info size={18} className="text-brand-500 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold text-slate-800 dark:text-slate-100">Turn on Kai (the AI companion) — free</p>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Your browser doesn’t support on-device AI (WebGPU). Open this in <span className="font-medium text-slate-700 dark:text-slate-200">Chrome or Edge</span> to
          chat with Kai privately with no setup — or add a free cloud key:
        </p>
        {import.meta.env.PROD ? (
          <>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Kai needs a cloud AI key on your host. <span className="font-medium text-slate-700 dark:text-slate-200">Groq</span> is
              free, needs no credit card, and works in Europe:
            </p>
            <ol className="text-slate-500 dark:text-slate-400 mt-1.5 space-y-1 list-decimal list-inside">
              <li>Get a free key at <span className="font-medium text-slate-700 dark:text-slate-200">console.groq.com/keys</span>.</li>
              <li>
                In Vercel → your project → <span className="font-medium text-slate-700 dark:text-slate-200">Settings → Environment Variables</span>,
                add <code className={codeChip}>GROQ_API_KEY</code> = your key (and <code className={codeChip}>AI_PROVIDER=groq</code>).
              </li>
              <li>Redeploy (Deployments → ⋯ → Redeploy).</li>
            </ol>
            <p className="text-slate-400 mt-1.5 text-xs">
              Gemini’s free tier is 0 quota in the EEA and Ollama can’t run on Vercel — use Groq. The key stays server-side, never sent to the browser.
            </p>
          </>
        ) : (
          <>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Pick one in your <code className={codeChip}>.env</code> file, then restart with <code className={codeChip}>npm run dev</code>:
            </p>
            <ul className="text-slate-500 dark:text-slate-400 mt-1.5 space-y-1 list-disc list-inside">
              <li>
                <span className="font-medium text-slate-700 dark:text-slate-200">Groq (free, no card, works in Europe):</span>{' '}
                get a key at console.groq.com/keys → set <code className={codeChip}>GROQ_API_KEY</code> and{' '}
                <code className={codeChip}>AI_PROVIDER=groq</code>.
              </li>
              <li>
                <span className="font-medium text-slate-700 dark:text-slate-200">Ollama (free, local, no key):</span>{' '}
                install from ollama.com, run <code className={codeChip}>ollama pull qwen2.5</code>, set <code className={codeChip}>AI_PROVIDER=ollama</code>.
              </li>
            </ul>
            <p className="text-slate-400 mt-1.5 text-xs">Everything stays on your machine/server — keys are never sent to the browser.</p>
          </>
        )}
      </div>
    </Card>
  );

  const pct = modelProgress ? Math.round(modelProgress.progress * 100) : 0;

  // On-device mode: shown until the model has produced its first reply this session.
  const browserModeBanner = engine === 'browser' && !modelReady && (
    <Card className="p-4 flex gap-3">
      <Cpu size={18} className="text-brand-500 shrink-0 mt-0.5" />
      <div className="text-sm flex-1 min-w-0">
        <p className="font-semibold text-slate-800 dark:text-slate-100">Kai runs on your device — private &amp; free</p>
        {modelProgress ? (
          <>
            <p className="text-slate-500 dark:text-slate-400 mt-1 truncate">{modelProgress.text || 'Preparing Kai…'}</p>
            <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-brand-500 transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-1 tabular-nums">{pct}% — one-time download</p>
          </>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            No API key needed. Your first message downloads Kai’s model once (~1&nbsp;GB), then it runs locally and works
            offline. Replies are a bit slower than the cloud.
          </p>
        )}
      </div>
    </Card>
  );

  const aiBanners = (notConfiguredCard || browserModeBanner) && (
    <div className="space-y-3">
      {notConfiguredCard}
      {browserModeBanner}
    </div>
  );

  // ── Scenario picker ──
  if (!scenario) {
    return (
      <div className="flex flex-1 flex-col gap-5">
        <header className="flex items-center gap-4">
          {/* Page identity uses the Speaking mascot like every other section; AiCore stays as Kai's
              own avatar inside the live conversation below. */}
          <img
            src={MASCOTS.speaking}
            alt=""
            aria-hidden="true"
            width={MASCOT_BANNER_SIZE}
            height={MASCOT_BANNER_SIZE}
            style={{ width: MASCOT_BANNER_SIZE, height: MASCOT_BANNER_SIZE }}
            className="shrink-0 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Speaking with Kai</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Have a spoken conversation with Kai, or practise real phrases out loud — no multiple choice.
            </p>
          </div>
        </header>

        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setTab('chat')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              tab === 'chat' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Conversations
          </button>
          <button
            type="button"
            onClick={() => setTab('phrases')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              tab === 'phrases' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Phrases
          </button>
        </div>

        {tab === 'phrases' ? (
          <>
            <p className="max-w-3xl text-sm text-slate-500 dark:text-slate-400">
              Tap a phrase to hear it and shadow the pronunciation. Turn on <em>Say it first</em> to hide the
              Japanese and produce it from the meaning before revealing. Works offline — no AI key needed.
            </p>
            <Phrasebook />
          </>
        ) : (
          <>
            {aiBanners}

            {/* Auto-fill so a wide window gets more scenarios per row rather than six very wide ones,
                and `auto-rows-fr` + `flex-1` so the rows share the height the header leaves. */}
            <div className="grid flex-1 auto-rows-fr gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fill,minmax(21rem,1fr))]">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => pick(s)}
                  className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-brand-400 hover:shadow-sm transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl" aria-hidden="true">{s.emoji}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{s.title.en}</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{s.blurb.en}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Conversation ──
  // What you can change mid-conversation. Inline above the thread on small screens; from lg it moves
  // into the rail beside it, so the chat itself keeps a comfortable width without leaving the right
  // half of a desktop window empty.
  const conversationControls = (
    <>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Show:</span>
        {(['kana', 'romaji', 'en'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
            className={`rounded-full px-2.5 py-1 font-semibold capitalize ${
              show[k] ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {k === 'en' ? 'English' : k}
          </button>
        ))}
      </div>
      {neuralAvailable && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Voice:</span>
          {([
            ['ja-JP-NanamiNeural', 'Nanami ♀'],
            ['ja-JP-KeitaNeural', 'Keita ♂'],
          ] as const).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setNeuralVoice(v);
                playNeural('こんにちは。', { voice: v }).catch(() => {});
              }}
              className={`rounded-full px-2.5 py-1 font-semibold ${
                neuralVoice === v ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      {/* min-w-0: as a grid item this defaults to min-width:auto, so a long line in the thread would
          push the column past the viewport instead of wrapping. */}
      <div className="flex min-w-0 flex-col h-[calc(100dvh-152px)] md:h-[calc(100dvh-4rem)]">
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={backToScenarios}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 shrink-0"
          >
            <ChevronLeft size={16} /> Scenarios
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <AiCore size={40} active={coreActive} />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white leading-tight truncate">
                Kai · <span className="font-normal text-slate-500 dark:text-slate-400">{scenario.emoji} {scenario.title.en}</span>
              </p>
              <p className="text-xs text-brand-500 dark:text-brand-400">{status}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
          >
            <RotateCcw size={13} /> Restart
          </button>
        </div>

        {aiBanners && <div className="mb-3 lg:hidden">{aiBanners}</div>}

        <div className="mb-2 space-y-2 lg:hidden">{conversationControls}</div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((m) =>
            m.role === 'companion' ? (
              <Card key={m.id} className="p-3.5 mr-6">
                <div className="flex items-start justify-between gap-2">
                  <p className="jp-text text-lg text-slate-900 dark:text-white leading-relaxed">{m.reply.ja}</p>
                  <button
                    type="button"
                    onClick={() => speak(m.reply.ja)}
                    aria-label="Play audio"
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                {show.kana && m.reply.kana && <p className="jp-text text-sm text-slate-500 dark:text-slate-400 mt-0.5">{m.reply.kana}</p>}
                {show.romaji && m.reply.romaji && <p className="text-sm text-slate-500 dark:text-slate-400 italic mt-0.5">{m.reply.romaji}</p>}
                {show.en && m.reply.en && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{m.reply.en}</p>}
                {m.reply.feedback && (
                  <p className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs px-2.5 py-1.5">
                    <Sparkles size={12} className="inline mr-1 -mt-0.5" />
                    {m.reply.feedback}
                  </p>
                )}
              </Card>
            ) : (
              <div key={m.id} className="flex justify-end">
                <div className="jp-text max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 text-white px-4 py-2.5 text-[15px]">
                  {m.text}
                </div>
              </div>
            ),
          )}
          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm mr-6">
              <Loader2 size={16} className="animate-spin" />
              {modelProgress ? `Preparing Kai… ${pct}% (one-time download)` : 'Kai is thinking…'}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">{error}</p>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="mt-3 flex items-center gap-2"
        >
          {speech.supported && (
            <button
              type="button"
              onClick={() => (speech.listening ? speech.stop() : speech.start())}
              aria-label={speech.listening ? 'Stop listening' : 'Start speaking'}
              className={`shrink-0 rounded-full p-3 transition-colors ${
                speech.listening ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              <Mic size={20} />
            </button>
          )}
          <input
            value={liveTranscript}
            onChange={(e) => setDraft(e.target.value)}
            readOnly={speech.listening}
            placeholder={
              engine === 'none'
                ? 'Use Chrome/Edge or add a key to chat…'
                : engine === 'browser' && !modelReady
                  ? 'Type to start — first reply prepares Kai on your device…'
                  : speech.listening
                    ? 'Listening… tap the mic when you finish'
                    : speech.supported
                      ? 'Speak with the mic, or type here…'
                      : 'Type your reply in Japanese…'
            }
            disabled={engine === 'none' || engine === null || loading}
            className="jp-text flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-[15px] outline-none focus:border-brand-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!liveTranscript.trim() || loading || engine === 'none' || engine === null}
            aria-label="Send"
            className="shrink-0 rounded-full bg-brand-600 p-3 text-white hover:bg-brand-700 disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </form>
        {speech.error && <p className="text-xs text-rose-500 mt-1">{speech.error}</p>}
        {!speech.supported && (
          <p className="text-xs text-slate-400 mt-1">Voice input needs Chrome or Edge. You can still type your replies here.</p>
        )}
      </div>

      {/* Conversation rail (lg+) */}
      <aside className="sticky top-8 hidden space-y-4 lg:block">
        {aiBanners}
        <Card className="p-4 space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Scenario</p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-white">
              {scenario.emoji} {scenario.title.en}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{scenario.blurb.en}</p>
          </div>
          <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">{conversationControls}</div>
          <p className="border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
            Speak with the mic or type — Kai replies in Japanese and flags mistakes as you go.
          </p>
        </Card>
      </aside>
    </div>
  );
}
