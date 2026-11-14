import { useState } from 'react';
import { Download, FileText, Lock, Printer, Share2 } from 'lucide-react';
import { Icon } from './Art';
import { aidSummaryFields, aidSummaryHtml, aidSummaryText } from '../lib/aidSummary';
import type { NoticeFacts } from '../lib/extract';
import { FEATURES } from '../lib/featuresText';
import { langInfo, type Lang } from '../lib/i18n';
import { downloadFile } from '../lib/reminders';

/**
 * Legal aid summary: a one-page summary of the notice, plus the person's own
 * questions, to print, download or share. Nothing is sent automatically.
 */
export function AidSummary({ lang, facts }: { lang: Lang; facts: NoticeFacts }) {
  const t = FEATURES[lang].aid;
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState('');
  const [includeA, setIncludeA] = useState(true);
  const [docLang, setDocLang] = useState<Lang>(lang);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const input = { facts, lang: docLang, questions, includeANumber: includeA };
  const f = aidSummaryFields(input);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  async function share() {
    setShareMsg(null);
    if (!canShare) return setShareMsg(t.shareUnsupported);
    try {
      await navigator.share({ title: f.heading, text: aidSummaryText(input) });
    } catch {
      /* the person closed the share sheet */
    }
  }

  return (
    <section className="card" aria-labelledby="aid-title">
      <h2 id="aid-title">{t.title}</h2>
      <p>{t.intro}</p>
      {!open ? (
        <button className="btn primary big" onClick={() => setOpen(true)}>
          <Icon as={FileText} /> {t.open}
        </button>
      ) : (
        <>
          <div className="fields">
            <label>
              {t.questionsLabel}
              <textarea rows={4} value={questions} onChange={(e) => setQuestions(e.target.value)} placeholder={t.questionsPlaceholder} dir="auto" />
              <span className="hint small">{t.questionsHint}</span>
            </label>
          </div>
          <label className="choice">
            <input type="checkbox" checked={includeA} onChange={(e) => setIncludeA(e.target.checked)} />
            <span>{t.includeA}</span>
          </label>
          <fieldset className="row wrap seg">
            <legend className="hint small">{t.summaryLang}</legend>
            {[...new Set<Lang>(['en', 'es', lang])].map((l) => (
              <label key={l} className="choice inline">
                <input type="radio" name="aidLang" checked={docLang === l} onChange={() => setDocLang(l)} />
                <span lang={langInfo(l).locale}>{langInfo(l).name}</span>
              </label>
            ))}
          </fieldset>

          <h3>{t.preview}</h3>
          {/* The same page that is printed, downloaded or shared. */}
          <article className="aid-preview print-area" lang={f.locale} dir={f.dir} aria-label={t.preview}>
            <h1>{f.heading}</h1>
            <p className="made">{f.made}</p>
            <table>
              <tbody>
                {f.rows.map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2>{f.questionsTitle}</h2>
            {f.questions.length ? (
              <ol>
                {f.questions.map((q, i) => (
                  <li key={i}>
                    <bdi>{q}</bdi>
                    <div className="line" />
                    <div className="line" />
                  </li>
                ))}
              </ol>
            ) : (
              <>
                <div className="line" />
                <div className="line" />
                <div className="line" />
              </>
            )}
            <h2>{f.notesTitle}</h2>
            <div className="line" />
            <div className="line" />
            <footer>{f.footer}</footer>
          </article>

          <div className="row wrap aid-actions">
            <button className="btn primary" onClick={() => window.print()}>
              <Icon as={Printer} /> {t.print}
            </button>
            <button className="btn" onClick={() => downloadFile(aidSummaryHtml(input), 'legal-help-summary.html', 'text/html;charset=utf-8')}>
              <Icon as={Download} /> {t.download}
            </button>
            <button className="btn" onClick={share}>
              <Icon as={Share2} /> {t.share}
            </button>
          </div>
          {shareMsg && (
            <p className="hint small" role="status">
              {shareMsg}
            </p>
          )}
          <p className="info small">
            <Icon as={Lock} />
            <span>{t.nothingSent}</span>
          </p>
        </>
      )}
    </section>
  );
}
