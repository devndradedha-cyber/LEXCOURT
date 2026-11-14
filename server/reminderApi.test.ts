import { describe, expect, it } from 'vitest';
import { MemoryMailer, ResendMailer } from './mailer';
import { handleConfirm, handleCreate, handleCron, handleReminderStats, handleUnsubscribe, makeToken, readToken, type ReminderDeps } from './reminderApi';
import { MemoryReminderStore, SupabaseReminderStore } from './reminderStore';
import { stageFor, validateReminder } from '../src/lib/reminderShared';
import { REMINDER_TEXT } from '../src/lib/reminderText';

const SECRET = 'test-secret-that-is-long-enough-123456';
const ADMIN = 'admin password 123';
let clock = new Date('2027-03-01T15:00:00Z');

function setup(over: Partial<ReminderDeps> = {}) {
  const store = new MemoryReminderStore(() => clock);
  const mailer = new MemoryMailer();
  const deps: ReminderDeps = { store, mailer, secret: SECRET, appUrl: 'https://lexcourt.test', cronSecret: 'cron-secret-123456', adminPassword: ADMIN, authDelayMs: 0, now: () => clock, ...over };
  return { store, mailer, deps };
}
const post = (url: string, body: unknown) => new Request(`https://lexcourt.test${url}`, { method: 'POST', body: JSON.stringify(body) });
const create = (deps: ReminderDeps, over: Record<string, unknown> = {}) =>
  handleCreate(post('/api/reminders', { email: 'Ana@Example.COM', date: '2027-04-01', label: 'hearing', lang: 'es', ...over }), deps);
const cron = (deps: ReminderDeps, auth = 'cron-secret-123456') =>
  handleCron(new Request('https://lexcourt.test/api/cron/reminders', { headers: { authorization: `Bearer ${auth}` } }), deps);
const linkToken = (text: string, kind: 'confirm' | 'stop') => text.match(new RegExp(`#/reminder/${kind}/([^\\s"<]+)`))![1];

