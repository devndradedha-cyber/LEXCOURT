import { describe, expect, it } from 'vitest';
import { extractNoticeFacts, findDates, findTimes } from './extract';

const TODAY = new Date(2026, 10, 10); // Nov 10, 2026

const NOTICE_OF_HEARING = `UNITED STATES DEPARTMENT OF JUSTICE
EXECUTIVE OFFICE FOR IMMIGRATION REVIEW
IMMIGRATION COURT
26 FEDERAL PLAZA, 12TH FLOOR, ROOM 1237
NEW YORK, NY 10278

To: JANE DOE
123 MAIN ST APT 4
BROOKLYN, NY 11201

RE: DOE, JANE
FILE: A123-456-789

NOTICE OF IN-PERSON HEARING IN REMOVAL PROCEEDINGS

Your case has been scheduled for a MASTER hearing before the Immigration Judge on Mar 3, 2027 at 08:30 AM at:
26 FEDERAL PLAZA, 12TH FLOOR, ROOM 1237
NEW YORK, NY 10278

Date: Nov 2, 2026`;

describe('extractNoticeFacts', () => {
  it('reads a typical Notice of Hearing', () => {
    const f = extractNoticeFacts(NOTICE_OF_HEARING, TODAY);
    expect(f.noticeType).toBe('notice_of_hearing');
    expect(f.hearingType).toBe('master');
    expect(f.date).toBe('2027-03-03');
    expect(f.time).toBe('08:30');
    expect(f.courtAddress).toBe('26 FEDERAL PLAZA, 12TH FLOOR, ROOM 1237\nNEW YORK, NY 10278');
    expect(f.aNumber).toBe('123-456-789');
    expect(f.remote).toBe(false);
    expect(f.dateToBeSet).toBe(false);
  });

  it('does not pick the respondent mailing address or the issue date', () => {
    const f = extractNoticeFacts(NOTICE_OF_HEARING, TODAY);
    expect(f.courtAddress).not.toContain('BROOKLYN');
    expect(f.date).not.toBe('2026-11-02');
  });

  it('recognises a Notice to Appear with the date to be set', () => {
    const f = extractNoticeFacts(
      `Notice to Appear (Form I-862)
You are ordered to appear before an immigration judge of the United States Department of Justice at:
1901 S BELL ST, SUITE 200
ARLINGTON, VA 22202
on a date to be set at a time to be set to show why you should not be removed.`,
      TODAY,
    );
    expect(f.noticeType).toBe('notice_to_appear');
    expect(f.date).toBeNull();
    expect(f.dateToBeSet).toBe(true);
    expect(f.courtAddress).toBe('1901 S BELL ST, SUITE 200\nARLINGTON, VA 22202');
  });

  it('detects an internet-based (Webex) individual hearing', () => {
    const f = extractNoticeFacts(
      'NOTICE OF INTERNET-BASED HEARING. Your INDIVIDUAL hearing is scheduled on 01/15/2027 at 1:00 PM via Webex.',
      TODAY,
    );
    expect(f.hearingType).toBe('individual');
    expect(f.remote).toBe(true);
    expect(f.date).toBe('2027-01-15');
    expect(f.time).toBe('13:00');
  });

  it('understands a spoken English description', () => {
    const f = extractNoticeFacts(
      'I got a letter from immigration court, my hearing is on March third at 9 a.m.',
      TODAY,
    );
    expect(f.date).toBe('2027-03-03');
    expect(f.time).toBe('09:00');
  });

  it('understands a spoken Spanish description', () => {
    const f = extractNoticeFacts(
      'Recibí un aviso de audiencia, tengo que ir a la corte el 15 de enero de 2027 a las 8:30 de la mañana',
      TODAY,
    );
    expect(f.noticeType).toBe('notice_of_hearing');
    expect(f.date).toBe('2027-01-15');
    expect(f.time).toBe('08:30');
  });

  it('returns empty facts for unrelated text', () => {
    const f = extractNoticeFacts('hello world', TODAY);
    expect(f).toMatchObject({ noticeType: 'unknown', date: null, time: null, courtAddress: null, aNumber: null });
  });
});

