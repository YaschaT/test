import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Thin wrapper around the browser's Web Speech API for Japanese voice input. Chrome/Edge support
 * this; Safari/Firefox largely don't, so `supported` gates the mic UI and the page offers a typed
 * fallback. Recognition needs mic permission and a secure context (https or localhost).
 */

// Minimal typings — the DOM lib doesn't ship SpeechRecognition types.
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  [i: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: { length: number; [i: number]: SpeechRecognitionResult };
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export interface SpeechRecognitionState {
  supported: boolean;
  listening: boolean;
  /** Finalised transcript for the current session. */
  transcript: string;
  /** In-progress words not yet finalised. */
  interim: string;
  /**
   * Every guess the recogniser offered this session — each final result's alternatives, plus the
   * interim strings it passed through. Pronunciation scoring reads this rather than `transcript`:
   * the top guess is often converted to kanji, while an earlier alternative or the interim text is
   * still the kana the learner actually said. See pronunciation.ts.
   */
  hypotheses: string[];
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(lang = 'ja-JP'): SpeechRecognitionState {
  const [supported] = useState(() => getCtor() !== null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [hypotheses, setHypotheses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const Ctor = getCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    // Costs nothing when unused (the chat only ever reads alternative 0) and gives the phrase drill
    // the runners-up, which are frequently the closer match to a kana-written line.
    recognition.maxAlternatives = 4;

    recognition.onresult = (e) => {
      let finalText = '';
      let interimText = '';
      const guesses: string[] = [];
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
        for (let alt = 0; alt < result.length; alt++) {
          const guess = result[alt]?.transcript;
          if (guess) guesses.push(guess);
        }
      }
      if (finalText) setTranscript((prev) => prev + finalText);
      setInterim(interimText);
      // Deduped rather than appended blindly: interim results repeat the same prefix on every event.
      if (guesses.length) setHypotheses((prev) => [...new Set([...prev, ...guesses])]);
    };
    recognition.onerror = (e) => {
      // "no-speech"/"aborted" are routine when the user pauses or stops; don't surface those.
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setError(
          e.error === 'not-allowed'
            ? 'Microphone access was blocked. Allow it in your browser to speak.'
            : `Speech recognition error: ${e.error}`,
        );
      }
      setListening(false);
    };
    recognition.onend = () => {
      setListening(false);
      setInterim('');
    };

    recognitionRef.current = recognition;
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        /* already stopped */
      }
    };
  }, [lang]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition || listening) return;
    setError(null);
    setTranscript('');
    setInterim('');
    setHypotheses([]);
    try {
      recognition.start();
      setListening(true);
    } catch {
      /* start() throws if already started — ignore */
    }
  }, [listening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript('');
    setInterim('');
    setHypotheses([]);
    setError(null);
  }, []);

  return { supported, listening, transcript, interim, hypotheses, error, start, stop, reset };
}
