/**
 * Email reminder API (Web-standard Request → Response), used by the Vercel
 * functions in /api and by the local development server.
 *
 *  POST /api/reminders              { email, date, label, lang }  → sends a confirmation email
 *  POST /api/reminders/confirm      { token }                     → turns reminders on
 *  POST /api/reminders/unsubscribe  { token } or ?token=          → deletes the reminder (one click)
 *  GET  /api/cron/reminders         (daily, Bearer CRON_SECRET)   → sends due emails, deletes old rows
 *  GET  /api/admin/reminders        (admin password)              → counts only
 *
 * Links in emails carry a signed token (HMAC of the row id), so no token is
 * stored and a link only works for its own reminder.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  CONFIRM_HOURS,
  MAX_PER_EMAIL,
  addDays,
  daysBetween,
  stageFor,
  todayUtc,
  validateReminder,
} from '../src/lib/reminderShared.js';
import { checkAdmin } from './feedbackApi.js';
import type { Mailer } from './mailer.js';
import { confirmEmail, reminderEmail, type Links } from './reminderEmail.js';
import type { ReminderRow, ReminderStore } from './reminderStore.js';

export interface ReminderDeps {
  store: ReminderStore | null;
  mailer: Mailer | null;
  /** Signs links in emails (at least 32 characters). */
  secret: string | null;
  /** Public address of the app, for links in emails. Falls back to the request's own origin. */
  appUrl: string | null;
  cronSecret: string | null;
  adminPassword: string | null;
  authDelayMs?: number;
  now?: () => Date;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.length > 4_000) throw new Error('too_large');
  return JSON.parse(text);
}

const ready = (d: ReminderDeps) => !!(d.store && d.mailer && d.secret && d.secret.length >= 32);

// --- Signed tokens ----------------------------------------------------------

type Purpose = 'confirm' | 'stop';

function sign(secret: string, purpose: Purpose, id: string): string {
  return createHmac('sha256', secret).update(`${purpose}:${id}`).digest('base64url');
}
export function makeToken(secret: string, purpose: Purpose, id: string): string {
  return `${id}.${sign(secret, purpose, id)}`;
}
export function readToken(secret: string, purpose: Purpose, token: unknown): string | null {
  if (typeof token !== 'string' || token.length > 200) return null;
  const [id, mac] = token.split('.');
  if (!id || !mac) return null;
  const want = Buffer.from(sign(secret, purpose, id));
  const got = Buffer.from(mac);
  return want.length === got.length && timingSafeEqual(want, got) ? id : null;
}

function links(deps: ReminderDeps, request: Request, id: string): Links & { confirm: string } {
  const base = (deps.appUrl ?? new URL(request.url).origin).replace(/\/$/, '');
  const stop = makeToken(deps.secret!, 'stop', id);
  return {
    appUrl: `${base}/`,
    stopPage: `${base}/#/reminder/stop/${stop}`,
    stopApi: `${base}/api/reminders/unsubscribe?token=${encodeURIComponent(stop)}`,
    confirm: `${base}/#/reminder/confirm/${makeToken(deps.secret!, 'confirm', id)}`,
  };
}

// --- Create -----------------------------------------------------------------

export async function handleCreate(request: Request, deps: ReminderDeps): Promise<Response> {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!ready(deps)) return json(503, { error: 'reminders_unavailable' });
  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return json(400, { error: 'invalid_body' });
  }
  const now = deps.now?.() ?? new Date();
  const v = validateReminder(body, todayUtc(now));
  if (!v.ok) return json(400, { error: v.error });
  // Spam trap filled in: answer as if it worked, store nothing.
  if ((body as { website?: unknown }).website) return json(202, { ok: true });

  const { email, date, label, lang } = v.value;
  try {
    // Same answer whether or not the limit is reached, so nobody can learn
    // whether an address already has reminders.
    if ((await deps.store!.countForEmail(email)) >= MAX_PER_EMAIL) return json(202, { ok: true });
    const row = await deps.store!.insert({ email, event_date: date, label, lang });
    const l = links(deps, request, row.id);
    try {
      await deps.mailer!.send(confirmEmail(email, lang, label, date, l.confirm, l));
    } catch {
      await deps.store!.remove(row.id);
      return json(502, { error: 'send_failed' });
    }
  } catch {
    return json(502, { error: 'storage_error' });
  }
  return json(202, { ok: true });
}

// --- Confirm ----------------------------------------------------------------

