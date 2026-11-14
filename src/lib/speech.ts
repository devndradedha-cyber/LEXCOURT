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

/** Language tags to try, in order: pa-Guru-IN, then pa-IN (some engines only know the plain tag). */
export function speechTags(speechLang: string): string[] {
  const plain = speechLang.replace(/-[A-Z][a-z]{3}(?=-|$)/, '');
  return plain === speechLang ? [speechLang] : [speechLang, plain];
}

export function startListening(
  /** BCP 47 tag such as en-US, es-US, hi-IN, pa-Guru-IN or ur-PK. */
  speechLang: string,
  onText: (finalText: string, interim: string) => void,
  onEnd: (error?: string) => void,
): Listener | null {
  const C = getCtor();
  if (!C) return null;
  const tags = speechTags(speechLang);
  let current: SpeechRecognitionLike | null = null;
  let stopped = false;

  const attempt = (index: number) => {
    const rec = new C();
    current = rec;
    // Browsers that cannot recognise this language end with the error
    // "language-not-supported": the next tag is tried, and after the last
    // one the UI says so in the person's language and suggests typing.
    rec.lang = tags[index];
    rec.continuous = true;
    rec.interimResults = true;
    let finalText = '';
    let heard = false;
    let error: string | undefined;
    rec.onresult = (e) => {
      heard = true;
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
    rec.onend = () => {
      if (error === 'language-not-supported' && !heard && !stopped && index + 1 < tags.length) return attempt(index + 1);
      onEnd(error);
    };
    try {
      rec.start();
    } catch {
      error = 'language-not-supported';
      rec.onend();
    }
  };
  attempt(0);
  return {
    stop: () => {
      stopped = true;
      current?.stop();
    },
  };
}
