import { describe, expect, it } from 'vitest';
import { DESIGN } from './designText';
import { LANGS, STRINGS, type Lang } from './i18n';
import { LEGAL } from './legal';
import { REMINDER_TEXT, formatReminderDate } from './reminderText';

const ALL = LANGS.map((l) => l.code) as Lang[];
const walk = (o: unknown): string[] =>
  typeof o === 'string'
    ? [o]
    : typeof o === 'function'
      ? [(o as (a: string, b: string, c: string) => string)('X', 'Y', 'Z'), (o as (n: number) => string)(1 as never)]
      : Array.isArray(o)
        ? o.flatMap(walk)
        : o && typeof o === 'object'
          ? Object.values(o).flatMap(walk)
          : [];

describe('reminder and redesign text', () => {
  it.each(ALL)('%s: every field is filled in, with the same keys as English', (lang) => {
    for (const [obj, en] of [
      [REMINDER_TEXT[lang], REMINDER_TEXT.en],
      [REMINDER_TEXT[lang].email, REMINDER_TEXT.en.email],
      [DESIGN[lang], DESIGN.en],
    ] as const) {
      expect(Object.keys(obj).sort()).toEqual(Object.keys(en).sort());
      for (const s of walk(obj)) expect(s.trim().length, lang).toBeGreaterThan(0);
    }
  });

  it('the required English wording', () => {
    expect(REMINDER_TEXT.en.disclaimer).toBe('Always double-check the date on your official notice. Reminders may fail. LexCourt is not responsible for missed dates.');
    expect(REMINDER_TEXT.en.title).toBe('Want a reminder?');
    expect(DESIGN.en.heroTitle).toBe('Understand your legal papers in your language');
    expect(DESIGN.en.scanButton).toBe('Scan a document');
    expect([DESIGN.en.cardMeaning, DESIGN.en.cardDate, DESIGN.en.cardHelp]).toEqual(['What this means', 'Your next date or deadline', 'Where to get free help']);
  });

  it.each(ALL)('%s: the email says tomorrow / in N days and keeps the label and date', (lang) => {
    const e = REMINDER_TEXT[lang].email;
    expect(e.when(1)).not.toMatch(/\d/);
    expect(e.when(7)).toContain('7');
    const line = e.reminderLine('LABEL', e.when(2), 'DATE');
    expect(line).toContain('LABEL');
    expect(line).toContain('DATE');
  });

  it('dates are formatted in each language without a time-zone shift', () => {
    expect(formatReminderDate('2027-03-04', 'en')).toBe('Thursday, March 4, 2027');
    expect(formatReminderDate('2027-03-04', 'es')).toBe('jueves, 4 de marzo de 2027');
    expect(formatReminderDate('2027-03-04', 'hi')).toContain('2027');
  });

  it('Urdu: every left-to-right isolate is closed', () => {
    for (const s of [...walk(REMINDER_TEXT.ur), ...walk(DESIGN.ur), ...walk(LEGAL.ur), ...walk(STRINGS.ur)]) {
      let depth = 0;
      for (const ch of s) {
        if (ch === '⁦') depth++;
        if (ch === '⁩') depth--;
        expect(depth).toBeGreaterThanOrEqual(0);
      }
      expect(depth, s.slice(0, 40)).toBe(0);
    }
  });
});

describe('legal text covers email reminders (draft 7)', () => {
  it.each(ALL)('%s: Terms section 18, Privacy Policy section and exception, privacy box', (lang) => {
    const L = LEGAL[lang];
    expect(L.terms.sections).toHaveLength(18);
    expect(parseInt(L.terms.sections[17].heading, 10)).toBe(18);
    expect(L.privacy.sections[6].paragraphs).toHaveLength(3);
    expect(L.privacy.sections[6].paragraphs!.join(' ')).toContain('Resend');
    expect(L.privacy.sections[1].paragraphs).toHaveLength(3);
    expect(STRINGS[lang].privacy).toHaveLength(STRINGS.en.privacy.length);
  });

  it('English wording', () => {
    expect(LEGAL.en.terms.sections[17].heading).toBe('18. Reminders');
    expect(LEGAL.en.terms.sections[17].paragraphs![0]).toMatch(/not responsible for missed dates/);
    expect(LEGAL.en.privacy.sections[6].heading).toBe('Email reminders you ask for');
    expect(LEGAL.en.privacy.sections[6].paragraphs![0]).toMatch(/We do not store your name, A-Number, case number, immigration status/);
    expect(STRINGS.en.privacy.join(' ')).toMatch(/If you ask for email reminders/);
    expect(STRINGS.en.privacy.join(' ')).not.toMatch(/Reminders go into your own calendar\. We never see them\./);
  });
});
