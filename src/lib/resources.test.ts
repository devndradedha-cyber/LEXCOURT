import { describe, expect, it } from 'vitest';
import { LINKS } from './resources';

describe('LINKS', () => {
  it('has the same resources in English and Spanish', () => {
    expect(Object.keys(LINKS.es).sort()).toEqual(Object.keys(LINKS.en).sort());
  });

  it('uses only HTTPS links on official or known nonprofit domains', () => {
    const allowed = /^https:\/\/([a-z]+\.)?(justice\.gov|eoir\.justice\.gov|immigrationadvocates\.org)\//;
    for (const lang of ['en', 'es'] as const) {
      for (const [key, value] of Object.entries(LINKS[lang])) {
        if (key === 'caseStatusPhone') continue;
        expect(value, `${lang}.${key}`).toMatch(allowed);
      }
    }
  });

  it('links each language to its own version of the court sites', () => {
    expect(LINKS.es.caseStatus).toContain('/es/');
    expect(LINKS.es.courtGuide).toContain('/es/');
    expect(LINKS.es.changeOfAddress).toContain('/es/');
  });
});
