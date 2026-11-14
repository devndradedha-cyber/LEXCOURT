/**
 * Storage for email reminders: Supabase in production, memory for local
 * development and tests. A row is only an email, a date, a fixed label, the
 * language, whether it was confirmed and which email was sent last.
 */
import { randomUUID } from 'node:crypto';
import type { FeedbackLang } from '../src/lib/feedback/moderation.js';
import type { EmailStage, ReminderLabel } from '../src/lib/reminderShared.js';

export interface ReminderRow {
  id: string;
  created_at: string;
  email: string;
  event_date: string;
  label: ReminderLabel;
  lang: FeedbackLang;
  confirmed: boolean;
  last_stage: EmailStage | null;
}
export type NewReminder = Pick<ReminderRow, 'email' | 'event_date' | 'label' | 'lang'>;

/** Counters hold numbers only, never personal data. */
export type CounterName = 'reminder_emails_sent' | 'reminders_confirmed';

export interface ReminderStore {
  insert(r: NewReminder): Promise<ReminderRow>;
  get(id: string): Promise<ReminderRow | null>;
  update(id: string, patch: Partial<Pick<ReminderRow, 'confirmed' | 'last_stage'>>): Promise<void>;
  remove(id: string): Promise<void>;
  countForEmail(email: string): Promise<number>;
  /** Confirmed reminders with a date from `from` to `to` (inclusive). */
  dueBetween(from: string, to: string): Promise<ReminderRow[]>;
  /** Deletes reminders dated before `beforeDate`, and unconfirmed ones created before `unconfirmedBefore`. */
  purge(beforeDate: string, unconfirmedBefore: string): Promise<void>;
  countActive(): Promise<number>;
  increment(name: CounterName, by: number): Promise<void>;
  counter(name: CounterName): Promise<number>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class MemoryReminderStore implements ReminderStore {
  rows: ReminderRow[] = [];
  counters: Record<string, number> = {};
  constructor(private now: () => Date = () => new Date()) {}

  async insert(r: NewReminder) {
    const row: ReminderRow = { ...r, id: randomUUID(), created_at: this.now().toISOString(), confirmed: false, last_stage: null };
    this.rows.push(row);
    return row;
  }
  async get(id: string) {
    return this.rows.find((r) => r.id === id) ?? null;
  }
  async update(id: string, patch: Partial<ReminderRow>) {
    const r = this.rows.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
  }
  async remove(id: string) {
    this.rows = this.rows.filter((r) => r.id !== id);
  }
  async countForEmail(email: string) {
    return this.rows.filter((r) => r.email.toLowerCase() === email.toLowerCase()).length;
  }
  async dueBetween(from: string, to: string) {
    return this.rows.filter((r) => r.confirmed && r.event_date >= from && r.event_date <= to);
  }
  async purge(beforeDate: string, unconfirmedBefore: string) {
    this.rows = this.rows.filter((r) => r.event_date >= beforeDate && (r.confirmed || r.created_at >= unconfirmedBefore));
  }
  async countActive() {
    return this.rows.filter((r) => r.confirmed).length;
  }
  async increment(name: CounterName, by: number) {
    this.counters[name] = (this.counters[name] ?? 0) + by;
  }
  async counter(name: CounterName) {
    return this.counters[name] ?? 0;
  }
}

export class SupabaseReminderStore implements ReminderStore {
  constructor(
    private url: string,
    private serviceKey: string,
    private fetchFn: typeof fetch = fetch,
  ) {}

  private async req(path: string, init: RequestInit = {}): Promise<Response> {
    const res = await this.fetchFn(`${this.url.replace(/\/$/, '')}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: this.serviceKey,
        Authorization: `Bearer ${this.serviceKey}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`storage_error_${res.status}`);
    return res;
  }
  private count(res: Response): number {
    // Content-Range: 0-9/42  or  */0
    return Number((res.headers.get('content-range') ?? '').split('/')[1] ?? 0) || 0;
  }

  async insert(r: NewReminder) {
    const res = await this.req('reminders', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify(r) });
    return ((await res.json()) as ReminderRow[])[0];
  }
  async get(id: string) {
    if (!UUID.test(id)) return null;
    const res = await this.req(`reminders?select=*&id=eq.${id}&limit=1`);
    return ((await res.json()) as ReminderRow[])[0] ?? null;
  }
  async update(id: string, patch: Partial<ReminderRow>) {
    if (!UUID.test(id)) throw new Error('invalid_id');
    await this.req(`reminders?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) });
  }
  async remove(id: string) {
    if (!UUID.test(id)) return;
    await this.req(`reminders?id=eq.${id}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
  }
  async countForEmail(email: string) {
    // ilike with no wildcards is a case-insensitive equals; escape the wildcard characters.
    const pattern = email.replace(/[\\%_]/g, (c) => `\\${c}`);
    const res = await this.req(`reminders?select=id&email=ilike.${encodeURIComponent(pattern)}`, { method: 'HEAD', headers: { Prefer: 'count=exact' } });
    return this.count(res);
  }
  async dueBetween(from: string, to: string) {
    const res = await this.req(`reminders?select=*&confirmed=is.true&event_date=gte.${from}&event_date=lte.${to}&limit=5000`);
    return (await res.json()) as ReminderRow[];
  }
  async purge(beforeDate: string, unconfirmedBefore: string) {
    await this.req(`reminders?event_date=lt.${beforeDate}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    await this.req(`reminders?confirmed=is.false&created_at=lt.${encodeURIComponent(unconfirmedBefore)}`, {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    });
  }
  async countActive() {
    const res = await this.req('reminders?select=id&confirmed=is.true', { method: 'HEAD', headers: { Prefer: 'count=exact' } });
    return this.count(res);
  }
  async increment(name: CounterName, by: number) {
    await this.req('rpc/increment_counter', { method: 'POST', body: JSON.stringify({ counter_name: name, amount: by }) });
  }
  async counter(name: CounterName) {
    const res = await this.req(`counters?select=value&name=eq.${name}`);
    const rows = (await res.json()) as { value: number }[];
    return Number(rows[0]?.value ?? 0);
  }
}
