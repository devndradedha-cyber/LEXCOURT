import { useRef, useState } from 'react';
import { CalendarPlus, Lock, Phone } from 'lucide-react';
import { Icon } from './Art';
import { FEATURES } from '../lib/featuresText';
import { langInfo, type Lang } from '../lib/i18n';
import { buildMonthlyIcs, downloadFile } from '../lib/reminders';
import { LINKS } from '../lib/resources';
import { CopyButton, ExtLink, InfoNotAdvice, ToolDraftBanner } from './ToolParts';
import { GlossaryText, ListenButton, WordsToKnow } from './Reading';

/** Digits of an A-Number, as the court's systems expect them: 9 digits (8-digit numbers get a leading 0). */
export function aNumberDigits(input: string): string | null {
  const d = input.replace(/\D/g, '');
  if (d.length === 9) return d;
  if (d.length === 8) return `0${d}`;
  return null;
}

/**
 * Case status helper. Explains how to check the court's Automated Case
 * Information online or by phone. It never connects to the court: nothing is
 * fetched or sent, and the A-Number stays on the device.
 */
export function CaseStatus({ lang, aNumberFromNotice }: { lang: Lang; aNumberFromNotice: string | null }) {
  const t = FEATURES[lang].status;
  const info = langInfo(lang);
  const rtl = info.dir === 'rtl';
  const [aNumber, setANumber] = useState(aNumberFromNotice ?? '');
  const [includeA, setIncludeA] = useState(false);
  const digits = aNumberDigits(aNumber);
  const shown = digits ? (rtl ? `⁦${digits}⁩` : digits) : '_________';
  const fill = (s: string) => s.replace('{aNumber}', shown);
  const ref = useRef<HTMLElement>(null);
  const L = LINKS[lang];

  function addReminder() {
    const mark = rtl ? '‏' : '';
    downloadFile(
      buildMonthlyIcs({
        title: mark + t.reminderEventTitle,
        description: mark + t.reminderEventDescription(includeA && digits ? digits : null),
        from: new Date(),
      }),
      'check-case-status.ics',
      'text/calendar;charset=utf-8',
    );
  }

  return (
    <>
      <section className="card" aria-labelledby="status-title" ref={ref}>
        <ToolDraftBanner lang={lang} />
        <h1 id="status-title">{t.title}</h1>
        <ListenButton lang={lang} target={ref} />
        {t.intro.map((p) => (
          <p key={p}>
            <GlossaryText text={p} lang={lang} />
          </p>
        ))}
        <p className="info">
          <Icon as={Lock} />
          <span>{t.noFetch}</span>
        </p>

        <div className="fields" data-no-read>
          <label>
            {/* One element: the label is a flex column, so loose pieces would each get their own line. */}
            <span>
              <GlossaryText text={t.aNumberLabel} lang={lang} />
            </span>
            <input
              value={aNumber}
              onChange={(e) => setANumber(e.target.value)}
              inputMode="numeric"
              dir="ltr"
              autoComplete="off"
              placeholder="A-123-456-789"
            />
            <span className="hint small">{aNumberFromNotice && aNumber === aNumberFromNotice ? t.aNumberFromNotice : t.aNumberHint}</span>
          </label>
          <p className="hint small">{t.aNumberPrivacy}</p>
          {digits && (
            <div className="row wrap">
              <CopyButton text={digits} lang={lang} />
            </div>
          )}
          <p className="hint small">{t.eightDigits}</p>
        </div>

        <h2>{t.onlineTitle}</h2>
        <ol className="steps">
          {t.onlineSteps.map((s) => (
            <li key={s}>
              <GlossaryText text={fill(s)} lang={lang} />
            </li>
          ))}
        </ol>
        <ul className="links" data-no-read>
          <li>
            <ExtLink href={L.caseStatus} lang={lang}>
              {t.onlineLink}
            </ExtLink>
          </li>
        </ul>

        <h2>{t.phoneTitle}</h2>
        <ol className="steps">
          {t.phoneSteps.map((s) => (
            <li key={s}>{fill(s)}</li>
          ))}
        </ol>
        <div className="row wrap" data-no-read>
          <a className="btn primary" href={`tel:+1${L.caseStatusPhone.replace(/-/g, '').slice(1)}`}>
            <Icon as={Phone} /> {t.callButton}
          </a>
        </div>
        <p className="hint small">{t.tddNote}</p>

        <h2>{t.whatYouSeeTitle}</h2>
        <ul>
          {t.whatYouSee.map((s) => (
            <li key={s}>
              <GlossaryText text={s} lang={lang} />
            </li>
          ))}
        </ul>
        <p className="warn">{t.differentDate}</p>
        <InfoNotAdvice lang={lang} />
      </section>

      <section className="card" aria-labelledby="monthly-title">
        <h2 id="monthly-title">{t.reminderTitle}</h2>
        <p className="hint">{t.reminderHint}</p>
        <label className="choice">
          <input type="checkbox" checked={includeA} onChange={(e) => setIncludeA(e.target.checked)} disabled={!digits} />
          <span>
            {t.reminderIncludeA}
            <span className="hint small block">{t.reminderIncludeAHint}</span>
          </span>
        </label>
        <button className="btn primary big" onClick={addReminder}>
          <Icon as={CalendarPlus} /> {t.reminderButton}
        </button>
      </section>

      <WordsToKnow lang={lang} />
    </>
  );
}
