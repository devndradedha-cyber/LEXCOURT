/**
 * Builds the confirmation and reminder emails in the person's language.
 * The only facts in an email are the label (for example "Court hearing") and
 * the date — nothing else is stored, so nothing else can be sent.
 */
import type { FeedbackLang } from '../src/lib/feedback/moderation.js';
import { REMINDER_TEXT, formatReminderDate } from '../src/lib/reminderText.js';
import type { ReminderLabel } from '../src/lib/reminderShared.js';
import type { Email } from './mailer.js';

const DIR: Record<FeedbackLang, 'ltr' | 'rtl'> = { en: 'ltr', es: 'ltr', hi: 'ltr', pa: 'ltr', ur: 'rtl' };
const HTML_LANG: Record<FeedbackLang, string> = { en: 'en', es: 'es', hi: 'hi', pa: 'pa', ur: 'ur' };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface Parts {
  lang: FeedbackLang;
  heading: string;
  lines: string[];
  button?: { label: string; url: string };
  appUrl: string;
  stopUrl: string;
  /** Small print at the end. */
  notes: string[];
}

function render(p: Parts): { text: string; html: string } {
  const t = REMINDER_TEXT[p.lang].email;
  const text = [
    p.heading,
    '',
    ...p.lines,
    ...(p.button ? ['', `${p.button.label}: ${p.button.url}`] : []),
    '',
    REMINDER_TEXT[p.lang].disclaimer,
    '',
    `${t.openApp}: ${p.appUrl}`,
    '',
    ...p.notes,
    `${t.stopLink}: ${p.stopUrl}`,
  ].join('\n');

  const font =
    p.lang === 'ur'
      ? "'Noto Nastaliq Urdu','Jameel Noori Nastaleeq',Arial,sans-serif"
      : "'Nunito','Segoe UI',Roboto,'Noto Sans Devanagari','Noto Sans Gurmukhi',Arial,sans-serif";
  const lh = p.lang === 'ur' ? '2' : '1.55';
  const html = `<!doctype html><html lang="${HTML_LANG[p.lang]}" dir="${DIR[p.lang]}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#FAF7F2;">
<div style="max-width:560px;margin:0 auto;padding:24px 16px;font-family:${font};font-size:17px;line-height:${lh};color:#1E2A5A;" dir="${DIR[p.lang]}">
<p style="margin:0 0 16px;font-weight:800;font-size:20px;color:#1E2A5A;">LexCourt</p>
<div style="background:#ffffff;border-radius:16px;padding:24px;box-shadow:0 2px 8px rgba(30,42,90,0.08);">
<h1 style="margin:0 0 12px;font-size:22px;line-height:1.4;color:#1E2A5A;">${esc(p.heading)}</h1>
${p.lines.map((l) => `<p style="margin:0 0 12px;">${esc(l)}</p>`).join('\n')}
${
  p.button
    ? `<p style="margin:20px 0;"><a href="${esc(p.button.url)}" style="display:inline-block;background:#14B8A6;color:#1E2A5A;font-weight:800;text-decoration:none;padding:14px 22px;border-radius:12px;">${esc(p.button.label)}</a></p>`
    : ''
}
<p style="margin:16px 0 0;padding:12px 14px;background:#FFF1EE;border-radius:10px;border-inline-start:4px solid #F97362;color:#7A2618;">${esc(REMINDER_TEXT[p.lang].disclaimer)}</p>
</div>
<p style="margin:20px 0 8px;"><a href="${esc(p.appUrl)}" style="color:#0F766E;font-weight:700;">${esc(t.openApp)}</a></p>
${p.notes.map((n) => `<p style="margin:0 0 8px;font-size:15px;color:#4A5275;">${esc(n)}</p>`).join('\n')}
<p style="margin:8px 0 0;font-size:15px;"><a href="${esc(p.stopUrl)}" style="color:#4A5275;">${esc(t.stopLink)}</a></p>
</div></body></html>`;
  return { text, html };
}

/** RFC 8058 one-click unsubscribe headers (Gmail, Apple Mail and others show an Unsubscribe button). */
function unsubscribeHeaders(oneClickUrl: string): Record<string, string> {
  return { 'List-Unsubscribe': `<${oneClickUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' };
}

export interface Links {
  appUrl: string;
  /** Page in the app that stops reminders with one tap on the link. */
  stopPage: string;
  /** API address for the one-click header. */
  stopApi: string;
}

export function confirmEmail(to: string, lang: FeedbackLang, label: ReminderLabel, date: string, confirmUrl: string, links: Links): Email {
  const T = REMINDER_TEXT[lang];
  const { text, html } = render({
    lang,
    heading: T.email.confirmSubject,
    lines: [T.email.confirmIntro(T.labels[label], formatReminderDate(date, lang)), T.email.confirmSchedule],
    button: { label: T.email.confirmButton, url: confirmUrl },
    appUrl: links.appUrl,
    stopUrl: links.stopPage,
    notes: [T.email.confirmIgnore, T.email.notAdvice],
  });
  return { to, subject: T.email.confirmSubject, text, html, headers: unsubscribeHeaders(links.stopApi) };
}

export function reminderEmail(to: string, lang: FeedbackLang, label: ReminderLabel, date: string, days: number, links: Links): Email {
  const T = REMINDER_TEXT[lang];
  const when = T.email.when(days);
  const d = formatReminderDate(date, lang);
  const { text, html } = render({
    lang,
    heading: T.email.reminderLine(T.labels[label], when, d),
    lines: [],
    appUrl: links.appUrl,
    stopUrl: links.stopPage,
    notes: [T.email.notAdvice, T.email.deletedAfter, T.email.why],
  });
  return { to, subject: T.email.reminderSubject(T.labels[label], when, d), text, html, headers: unsubscribeHeaders(links.stopApi) };
}
