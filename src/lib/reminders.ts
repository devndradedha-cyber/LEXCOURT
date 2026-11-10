/**
 * Calendar reminders built entirely on the device. The user downloads an
 * .ics file and adds it to their own phone calendar, so LexCourt never has to
 * store their hearing date, contact details or anything else.
 */

export interface ReminderInput {
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM (24h). If missing, an all-day event is created. */
  time: string | null;
  title: string;
  location: string | null;
  description: string;
  /** Used only to make a stable UID; never includes personal data. */
  now?: Date;
}

/** Days before the hearing to remind the user. 0 = morning of the hearing. */
export const REMINDER_OFFSETS_DAYS = [7, 1, 0] as const;

function escapeText(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold lines longer than 75 octets, as RFC 5545 requires. */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ' ' + rest.slice(74);
  }
  out.push(rest);
  return out.join('\r\n');
}

function compact(date: string, time: string | null): string {
  const d = date.replace(/-/g, '');
  return time ? `${d}T${time.replace(':', '')}00` : d;
}

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, hh, mm + minutes));
  const p = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`,
    time: `${p(dt.getUTCHours())}:${p(dt.getUTCMinutes())}`,
  };
}

function nextDay(date: string): string {
  return addMinutes(date, '00:00', 24 * 60).date;
}

function stamp(now: Date): string {
  return now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Build an iCalendar file. Times are "floating" local times (no time zone),
 * which calendar apps show at the same clock time the notice states, in the
 * court's local time when the phone is in that area.
 */
export function buildIcs(input: ReminderInput): string {
  const now = input.now ?? new Date();
  const uid = `${compact(input.date, input.time)}-${now.getTime().toString(36)}@lexcourt`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LexCourt//Notice Reader//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT'];
  lines.push(`UID:${uid}`, `DTSTAMP:${stamp(now)}`);
  if (input.time) {
    const end = addMinutes(input.date, input.time, 120);
    lines.push(`DTSTART:${compact(input.date, input.time)}`, `DTEND:${compact(end.date, end.time)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compact(input.date, null)}`, `DTEND;VALUE=DATE:${compact(nextDay(input.date), null)}`);
  }
  lines.push(`SUMMARY:${escapeText(input.title)}`);
  if (input.location) lines.push(`LOCATION:${escapeText(input.location)}`);
  lines.push(`DESCRIPTION:${escapeText(input.description)}`);
  for (const days of REMINDER_OFFSETS_DAYS) {
    // For the day-of alarm on a timed event, remind 2 hours before.
    const trigger = days === 0 ? (input.time ? '-PT2H' : 'PT7H') : `-P${days}D`;
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escapeText(input.title)}`, `TRIGGER:${trigger}`, 'END:VALARM');
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** A link that opens Google Calendar's "new event" form, pre-filled. */
export function googleCalendarUrl(input: ReminderInput): string {
  const start = compact(input.date, input.time);
  const end = input.time
    ? (() => {
        const e = addMinutes(input.date, input.time!, 120);
        return compact(e.date, e.time);
      })()
    : compact(nextDay(input.date), null);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${start}/${end}`,
    details: input.description,
  });
  if (input.location) params.set('location', input.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs(input: ReminderInput, filename = 'immigration-court-hearing.ics'): void {
  const blob = new Blob([buildIcs(input)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
