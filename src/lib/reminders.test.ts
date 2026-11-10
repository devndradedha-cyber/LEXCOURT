import { describe, expect, it } from 'vitest';
import { buildIcs, googleCalendarUrl } from './reminders';

const base = {
  title: 'Immigration court hearing',
  location: '26 Federal Plaza, Room 1237\nNew York, NY 10278',
  description: 'Bring this notice, ID, documents.',
  now: new Date(Date.UTC(2026, 10, 10, 12, 0, 0)),
};

describe('buildIcs', () => {
  it('creates a timed event with three reminders', () => {
    const ics = buildIcs({ ...base, date: '2027-03-03', time: '08:30' });
    expect(ics).toContain('DTSTART:20270303T083000');
    expect(ics).toContain('DTEND:20270303T103000');
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(3);
    expect(ics).toContain('TRIGGER:-P7D');
    expect(ics).toContain('TRIGGER:-P1D');
    expect(ics).toContain('TRIGGER:-PT2H');
    expect(ics).toContain('LOCATION:26 Federal Plaza\\, Room 1237\\nNew York\\, NY 10278');
    expect(ics.endsWith('\r\n')).toBe(true);
  });

  it('creates an all-day event when there is no time', () => {
    const ics = buildIcs({ ...base, date: '2027-12-31', time: null });
    expect(ics).toContain('DTSTART;VALUE=DATE:20271231');
    expect(ics).toContain('DTEND;VALUE=DATE:20280101');
  });

  it('folds long lines', () => {
    const ics = buildIcs({ ...base, date: '2027-03-03', time: '08:30', description: 'x'.repeat(200) });
    for (const line of ics.split('\r\n')) expect(line.length).toBeLessThanOrEqual(75);
  });
});

describe('googleCalendarUrl', () => {
  it('pre-fills the event', () => {
    const u = new URL(googleCalendarUrl({ ...base, date: '2027-03-03', time: '08:30' }));
    expect(u.searchParams.get('dates')).toBe('20270303T083000/20270303T103000');
    expect(u.searchParams.get('text')).toBe('Immigration court hearing');
  });
});