describe('creating a reminder', () => {
  it('stores only email, date, label and language, and sends a confirmation email in that language', async () => {
    clock = new Date('2027-03-01T15:00:00Z');
    const { store, mailer, deps } = setup();
    const res = await create(deps);
    expect(res.status).toBe(202);
    expect(store.rows).toHaveLength(1);
    expect(Object.keys(store.rows[0]).sort()).toEqual(['confirmed', 'created_at', 'email', 'event_date', 'id', 'label', 'lang', 'last_stage']);
    expect(store.rows[0]).toMatchObject({ email: 'Ana@example.com', event_date: '2027-04-01', label: 'hearing', lang: 'es', confirmed: false });
    const m = mailer.outbox[0];
    expect(m.to).toBe('Ana@example.com');
    expect(m.subject).toBe(REMINDER_TEXT.es.email.confirmSubject);
    expect(m.text).toContain('Audiencia en la corte');
    expect(m.text).toContain('jueves, 1 de abril de 2027');
    expect(m.text).toContain(REMINDER_TEXT.es.disclaimer);
    expect(m.html).toContain('lang="es"');
    expect(m.headers?.['List-Unsubscribe']).toMatch(/^<https:\/\/lexcourt\.test\/api\/reminders\/unsubscribe\?token=/);
    expect(m.headers?.['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect(m.text).toMatch(/#\/reminder\/stop\//);
  });

  it.each([
    [{ aNumber: '123456789' }, 'unexpected_field'],
    [{ caseNumber: 'X' }, 'unexpected_field'],
    [{ note: 'my status' }, 'unexpected_field'],
    [{ email: 'not-an-email' }, 'invalid_email'],
    [{ date: '2027-02-30' }, 'invalid_date'],
    [{ date: '2027-03-01' }, 'date_too_soon'],
    [{ date: '2040-01-01' }, 'date_too_far'],
    [{ label: 'ICE check-in at 26 Federal Plaza' }, 'invalid_label'],
    [{ lang: 'fr' }, 'invalid_lang'],
  ])('refuses %j (%s) and stores nothing', async (over, error) => {
    const { store, mailer, deps } = setup();
    const res = await create(deps, over);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe(error);
    expect(store.rows).toHaveLength(0);
    expect(mailer.outbox).toHaveLength(0);
  });

  it('silently ignores more than 3 reminders for one address (no way to learn if an address is signed up)', async () => {
    const { store, mailer, deps } = setup();
    for (let i = 0; i < 5; i++) expect((await create(deps, { email: i % 2 ? 'ana@example.com' : 'ANA@example.com' })).status).toBe(202);
    expect(store.rows).toHaveLength(3);
    expect(mailer.outbox).toHaveLength(3);
  });

  it('spam trap: answers OK, stores and sends nothing', async () => {
    const { store, mailer, deps } = setup();
    expect((await create(deps, { website: 'http://spam' })).status).toBe(202);
    expect(store.rows).toHaveLength(0);
    expect(mailer.outbox).toHaveLength(0);
  });

  it('does not keep the address if the confirmation email cannot be sent', async () => {
    const { store, mailer, deps } = setup();
    mailer.fail = true;
    expect((await create(deps)).status).toBe(502);
    expect(store.rows).toHaveLength(0);
  });

  it('is unavailable without a store, mailer or a long enough secret', async () => {
    expect((await create(setup({ store: null }).deps)).status).toBe(503);
    expect((await create(setup({ mailer: null }).deps)).status).toBe(503);
    expect((await create(setup({ secret: 'short' }).deps)).status).toBe(503);
  });
});

describe('confirm and unsubscribe links', () => {
  it('signed tokens only work for their own purpose and row', () => {
    const t = makeToken(SECRET, 'confirm', 'abc');
    expect(readToken(SECRET, 'confirm', t)).toBe('abc');
    expect(readToken(SECRET, 'stop', t)).toBeNull();
    expect(readToken('another-secret-of-enough-length-000', 'confirm', t)).toBeNull();
    expect(readToken(SECRET, 'confirm', t.replace('abc', 'abd'))).toBeNull();
    expect(readToken(SECRET, 'confirm', 42)).toBeNull();
  });

  it('confirming turns reminders on; a date within a week gets its reminder right away', async () => {
    clock = new Date('2027-03-01T15:00:00Z');
    const { store, mailer, deps } = setup();
    await create(deps, { date: '2027-03-04', lang: 'en' });
    const res = await handleConfirm(post('/api/reminders/confirm', { token: linkToken(mailer.outbox[0].text, 'confirm') }), deps);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, date: '2027-03-04', label: 'hearing' });
    expect(store.rows[0]).toMatchObject({ confirmed: true, last_stage: 7 });
    expect(mailer.outbox[1].subject).toBe('Reminder: Court hearing in 3 days (Thursday, March 4, 2027)');
    expect(store.counters).toEqual({ reminders_confirmed: 1, reminder_emails_sent: 1 });
  });

  it('a bad confirm token is refused', async () => {
    const { deps } = setup();
    expect((await handleConfirm(post('/api/reminders/confirm', { token: 'x.y' }), deps)).status).toBe(404);
  });

  it('one-click unsubscribe deletes the reminder (body token or ?token=), POST only', async () => {
    const { store, mailer, deps } = setup();
    await create(deps);
    await create(deps, { email: 'b@example.com' });
    const stop0 = linkToken(mailer.outbox[0].text, 'stop');
    expect((await handleUnsubscribe(new Request(`https://x/api/reminders/unsubscribe?token=${stop0}`), deps)).status).toBe(405);
    expect(store.rows).toHaveLength(2);
    expect((await handleUnsubscribe(new Request(`https://x/api/reminders/unsubscribe?token=${encodeURIComponent(stop0)}`, { method: 'POST', body: 'List-Unsubscribe=One-Click' }), deps)).status).toBe(200);
    expect(store.rows.map((r) => r.email)).toEqual(['b@example.com']);
    const stop1 = linkToken(mailer.outbox[1].text, 'stop');
    expect((await handleUnsubscribe(post('/api/reminders/unsubscribe', { token: stop1 }), deps)).status).toBe(200);
    expect(store.rows).toHaveLength(0);
    // A confirm token cannot unsubscribe.
    expect((await handleUnsubscribe(post('/api/reminders/unsubscribe', { token: linkToken(mailer.outbox[0].text, 'confirm') }), deps)).status).toBe(404);
  });
});

