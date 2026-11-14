import { describe, expect, it } from 'vitest';
import { FEATURES } from './featuresText';
import { STRINGS } from './i18n';
import { gurmukhiToDevanagari, splitForSpeech, stripEnglishGlosses } from './readAloud';

const walk = (o: unknown): string[] =>
  typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(walk) : o && typeof o === 'object' ? Object.values(o).flatMap(walk) : [];

describe('read aloud skips English glosses in brackets', () => {
  it('removes "(Notice to Appear)" and "(A-Number)" but keeps the Hindi', () => {
    expect(stripEnglishGlosses('यह नोटिस टू अपीयर (Notice to Appear) है।')).toBe('यह नोटिस टू अपीयर है।');
    expect(stripEnglishGlosses('अपना ए-नंबर (A-Number) लिखें: 123।')).toBe('अपना ए-नंबर लिखें: 123।');
    expect(stripEnglishGlosses('ਨੋਟਿਸ ਟੂ ਅਪੀਅਰ (Notice to Appear), ਅਤੇ')).toBe('ਨੋਟਿਸ ਟੂ ਅਪੀਅਰ, ਅਤੇ');
  });

  it('mixed brackets keep the Hindi part', () => {
    expect(stripEnglishGlosses('हाज़िर होने का नोटिस (Notice to Appear, फ़ॉर्म I-862)')).toBe('हाज़िर होने का नोटिस (फ़ॉर्म I-862)');
  });

  it('Urdu: also removes glosses wrapped in left-to-right isolates', () => {
    expect(stripEnglishGlosses('اپنا اے نمبر ⁦(A-Number)⁩ لکھیں')).toBe('اپنا اے نمبر لکھیں');
  });

  it('keeps brackets that contain Hindi or Punjabi, and keeps English outside brackets', () => {
    expect(stripEnglishGlosses('ऑनलाइन (मुफ़्त) देखें')).toBe('ऑनलाइन (मुफ़्त) देखें');
    expect(stripEnglishGlosses('LexCourt खोलें')).toBe('LexCourt खोलें');
  });

  it.each(['hi', 'pa'] as const)('%s: no English word in brackets is left in any explanation', (lang) => {
    const all = [...walk(STRINGS[lang]), ...walk(FEATURES[lang])].filter((s) => /\([A-Za-z]/.test(s));
    expect(all.length).toBeGreaterThan(5); // the text really has glosses
    for (const s of all) {
      const spoken = splitForSpeech(stripEnglishGlosses(s)).join(' ');
      // Form numbers like "फ़ॉर्म I-862" may stay; English words in brackets may not.
      expect(spoken, s).not.toMatch(/\(\s*[A-Za-z]{2,}/);
    }
  });

  it('Punjabi read with a Hindi voice: glosses removed before the script conversion', () => {
    const out = gurmukhiToDevanagari(stripEnglishGlosses('ਤੁਹਾਡਾ ਏ-ਨੰਬਰ (A-Number)'));
    expect(out).toBe('तुहाडा ए-नंबर');
  });
});

describe('voice input language tags', () => {
  it('tries pa-Guru-IN, then the plain pa-IN; others as they are', async () => {
    const { speechTags } = await import('./speech');
    expect(speechTags('pa-Guru-IN')).toEqual(['pa-Guru-IN', 'pa-IN']);
    expect(speechTags('hi-IN')).toEqual(['hi-IN']);
    expect(speechTags('ur-PK')).toEqual(['ur-PK']);
  });
});