describe('findDates', () => {
  it('rolls month/day without a year forward to the next occurrence', () => {
    expect(findDates('on March 3', TODAY)[0].value).toBe('2027-03-03');
    expect(findDates('on December 1', TODAY)[0].value).toBe('2026-12-01');
  });

  it('rejects impossible dates', () => {
    expect(findDates('02/30/2027', TODAY)).toHaveLength(0);
  });
});

describe('findTimes', () => {
  it('ignores bare numbers', () => {
    expect(findTimes('room 1237 floor 12')).toHaveLength(0);
  });
  it('handles noon and midnight', () => {
    expect(findTimes('12:00 PM')[0].value).toBe('12:00');
    expect(findTimes('12:15 AM')[0].value).toBe('00:15');
  });
});

describe('never confuses the person’s own address or the printed date with the hearing details', () => {
  const THEIRS = /EXAMPLE|QUEENS|11375/i;

  const cases: [string, string][] = [
    [
      '"To:" label lost by OCR, name line above the address',
      `DOE, JANE
123 EXAMPLE STREET
QUEENS, NY 11375
Date: Nov 2, 2026
NOTICE OF HEARING IN REMOVAL PROCEEDINGS
Your case has been scheduled for a MASTER hearing on Jan 15, 2027 at 08:30 AM at:
26 FEDERAL PLAZA, ROOM 1237
NEW YORK, NY 10278`,
    ],
    [
      'printed date label on the line above the date',
      `Date:
11/02/2026
To: DOE, JANE
123 EXAMPLE STREET
QUEENS, NY 11375
NOTICE OF HEARING. Your hearing is scheduled on 01/15/2027 at 8:30 AM at 26 FEDERAL PLAZA, NEW YORK, NY 10278`,
    ],
    [
      'Spanish labels (Para: / Fecha:)',
      `Fecha: 2 de noviembre de 2026
Para: DOE, JANE
123 EXAMPLE STREET
QUEENS, NY 11375
AVISO DE AUDIENCIA. Su audiencia está programada para el 15 de enero de 2027 a las 8:30 de la mañana en 26 FEDERAL PLAZA, NEW YORK, NY 10278`,
    ],
    [
      'certificate of service date after the hearing date',
      `NOTICE OF HEARING
Your case has been scheduled for a MASTER hearing on Jan 15, 2027 at 08:30 AM at 26 FEDERAL PLAZA, NEW YORK, NY 10278
CERTIFICATE OF SERVICE
This document was served by mail to: DOE, JANE
123 EXAMPLE STREET
QUEENS, NY 11375
on Dec 20, 2026 by court staff`,
    ],
  ];

  it.each(cases)('%s', (_name, text) => {
    const f = extractNoticeFacts(text, TODAY);
    expect(f.date).toBe('2027-01-15');
    expect(f.time).toBe('08:30');
    expect(f.courtAddress).toMatch(/26 FEDERAL PLAZA/);
    expect(f.courtAddress).toMatch(/NEW YORK, NY 10278/);
    expect(f.courtAddress).not.toMatch(THEIRS);
  });

  it('leaves the court address blank when only the person’s address is readable', () => {
    const f = extractNoticeFacts(
      `To: DOE, JANE
123 EXAMPLE STREET
QUEENS, NY 11375
NOTICE OF HEARING. Your hearing is scheduled on Jan 15, 2027 at 8:30 AM at [unreadable]`,
      TODAY,
    );
    expect(f.courtAddress).toBeNull();
    expect(f.date).toBe('2027-01-15');
  });

  it('leaves the hearing date blank when only the printed date is readable', () => {
    const f = extractNoticeFacts(
      `Date: Nov 2, 2026
NOTICE OF HEARING. Your hearing is scheduled on J#n 1S, 2O27 at 26 FEDERAL PLAZA, NEW YORK, NY 10278`,
      TODAY,
    );
    expect(f.date).toBeNull();
    expect(f.time).toBeNull();
  });

  it('does not treat "individual authorized to practice" boilerplate as an individual hearing', () => {
    const f = extractNoticeFacts(
      'MASTER hearing on Jan 15, 2027. You may be represented by an attorney or other individual authorized to practice.',
      TODAY,
    );
    expect(f.hearingType).toBe('master');
  });
});

