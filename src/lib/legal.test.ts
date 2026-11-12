import { describe, expect, it } from 'vitest';
import { IS_DRAFT, LEGAL, TERMS_VERSION, hasAcceptedTerms, recordTermsAccepted, type LegalDoc } from './legal';

const allText = (d: LegalDoc) =>
  [d.title, ...d.sections.flatMap((s) => [s.heading, ...(s.paragraphs ?? []), ...(s.bullets ?? [])])].join(' ');

/** Statements every version must make, per language. */
const REQUIRED = {
  en: {
    notLawFirm: /not a law firm/i,
    noAdvice: /(does not|not) (give|provide) legal advice|not legal advice/i,
    noRelationship: /does not create an attorney-client relationship/i,
    errors: /mistakes|errors/i,
    checkNotice: /official notice/i,
    checkCourt: /acis\.eoir\.justice\.gov|court’s case information/i,
    getHelp: /attorney or (an? )?(DOJ-)?accredited representative/i,
  },
  es: {
    notLawFirm: /no es un bufete de abogados/i,
    noAdvice: /no (da|ofrece) asesor[ií]a legal|no asesor[ií]a legal/i,
    noRelationship: /no crea una relaci[oó]n abogado-cliente/i,
    errors: /errores/i,
    checkNotice: /aviso oficial/i,
    checkCourt: /acis\.eoir\.justice\.gov|informaci[oó]n de (su caso en )?la corte/i,
    getHelp: /abogado o (un |de un )?representante acreditado/i,
  },
} as const;

describe('legal text', () => {
  for (const lang of ['en', 'es'] as const) {
    const L = LEGAL[lang];
    describe(lang, () => {
      it.each(Object.entries(REQUIRED[lang]))('short on-screen disclaimer states: %s', (_k, re) => {
        expect(L.short).toMatch(re);
      });
      it.each(Object.entries(REQUIRED[lang]))('full disclaimer states: %s', (_k, re) => {
        expect(allText(L.disclaimer)).toMatch(re);
      });
      it.each(Object.entries(REQUIRED[lang]))('terms of use state: %s', (_k, re) => {
        expect(allText(L.terms)).toMatch(re);
      });
      it('acceptance checkbox covers no advice, errors and checking details', () => {
        expect(L.acceptCheckbox).toMatch(REQUIRED[lang].notLawFirm);
        expect(L.acceptCheckbox).toMatch(REQUIRED[lang].errors);
      });
    });
  }

  it('English and Spanish documents have the same sections', () => {
    for (const doc of ['disclaimer', 'terms', 'privacy'] as const) {
      const en = LEGAL.en[doc].sections;
      const es = LEGAL.es[doc].sections;
      expect(es.length, doc).toBe(en.length);
      es.forEach((s, i) => {
        expect(s.paragraphs?.length ?? 0, `${doc} §${i + 1}`).toBe(en[i].paragraphs?.length ?? 0);
        expect(s.bullets?.length ?? 0, `${doc} §${i + 1}`).toBe(en[i].bullets?.length ?? 0);
      });
    }
  });

  it('is marked as a draft needing attorney review', () => {
    expect(IS_DRAFT).toBe(true);
    expect(TERMS_VERSION).toMatch(/draft/);
    expect(LEGAL.en.draftBadge).toMatch(/draft/i);
    expect(LEGAL.en.draftBadge).toMatch(/attorney review/i);
    expect(LEGAL.es.draftBadge).toMatch(/borrador/i);
    expect(LEGAL.es.draftBadge).toMatch(/revisi[oó]n de un abogado/i);
  });
});

describe('terms acceptance', () => {
  const fakeStore = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
  };

  it('is remembered for the current version only', () => {
    const s = fakeStore();
    expect(hasAcceptedTerms(s)).toBe(false);
    recordTermsAccepted(s);
    expect(hasAcceptedTerms(s)).toBe(true);
    expect([...s.m.values()]).toEqual([TERMS_VERSION]); // nothing else is stored
    s.m.set('lexcourt.termsAccepted', 'an-older-version');
    expect(hasAcceptedTerms(s)).toBe(false);
  });

  it('asks again (and does not crash) when storage is unavailable', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    };
    expect(() => recordTermsAccepted(broken)).not.toThrow();
    expect(hasAcceptedTerms(broken)).toBe(false);
    expect(hasAcceptedTerms(null)).toBe(false);
  });
});

