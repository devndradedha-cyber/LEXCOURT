import { useId, useState } from 'react';
import { findSensitive, mentionsScam } from '../lib/feedback/moderation';
import { MAX_COMMENT, type FeedbackFeature } from '../lib/feedback/shared';
import { FEEDBACK } from '../lib/feedbackText';
import type { Lang } from '../lib/i18n';

/** Features already rated or dismissed in this visit (memory only, nothing saved on the device). */
const done = new Set<FeedbackFeature>();

/**
 * "How helpful was this?" — rates LexCourt only. The comment is optional,
 * private by default, and can be shared only with consent and after review.
 */
export function FeedbackPrompt({ lang, feature }: { lang: Lang; feature: FeedbackFeature }) {
  const t = FEEDBACK[lang];
  const id = useId();
  const [hidden, setHidden] = useState(done.has(feature));
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'unavailable'>('idle');
  const [queued, setQueued] = useState(false);

  if (hidden) return null;

  const sensitive = findSensitive(comment);
  const kinds = [...new Set(sensitive.map((s) => s.kind))];
  const scam = mentionsScam(comment);
  const canShare = comment.trim().length > 0 && !scam;
  const canSend = rating > 0 && kinds.length === 0 && state !== 'sending';

  async function send() {
    if (!canSend) return;
    setState('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, rating, comment: comment.trim(), lang, publicConsent: consent && canShare, website: honeypot }),
      });
      if (res.status === 503) return setState('unavailable');
      if (!res.ok) return setState('error');
      const body = (await res.json()) as { status?: string };
      setQueued(body.status === 'pending');
      setState('sent');
      done.add(feature);
    } catch {
      setState('error');
    }
  }

  if (state === 'sent')
    return (
      <section className="card feedback" role="status">
        <p className="feedback-thanks">✓ {t.thanks}</p>
        {queued && <p className="hint small">{t.thanksReview}</p>}
      </section>
    );

  return (
    <section className="card feedback" aria-labelledby={`${id}-title`} data-no-read>
      <h2 id={`${id}-title`}>{t.title}</h2>
      <p className="hint small">{t.aboutLexCourt}</p>

      <div className="stars" role="radiogroup" aria-label={t.title}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} — ${t.starLabels[n - 1]}`}
            className={n <= rating ? 'star on' : 'star'}
            onClick={() => setRating(n)}
          >
            ★
          </button>
        ))}
      </div>
      <p className="hint small" aria-live="polite">
        {rating ? `${rating}/5 — ${t.starLabels[rating - 1]}` : t.chooseRating}
      </p>

      <label className="feedback-comment">
        {t.commentLabel}
        <textarea
          rows={3}
          maxLength={MAX_COMMENT}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t.placeholder}
          dir="auto"
          aria-describedby={`${id}-dont`}
        />
      </label>
      <p className="warn small" id={`${id}-dont`}>
        🔒 {t.doNotInclude}
      </p>

      {kinds.length > 0 && (
        <div className="error-box" role="alert">
          <p>{t.sensitiveFound}</p>
          <ul>
            {kinds.map((k) => (
              <li key={k}>{t.kinds[k]}</li>
            ))}
          </ul>
        </div>
      )}

      {scam && (
        <div className="alert" role="note">
          <p>
            <strong>{t.scamTitle}</strong>
          </p>
          <p>{t.scamText}</p>
          <a className="btn primary" href="#/report">
            {t.scamButton}
          </a>
        </div>
      )}

      {comment.trim() && (
        <label className="choice">
          <input type="checkbox" checked={consent && canShare} disabled={!canShare} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            {t.consentLabel}
            {scam && <span className="hint small block">{t.consentScam}</span>}
          </span>
        </label>
      )}

      {/* Hidden from people; automated spam tends to fill it in. */}
      <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" />

      <p className="hint small">
        {t.privacy} <a href="#/privacy">{t.privacyLink}</a>
      </p>

      {state === 'error' && <p className="error" role="alert">{t.error}</p>}
      {state === 'unavailable' && <p className="error" role="alert">{t.unavailable}</p>}

      <div className="row">
        <button
          className="btn"
          type="button"
          onClick={() => {
            done.add(feature);
            setHidden(true);
          }}
        >
          {t.notNow}
        </button>
        <button className="btn primary" type="button" disabled={!canSend} onClick={send}>
          {state === 'sending' ? t.sending : t.send}
        </button>
      </div>
    </section>
  );
}
