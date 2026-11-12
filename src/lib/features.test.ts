import { describe, expect, it } from 'vitest';
import { aidSummaryFields, aidSummaryHtml, aidSummaryText } from './aidSummary';
import { aNumberDigits } from '../components/CaseStatus';
import type { NoticeFacts } from './extract';
import { FEATURES, TERM_IDS } from './featuresText';
import { segmentGlossary, termsIn } from './glossary';
import { STRINGS, type Lang } from './i18n';
import { LEGAL } from './legal';
import { pickVoice, splitForSpeech } from './readAloud';
import { buildMonthlyIcs, monthlyDay } from './reminders';

const LANGS: Lang[] = ['en', 'es', 'hi', 'pa', 'ur'];
const shape = (o: unknown): unknown =>
  Array.isArray(o) ? o.map(shape) : typeof o === 'object' && o ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, shape(v)])) : typeof o;
const visible = (s: string) => s.replace(/[⁦-⁩‎‏]/g, '');

const FACTS: NoticeFacts = {
  noticeType: 'notice_of_hearing',
  hearingType: 'master',
  date: '2027-03-03',
  time: '08:30',
  dateToBeSet: false,
  courtAddress: '26 FEDERAL PLAZA, ROOM 1237\nNEW YORK, NY 10278',
  remote: false,
  aNumber: '123-456-789',
};

describe('feature text', () => {
  it.each(LANGS)('%s has the same structure as English and no empty text', (lang) => {
    expect(shape(FEATURES[lang])).toEqual(shape(FEATURES.en));
    const walk = (o: unknown): string[] =>
      typeof o === 'string' ? [o] : Array.isArray(o) ? o.flatMap(walk) : o && typeof o === 'object' ? Object.values(o).flatMap(walk) : [];
    for (const s of walk(FEATURES[lang])) expect(s.trim()).not.toBe('');
  });

  it.each(LANGS)('%s keeps the {aNumber} placeholder in the steps', (lang) => {
    const t = FEATURES[lang].status;
    expect(t.onlineSteps.filter((s) => s.includes('{aNumber}'))).toHaveLength(1);
    expect(t.phoneSteps.filter((s) => s.includes('{aNumber}'))).toHaveLength(1);
  });

  it('Urdu: every left-to-right isolate is closed', () => {
    const walk = (o: unknown): string[] =>
      typeof o === 'string' ? [o] : typeof o === 'function' ? [(o as (a: string) => string)('123456789')] : Array.isArray(o) ? o.flatMap(walk) : o && typeof o === 'object' ? Object.values(o).flatMap(walk) : [];
    for (const s of walk(FEATURES.ur)) {
      let depth = 0;
      for (const ch of s) {
        if (ch === '⁦') depth++;
        if (ch === '⁩') depth--;
        expect(depth).toBeGreaterThanOrEqual(0);
      }
      expect(depth, s.slice(0, 50)).toBe(0);
    }
  });

  it('keeps the immigration terms in English in the glossary names', () => {
    for (const lang of ['hi', 'pa', 'ur'] as const) {
      const g = FEATURES[lang].glossary.terms;
      expect(visible(g.noticeToAppear.term)).toContain('(Notice to Appear)');
      expect(visible(g.masterHearing.term)).toContain('(master calendar hearing)');
      expect(visible(g.aNumber.term)).toContain('(A-Number)');
      expect(visible(g.inAbsentia.term)).toContain('(in absentia)');
    }
  });
});

describe('glossary', () => {
  it.each(LANGS)('%s: each term’s own name is recognised as that term', (lang) => {
    for (const id of TERM_IDS) expect(termsIn(FEATURES[lang].glossary.terms[id].term, lang), id).toContain(id);
  });

  it.each(LANGS)('%s: key terms are underlined in the explanations', (lang) => {
    const S = STRINGS[lang];
    expect(termsIn(S.notice.notice_to_appear.title, lang)).toContain('noticeToAppear');
    expect(termsIn(S.hearing.master.title, lang)).toContain('masterHearing');
    expect(termsIn(S.hearing.individual.title, lang)).toContain('individualHearing');
    expect(termsIn(S.mustKnow[0], lang)).toContain('inAbsentia');
    expect(termsIn(S.notice.judge_order.body[2], lang)).toContain('appeal');
  });

  it('never loses or changes text', () => {
    for (const lang of LANGS)
      for (const text of [...STRINGS[lang].mustKnow, ...FEATURES[lang].status.intro])
        expect(segmentGlossary(text, lang).map((s) => s.text).join('')).toBe(text.normalize('NFC'));
  });

  it('links only the first appearance, and not inside longer words', () => {
    const segs = segmentGlossary('An appeal. Another appeal. Appealing is different from appeals.', 'en');
    expect(segs.filter((s) => s.term)).toHaveLength(1);
    expect(termsIn('reappealed', 'en')).toEqual([]);
  });
});

