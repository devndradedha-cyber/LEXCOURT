import { describe, expect, it } from 'vitest';
import { computeStats, handleModerate, handleQueue, handleStats, handleSubmit, type Deps } from './feedbackApi';
import { MemoryStore, SupabaseStore } from './store';

const PASSWORD = 'correct horse battery';
const deps = (store = new MemoryStore()): Deps & { store: MemoryStore } => ({ store, adminPassword: PASSWORD, authDelayMs: 0 });
const post = (url: string, body: unknown, auth?: string) =>
  new Request(`http://x${url}`, { method: 'POST', body: JSON.stringify(body), headers: auth ? { authorization: `Bearer ${auth}` } : {} });
const get = (url: string, auth?: string) => new Request(`http://x${url}`, { headers: auth ? { authorization: `Bearer ${auth}` } : {} });
const submit = (d: Deps, over: Record<string, unknown> = {}) =>
  handleSubmit(post('/api/feedback', { feature: 'notice_reader', rating: 5, comment: '', lang: 'en', publicConsent: false, ...over }), d);

describe('submit', () => {
  it('stores a rating with no comment as private', async () => {
    const d = deps();
    const res = await submit(d, { rating: 4 });
    expect(res.status).toBe(201);
    expect(d.store.rows).toHaveLength(1);
    expect(d.store.rows[0]).toMatchObject({ rating: 4, comment: null, status: 'private', public_consent: false, public_text: null });
  });

  it('keeps comments private unless the person consents', async () => {
    const d = deps();
    await submit(d, { comment: 'Clear and simple.' });
    expect(d.store.rows[0].status).toBe('private');
  });

  it('consent puts the comment in the moderation queue, with names removed', async () => {
    const d = deps();
    const res = await submit(d, { comment: 'Attorney Jane Doe told me about this. Very clear.', publicConsent: true });
    expect(await res.json()).toMatchObject({ status: 'pending', flags: ['names_removed'] });
    expect(d.store.rows[0]).toMatchObject({ status: 'pending', public_consent: true, public_text: 'Attorney [name removed] told me about this. Very clear.' });
    expect(d.store.rows[0].comment).toContain('Jane Doe'); // the private original is for admins only
  });

  it('never stores sensitive details, even if the app check was bypassed', async () => {
    const d = deps();
    await submit(d, { comment: 'My A-Number is A123-456-789 and I am undocumented', publicConsent: true });
    const row = d.store.rows[0];
    expect(row.comment).toBe('My A-Number is [removed] and I am [removed]');
    expect(JSON.stringify(row)).not.toMatch(/123-456-789|undocumented/);
    expect(row.flags).toContain('sensitive_removed');
  });

  it('scam accusations are never queued for publishing, even with consent', async () => {
    const d = deps();
    const res = await submit(d, { comment: 'The notario scammed me', publicConsent: true });
    expect(await res.json()).toMatchObject({ status: 'private', flags: ['scam_mentioned'] });
    expect(d.store.rows[0]).toMatchObject({ status: 'private', public_consent: false, public_text: null });
  });

  it.each([
    [{ rating: 0 }],
    [{ feature: 'lawyer_rating' }],
    [{ aNumber: '123456789' }],
    [{ name: 'Ann' }],
  ])('rejects %j and stores nothing', async (over) => {
    const d = deps();
    expect((await submit(d, over)).status).toBe(400);
    expect(d.store.rows).toHaveLength(0);
  });

  it('says feedback is unavailable when no database is configured', async () => {
    expect((await submit({ store: null, adminPassword: null })).status).toBe(503);
  });
});

