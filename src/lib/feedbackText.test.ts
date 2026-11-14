import { describe, expect, it } from 'vitest';
import { FEEDBACK } from './feedbackText';
import { LANGS, STRINGS, type Lang } from './i18n';
import { LEGAL } from './legal';

const ALL = LANGS.map((l) => l.code) as Lang[];
const walk = (o: unknown): string[] =>
  typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(walk) : o && typeof o === 'object' ? Object.values(o).flatMap(walk) : [];

describe('feedback prompt text', () => {
  it.each(ALL)('%s has every field filled in', (lang) => {
    const t = FEEDBACK[lang];
    expect(Object.keys(t).sort()).toEqual(Object.keys(FEEDBACK.en).sort());
    expect(Object.keys(t.kinds).sort()).toEqual(Object.keys(FEEDBACK.en.kinds).sort());
    expect(t.starLabels).toHaveLength(5);
    for (const s of walk(t)) expect(s.trim().length, lang).toBeGreaterThan(0);
  });

  it.each(ALL)('%s says ratings are about LexCourt only and warns against sensitive details', (lang) => {
    expect(FEEDBACK[lang].aboutLexCourt).toContain('LexCourt');
    expect(FEEDBACK[lang].doNotInclude).toMatch(/A-Number/);
  });

  it('Urdu: every left-to-right isolate is closed', () => {
    for (const s of [...walk(FEEDBACK.ur), ...walk(LEGAL.ur), ...walk(STRINGS.ur)]) {
      let depth = 0;
      for (const ch of s) {
        if (ch === '⁦') depth++;
        if (ch === '⁩') depth--;
        expect(depth).toBeGreaterThanOrEqual(0);
      }
      expect(depth, s.slice(0, 50)).toBe(0);
    }
  });
});

describe('legal text covers feedback (draft 6)', () => {
  it.each(ALL)('%s: Terms section 17 and a Privacy Policy feedback section', (lang) => {
    const L = LEGAL[lang];
    expect(L.terms.sections.length).toBeGreaterThanOrEqual(17);
    expect(parseInt(L.terms.sections[16].heading, 10)).toBe(17);
    expect(L.privacy.sections).toHaveLength(10);
    const fb = L.privacy.sections[5];
    expect(fb.paragraphs).toHaveLength(4);
    expect(fb.paragraphs!.join(' ')).toContain('Supabase');
    expect(fb.paragraphs![3]).toContain('[CONTACT EMAIL]');
    expect(L.privacy.sections.map((s) => s.paragraphs?.length ?? 0)).toEqual(LEGAL.en.privacy.sections.map((s) => s.paragraphs?.length ?? 0));
  });

  it('English wording', () => {
    expect(LEGAL.en.terms.sections[16].heading).toBe('17. Feedback');
    expect(LEGAL.en.privacy.sections[5].heading).toBe('Feedback you choose to send');
    expect(LEGAL.en.privacy.sections[5].paragraphs!.join(' ')).toMatch(/only if you tick the box allowing it and a reviewer approves it/);
    expect(LEGAL.en.privacy.sections[5].paragraphs![3]).toMatch(/ATTORNEY REVIEW/);
  });
});
