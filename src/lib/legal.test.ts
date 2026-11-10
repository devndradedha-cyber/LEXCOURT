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
