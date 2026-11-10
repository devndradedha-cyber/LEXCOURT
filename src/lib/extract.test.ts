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