describe('read aloud', () => {
  const v = (lang: string, localService: boolean, name = lang) => ({ lang, localService, name });

  it('uses only voices on the device', () => {
    expect(pickVoice([v('hi-IN', false, 'Google हिन्दी')], 'hi-IN')).toBeNull();
    expect(pickVoice([v('hi-IN', false), v('hi-IN', true, 'Lekha')], 'hi-IN')?.name).toBe('Lekha');
  });

  it('matches by language when the region differs, and handles pa-Guru-IN', () => {
    expect(pickVoice([v('es-MX', true)], 'es-US')?.lang).toBe('es-MX');
    expect(pickVoice([v('pa-IN', true)], 'pa-Guru-IN')?.lang).toBe('pa-IN');
    expect(pickVoice([v('ur_PK', true)], 'ur-PK')?.lang).toBe('ur_PK');
    expect(pickVoice([v('en-US', true)], 'ur-PK')).toBeNull();
  });

  it('splits text into sentences in every script and removes direction marks', () => {
    expect(splitForSpeech('पहला वाक्य। दूसरा वाक्य।')).toEqual(['पहला वाक्य।', 'दूसरा वाक्य।']);
    expect(splitForSpeech('پہلا جملہ۔ دوسرا جملہ؟')).toEqual(['پہلا جملہ۔', 'دوسرا جملہ؟']);
    expect(splitForSpeech('One. Two!')).toEqual(['One.', 'Two!']);
    expect(splitForSpeech('اے نمبر ⁦(A-Number)⁩')).toEqual(['اے نمبر (A-Number)']);
    for (const part of splitForSpeech('word '.repeat(200))) expect(part.length).toBeLessThanOrEqual(220);
  });
});

describe('case status helper', () => {
  it('turns an A-Number into the 9 digits the court expects', () => {
    expect(aNumberDigits('A-123-456-789')).toBe('123456789');
    expect(aNumberDigits('A 12 345 678')).toBe('012345678');
    expect(aNumberDigits('12345')).toBeNull();
  });

  it('monthly reminder repeats 12 times, from next month, on a day every month has', () => {
    const ics = buildMonthlyIcs({ title: 'Check', description: 'd', from: new Date(2026, 0, 31), now: new Date(Date.UTC(2026, 0, 31)) });
    expect(ics).toContain('RRULE:FREQ=MONTHLY;BYMONTHDAY=28;COUNT=12');
    expect(ics).toContain('DTSTART:20260228T100000');
    expect(monthlyDay(new Date(2026, 10, 12))).toBe(12);
  });

  it.each(LANGS)('%s: reminder has the A-Number only when the person chooses it', (lang) => {
    const t = FEATURES[lang].status;
    expect(visible(t.reminderEventDescription(null))).not.toContain('123456789');
    expect(visible(t.reminderEventDescription('123456789'))).toContain('123456789');
    expect(visible(t.reminderEventDescription(null))).toContain('1-800-898-7180');
  });
});

describe('legal aid summary', () => {
  const input = (over: Partial<Parameters<typeof aidSummaryHtml>[0]> = {}) => ({
    facts: FACTS,
    lang: 'en' as Lang,
    questions: 'Do I need a lawyer?\n\n<script>alert(1)</script>',
    includeANumber: true,
    today: new Date(2026, 10, 12),
    ...over,
  });

  it('has the notice details and the questions, escaped', () => {
    const html = aidSummaryHtml(input());
    expect(html).toContain('Notice of Hearing');
    expect(html).toContain('Wednesday, March 3, 2027');
    expect(html).toContain('26 FEDERAL PLAZA, ROOM 1237, NEW YORK, NY 10278');
    expect(html).toContain('123-456-789');
    expect(html).toContain('Do I need a lawyer?');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toMatch(/<script/i);
  });

  it('is self-contained: nothing loads from anywhere', () => {
    const html = aidSummaryHtml(input());
    expect(html).not.toMatch(/https?:|<link|<img|<iframe|src=/i);
  });

  it('leaves the A-Number out when the person unticks it', () => {
    const f = aidSummaryFields(input({ includeANumber: false }));
    expect(f.rows.find(([k]) => k === 'A-Number')![1]).toBe('Not included');
    expect(aidSummaryText(input({ includeANumber: false }))).not.toContain('123-456-789');
  });

  it('says "not found" for missing details', () => {
    const f = aidSummaryFields(input({ facts: { ...FACTS, date: null, time: null, courtAddress: null } }));
    expect(f.rows.filter(([, v]) => v.startsWith('Not found'))).toHaveLength(3);
  });

  it.each(LANGS)('%s: right direction and language', (lang) => {
    const html = aidSummaryHtml(input({ lang }));
    expect(html).toContain(`dir="${lang === 'ur' ? 'rtl' : 'ltr'}"`);
    expect(html).toContain(FEATURES[lang].aid.doc.heading);
    expect(html).toContain(FEATURES[lang].aid.doc.footer);
  });
});

describe('privacy policy covers the new features', () => {
  it.each(LANGS)('%s', (lang) => {
    const bullets = LEGAL[lang].privacy.sections[4].bullets!;
    expect(bullets).toHaveLength(6);
    expect(LEGAL[lang].privacy.sections.map((s) => s.bullets?.length ?? 0)).toEqual(LEGAL.en.privacy.sections.map((s) => s.bullets?.length ?? 0));
  });
  it('English wording', () => {
    const b = LEGAL.en.privacy.sections[4].bullets!.join(' ');
    expect(b).toContain('only uses voices installed on your device');
    expect(b).toContain('LexCourt never sends them');
  });
});