describe('admin', () => {
  it('needs the admin password', async () => {
    const d = deps();
    expect((await handleStats(get('/api/admin/stats'), d)).status).toBe(401);
    expect((await handleStats(get('/api/admin/stats', 'wrong password!!'), d)).status).toBe(401);
    expect((await handleStats(get('/api/admin/stats', PASSWORD), d)).status).toBe(200);
  });

  it('refuses to run with a short or missing admin password', async () => {
    expect((await handleStats(get('/api/admin/stats', 'short'), { ...deps(), adminPassword: 'short' })).status).toBe(503);
    expect((await handleStats(get('/api/admin/stats', ''), { ...deps(), adminPassword: null })).status).toBe(503);
  });

  it('computes average and counts per feature', async () => {
    const d = deps();
    await submit(d, { rating: 5 });
    await submit(d, { rating: 3 });
    await submit(d, { feature: 'rep_check', rating: 4, comment: 'Nice', publicConsent: true });
    const s = await (await handleStats(get('/api/admin/stats', PASSWORD), d)).json();
    expect(s).toMatchObject({ total: 3, average: 4, pending: 1 });
    expect(s.perFeature.notice_reader).toEqual({ count: 2, average: 4, distribution: [0, 0, 1, 0, 1] });
    expect(s.perFeature.rep_check).toMatchObject({ count: 1, average: 4 });
  });

  it('queue shows pending and private comments', async () => {
    const d = deps();
    await submit(d, { comment: 'Private note' });
    await submit(d, { comment: 'Please share', publicConsent: true });
    await submit(d, { rating: 2 });
    const q = await (await handleQueue(get('/api/admin/queue', PASSWORD), d)).json();
    expect(q.pending.map((r: { comment: string }) => r.comment)).toEqual(['Please share']);
    expect(q.private.map((r: { comment: string }) => r.comment)).toEqual(['Private note']);
  });

  it('approves, re-checking the edited text', async () => {
    const d = deps();
    await submit(d, { comment: 'Great tool', publicConsent: true });
    const id = d.store.rows[0].id;
    // An edit that adds a name is cleaned and sent back for another look.
    const r1 = await handleModerate(post('/api/admin/moderate', { id, action: 'approve', publicText: 'Great tool, said Maria Lopez' }, PASSWORD), d);
    expect(r1.status).toBe(409);
    expect((await r1.json()).publicText).toBe('Great tool, said [name removed]');
    expect(d.store.rows[0].status).toBe('pending');
    // Scam wording can't be approved.
    const r2 = await handleModerate(post('/api/admin/moderate', { id, action: 'approve', publicText: 'Better than the scammers' }, PASSWORD), d);
    expect(r2.status).toBe(422);
    // Clean text is approved.
    const r3 = await handleModerate(post('/api/admin/moderate', { id, action: 'approve', publicText: 'Great tool' }, PASSWORD), d);
    expect(r3.status).toBe(200);
    expect(d.store.rows[0]).toMatchObject({ status: 'approved', public_text: 'Great tool' });
  });

  it('cannot approve private comments (no consent)', async () => {
    const d = deps();
    await submit(d, { comment: 'Private note' });
    const r = await handleModerate(post('/api/admin/moderate', { id: d.store.rows[0].id, action: 'approve' }, PASSWORD), d);
    expect(r.status).toBe(409);
    expect(d.store.rows[0].status).toBe('private');
  });

  it('rejects', async () => {
    const d = deps();
    await submit(d, { comment: 'ok', publicConsent: true });
    await handleModerate(post('/api/admin/moderate', { id: d.store.rows[0].id, action: 'reject' }, PASSWORD), d);
    expect(d.store.rows[0].status).toBe('rejected');
  });
});

describe('computeStats', () => {
  it('handles no ratings', () => {
    expect(computeStats([], 0)).toMatchObject({ total: 0, average: null, perFeature: { notice_reader: { count: 0, average: null } } });
  });
});

describe('SupabaseStore', () => {
  it('uses the service key server-side and the REST API', async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fakeFetch = (async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify([]), { status: 200 });
    }) as unknown as typeof fetch;
    const s = new SupabaseStore('https://proj.supabase.co/', 'service-key', fakeFetch);
    await s.insert({ feature: 'notice_reader', rating: 5, comment: null, lang: 'en', public_consent: false, status: 'private', public_text: null, flags: [] });
    await s.list('pending', 10);
    expect(calls[0].url).toBe('https://proj.supabase.co/rest/v1/feedback');
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe('Bearer service-key');
    expect(calls[1].url).toContain('status=eq.pending');
    expect(await s.get("1' or 1=1")).toBeNull(); // ids are checked before use
  });
});
