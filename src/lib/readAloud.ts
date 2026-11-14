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

/**
 * Best voice for a BCP 47 tag such as hi-IN or pa-Guru-IN, or null.
 * By default only on-device voices are used. With `allowOnline`, an online
 * voice (for example Chrome's "Google हिन्दी") may be used; the UI only allows
 * this after the person agrees.
 */
export function pickVoice<V extends VoiceLike>(voices: V[], tag: string, allowOnline = false): V | null {
  const want = tag.toLowerCase().replace(/_/g, '-');
  const lang = want.split('-')[0];
  const local = voices.filter((v) => allowOnline || v.localService);
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

/**
 * Before text goes to an online voice, remove long numbers such as the
 * A-Number so they are not sent to the voice service.
 */
export function redactForOnline(text: string): string {
  return text.replace(/\b(?:A[\s-]?)?\d[\d\s-]{6,}\d\b/g, '…');
}

export type SpeakResult = 'ok' | 'noVoice' | 'onlineOnly';

/**
 * Speak text in the language `tag`.
 * - 'ok': speaking with an on-device voice (or an online one, if allowed).
 * - 'onlineOnly': the only voice for this language is online; ask first.
 * - 'noVoice': no voice at all for this language.
 * If the browser lists no voices at all (some Android phones), the phone's
 * own text-to-speech engine is asked to speak the language directly.
 */
export async function speak(text: string, tag: string, onEnd: () => void, allowOnline = false): Promise<SpeakResult> {
  const synth = window.speechSynthesis;
  const voices = await loadVoices();
  const voice = pickVoice(voices, tag, allowOnline);
  if (!voice && voices.length) return pickVoice(voices, tag, true) ? 'onlineOnly' : 'noVoice';
  synth.cancel();
  const online = !!voice && !voice.localService;
  const parts = splitForSpeech(online ? redactForOnline(text) : text);
  parts.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? tag;
    u.rate = 0.95;
    if (i === parts.length - 1) {
      u.onend = onEnd;
      u.onerror = onEnd;
    }
    synth.speak(u);
  });
  if (!parts.length) onEnd();
  return 'ok';
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
