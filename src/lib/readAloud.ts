/**
 * Read aloud with the browser's built-in speech synthesis.
 *
 * Privacy: only voices that run on the device (localService) are used. Some
 * browsers also offer online voices that send the text to a server; LexCourt
 * never uses those. If there is no on-device voice for the language, the UI
 * says so instead.
 */

export interface VoiceLike {
  lang: string;
  localService: boolean;
  name: string;
  default?: boolean;
}

/** Best on-device voice for a BCP 47 tag such as hi-IN or pa-Guru-IN, or null. */
export function pickVoice<V extends VoiceLike>(voices: V[], tag: string): V | null {
  const want = tag.toLowerCase().replace(/_/g, '-');
  const lang = want.split('-')[0];
  const local = voices.filter((v) => v.localService);
  const norm = (v: V) => v.lang.toLowerCase().replace(/_/g, '-');
  return (
    local.find((v) => norm(v) === want) ??
    local.find((v) => norm(v).startsWith(`${lang}-`) && v.default) ??
    local.find((v) => norm(v) === lang || norm(v).startsWith(`${lang}-`)) ??
    null
  );
}

/**
 * Split text into sentences of reasonable length. Some browsers stop speaking
 * after about 15 seconds of one long utterance, so each sentence is queued
 * separately. Handles Latin, Devanagari (।), Gurmukhi (।) and Urdu (۔ ؟) punctuation.
 */
export function splitForSpeech(text: string, max = 220): string[] {
  const clean = text.replace(/[⁦-⁩‎‏]/g, '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?।۔؟:])\s+/u);
  const out: string[] = [];
  for (const s of sentences) {
    if (s.length <= max) {
      out.push(s);
      continue;
    }
    // Very long sentence: break at commas, then at spaces.
    let rest = s;
    while (rest.length > max) {
      const cut = Math.max(rest.lastIndexOf(', ', max), rest.lastIndexOf('، ', max), rest.lastIndexOf(' ', max));
      const at = cut > max / 2 ? cut + 1 : max;
      out.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trim();
    }
    if (rest) out.push(rest);
  }
  return out;
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

/** Voices can load after the page; wait briefly for them. */
export function loadVoices(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const now = synth.getVoices();
    if (now.length) return resolve(now);
    const done = () => {
      synth.removeEventListener?.('voiceschanged', done);
      resolve(synth.getVoices());
    };
    synth.addEventListener?.('voiceschanged', done);
    setTimeout(done, timeoutMs);
  });
}

/** Speak text with an on-device voice. Returns false if there is none for the language. */
export async function speak(text: string, tag: string, onEnd: () => void): Promise<boolean> {
  const synth = window.speechSynthesis;
  const voice = pickVoice(await loadVoices(), tag);
  if (!voice) return false;
  synth.cancel();
  const parts = splitForSpeech(text);
  parts.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = 0.95;
    if (i === parts.length - 1) {
      u.onend = onEnd;
      u.onerror = onEnd;
    }
    synth.speak(u);
  });
  if (!parts.length) onEnd();
  return true;
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
