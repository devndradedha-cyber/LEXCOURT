/**
 * Voice input using the browser's built-in speech recognition (Web Speech API).
 * Not every browser supports it; the UI falls back to typing.
 *
 * Privacy note: some browsers (for example Chrome) send the audio to the
 * browser maker's speech service to turn it into text. LexCourt tells the user
 * this before they start recording.
 */

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type Ctor = new () => SpeechRecognitionLike;

function getCtor(): Ctor | null {
  const w = window as unknown as { SpeechRecognition?: Ctor; webkitSpeechRecognition?: Ctor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && getCtor() !== null;
}

export interface Listener {
  stop(): void;
}

export function startListening(
  /** BCP 47 tag such as en-US, es-US, hi-IN, pa-Guru-IN or ur-PK. */
  speechLang: string,
  onText: (finalText: string, interim: string) => void,
  onEnd: (error?: string) => void,
): Listener | null {
  const C = getCtor();
  if (!C) return null;
  const rec = new C();
  // Browsers that cannot recognise this language end with the error
  // "language-not-supported"; the UI then suggests typing instead.
  rec.lang = speechLang;
  rec.continuous = true;
  rec.interimResults = true;
  let finalText = '';
  let error: string | undefined;
  rec.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript + ' ';
      else interim += r[0].transcript;
    }
    onText(finalText.trim(), interim);
  };
  rec.onerror = (e) => {
    error = e.error;
  };
  rec.onend = () => onEnd(error);
  rec.start();
  return { stop: () => rec.stop() };
}
