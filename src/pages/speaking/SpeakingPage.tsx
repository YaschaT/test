import { useEffect, useRef, useState } from 'react';
import { Mic, Send, Volume2, Loader2, RotateCcw, Sparkles, Info, ChevronLeft } from 'lucide-react';
import { Card } from '../../components/Card';
import { AiCore } from '../../components/speaking/AiCore';
import { useSpeechRecognition } from '../../lib/speech';
import {
  getCompanionStatus,
  sendCompanionMessage,
  CompanionError,
  type ChatTurn,
  type CompanionReply,
} from '../../lib/aiCompanion';
import { getSavedVoiceMode, useTtsPlayer } from '../../lib/tts/ttsService';
import { SCENARIOS, type Scenario } from '../../data/scenarios';

type Msg =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'companion'; reply: CompanionReply };

function newId() {
  return Math.random().toString(36).slice(2);
}

function openingReply(scenario: Scenario): CompanionReply {
  return { ...scenario.opening, feedback: '' };
}

export function SpeakingPage() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState({ kana: false, romaji: false, en: true });

  const speech = useSpeechRecognition('ja-JP');
  const tts = useTtsPlayer(getSavedVoiceMode());
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevListening = useRef(false);

  useEffect(() => {
    getCompanionStatus().then(setAvailable);
  }, []);

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
    if (!content || loading || available === false || !scenario) return;

    const next: Msg[] = [...messages, { id: newId(), role: 'user', text: content }];
    setMessages(next);
    setDraft('');
    setError(null);
    setLoading(true);

    const history: ChatTurn[] = next.map((m) =>
      m.role === 'user' ? { role: 'user', content: m.text } : { role: 'assistant', content: m.reply.ja },
    );

    try {
      const reply = await sendCompanionMessage(history, scenario.id);
      setMessages((m) => [...m, { id: newId(), role: 'companion', reply }]);
      void tts.play(reply.ja, 1);
    } catch (e) {
      if (e instanceof CompanionError && e.message === 'not_configured') setAvailable(false);
      else setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
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

  const notConfiguredCard = available === false && (
    <Card className="p-4 flex gap-3">
      <Info size={18} className="text-brand-500 shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold text-slate-800 dark:text-slate-100">Turn on Kai (the AI companion) — free options</p>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Pick one in your <code className="rounded bg-slate-100 dark:bg-slate-800 px-1">.env</code> file, then
          restart with <code className="rounded bg-slate-100 dark:bg-slate-800 px-1">npm run dev</code>:
        </p>
        <ul className="text-slate-500 dark:text-slate-400 mt-1.5 space-y-1 list-disc list-inside">
          <li>
            <span className="font-medium text-slate-700 dark:text-slate-200">Gemini (free, no card):</span> get a
            key at aistudio.google.com/apikey → set{' '}
            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1">GEMINI_API_KEY</code>.
          </li>
          <li>
            <span className="font-medium text-slate-700 dark:text-slate-200">Ollama (free, local):</span> install
            from ollama.com, run <code className="rounded bg-slate-100 dark:bg-slate-800 px-1">ollama pull qwen2.5</code>,
            set <code className="rounded bg-slate-100 dark:bg-slate-800 px-1">AI_PROVIDER=ollama</code>.
          </li>
        </ul>
        <p className="text-slate-400 mt-1.5 text-xs">Everything stays on your machine/server — keys are never sent to the browser.</p>
      </div>
    </Card>
  );

  // ── Scenario picker ──
  if (!scenario) {
    return (
      <div className="space-y-5 max-w-3xl">
        <header className="flex items-center gap-4">
          <AiCore size={56} />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Speaking with Kai</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
              Pick a real-life situation and have a spoken Japanese conversation — Kai plays the other person.
              Talk with the mic, no multiple choice.
            </p>
          </div>
        </header>

        {notConfiguredCard}

        <div className="grid gap-3 sm:grid-cols-2">
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
      </div>
    );
  }

  // ── Conversation ──
  return (
    <div className="flex flex-col max-w-2xl h-[calc(100vh-7rem)]">
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

      {available === false && <div className="mb-3">{notConfiguredCard}</div>}

      <div className="flex items-center gap-2 mb-2 text-xs">
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

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) =>
          m.role === 'companion' ? (
            <Card key={m.id} className="p-3.5 mr-6">
              <div className="flex items-start justify-between gap-2">
                <p className="jp-text text-lg text-slate-900 dark:text-white leading-relaxed">{m.reply.ja}</p>
                <button
                  type="button"
                  onClick={() => tts.play(m.reply.ja, 1)}
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
            <Loader2 size={16} className="animate-spin" /> Kai is thinking…
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
            available === false
              ? 'Add your API key to start talking…'
              : speech.listening
                ? 'Listening… tap the mic when you finish'
                : speech.supported
                  ? 'Speak with the mic, or type here…'
                  : 'Type your reply in Japanese…'
          }
          disabled={available === false || loading}
          className="jp-text flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-[15px] outline-none focus:border-brand-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!liveTranscript.trim() || loading || available === false}
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
  );
}