describe('draft 2 changes', () => {
  const terms = (lang: 'en' | 'es' | 'hi' | 'pa' | 'ur') => LEGAL[lang].terms.sections;
  const text = (lang: 'en' | 'es' | 'hi' | 'pa' | 'ur') => allText(LEGAL[lang].terms);

  it('has a "Users under 18" section and the same sentence on the acceptance screen', () => {
    expect(terms('en')[5].heading).toBe('6. Users under 18');
    expect(terms('es')[5].heading).toBe('6. Usuarios menores de 18 años');
    for (const lang of ['en', 'es'] as const) expect(LEGAL[lang].acceptIntro).toContain(terms(lang)[5].paragraphs![0]);
  });

  it('numbers the Terms sections 1–17 in order, in every language', () => {
    for (const lang of ['en', 'es', 'hi', 'pa', 'ur'] as const)
      expect(terms(lang).map((s) => parseInt(s.heading, 10))).toEqual(Array.from({ length: 17 }, (_, i) => i + 1));
  });

  it('adds severability, entire agreement and Pennsylvania governing law with placeholders', () => {
    expect(text('en')).toMatch(/Severability/);
    expect(text('en')).toMatch(/Entire agreement/);
    expect(text('es')).toMatch(/Divisibilidad/);
    expect(text('es')).toMatch(/Acuerdo completo/);
    for (const lang of ['en', 'es'] as const) {
      const last = terms(lang)[14].paragraphs![0];
      expect(last).toMatch(/Pennsylvania|Pensilvania/);
      expect(last).toContain('[OPERATOR NAME]');
      expect(last).toContain('[CONTACT EMAIL]');
      const privacyLast = LEGAL[lang].privacy.sections[7].paragraphs![0];
      expect(privacyLast).toContain('[OPERATOR NAME]');
      expect(privacyLast).toContain('[CONTACT EMAIL]');
    }
  });

  it('privacy policy says the notice and its details are never received', () => {
    expect(LEGAL.en.privacy.sections[1].paragraphs![1]).toMatch(/never receives your notice or the details from it/);
    expect(LEGAL.es.privacy.sections[1].paragraphs![1]).toMatch(/nunca recibe su aviso ni los datos/);
  });

  it('asks everyone to accept the changed terms again', () => {
    expect(TERMS_VERSION).not.toBe('2026-11-10-draft');
  });
});


describe('Language section (English version controls)', () => {
  const LANGS_ALL = ['en', 'es', 'hi', 'pa', 'ur'] as const;
  const EN_TERMS =
    'These Terms are written in English and translated for convenience. If a translation differs from the English version, the English version controls.';

  it('is Terms section 16, with the exact English wording', () => {
    const last = LEGAL.en.terms.sections[15];
    expect(last.heading).toBe('16. Language');
    expect(last.paragraphs).toEqual([EN_TERMS]);
  });

  it('is the last section of the Privacy Policy', () => {
    const last = LEGAL.en.privacy.sections[LEGAL.en.privacy.sections.length - 1];
    expect(last.heading).toBe('Language');
    expect(last.paragraphs![0]).toBe(
      'This Privacy Policy is written in English and translated for convenience. If a translation differs from the English version, the English version controls.',
    );
  });

  it('appears in every language, and the acceptance screen repeats the Terms sentence', () => {
    for (const lang of LANGS_ALL) {
      const L = LEGAL[lang];
      const termsSentence = L.terms.sections[15].paragraphs![0];
      expect(termsSentence.length, lang).toBeGreaterThan(40);
      expect(L.privacy.sections[L.privacy.sections.length - 1].paragraphs![0].length, lang).toBeGreaterThan(40);
      expect(L.acceptLanguageNote, lang).toBe(termsSentence);
    }
    expect(LEGAL.en.acceptLanguageNote).toBe(EN_TERMS);
  });

  it('asks everyone to accept the changed Terms again', () => {
    expect(TERMS_VERSION).not.toBe('2026-11-10-draft-2');
    expect(TERMS_VERSION).toMatch(/draft/);
  });
});
