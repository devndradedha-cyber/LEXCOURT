import { useEffect, useId, useRef, useState } from 'react';
import { BellRing, CalendarPlus, CheckCircle2, ExternalLink, Mail, TriangleAlert, XCircle } from 'lucide-react';
import { STRINGS, langInfo, type Lang } from '../lib/i18n';
import { REMINDER_LABELS, isValidEmail, type ReminderLabel } from '../lib/reminderShared';
import { REMINDER_TEXT, formatReminderDate } from '../lib/reminderText';
import { downloadIcs, googleCalendarUrl, type ReminderInput } from '../lib/reminders';
import { CardIcon, Icon } from './Art';

/** U+200F RIGHT-TO-LEFT MARK: tells calendar apps that Urdu text runs right to left. */
const rtlMark = (lang: Lang) => (langInfo(lang).dir === 'rtl' ? '‏' : '');

/**
 * "Want a reminder?" — two free options:
 *  a) a calendar file made on the device (nothing sent), and
 *  b) email reminders 7, 2 and 1 days before. Only the email, the date, a fixed
 *     label and the language are sent — never the A-Number, case details or document.
 */
export function ReminderCard({
  lang,
  date,
  time,
  location,
  aNumberKnown,
  onDate,
  style,
}: {
  lang: Lang;
  date: string | null;
  time: string | null;
  location: string | null;
  aNumberKnown: boolean;
  onDate: (date: string | null) => void;
  style?: React.CSSProperties;
}) {
  const r = REMINDER_TEXT[lang];
  const t = STRINGS[lang];
  const id = useId();
  const [label, setLabel] = useState<ReminderLabel>('hearing');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const ics: ReminderInput | null = date
    ? {
        date,
        time,
        title: rtlMark(lang) + (label === 'hearing' ? t.reminderTitle : r.labels[label]),
        location,
        description: rtlMark(lang) + t.reminderDescription(aNumberKnown),
      }
    : null;

  async function sendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    if (!isValidEmail(email.trim())) return setError(r.invalidEmail);
    setError(null);
    setState('sending');
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Only these five fields. Nothing from the notice.
        body: JSON.stringify({ email: email.trim(), date, label, lang, website: honeypot }),
      });
      if (res.ok) return setState('sent');
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setState('idle');
      setError(
        res.status === 503
          ? r.unavailable
          : body.error === 'invalid_email'
            ? r.invalidEmail
            : body.error === 'date_too_soon'
              ? r.dateTooSoon
              : body.error === 'date_too_far'
                ? r.dateTooFar
                : r.error,
      );
    } catch {
      setState('idle');
      setError(r.error);
    }
  }

  return (
    <section className="card enter" aria-labelledby={`${id}-title`} style={style}>
      <div className="card-head">
        <CardIcon as={BellRing} tone="coral" />
        <h2 id={`${id}-title`}>{r.title}</h2>
      </div>

      {date ? (
        <p className="big-date small-date">{r.forDate(formatReminderDate(date, lang))}</p>
      ) : (
        <p>{r.enterDate}</p>
      )}
      <label className="fields">
        <span>{r.dateLabel}</span>
        <input type="date" value={date ?? ''} onChange={(e) => onDate(e.target.value || null)} />
      </label>

      <fieldset className="what">
        <legend>
          <strong>{r.whatLabel}</strong>
        </legend>
        <div className="label-chips">
          {REMINDER_LABELS.map((l) => (
            <label key={l} className="choice inline">
              <input type="radio" name={`${id}-label`} checked={label === l} onChange={() => setLabel(l)} />
              <span>{r.labels[l]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="warn" role="note">
        <Icon as={TriangleAlert} />
        <span>{r.disclaimer}</span>
      </p>

      <div className="reminder-options">
        <div className="option">
          <h3>
            <Icon as={CalendarPlus} /> {r.calendarTitle}
          </h3>
          <p className="hint small">{r.calendarText}</p>
          {ics ? (
            <div className="row wrap">
              <button type="button" className="btn primary" onClick={() => downloadIcs(ics)}>
                <Icon as={CalendarPlus} /> {r.calendarButton}
              </button>
              <a className="btn" href={googleCalendarUrl(ics)} target="_blank" rel="noopener noreferrer">
                {r.googleButton} <Icon as={ExternalLink} size={18} />
              </a>
            </div>
          ) : (
            <p className="missing">{t.needDate}</p>
          )}
        </div>

        <div className="option">
          <h3>
            <Icon as={Mail} /> {r.emailTitle}
          </h3>
          <p className="hint small">{r.emailText}</p>
          {state === 'sent' ? (
            <div className="done-box" role="status">
              <Icon as={CheckCircle2} />
              <span>
                {r.sent}
                <span className="block hint small">{r.sentHint}</span>
              </span>
            </div>
          ) : (
            <form onSubmit={sendEmail} noValidate>
              <label className="fields">
                <span>{r.emailLabel}</span>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={`${id}-store`}
                  aria-invalid={error === r.invalidEmail || undefined}
                />
              </label>
              <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button className="btn primary big" disabled={!date || !email.trim() || state === 'sending'}>
                <Icon as={Mail} /> {state === 'sending' ? r.sending : r.emailButton}
              </button>
              {!date && <p className="missing">{t.needDate}</p>}
              <p className="hint small" id={`${id}-store`}>
                {r.storeNote}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/** Page opened from an email link: #/reminder/confirm/<token> or #/reminder/stop/<token>. */
export function ReminderLinkPage({ lang, action, token }: { lang: Lang; action: 'confirm' | 'stop'; token: string }) {
  const r = REMINDER_TEXT[lang];
  const [result, setResult] = useState<{ ok: boolean; date?: string; label?: ReminderLabel } | null>(null);
  const started = useRef(false);
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    fetch(action === 'confirm' ? '/api/reminders/confirm' : '/api/reminders/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => setResult({ ok: res.ok, ...((await res.json().catch(() => ({}))) as object) }))
      .catch(() => setResult({ ok: false }));
  }, [action, token]);

  useEffect(() => {
    if (result) ref.current?.focus();
  }, [result]);

  const message = !result
    ? action === 'confirm'
      ? r.pageConfirming
      : r.pageStopping
    : !result.ok
      ? r.pageFailed
      : action === 'stop'
        ? r.pageStopped
        : result.date && result.label && REMINDER_LABELS.includes(result.label)
          ? r.pageConfirmed(r.labels[result.label], formatReminderDate(result.date, lang))
          : r.pageConfirming;

  return (
    <section className="card reminder-page enter" aria-live="polite">
      <CardIcon as={!result ? BellRing : result.ok ? CheckCircle2 : XCircle} tone={result && !result.ok ? 'coral' : 'teal'} />
      <h1 tabIndex={-1} ref={ref}>
        {message}
      </h1>
      {result?.ok && action === 'confirm' && (
        <p className="warn" role="note">
          <Icon as={TriangleAlert} />
          <span>{r.disclaimer}</span>
        </p>
      )}
      <a className="btn primary big" href="#/">
        {r.pageHome}
      </a>
    </section>
  );
}
