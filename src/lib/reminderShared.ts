/**
 * Email reminder rules shared by the app and the server.
 *
 * Privacy: a reminder is only an email address, a date (YYYY-MM-DD), one of
 * three fixed labels and the language for the emails. There is no free-text
 * field, so an A-Number, case number, immigration status or anything from the
 * notice cannot be stored with it.
 */
import type { FeedbackLang } from './feedback/moderation.js';

export const REMINDER_LABELS = ['hearing', 'deadline', 'appointment'] as const;
export type ReminderLabel = (typeof REMINDER_LABELS)[number];
export const REMINDER_LANGS: FeedbackLang[] = ['en', 'es', 'hi', 'pa', 'ur'];

/** Emails go out this many days before the date. */
export const EMAIL_STAGES = [7, 2, 1] as const;
export type EmailStage = (typeof EMAIL_STAGES)[number];

/** Hearings can be scheduled years ahead (court backlogs). */
export const MAX_YEARS_AHEAD = 5;
/** More than this many reminders for one address are silently ignored (abuse limit). */
export const MAX_PER_EMAIL = 3;
/** Unconfirmed addresses are deleted after this many hours. */
export const CONFIRM_HOURS = 48;

export interface ReminderRequest {
  email: string;
  date: string;
  label: ReminderLabel;
  lang: FeedbackLang;
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:".]{2,}$/;

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function normaliseEmail(email: string): string {
  const e = email.trim();
  const at = e.lastIndexOf('@');
  return at < 0 ? e : e.slice(0, at) + '@' + e.slice(at + 1).toLowerCase();
}

/** Today's date (YYYY-MM-DD) in UTC. The daily job runs mid-morning in U.S. time zones. */
export function todayUtc(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Whole days from `from` to `to` (both YYYY-MM-DD). */
export function daysBetween(from: string, to: string): number {
  const ms = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((ms(to) - ms(from)) / 86_400_000);
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/**
 * Which email is due when `days` remain: 7 (a week or less), 2, or 1 (tomorrow).
 * Late sign-ups and missed days still get the closest one, once.
 */
export function stageFor(days: number): EmailStage | null {
  if (days < 1 || days > 7) return null;
  return days <= 1 ? 1 : days <= 2 ? 2 : 7;
}

export type ReminderCheck =
  | { ok: true; value: ReminderRequest }
  | { ok: false; error: 'invalid_body' | 'invalid_email' | 'invalid_date' | 'date_too_soon' | 'date_too_far' | 'invalid_label' | 'invalid_lang' | 'unexpected_field' };

const ALLOWED = new Set(['email', 'date', 'label', 'lang', 'website']);

/** Checks a request from the app. Any field other than the four allowed (plus the spam trap) is refused. */
export function validateReminder(body: unknown, today: string): ReminderCheck {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'invalid_body' };
  const b = body as Record<string, unknown>;
  if (Object.keys(b).some((k) => !ALLOWED.has(k))) return { ok: false, error: 'unexpected_field' };
  const email = typeof b.email === 'string' ? normaliseEmail(b.email) : '';
  if (!isValidEmail(email)) return { ok: false, error: 'invalid_email' };
  const date = typeof b.date === 'string' ? b.date : '';
  if (!isIsoDate(date)) return { ok: false, error: 'invalid_date' };
  const days = daysBetween(today, date);
  if (days < 1) return { ok: false, error: 'date_too_soon' };
  if (days > MAX_YEARS_AHEAD * 366) return { ok: false, error: 'date_too_far' };
  if (!REMINDER_LABELS.includes(b.label as ReminderLabel)) return { ok: false, error: 'invalid_label' };
  if (!REMINDER_LANGS.includes(b.lang as FeedbackLang)) return { ok: false, error: 'invalid_lang' };
  return { ok: true, value: { email, date, label: b.label as ReminderLabel, lang: b.lang as FeedbackLang } };
}
