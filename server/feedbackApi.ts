/**
 * Feedback API handlers (Web-standard Request → Response), used by the Vercel
 * functions in /api and by the local development server.
 *
 * Rules enforced here (not only in the app):
 *  - Only a feature, a 1–5 rating, an optional comment, the language and a
 *    consent flag are accepted. Sensitive details are removed from comments.
 *  - A comment can become public only if the person consented AND an admin
 *    approves it; names are removed and scam/misconduct accusations are never
 *    publishable.
 *  - Admin endpoints need the admin password.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { FEEDBACK_FEATURES, validateSubmission, type FeedbackFeature, type FeedbackRecord } from '../src/lib/feedback/shared.js';
import { mentionsScam, preparePublic, removeNames, removeSensitive, type FeedbackLang } from '../src/lib/feedback/moderation.js';
import type { FeedbackStore } from './store.js';

export interface Deps {
  store: FeedbackStore | null;
  adminPassword: string | null;
  /** Delay after a wrong password, to slow guessing (ms). */
  authDelayMs?: number;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

const MAX_BODY = 8_000;

async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.length > MAX_BODY) throw new Error('too_large');
  return JSON.parse(text);
}

// ---------------------------------------------------------------------------
// Public: submit feedback
// ---------------------------------------------------------------------------

export async function handleSubmit(request: Request, deps: Deps): Promise<Response> {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!deps.store) return json(503, { error: 'feedback_unavailable' });
  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return json(400, { error: 'invalid_body' });
  }
  const v = validateSubmission(body);
  if (!v.ok) return json(400, { error: v.error });
  const { feature, rating, lang, publicConsent } = v.value;

  // Never store sensitive details, even if the app's check was bypassed.
  const cleaned = removeSensitive(v.value.comment);
  const comment = cleaned.text.trim() || null;
  const flags: string[] = cleaned.kinds.length ? ['sensitive_removed'] : [];

  let status: FeedbackRecord['status'] = 'private';
  let publicText: string | null = null;
  if (comment && publicConsent) {
    const p = preparePublic(comment, lang);
    for (const f of p.flags) if (!flags.includes(f)) flags.push(f);
    if (p.publicText) {
      status = 'pending';
      publicText = p.publicText;
    }
  } else if (comment && mentionsScam(comment)) {
    flags.push('scam_mentioned');
  }

  try {
    await deps.store.insert({
      feature,
      rating,
      comment,
      lang,
      public_consent: publicConsent && status === 'pending',
      status,
      public_text: publicText,
      flags,
    });
  } catch {
    return json(502, { error: 'storage_error' });
  }
  return json(201, { ok: true, status, flags });
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

const digest = (s: string) => createHash('sha256').update(s, 'utf8').digest();

/** Checks the admin password (Bearer header). Returns an error response, or null if allowed. */
export async function checkAdmin(request: Request, adminPassword: string | null, authDelayMs?: number): Promise<Response | null> {
  if (!adminPassword || adminPassword.length < 12) return json(503, { error: 'admin_not_configured' });
  const header = request.headers.get('authorization') ?? '';
  const given = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!timingSafeEqual(digest(given), digest(adminPassword))) {
    await new Promise((r) => setTimeout(r, authDelayMs ?? 600));
    return json(401, { error: 'unauthorised' });
  }
  return null;
}

async function authorised(request: Request, deps: Deps): Promise<Response | null> {
  if (!deps.store) return json(503, { error: 'feedback_unavailable' });
  return checkAdmin(request, deps.adminPassword, deps.authDelayMs);
}

export interface Stats {
  total: number;
  average: number | null;
  perFeature: Record<FeedbackFeature, { count: number; average: number | null; distribution: number[] }>;
  pending: number;
}

export function computeStats(ratings: { feature: FeedbackFeature; rating: number }[], pending: number): Stats {
  const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null);
  const perFeature = Object.fromEntries(
    FEEDBACK_FEATURES.map((f) => {
      const rs = ratings.filter((r) => r.feature === f).map((r) => r.rating);
      return [f, { count: rs.length, average: avg(rs), distribution: [1, 2, 3, 4, 5].map((n) => rs.filter((r) => r === n).length) }];
    }),
  ) as Stats['perFeature'];
  return { total: ratings.length, average: avg(ratings.map((r) => r.rating)), perFeature, pending };
}

export async function handleStats(request: Request, deps: Deps): Promise<Response> {
  if (request.method !== 'GET') return json(405, { error: 'method_not_allowed' });
  const denied = await authorised(request, deps);
  if (denied) return denied;
  try {
    const [ratings, pending] = await Promise.all([deps.store!.ratings(), deps.store!.list('pending', 200)]);
    return json(200, computeStats(ratings, pending.length));
  } catch {
    return json(502, { error: 'storage_error' });
  }
}

export async function handleQueue(request: Request, deps: Deps): Promise<Response> {
  if (request.method !== 'GET') return json(405, { error: 'method_not_allowed' });
  const denied = await authorised(request, deps);
  if (denied) return denied;
  try {
    const [pending, privateComments, approved] = await Promise.all([
      deps.store!.list('pending', 50),
      deps.store!.list('private', 50, true),
      deps.store!.list('approved', 50),
    ]);
    return json(200, { pending, private: privateComments, approved });
  } catch {
    return json(502, { error: 'storage_error' });
  }
}

/**
 * Approve or reject a pending comment. On approval the (possibly edited)
 * public text is checked again: names and sensitive details are removed, and
 * text that mentions fraud or scams cannot be approved.
 */
export async function handleModerate(request: Request, deps: Deps): Promise<Response> {
  if (request.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  const denied = await authorised(request, deps);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    body = (await readJson(request)) as Record<string, unknown>;
  } catch {
    return json(400, { error: 'invalid_body' });
  }
  const id = typeof body.id === 'string' ? body.id : '';
  const action = body.action;
  if (action !== 'approve' && action !== 'reject') return json(400, { error: 'invalid_action' });
  const item = await deps.store!.get(id).catch(() => null);
  if (!item) return json(404, { error: 'not_found' });
  if (item.status !== 'pending') return json(409, { error: 'not_pending' });
  if (action === 'approve' && !item.public_consent) return json(409, { error: 'no_consent' });

  const now = new Date().toISOString();
  if (action === 'reject') {
    await deps.store!.update(id, { status: 'rejected', reviewed_at: now });
    return json(200, { ok: true, status: 'rejected' });
  }
  const text = typeof body.publicText === 'string' ? body.publicText.trim() : item.public_text ?? '';
  if (!text) return json(400, { error: 'empty_text' });
  if (mentionsScam(text)) return json(422, { error: 'scam_not_publishable' });
  const s = removeSensitive(text);
  const n = removeNames(s.text, item.lang as FeedbackLang);
  if (s.kinds.length || n.removed) {
    // Something still needed removing: save the cleaned text and ask the admin to look again.
    await deps.store!.update(id, { public_text: n.text, flags: [...new Set([...item.flags, ...(n.removed ? ['names_removed'] : []), ...(s.kinds.length ? ['sensitive_removed'] : [])])] });
    return json(409, { error: 'changed_review_again', publicText: n.text });
  }
  await deps.store!.update(id, { status: 'approved', public_text: text, reviewed_at: now });
  return json(200, { ok: true, status: 'approved' });
}
