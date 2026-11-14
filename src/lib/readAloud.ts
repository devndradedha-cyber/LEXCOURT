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

/**
 * Gurmukhi (Punjabi) to Devanagari, letter by letter. Used only when the
 * device has no Punjabi voice: a Hindi voice can then read Punjabi words
 * closely enough to follow. The two scripts share the same Unicode layout
 * (Gurmukhi = Devanagari + 0x100) except for a few Punjabi-only marks.
 */
const GURMUKHI_SPECIAL: Record<string, string> = {
  'ੰ': 'ं', // tippi -> anusvara
  'ੲ': 'इ', // iri (vowel bearer)
  'ੳ': 'उ', // ura (vowel bearer)
  'ੴ': 'ओं', // ek onkar
  'ਖ਼': 'ख़', // khha
  'ਗ਼': 'ग़', // ghha
  'ਜ਼': 'ज़', // za
  'ੜ': 'ड़', // rra
  'ਫ਼': 'फ़', // fa
  'ੑ': '', // udaat
  'ੵ': '', // yakash
};
const isGurmukhiConsonant = (c: string) => {
  const n = c.codePointAt(0) ?? 0;
  return (n >= 0x0a15 && n <= 0x0a39) || (n >= 0x0a59 && n <= 0x0a5e);
};
export function gurmukhiToDevanagari(text: string): string {
  let out = '';
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const n = c.codePointAt(0) ?? 0;
    if (c === 'ੱ') {
      // addak: doubles the next consonant
      const next = chars[i + 1];
      if (next && isGurmukhiConsonant(next)) out += gurmukhiToDevanagari(next) + '्';
      continue;
    }
    if (c in GURMUKHI_SPECIAL) out += GURMUKHI_SPECIAL[c];
    else if (n >= 0x0a00 && n <= 0x0a7f) out += String.fromCodePoint(n - 0x100);
    else out += c;
  }
  // Gurmukhi sha and lla are often typed as sa/la + nukta.
  return out.replace(/\u0938\u093C/g, '\u0936').replace(/\u0932\u093C/g, '\u0932').replace(/\u0933/g, '\u0932');
}

/** Remove the script subtag (pa-Guru-IN -> pa-IN); phones' speech engines expect that. */
export function plainTag(tag: string): string {
  return tag.replace(/-[A-Z][a-z]{3}(?=-|$)/, '');
}

/**
 * Remove English glosses in brackets, such as "(Notice to Appear)" or
 * "(A-Number)", which Hindi, Punjabi and Urdu text adds after the term in its
 * own script. A Hindi or Punjabi voice mispronounces the English, and the
 * term has just been read in the person's language. Brackets that contain
 * any Indian or Urdu script are kept.
 */
export function stripEnglishGlosses(text: string): string {
  return text
    .replace(/\s*[\u2066\u2068]?\(\s*[A-Za-z][^()\u0600-\u06FF\u0900-\u0DFF]*\)[\u2069]?/g, '')
    // "(Notice to Appear, फ़ॉर्म I-862)" -> "(फ़ॉर्म I-862)"
    .replace(/\(\s*[A-Za-z][A-Za-z0-9 .'’\/&-]*,\s*(?=[^)]*[\u0600-\u06FF\u0900-\u0DFF])/g, '(')
    .replace(/[ \t]+([,.;:!?।۔،؟])/g, '$1');
}

/** Languages whose text carries English glosses in brackets. */
const GLOSSED = /^(hi|pa|ur)\b/i;

export type SpeakResult = 'ok' | 'viaHindi' | 'noVoice' | 'onlineOnly';

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
  let voice = pickVoice(voices, tag, allowOnline);
  let result: SpeakResult = 'ok';
  let body = GLOSSED.test(tag) ? stripEnglishGlosses(text) : text;
  // Punjabi: most iPhones and computers have no Punjabi voice. Read the
  // Gurmukhi text with a Hindi voice instead (letter-for-letter conversion).
  if (!voice && voices.length && tag.toLowerCase().startsWith('pa')) {
    const hindi = pickVoice(voices, 'hi-IN', allowOnline);
    if (hindi) {
      voice = hindi;
      result = 'viaHindi';
      body = gurmukhiToDevanagari(body);
    }
  }
  if (!voice && voices.length) {
    const online = pickVoice(voices, tag, true) ?? (tag.toLowerCase().startsWith('pa') ? pickVoice(voices, 'hi-IN', true) : null);
    return online ? 'onlineOnly' : 'noVoice';
  }
  synth.cancel();
  const online = !!voice && !voice.localService;
  const parts = splitForSpeech(online ? redactForOnline(body) : body);
  parts.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? plainTag(tag);
    u.rate = 0.95;
    if (i === parts.length - 1) {
      u.onend = onEnd;
      u.onerror = onEnd;
    }
    synth.speak(u);
  });
  if (!parts.length) onEnd();
  return result;
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}
