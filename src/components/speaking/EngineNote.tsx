import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LoadProgress } from '../../lib/browserAi';

/**
 * Where Kai is running, and what that means for the learner.
 *
 * 'cloud' = a provider key is set on the host (fast, best); 'browser' = no key but WebGPU is
 * available, so Kai runs on-device; 'none' = neither, so the page has to explain how to switch one
 * on. null = still checking.
 */
export type SpeakingEngine = 'cloud' | 'browser' | 'none' | null;

interface EngineNoteProps {
  engine: SpeakingEngine;
  /** Set while the on-device model is downloading/compiling, so the wait has a number on it. */
  progress?: LoadProgress | null;
  className?: string;
}

const CHIP: Record<'cloud' | 'browser' | 'none', { label: string; dot: string }> = {
  cloud: { label: 'Kai is ready to talk', dot: 'bg-brand-400 shadow-[0_0_0_3px_rgba(111,143,252,0.18)]' },
  browser: { label: 'Kai runs on your device', dot: 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]' },
  none: { label: 'Kai needs a quick setup', dot: 'bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]' },
};

/**
 * A status chip rather than a standing banner: on a working setup this is one line the learner reads
 * once and then ignores, so it stays folded until asked. When there's nothing to talk to it opens by
 * itself — a chip that hides the one thing standing between you and the feature is just a smaller way
 * of not saying it.
 */
export function EngineNote({ engine, progress = null, className = '' }: EngineNoteProps) {
  const [open, setOpen] = useState(false);
  const forced = engine === 'none';
  const expanded = forced || open;

  if (engine === null) {
    return (
      <p className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-400 dark:border-hairline dark:bg-ink-900 ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden="true" />
        Checking Kai…
      </p>
    );
  }

  const chip = CHIP[engine];
  const pct = progress ? Math.round(progress.progress * 100) : 0;

  return (
    <div className={`flex flex-col items-start gap-2 lg:items-end ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={expanded}
        className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-600 transition-colors hover:border-brand-400 hover:text-slate-900 dark:border-hairline dark:bg-ink-900 dark:text-slate-300 dark:hover:border-iris-800 dark:hover:text-brand-200"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${chip.dot}`} aria-hidden="true" />
        {chip.label}
        <ChevronDown
          size={13}
          aria-hidden="true"
          className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {progress && (
        <div className="w-full max-w-sm">
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-ink-700">
            <div
              className="h-full rounded-full bg-brand-500 transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-400 tabular-nums">
            {progress.text || 'Preparing Kai…'} · {pct}% — one-time download
          </p>
        </div>
      )}

      {expanded && (
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-3.5 text-left text-[12.5px] leading-relaxed text-slate-500 dark:border-hairline dark:bg-ink-900 dark:text-slate-400">
          {engine === 'browser' && (
            <p>
              No API key, no account, nothing sent to a server. Your first conversation downloads Kai’s
              model once (~1&nbsp;GB), then Speaking works offline. Replies are a little slower than the
              cloud.
            </p>
          )}
          {engine === 'cloud' && (
            <p>
              Replies come from the AI key set on your host, so they’re quick. The key stays server-side
              and is never sent to the browser — the page only ever posts this conversation.
            </p>
          )}
          {engine === 'none' && <SetupSteps />}
        </div>
      )}
    </div>
  );
}

const codeChip = 'rounded bg-slate-100 dark:bg-ink-800 px-1';

/** Shown only when there's no cloud key AND no WebGPU, so on-device isn't possible either. */
function SetupSteps() {
  return (
    <>
      <p className="font-semibold text-slate-800 dark:text-slate-100">Turn on Kai — free</p>
      <p className="mt-1">
        This browser doesn’t support on-device AI (WebGPU). Open the app in{' '}
        <span className="font-medium text-slate-700 dark:text-slate-200">Chrome or Edge</span> to chat
        with Kai privately with no setup — or add a free cloud key:
      </p>
      {import.meta.env.PROD ? (
        <ol className="mt-1.5 list-inside list-decimal space-y-1">
          <li>
            Get a free key at{' '}
            <span className="font-medium text-slate-700 dark:text-slate-200">console.groq.com/keys</span> —
            no credit card, and it works in Europe.
          </li>
          <li>
            In Vercel → your project →{' '}
            <span className="font-medium text-slate-700 dark:text-slate-200">Settings → Environment Variables</span>,
            add <code className={codeChip}>GROQ_API_KEY</code> = your key (and{' '}
            <code className={codeChip}>AI_PROVIDER=groq</code>).
          </li>
          <li>Redeploy (Deployments → ⋯ → Redeploy).</li>
        </ol>
      ) : (
        <ul className="mt-1.5 list-inside list-disc space-y-1">
          <li>
            <span className="font-medium text-slate-700 dark:text-slate-200">Groq (free, no card):</span>{' '}
            get a key at console.groq.com/keys → set <code className={codeChip}>GROQ_API_KEY</code> and{' '}
            <code className={codeChip}>AI_PROVIDER=groq</code> in <code className={codeChip}>.env</code>.
          </li>
          <li>
            <span className="font-medium text-slate-700 dark:text-slate-200">Ollama (free, local):</span>{' '}
            install from ollama.com, run <code className={codeChip}>ollama pull qwen2.5</code>, set{' '}
            <code className={codeChip}>AI_PROVIDER=ollama</code>.
          </li>
        </ul>
      )}
      <p className="mt-1.5 text-slate-400">
        Then restart with <code className={codeChip}>npm run dev</code>. Keys stay on your machine or
        server — they’re never sent to the browser.
      </p>
    </>
  );
}