describe('daily job', () => {
  it('sends 7, 2 and 1 days before, once each, then deletes the reminder after the date', async () => {
    clock = new Date('2027-03-01T15:00:00Z');
    const { store, mailer, deps } = setup();
    await create(deps, { date: '2027-03-20', lang: 'hi' });
    await handleConfirm(post('/api/reminders/confirm', { token: linkToken(mailer.outbox[0].text, 'confirm') }), deps);
    mailer.outbox = [];
    const sentOn: string[] = [];
    for (let day = 1; day <= 22; day++) {
      clock = new Date(Date.UTC(2027, 2, day, 15));
      const before = mailer.outbox.length;
      const res = await cron(deps);
      expect(res.status).toBe(200);
      if (mailer.outbox.length > before) sentOn.push(clock.toISOString().slice(0, 10));
    }
    expect(sentOn).toEqual(['2027-03-13', '2027-03-18', '2027-03-19']);
    expect(mailer.outbox.map((m) => m.subject)).toEqual([
      'रिमाइंडर: कोर्ट की सुनवाई 7 दिन में (शनिवार, 20 मार्च 2027)',
      'रिमाइंडर: कोर्ट की सुनवाई 2 दिन में (शनिवार, 20 मार्च 2027)',
      'रिमाइंडर: कोर्ट की सुनवाई कल (शनिवार, 20 मार्च 2027)',
    ]);
    for (const m of mailer.outbox) {
      expect(m.text).toContain(REMINDER_TEXT.hi.disclaimer);
      expect(m.text).toContain(REMINDER_TEXT.hi.email.stopLink);
      expect(m.headers?.['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    }
    expect(store.rows).toHaveLength(0); // deleted the day after the date
    expect(store.counters.reminder_emails_sent).toBe(3);
  });

  it('never emails unconfirmed addresses and deletes them after 48 hours', async () => {
    clock = new Date('2027-03-01T15:00:00Z');
    const { store, mailer, deps } = setup();
    await create(deps, { date: '2027-03-03' });
    clock = new Date('2027-03-02T15:00:00Z');
    await cron(deps);
    expect(mailer.outbox).toHaveLength(1); // only the confirmation
    expect(store.rows).toHaveLength(1);
    clock = new Date('2027-03-03T15:00:01Z');
    await cron(deps);
    expect(store.rows).toHaveLength(0);
  });

  it('needs the cron secret', async () => {
    const { deps } = setup();
    expect((await cron(deps, 'wrong')).status).toBe(401);
    expect((await cron({ ...deps, cronSecret: null })).status).toBe(503);
  });

  it('stages: 7 for 3–7 days, 2 for 2 days, 1 for tomorrow', () => {
    expect([0, 1, 2, 3, 7, 8].map(stageFor)).toEqual([null, 1, 2, 7, 7, null]);
  });
});

describe('admin counts', () => {
  it('shows only numbers, behind the admin password', async () => {
    clock = new Date('2027-03-01T15:00:00Z');
    const { mailer, deps } = setup();
    await create(deps, { date: '2027-03-05' });
    await handleConfirm(post('/api/reminders/confirm', { token: linkToken(mailer.outbox[0].text, 'confirm') }), deps);
    const get = (auth: string) => handleReminderStats(new Request('https://x/api/admin/reminders', { headers: { authorization: `Bearer ${auth}` } }), deps);
    expect((await get('nope nope nope')).status).toBe(401);
    const body = await (await get(ADMIN)).json();
    expect(body).toEqual({ configured: true, emailsSent: 1, confirmed: 1, active: 1 });
    expect(JSON.stringify(body)).not.toContain('@');
  });
});

describe('validation and providers', () => {
  it('normalises the email domain and accepts any label in the fixed list', () => {
    expect(validateReminder({ email: ' Ana@GMAIL.com ', date: '2027-03-02', label: 'deadline', lang: 'ur' }, '2027-03-01')).toEqual({
      ok: true,
      value: { email: 'Ana@gmail.com', date: '2027-03-02', label: 'deadline', lang: 'ur' },
    });
  });

  it('Resend: API key stays server-side, unsubscribe headers are passed', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const f = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response('{}', { status: 200 });
    }) as unknown as typeof fetch;
    await new ResendMailer('re_key', 'LexCourt <r@x.org>', f).send({ to: 'a@b.co', subject: 's', text: 't', html: 'h', headers: { 'List-Unsubscribe': '<u>' } });
    expect(calls[0].url).toBe('https://api.resend.com/emails');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer re_key');
    expect(JSON.parse(calls[0].init.body as string)).toMatchObject({ from: 'LexCourt <r@x.org>', to: ['a@b.co'], headers: { 'List-Unsubscribe': '<u>' } });
  });

  it('Supabase: counts with exact count, ids checked, counter via RPC', async () => {
    const calls: string[] = [];
    const f = (async (url: string, init: RequestInit) => {
      calls.push(`${init.method ?? 'GET'} ${url}`);
      return new Response(init.method === 'HEAD' ? null : '[]', { status: 200, headers: { 'content-range': '*/4' } });
    }) as unknown as typeof fetch;
    const s = new SupabaseReminderStore('https://p.supabase.co', 'svc', f);
    expect(await s.countForEmail('a_b%@x.com')).toBe(4);
    expect(calls[0]).toContain('email=ilike.a%5C_b%5C%25%40x.com');
    expect(await s.get("1' or 1=1")).toBeNull();
    await s.increment('reminder_emails_sent', 2);
    expect(calls.at(-1)).toBe('POST https://p.supabase.co/rest/v1/rpc/increment_counter');
  });
});