/** Sends the email that is due now, if any. Returns true if one was sent. */
async function sendDue(row: ReminderRow, today: string, deps: ReminderDeps, request: Request): Promise<boolean> {
  const days = daysBetween(today, row.event_date);
  const stage = stageFor(days);
  if (!stage || (row.last_stage !== null && row.last_stage <= stage)) return false;
  await deps.mailer!.send(reminderEmail(row.email, row.lang, row.label, row.event_date, days, links(deps, request, row.id)));
  await deps.store!.update(row.id, { last_stage: stage });
  return true;
}

export async function handleConfirm(request: Request, deps: ReminderDeps): Promise<Response> {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!ready(deps)) return json(503, { error: 'reminders_unavailable' });
  let body: { token?: unknown };
  try {
    body = (await readJson(request)) as { token?: unknown };
  } catch {
    return json(400, { error: 'invalid_body' });
  }
  const id = readToken(deps.secret!, 'confirm', body?.token);
  if (!id) return json(404, { error: 'not_found' });
  try {
    const row = await deps.store!.get(id);
    if (!row) return json(404, { error: 'not_found' });
    if (!row.confirmed) {
      await deps.store!.update(id, { confirmed: true });
      await deps.store!.increment('reminders_confirmed', 1);
      // If the date is already within a week, send that reminder now.
      try {
        if (await sendDue({ ...row, confirmed: true }, todayUtc(deps.now?.() ?? new Date()), deps, request))
          await deps.store!.increment('reminder_emails_sent', 1);
      } catch {
        /* the daily job will try again */
      }
    }
    return json(200, { ok: true, date: row.event_date, label: row.label });
  } catch {
    return json(502, { error: 'storage_error' });
  }
}

// --- Unsubscribe (one click) ---------------------------------------------------

export async function handleUnsubscribe(request: Request, deps: ReminderDeps): Promise<Response> {
  // POST only: link scanners that open links (GET) must not unsubscribe anyone.
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!ready(deps)) return json(503, { error: 'reminders_unavailable' });
  let token: unknown = new URL(request.url).searchParams.get('token');
  if (!token) {
    try {
      token = ((await readJson(request)) as { token?: unknown })?.token;
    } catch {
      return json(400, { error: 'invalid_body' });
    }
  }
  const id = readToken(deps.secret!, 'stop', token);
  if (!id) return json(404, { error: 'not_found' });
  try {
    await deps.store!.remove(id);
  } catch {
    return json(502, { error: 'storage_error' });
  }
  return json(200, { ok: true });
}

// --- Daily job ----------------------------------------------------------------

export async function handleCron(request: Request, deps: ReminderDeps): Promise<Response> {
  if (!deps.cronSecret || deps.cronSecret.length < 16) return json(503, { error: 'cron_not_configured' });
  const given = (request.headers.get('authorization') ?? '').replace(/^Bearer /, '');
  const a = Buffer.from(createHmac('sha256', 'cron').update(given).digest());
  const b = Buffer.from(createHmac('sha256', 'cron').update(deps.cronSecret).digest());
  if (!timingSafeEqual(a, b)) return json(401, { error: 'unauthorised' });
  if (!ready(deps)) return json(503, { error: 'reminders_unavailable' });

  const now = deps.now?.() ?? new Date();
  const today = todayUtc(now);
  let sent = 0;
  let failed = 0;
  try {
    // "Delete after the date passes": everything dated before today goes.
    await deps.store!.purge(today, new Date(now.getTime() - CONFIRM_HOURS * 3_600_000).toISOString());
    for (const row of await deps.store!.dueBetween(addDays(today, 1), addDays(today, 7))) {
      try {
        if (await sendDue(row, today, deps, request)) sent++;
      } catch {
        failed++;
      }
    }
    if (sent) await deps.store!.increment('reminder_emails_sent', sent);
  } catch {
    return json(502, { error: 'storage_error', sent, failed });
  }
  return json(200, { ok: true, sent, failed });
}

// --- Admin: counts only -------------------------------------------------------

export async function handleReminderStats(request: Request, deps: ReminderDeps): Promise<Response> {
  if (request.method !== 'GET') return json(405, { error: 'method_not_allowed' });
  const denied = await checkAdmin(request, deps.adminPassword, deps.authDelayMs);
  if (denied) return denied;
  if (!deps.store) return json(200, { configured: false, emailsSent: 0, confirmed: 0, active: 0 });
  try {
    const [emailsSent, confirmed, active] = await Promise.all([
      deps.store.counter('reminder_emails_sent'),
      deps.store.counter('reminders_confirmed'),
      deps.store.countActive(),
    ]);
    return json(200, { configured: ready(deps), emailsSent, confirmed, active });
  } catch {
    return json(502, { error: 'storage_error' });
  }
}

