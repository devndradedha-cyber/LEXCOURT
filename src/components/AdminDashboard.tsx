import { useState } from 'react';
import type { FeedbackRecord } from '../lib/feedback/shared';
import { langInfo, type Lang } from '../lib/i18n';

/**
 * Admin dashboard (English only): average rating, ratings per feature and the
 * moderation queue. The admin password is kept in memory only and sent with
 * each request; nothing is saved in the browser.
 */

interface Stats {
  total: number;
  average: number | null;
  pending: number;
  perFeature: Record<string, { count: number; average: number | null; distribution: number[] }>;
}
interface Queue {
  pending: FeedbackRecord[];
  private: FeedbackRecord[];
  approved: FeedbackRecord[];
}

const FEATURE_NAMES: Record<string, string> = { notice_reader: 'Notice Reader', rep_check: 'Lawyer / representative check' };
const FLAG_NAMES: Record<string, string> = {
  names_removed: 'Names removed — check',
  sensitive_removed: 'Sensitive details removed',
  scam_mentioned: 'Mentions fraud/scam — not publishable',
};
const ERRORS: Record<string, string> = {
  unauthorised: 'Wrong password.',
  admin_not_configured: 'The admin password is not set up on the server (ADMIN_PASSWORD, at least 12 characters).',
  feedback_unavailable: 'The feedback database is not set up on the server (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).',
  storage_error: 'The database could not be reached. Try again.',
  scam_not_publishable: 'This text mentions fraud or a scam and cannot be approved.',
  changed_review_again: 'Names or personal details were found and removed. Check the new text, then approve again.',
  not_pending: 'This item was already reviewed.',
};

const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

export function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [queue, setQueue] = useState<Queue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function api<T>(path: string, pw: string, init: RequestInit = {}): Promise<{ status: number; body: T & { error?: string } }> {
    const res = await fetch(path, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${pw}`, 'Content-Type': 'application/json' } });
    return { status: res.status, body: await res.json().catch(() => ({ error: 'storage_error' })) };
  }

  async function load(pw: string) {
    setBusy(true);
    setError(null);
    try {
      const [s, q] = await Promise.all([api<Stats>('/api/admin/stats', pw), api<Queue>('/api/admin/queue', pw)]);
      if (s.status !== 200) {
        setError(ERRORS[s.body.error ?? ''] ?? 'Something went wrong.');
        if (s.status === 401) setAuthed(null);
        return;
      }
      setAuthed(pw);
      setStats(s.body);
      setQueue(q.body);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  if (!authed)
    return (
      <section className="card admin" aria-labelledby="admin-title">
        <h1 id="admin-title">Feedback admin</h1>
        <p className="hint">For LexCourt reviewers only.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(password);
          }}
          className="fields"
        >
          <label>
            Admin password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" dir="ltr" />
          </label>
          <button className="btn primary" disabled={!password || busy}>
            {busy ? 'Checking…' : 'Open dashboard'}
          </button>
        </form>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>
    );

  return (
    <>
      <section className="card admin" aria-labelledby="admin-title">
        <div className="row wrap admin-head">
          <h1 id="admin-title">Feedback admin</h1>
          <button className="btn" onClick={() => load(authed)} disabled={busy}>
            ↻ Refresh
          </button>
          <button
            className="btn"
            onClick={() => {
              setAuthed(null);
              setPassword('');
              setStats(null);
              setQueue(null);
            }}
          >
            Sign out
          </button>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {stats && (
          <div className="admin-stats">
            <div className="stat">
              <span className="stat-num">{stats.average ?? '—'}</span>
              <span className="stat-label">Average rating ({stats.total} ratings)</span>
            </div>
            <div className="stat">
              <span className="stat-num">{stats.pending}</span>
              <span className="stat-label">Waiting for review</span>
            </div>
            {Object.entries(stats.perFeature).map(([f, v]) => (
              <div className="stat wide" key={f}>
                <span className="stat-label">
                  <strong>{FEATURE_NAMES[f] ?? f}</strong>: {v.count} ratings, average {v.average ?? '—'}
                </span>
                <div className="bars" aria-label={`Ratings for ${FEATURE_NAMES[f] ?? f}`}>
                  {v.distribution.map((c, i) => (
                    <div key={i} className="bar-row">
                      <span>{i + 1}★</span>
                      <span className="bar" style={{ width: `${v.count ? (c / v.count) * 100 : 0}%` }} />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {queue && (
        <>
          <section className="card admin" aria-labelledby="queue-title">
            <h2 id="queue-title">Moderation queue ({queue.pending.length})</h2>
            <p className="hint small">
              People who allowed sharing. Approving saves the public text; it is not shown anywhere yet. Names and personal details are removed
              automatically, and text about fraud or scams cannot be approved.
            </p>
            {queue.pending.length === 0 && <p>Nothing waiting.</p>}
            {queue.pending.map((item) => (
              <ModerationItem key={item.id} item={item} password={authed} onDone={() => load(authed)} />
            ))}
          </section>

          <details className="card admin">
            <summary>Private comments ({queue.private.length}) — admin only, never published</summary>
            {queue.private.map((item) => (
              <ItemView key={item.id} item={item} />
            ))}
          </details>

          <details className="card admin">
            <summary>Approved ({queue.approved.length}) — ready, not shown publicly yet</summary>
            {queue.approved.map((item) => (
              <div key={item.id} className="admin-item">
                <Meta item={item} />
                <p lang={langInfo(item.lang as Lang).locale} dir="auto">
                  {item.public_text}
                </p>
              </div>
            ))}
          </details>
        </>
      )}
    </>
  );
}

function Meta({ item }: { item: FeedbackRecord }) {
  return (
    <p className="hint small admin-meta">
      <span className="stars-text">{stars(item.rating)}</span> · {FEATURE_NAMES[item.feature] ?? item.feature} · {langInfo(item.lang as Lang).english} ·{' '}
      {new Date(item.created_at).toLocaleString()}
      {item.flags.map((f) => (
        <span key={f} className={`flag ${f}`}>
          {FLAG_NAMES[f] ?? f}
        </span>
      ))}
    </p>
  );
}

function ItemView({ item }: { item: FeedbackRecord }) {
  return (
    <div className="admin-item">
      <Meta item={item} />
      <p lang={langInfo(item.lang as Lang).locale} dir="auto">
        {item.comment}
      </p>
    </div>
  );
}

function ModerationItem({ item, password, onDone }: { item: FeedbackRecord; password: string; onDone: () => void }) {
  const [text, setText] = useState(item.public_text ?? '');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function act(action: 'approve' | 'reject') {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${password}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, action, publicText: text }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; publicText?: string };
      if (res.ok) return onDone();
      if (body.publicText) setText(body.publicText);
      setMsg(ERRORS[body.error ?? ''] ?? 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-item">
      <Meta item={item} />
      <p className="hint small">Original (admin only):</p>
      <blockquote lang={langInfo(item.lang as Lang).locale} dir="auto">
        {item.comment}
      </blockquote>
      <label className="fields">
        Public text (edit if needed)
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} dir="auto" lang={langInfo(item.lang as Lang).locale} />
      </label>
      {msg && (
        <p className="error" role="alert">
          {msg}
        </p>
      )}
      <div className="row">
        <button className="btn" onClick={() => act('reject')} disabled={busy}>
          Reject
        </button>
        <button className="btn primary" onClick={() => act('approve')} disabled={busy || !text.trim()}>
          Approve
        </button>
      </div>
    </div>
  );
}
