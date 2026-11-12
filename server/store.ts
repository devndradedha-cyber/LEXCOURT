/**
 * Where feedback is kept. Production: Supabase (Postgres) through its REST API,
 * using the service-role key, which stays on the server. Development and tests:
 * an in-memory store.
 *
 * Nothing that identifies a person is stored: no IP address, no user agent,
 * no name, no contact details.
 */
import type { FeedbackFeature, FeedbackRecord, FeedbackStatus } from '../src/lib/feedback/shared.js';

export type NewFeedback = Omit<FeedbackRecord, 'id' | 'created_at' | 'reviewed_at'>;

export interface FeedbackStore {
  insert(row: NewFeedback): Promise<void>;
  /** Ratings only, for the dashboard. */
  ratings(): Promise<{ feature: FeedbackFeature; rating: number }[]>;
  list(status: FeedbackStatus, limit: number, withCommentOnly?: boolean): Promise<FeedbackRecord[]>;
  get(id: string): Promise<FeedbackRecord | null>;
  update(id: string, patch: Partial<Pick<FeedbackRecord, 'status' | 'public_text' | 'flags' | 'reviewed_at'>>): Promise<void>;
}

export class MemoryStore implements FeedbackStore {
  rows: FeedbackRecord[] = [];
  async insert(row: NewFeedback) {
    this.rows.push({ ...row, id: crypto.randomUUID(), created_at: new Date().toISOString(), reviewed_at: null });
  }
  async ratings() {
    return this.rows.map((r) => ({ feature: r.feature, rating: r.rating }));
  }
  async list(status: FeedbackStatus, limit: number, withCommentOnly = false) {
    return this.rows
      .filter((r) => r.status === status && (!withCommentOnly || r.comment))
      .sort((a, b) => (status === 'pending' ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at)))
      .slice(0, limit);
  }
  async get(id: string) {
    return this.rows.find((r) => r.id === id) ?? null;
  }
  async update(id: string, patch: Partial<FeedbackRecord>) {
    const r = this.rows.find((x) => x.id === id);
    if (r) Object.assign(r, patch);
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class SupabaseStore implements FeedbackStore {
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

  async insert(row: NewFeedback) {
    await this.req('feedback', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(row) });
  }
  async ratings() {
    const res = await this.req('feedback?select=feature,rating', { headers: { Range: '0-49999' } });
    return (await res.json()) as { feature: FeedbackFeature; rating: number }[];
  }
  async list(status: FeedbackStatus, limit: number, withCommentOnly = false) {
    const order = status === 'pending' ? 'created_at.asc' : 'created_at.desc';
    const extra = withCommentOnly ? '&comment=not.is.null' : '';
    const res = await this.req(`feedback?select=*&status=eq.${status}${extra}&order=${order}&limit=${Math.min(limit, 200)}`);
    return (await res.json()) as FeedbackRecord[];
  }
  async get(id: string) {
    if (!UUID.test(id)) return null;
    const res = await this.req(`feedback?select=*&id=eq.${id}&limit=1`);
    const rows = (await res.json()) as FeedbackRecord[];
    return rows[0] ?? null;
  }
  async update(id: string, patch: Partial<FeedbackRecord>) {
    if (!UUID.test(id)) throw new Error('invalid_id');
    await this.req(`feedback?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(patch) });
  }
}
