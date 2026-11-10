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

describe('draft 2 text', async () => {
  const { STRINGS } = await import('./i18n');
  it('does not claim the EOIR-33/IC form needs no account (unconfirmed)', () => {
    expect(STRINGS.en.helpForms).not.toMatch(/account/i);
    expect(STRINGS.es.helpForms).not.toMatch(/cuenta/i);
  });
  it('has the new and changed explanations in both languages', () => {
    expect(STRINGS.en.mustKnow[1]).toMatch(/ICE check-ins are different from court hearings/);
    expect(STRINGS.es.mustKnow[1]).toMatch(/ICE/);
    expect(STRINGS.en.mustKnow[5]).toMatch(/at no cost to you/);
    expect(STRINGS.es.mustKnow[2]).toMatch(/con frecuencia/);
    expect(STRINGS.es.mustKnow.join(' ')).not.toMatch(/seguido/);
    expect(STRINGS.es.hearing.master.title).toMatch(/^Audiencia de calendario principal/);
    expect(STRINGS.en.notice.judge_order.body[2]).toMatch(/Board of Immigration Appeals.*30 days/);
    expect(STRINGS.en.mustKnow).toHaveLength(STRINGS.es.mustKnow.length);
  });
});