describe('spoken or typed descriptions in Hindi, Punjabi and Urdu', () => {
  const cases: [string, string, Partial<ReturnType<typeof extractNoticeFacts>>][] = [
    ['Hindi', 'मेरी सुनवाई 3 मार्च 2027 को सुबह 8:30 बजे है', { date: '2027-03-03', time: '08:30' }],
    ['Hindi, Devanagari digits, afternoon', 'मेरी पेशी १५ जनवरी २०२७ को दोपहर 1 बजे है', { date: '2027-01-15', time: '13:00' }],
    ['Hindi, evening', 'अदालत में सुनवाई 9 दिसंबर को शाम 5:15 बजे', { date: '2026-12-09', time: '17:15' }],
    ['Punjabi', 'ਮੇਰੀ ਸੁਣਵਾਈ 3 ਮਾਰਚ 2027 ਨੂੰ ਸਵੇਰੇ 8:30 ਵਜੇ ਹੈ', { date: '2027-03-03', time: '08:30' }],
    ['Punjabi, Gurmukhi digits', 'ਅਦਾਲਤ ਵਿੱਚ ਸੁਣਵਾਈ ੨੦ ਫ਼ਰਵਰੀ ੨੦੨੭ ਨੂੰ ਦੁਪਹਿਰ 2 ਵਜੇ', { date: '2027-02-20', time: '14:00' }],
    ['Urdu', 'میری سماعت 3 مارچ 2027 کو صبح 8:30 بجے ہے', { date: '2027-03-03', time: '08:30' }],
    ['Urdu, Urdu digits, Arabic yeh', 'عدالت میں سماعت ۱۵ جنوري ۲۰۲۷ کو شام 4 بجے', { date: '2027-01-15', time: '16:00' }],
  ];
  it.each(cases)('%s', (_name, text, expected) => {
    expect(extractNoticeFacts(text, TODAY)).toMatchObject(expected);
  });

  it('reads the example text shown in each language’s text box', async () => {
    const { STRINGS } = await import('./i18n');
    for (const lang of ['hi', 'pa', 'ur'] as const) {
      const example = STRINGS[lang].typePlaceholder.replace(/^[^:]*:\s*/, '');
      const f = extractNoticeFacts(example, TODAY);
      expect(f, lang).toMatchObject({ noticeType: 'notice_of_hearing', hearingType: 'master', date: '2027-03-03', time: '08:30' });
      expect(f.courtAddress, lang).toBe('26 Federal Plaza\nNew York, NY 10278');
    }
  });

  it('still never confuses a printed date in Hindi text with the hearing date', () => {
    const f = extractNoticeFacts('Date: Nov 2, 2026\nमेरी सुनवाई 15 जनवरी 2027 को सुबह 9 बजे है', TODAY);
    expect(f.date).toBe('2027-01-15');
    expect(f.time).toBe('09:00');
  });
});

describe('normalizeDigits', () => {
  it('converts every supported script’s digits', async () => {
    const { normalizeDigits } = await import('./extract');
    expect(normalizeDigits('०१२३४५६७८९ ੦੧੨੩੪੫੬੭੮੯ ۰۱۲۳۴۵۶۷۸۹ ٠١٢٣٤٥٦٧٨٩')).toBe('0123456789 0123456789 0123456789 0123456789');
  });
});
