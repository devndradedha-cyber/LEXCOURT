import { describe, expect, it } from 'vitest';
import { LANGS, STRINGS, type Lang } from './i18n';
import { LEGAL } from './legal';
import { SUMMARY, TOOLS } from './toolsText';

const NEW = ['hi', 'pa', 'ur'] as const satisfies readonly Lang[];

/** Structure of a value: same keys, same array lengths, same kinds of values. */
const shape = (o: unknown): unknown =>
  Array.isArray(o)
    ? o.map(shape)
    : typeof o === 'object' && o
      ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, shape(v)]))
      : typeof o;

/** Every string in a value (functions are called with sample arguments). */
function strings(o: unknown): string[] {
  if (typeof o === 'string') return [o];
  if (typeof o === 'function') return [(o as (...a: unknown[]) => string)('Texas', 5)];
  if (Array.isArray(o)) return o.flatMap(strings);
  if (o && typeof o === 'object') return Object.values(o).flatMap(strings);
  return [];
}

/** Text as people read it: without invisible direction marks. */
const visible = (s: string) => s.replace(/[⁦-⁩‎‏]/g, '');

describe('languages', () => {
  it('menu lists English, Español, हिन्दी, ਪੰਜਾਬੀ, اردو in that order', () => {
    expect(LANGS.map((l) => l.name)).toEqual(['English', 'Español', 'हिन्दी', 'ਪੰਜਾਬੀ', 'اردو']);
    expect(LANGS.find((l) => l.code === 'ur')!.dir).toBe('rtl');
    expect(LANGS.filter((l) => l.dir === 'rtl').map((l) => l.code)).toEqual(['ur']);
  });

  it.each(NEW)('%s has exactly the same text structure as English', (lang) => {
    expect(shape(STRINGS[lang])).toEqual(shape(STRINGS.en));
    expect(shape(LEGAL[lang])).toEqual(shape(LEGAL.en));
    expect(shape(TOOLS[lang])).toEqual(shape(TOOLS.en));
    expect(shape(SUMMARY[lang])).toEqual(shape(SUMMARY.en));
  });

  it.each(NEW)('%s has no empty text where English has text', (lang) => {
    const en = strings({ s: STRINGS.en, l: LEGAL.en, t: TOOLS.en, m: SUMMARY.en });
    const tr = strings({ s: STRINGS[lang], l: LEGAL[lang], t: TOOLS[lang], m: SUMMARY[lang] });
    expect(tr.length).toBe(en.length);
    tr.forEach((t, i) => {
      if (en[i].trim()) expect(t.trim(), `item ${i}: ${en[i].slice(0, 40)}`).not.toBe('');
    });
  });

  it.each(NEW)('%s is marked as a draft translation needing native speaker review', (lang) => {
    expect(LANGS.find((l) => l.code === lang)!.draftTranslation).toBe(true);
    expect(visible(STRINGS[lang].translationDraft)).toContain('DRAFT, needs native speaker review');
    expect(visible(LEGAL[lang].draftBadge)).toContain('DRAFT — needs attorney review');
  });

  it('English and Spanish are not marked as draft translations', () => {
    expect(STRINGS.en.translationDraft).toBe('');
    expect(STRINGS.es.translationDraft).toBe('');
  });

  describe('immigration terms are kept in English in brackets', () => {
    it.each(NEW)('%s', (lang) => {
      const S = STRINGS[lang];
      const v = (s: string) => visible(s);
      expect(v(S.notice.notice_to_appear.title)).toMatch(/\(Notice to Appear/);
      expect(v(S.notice.notice_of_hearing.title)).toContain('(Notice of Hearing)');
      expect(v(S.hearing.master.title)).toContain('(master calendar hearing)');
      expect(v(S.fieldANumber)).toContain('(A-Number)');
      expect(v(S.mustKnow[3])).toContain('EOIR-33/IC');
      expect(v(S.mustKnow[0])).toContain('(in absentia)');
      expect(v(S.notice.judge_order.body[2])).toContain('(Board of Immigration Appeals)');
      expect(v(S.mustKnow[1])).toContain('(ICE check-in)');
    });
  });

  it('keeps placeholders and contact details unchanged in every language', () => {
    for (const lang of NEW) {
      const terms = visible(LEGAL[lang].terms.sections[14].paragraphs![0]);
      expect(terms).toContain('[OPERATOR NAME]');
      expect(terms).toContain('[CONTACT EMAIL]');
      expect(terms).toMatch(/Commonwealth of Pennsylvania/);
      expect(visible(STRINGS[lang].reminderDescription(true))).toContain('1-800-898-7180');
      expect(visible(STRINGS[lang].reminderDescription(true))).toContain('acis.eoir.justice.gov');
    }
  });

  it('Urdu: every left-to-right isolate is closed', () => {
    for (const s of strings({ s: STRINGS.ur, l: LEGAL.ur, t: TOOLS.ur, m: SUMMARY.ur })) {
      let depth = 0;
      for (const ch of s) {
        if (ch === '⁦') depth++;
        if (ch === '⁩') depth--;
        expect(depth, s.slice(0, 60)).toBeGreaterThanOrEqual(0);
      }
      expect(depth, s.slice(0, 60)).toBe(0);
    }
  });

  it('uses the right script for each language', () => {
    const script = { hi: /[ऀ-ॿ]/, pa: /[਀-੿]/, ur: /[؀-ۿ]/ } as const;
    for (const lang of NEW) {
      expect(STRINGS[lang].startTitle).toMatch(script[lang]);
      expect(LEGAL[lang].terms.title).toMatch(script[lang]);
      expect(TOOLS[lang].report.title).toMatch(script[lang]);
    }
  });
});
