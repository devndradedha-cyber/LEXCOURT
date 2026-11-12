/**
 * One-page summary for legal help: a self-contained HTML page (prints on one
 * page, opens on any phone or computer) and a plain-text version for sharing.
 * Built on the device; LexCourt never sends it anywhere.
 */
import type { NoticeFacts } from './extract';
import { STRINGS, langInfo, type Lang } from './i18n';
import { FEATURES } from './featuresText';

export interface AidSummaryInput {
  facts: NoticeFacts;
  lang: Lang;
  questions: string;
  includeANumber: boolean;
  today?: Date;
}

export interface AidSummaryFields {
  heading: string;
  made: string;
  rows: [string, string][];
  questions: string[];
  questionsTitle: string;
  notesTitle: string;
  footer: string;
  dir: 'ltr' | 'rtl';
  locale: string;
}

const isolate = (s: string, rtl: boolean) => (rtl ? `⁦${s}⁩` : s);

export function aidSummaryFields({ facts, lang, questions, includeANumber, today = new Date() }: AidSummaryInput): AidSummaryFields {
  const t = FEATURES[lang].aid.doc;
  const S = STRINGS[lang];
  const info = langInfo(lang);
  const rtl = info.dir === 'rtl';
  const date = facts.date
    ? (() => {
        const [y, m, d] = facts.date!.split('-').map(Number);
        return new Intl.DateTimeFormat(info.locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(y, m - 1, d));
      })()
    : t.notFound;
  const time = facts.time
    ? isolate(
        new Intl.DateTimeFormat(info.locale, { hour: 'numeric', minute: '2-digit' }).format(
          new Date(2000, 0, 1, ...(facts.time.split(':').map(Number) as [number, number])),
        ),
        rtl,
      )
    : t.notFound;
  const rows: [string, string][] = [
    [t.noticeType, S.notice[facts.noticeType].title],
    [t.hearingDate, date],
    [t.hearingTime, time],
    [t.court, facts.courtAddress ? isolate(facts.courtAddress.replace(/\n/g, ', '), rtl) : t.notFound],
    [t.aNumber, includeANumber ? (facts.aNumber ? isolate(facts.aNumber, rtl) : t.notFound) : t.notIncluded],
  ];
  if (facts.remote) rows.push([t.remote, t.remoteYes]);
  return {
    heading: t.heading,
    made: t.made(new Intl.DateTimeFormat(info.locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(today)),
    rows,
    questions: questions.split('\n').map((q) => q.trim()).filter(Boolean),
    questionsTitle: t.questions,
    notesTitle: t.notes,
    footer: t.footer,
    dir: info.dir,
    locale: info.locale,
  };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Standalone HTML page (no scripts, no outside resources). */
export function aidSummaryHtml(input: AidSummaryInput): string {
  const f = aidSummaryFields(input);
  const blankLines = (n: number) => '<div class="line"></div>'.repeat(n);
  const questions = f.questions.length
    ? `<ol>${f.questions.map((q) => `<li><p><bdi>${esc(q)}</bdi></p>${blankLines(2)}</li>`).join('')}</ol>${blankLines(2)}`
    : blankLines(6);
  return `<!doctype html>
<html lang="${f.locale}" dir="${f.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(f.heading)}</title>
<style>
  @page { size: auto; margin: 16mm; }
  body { font: 15px/1.5 system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans Devanagari', 'Noto Sans Gurmukhi', 'Noto Nastaliq Urdu', sans-serif; color: #111; max-width: 720px; margin: 24px auto; padding: 0 16px; }
  ${f.dir === 'rtl' ? 'body { line-height: 2; }' : ''}
  h1 { font-size: 22px; margin: 0 0 2px; }
  .made { color: #555; font-size: 13px; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  th, td { border: 1px solid #bbb; padding: 6px 8px; text-align: start; vertical-align: top; }
  th { width: 34%; background: #f1f3f6; font-weight: 600; }
  h2 { font-size: 17px; margin: 18px 0 6px; }
  ol { padding-inline-start: 22px; margin: 0; }
  li p { margin: 0 0 4px; }
  .line { border-bottom: 1px solid #999; height: 28px; }
  footer { margin-top: 22px; font-size: 12px; color: #444; border-top: 1px solid #ccc; padding-top: 8px; }
</style>
</head>
<body>
<h1>${esc(f.heading)}</h1>
<p class="made">${esc(f.made)}</p>
<table>${f.rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>
<h2>${esc(f.questionsTitle)}</h2>
${questions}
<h2>${esc(f.notesTitle)}</h2>
${blankLines(4)}
<footer>${esc(f.footer)}</footer>
</body>
</html>
`;
}

/** Plain-text version, for the share sheet. */
export function aidSummaryText(input: AidSummaryInput): string {
  const f = aidSummaryFields(input);
  const lines = [f.heading, f.made, '', ...f.rows.map(([k, v]) => `${k}: ${v}`)];
  lines.push('', `${f.questionsTitle}:`);
  if (f.questions.length) f.questions.forEach((q, i) => lines.push(`${i + 1}. ${q}`));
  else lines.push('-');
  lines.push('', f.footer);
  return lines.join('\n');
}
