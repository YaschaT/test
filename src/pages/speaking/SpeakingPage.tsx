import { useEffect, useRef, useState } from 'react';
import { Mic, Send, Volume2, Loader2, RotateCcw, Sparkles, Info } from 'lucide-react';
import { Card } from '../../components/Card';
import { Mascot } from '../../components/Mascot';
import { useSpeechRecognition } from '../../lib/speech';
import {
  getCompanionStatus,
  sendCompanionMessage,
  CompanionError,
  type ChatTurn,
  type CompanionReply,
} from '../../lib/aiCompanion';
import { getSavedVoiceMode, useTtsPlayer } from '../../lib/tts/ttsService';

type Msg =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'companion'; reply: CompanionReply };

const GREETING: CompanionReply = {
  ja: 'こんにちは！わたしはコトです。きょうはなにをしましたか？',
  kana: 'こんにちは！わたしはことです。きょうはなにをしましたか？',
  romaji: 'Konnichiwa! Watashi wa Koto desu. Kyou wa nani o shimashita ka?',
  en: "Hi! I'm Koto, your conversation fox. What did you do today?",
  feedback: '',
};

const STARTERS = [
  { ja: 'はじめまして。', en: 'Nice to meet you.' },
  { ja: 'きょうはいいてんきですね。', en: "It's nice weather today, isn't it?" },
  { ja: 'にほんごをべんきょうしています。', en: "I'm studying Japanese." },
  { ja: 'しゅみはなんですか。', en: 'What are your hobbies?' },
];

function newId() {
  return Math.random().toString(36).slice(2);
}

export function SpeakingPage() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Msg[]>([{ id: newId(), role: 'companion', reply: GREETING }]);
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

  // When a speech session ends, fold what was heard into the draft for the learner to review + send.
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

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading || available === false) return;

    const next: Msg[] = [...messages, { id: newId(), role: 'user', text: content }];
    setMessages(next);
    setDraft('');
    setError(null);
    setLoading(true);

    const history: ChatTurn[] = next.map((m) =>
      m.role === 'user' ? { role: 'user', content: m.text } : { role: 'assistant', content: m.reply.ja },
    );

    try {
      const reply = await sendCompanionMessage(history);
      setMessages((m) => [...m, { id: newId(), role: 'companion', reply }]);
      void tts.play(reply.ja, 1);
    } catch (e) {
      if (e instanceof CompanionError && e.message === 'not_configured') setAvailable(false);
      else setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setMessages([{ id: newId(), role: 'companion', reply: GREETING }]);
    setDraft('');
    setError(null);
    if (speech.listening) speech.stop();
  }

  const onlyGreeting = messages.length === 1;
  const liveTranscript = speech.listening ? `${draft}${draft ? ' ' : ''}${speech.transcript}${speech.interim}`.trim() : draft;

  return (
    <div className="flex flex-col max-w-2xl h-[calc(100vh-7rem)]">
      <header className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Speaking</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Have a real Japanese conversation with Koto, your AI fox companion. Tap the mic and just talk —
            no multiple choice.
          </p>
        </div>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
        >
          <RotateCcw size={13} /> Restart
        </button>
      </header>

      {available === false && (
        <Card className="p-4 mb-3 flex gap-3">
          <Info size={18} className="text-brand-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Turn on the AI companion</p>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              The conversation runs through your own Anthropic API key so nothing is shared. Add{' '}
              <code className="rounded bg-slate-100 dark:bg-slate-800 px-1">ANTHROPIC_API_KEY=…</code> to your{' '}
              <code className="rounded bg-slate-100 dark:bg-slate-800 px-1">.env</code> file and restart the dev
              server. You can still read Koto's greeting below.
            </p>
          </div>
        </Card>
      )}

      {/* display toggles */}
      <div className="flex items-center gap-2 mb-2 text-xs">
        <span className="text-slate-400 font-medium">Show:</span>
        {(['kana', 'romaji', 'en'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setShow((s) => ({ ...s, [k]: !s[k] }))}
            className={`rounded-full px-2.5 py-1 font-semibold capitalize ${
              show[k]
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {k === 'en' ? 'English' : k}
          </button>
        ))}
      </div>

      {/* conversation */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((m) =>
          m.role === 'companion' ? (
            <div key={m.id} className="flex gap-2.5 items-start">
              <div className="shrink-0 rounded-full bg-brand-50 dark:bg-slate-800 p-1">
                <Mascot size={34} mood="happy" />
              </div>
              <Card className="p-3.5 flex-1">
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
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div className="jp-text max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 text-white px-4 py-2.5 text-[15px]">
                {m.text}
              </div>
            </div>
          ),
        )}
        {loading && (
          <div className="flex gap-2.5 items-center text-slate-400 text-sm">
            <div className="shrink-0 rounded-full bg-brand-50 dark:bg-slate-800 p-1">
              <Mascot size={34} mood="neutral" />
            </div>
            <Loader2 size={16} className="animate-spin" /> Koto is thinking…
          </div>
        )}
      </div>

      {error && <p className="text-sm text-rose-600 dark:text-rose-400 mt-2">{error}</p>}

      {/* starters */}
      {onlyGreeting && available !== false && (
        <div className="flex flex-wrap gap-2 mt-3">
          {STARTERS.map((s) => (
            <button
              key={s.ja}
              type="button"
              onClick={() => send(s.ja)}
              className="rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              title={s.en}
            >
              <span className="jp-text text-slate-700 dark:text-slate-200">{s.ja}</span>
            </button>
          ))}
        </div>
      )}

      {/* input bar */}
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
              speech.listening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-brand-600 text-white hover:bg-brand-700'
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
        <p className="text-xs text-slate-400 mt-1">
          Voice input needs Chrome or Edge. You can still type your replies here.
        </p>
      )}
    </div>
  );
}
