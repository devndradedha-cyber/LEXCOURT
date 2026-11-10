import { useEffect, useRef, useState } from 'react';
import { extractNoticeFacts, type NoticeFacts } from './lib/extract';
import { STRINGS, detectLang, type Lang } from './lib/i18n';
import { IS_DRAFT, LEGAL, hasAcceptedTerms, recordTermsAccepted, type LegalDoc } from './lib/legal';
import { fileToText, type Progress } from './lib/readFile';
import { downloadIcs, googleCalendarUrl, type ReminderInput } from './lib/reminders';
import { LINKS } from './lib/resources';
import { speechSupported, startListening, type Listener } from './lib/speech';
import { TOOLS } from './lib/toolsText';
import { CheckRepresentative } from './components/CheckRepresentative';
import { ReportProblem } from './components/ReportProblem';

type Phase = { kind: 'start' } | { kind: 'working'; label: string; fraction: number } | { kind: 'result' };

type LegalRoute = 'disclaimer' | 'terms' | 'privacy';
type ToolRoute = 'home' | 'check' | 'report';
type Route = ToolRoute | LegalRoute;
const LEGAL_ROUTES: Route[] = ['disclaimer', 'terms', 'privacy'];
const TOOL_ROUTES: Route[] = ['check', 'report'];
const isLegal = (r: Route): r is LegalRoute => LEGAL_ROUTES.includes(r);

function readRoute(): Route {
  const r = window.location.hash.replace(/^#\/?/, '') as Route;
  return LEGAL_ROUTES.includes(r) || TOOL_ROUTES.includes(r) ? r : 'home';
}

/** Simple hash routing (#/terms, #/privacy, #/disclaimer) so pages work on any static host. */
function useRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return route;
}

export default function App() {
  const [lang, setLang] = useState<Lang>(detectLang);
  const t = STRINGS[lang];
  const legal = LEGAL[lang];
  const route = useRoute();
  const [accepted, setAccepted] = useState<boolean>(() => hasAcceptedTerms());
  const [phase, setPhase] = useState<Phase>({ kind: 'start' });
  const [error, setError] = useState<string | null>(null);
  const [sourceText, setSourceText] = useState('');
  const [facts, setFacts] = useState<NoticeFacts | null>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (phase.kind === 'result') resultRef.current?.focus();
  }, [phase.kind]);

  function analyze(text: string) {
    if (text.replace(/\s/g, '').length < 4) {
      setError(t.errorNoText);
      setPhase({ kind: 'start' });
      return;
    }
    setSourceText(text);
    setFacts(extractNoticeFacts(text));
    setError(null);
    setPhase({ kind: 'result' });
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    const onProgress: Progress = (stage, fraction) => {
      const label = stage === 'pdf' ? t.progressPdf : stage === 'ocr-loading' ? t.progressOcrLoading : t.progressOcr;
      setPhase({ kind: 'working', label, fraction });
    };
    onProgress('pdf', 0);
    try {
      const text = await fileToText(file, onProgress);
      analyze(text);
    } catch (e) {
      setError(e instanceof Error && e.message === 'unsupported-file' ? t.errorUnsupported : t.errorRead);
      setPhase({ kind: 'start' });
    }
  }

  function reset() {
    setFacts(null);
    setSourceText('');
    setError(null);
    setPhase({ kind: 'start' });
    window.scrollTo(0, 0);
  }

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img src="/icon.svg" alt="" width={32} height={32} />
          <div>
            <div className="brand-name">LexCourt</div>
            <div className="brand-tag">{t.appTagline}</div>
          </div>
        </div>
        <button className="lang" onClick={() => setLang(lang === 'en' ? 'es' : 'en')} lang={lang === 'en' ? 'es' : 'en'}>
          {t.langToggle}
        </button>
      </header>

      <ShortDisclaimer lang={lang} />

      {!isLegal(route) && <ToolNav lang={lang} route={route} />}

      <main>
        {isLegal(route) && <LegalPage lang={lang} doc={legal[route]} />}

        {!isLegal(route) && !accepted && (
          <AcceptTerms
            lang={lang}
            onAccept={() => {
              recordTermsAccepted();
              setAccepted(true);
              window.scrollTo(0, 0);
            }}
          />
        )}

        {route === 'home' && accepted && (
          <>
        {phase.kind === 'start' && <StartScreen lang={lang} error={error} onFile={onFile} onText={analyze} />}

        {phase.kind === 'working' && (
          <section className="card" aria-live="polite">
            <p>{phase.label}</p>
            <progress value={Math.round(phase.fraction * 100)} max={100} />
          </section>
        )}

        {phase.kind === 'result' && facts && (
          <Result lang={lang} facts={facts} setFacts={setFacts} sourceText={sourceText} onReset={reset} headingRef={resultRef} />
        )}

          </>
        )}

        {route === 'check' && accepted && (
          <CheckRepresentative lang={lang} onReport={() => (window.location.hash = '#/report')} />
        )}

        {route === 'report' && accepted && <ReportProblem lang={lang} />}

        {!isLegal(route) && <LegalHelp lang={lang} />}

        {route === 'home' && (
          <section className="card subtle" aria-labelledby="privacy-title">
            <h2 id="privacy-title">{t.privacyTitle}</h2>
            <ul>
              {t.privacy.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <a href="#/privacy">{legal.privacy.title} →</a>
          </section>
        )}
      </main>

      <footer>
        <nav aria-label={legal.shortLinks.terms} className="legal-links">
          <a href="#/disclaimer">{legal.shortLinks.disclaimer}</a>
          <a href="#/terms">{legal.shortLinks.terms}</a>
          <a href="#/privacy">{legal.shortLinks.privacy}</a>
        </nav>
        <p>{t.footer}</p>
        {IS_DRAFT && <p className="draft-inline">{legal.draftBadge}</p>}
      </footer>
    </>
  );
}

/** Tabs for the three tools. Plain links, so the browser's back button works. */
function ToolNav({ lang, route }: { lang: Lang; route: ToolRoute }) {
  const n = TOOLS[lang].nav;
  const tabs: [ToolRoute, string, string][] = [
    ['home', '#/', n.notice],
    ['check', '#/check', n.check],
    ['report', '#/report', n.report],
  ];
  return (
    <nav className="tool-nav" aria-label="LexCourt">
      {tabs.map(([r, href, label]) => (
        <a key={r} href={href} aria-current={route === r ? 'page' : undefined}>
          {label}
        </a>
      ))}
    </nav>
  );
}

/** Short disclaimer shown at the top of every screen. */
function ShortDisclaimer({ lang }: { lang: Lang }) {
  const legal = LEGAL[lang];
  return (
    <aside className="short-disclaimer" aria-label={legal.shortLinks.disclaimer}>
      <p>
        <strong>⚠️ </strong>
        {legal.short}{' '}
        <a href="#/disclaimer">{legal.shortLinks.disclaimer}</a>
      </p>
    </aside>
  );
}

function DraftBanner({ lang }: { lang: Lang }) {
  if (!IS_DRAFT) return null;
  const legal = LEGAL[lang];
  return (
    <div className="draft-banner" role="note">
      <strong>{legal.draftBadge}</strong>
      <span>{legal.draftNotice}</span>
    </div>
  );
}

function AcceptTerms({ lang, onAccept }: { lang: Lang; onAccept: () => void }) {
  const legal = LEGAL[lang];
  const [checked, setChecked] = useState(false);
  return (
    <section className="card" aria-labelledby="accept-title">
      <DraftBanner lang={lang} />
      <h1 id="accept-title">{legal.acceptTitle}</h1>
      {legal.acceptIntro.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <p className="row wrap legal-inline-links">
        <a href="#/terms">{legal.terms.title}</a>
        <a href="#/privacy">{legal.privacy.title}</a>
        <a href="#/disclaimer">{legal.disclaimer.title}</a>
      </p>
      <label className="accept">
        <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
        <span>{legal.acceptCheckbox}</span>
      </label>
      <button className="btn primary big" disabled={!checked} onClick={onAccept}>
        {legal.acceptButton}
      </button>
      <p className="hint small">{legal.acceptStorageNote}</p>
    </section>
  );
}

function LegalPage({ lang, doc }: { lang: Lang; doc: LegalDoc }) {
  const legal = LEGAL[lang];
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => ref.current?.focus(), [doc]);
  return (
    <article className="card legal-doc" aria-labelledby="legal-title">
      <a href="#/" className="back">
        {legal.back}
      </a>
      <DraftBanner lang={lang} />
      <h1 id="legal-title" tabIndex={-1} ref={ref}>
        {doc.title}
      </h1>
      <p className="hint small">{doc.updated}</p>
      {doc.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs?.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {s.bullets && (
            <ul>
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <a href="#/" className="btn big">
        {legal.back}
      </a>
    </article>
  );
}

function StartScreen({
  lang,
  error,
  onFile,
  onText,
}: {
  lang: Lang;
  error: string | null;
  onFile: (f: File | undefined) => void;
  onText: (text: string) => void;
}) {
  const t = STRINGS[lang];
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const listener = useRef<Listener | null>(null);
  const canSpeak = speechSupported();

  useEffect(() => () => listener.current?.stop(), []);

  function toggleVoice() {
    if (listening) {
      listener.current?.stop();
      return;
    }
    setVoiceError(null);
    const base = text ? text.trim() + ' ' : '';
    listener.current = startListening(
      lang,
      (finalText, interimText) => {
        setText(base + finalText);
        setInterim(interimText);
      },
      (err) => {
        setListening(false);
        setInterim('');
        if (err && err !== 'no-speech' && err !== 'aborted') setVoiceError(t.voiceUnsupported);
      },
    );
    setListening(listener.current !== null);
  }

  return (
    <section className="card" aria-labelledby="start-title">
      <h1 id="start-title">{t.startTitle}</h1>
      <p className="hint">{t.startHint}</p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <label className="btn primary big">
        {t.uploadPhoto}
        <input type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} hidden />
      </label>
      <label className="btn big">
        {t.uploadPdf}
        <input type="file" accept="application/pdf,.pdf" onChange={(e) => onFile(e.target.files?.[0])} hidden />
      </label>

      <h2 className="or">{t.orDescribe}</h2>
      <textarea
        value={text + (interim ? (text ? ' ' : '') + interim : '')}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.typePlaceholder}
        rows={5}
        aria-label={t.orDescribe}
        readOnly={listening}
      />
      <div className="row">
        {canSpeak && (
          <button className={'btn' + (listening ? ' recording' : '')} onClick={toggleVoice} aria-pressed={listening}>
            {listening ? `■ ${t.stopSpeaking}` : `🎤 ${t.speak}`}
          </button>
        )}
        <button className="btn primary" onClick={() => onText(text)} disabled={listening || !text.trim()}>
          {t.readThis}
        </button>
      </div>
      {listening && <p className="hint" aria-live="polite">{t.listening}</p>}
      <p className="hint small">{canSpeak ? t.voicePrivacy : t.voiceUnsupported}</p>
      {voiceError && <p className="error">{voiceError}</p>}
    </section>
  );
}

function formatDate(date: string, lang: Lang): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(y, m - 1, d));
}

function formatTime(time: string, lang: Lang): string {
  const [h, m] = time.split(':').map(Number);
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', { hour: 'numeric', minute: '2-digit' }).format(
    new Date(2000, 0, 1, h, m),
  );
}

function Result({
  lang,
  facts,
  setFacts,
  sourceText,
  onReset,
  headingRef,
}: {
  lang: Lang;
  facts: NoticeFacts;
  setFacts: (f: NoticeFacts) => void;
  sourceText: string;
  onReset: () => void;
  headingRef: React.RefObject<HTMLHeadingElement>;
}) {
  const t = STRINGS[lang];
  const update = (patch: Partial<NoticeFacts>) => setFacts({ ...facts, ...patch });
  const notice = t.notice[facts.noticeType];
  const hearing = facts.hearingType !== 'unknown' ? t.hearing[facts.hearingType] : null;

  const reminder: ReminderInput | null = facts.date
    ? {
        date: facts.date,
        time: facts.time,
        title: t.reminderTitle,
        location: facts.courtAddress?.replace(/\n/g, ', ') ?? null,
        description: t.reminderDescription(!!facts.aNumber),
      }
    : null;

  return (
    <>
      <section className="card" aria-labelledby="result-title">
        <h1 id="result-title" tabIndex={-1} ref={headingRef}>
          {t.resultTitle}
        </h1>
        <p className="warn">{t.checkWarning}</p>

        {facts.date && (
          <p className="big-date">
            {formatDate(facts.date, lang)}
            {facts.time && <> · {formatTime(facts.time, lang)}</>}
          </p>
        )}

        <div className="fields">
          <label>
            {t.fieldDate}
            <input type="date" value={facts.date ?? ''} onChange={(e) => update({ date: e.target.value || null })} />
            {!facts.date && <span className="missing">{t.notFound}</span>}
          </label>
          <label>
            {t.fieldTime}
            <input type="time" value={facts.time ?? ''} onChange={(e) => update({ time: e.target.value || null })} />
            {!facts.time && <span className="missing">{t.notFound}</span>}
          </label>
          <label>
            {t.fieldCourt}
            <textarea rows={3} value={facts.courtAddress ?? ''} onChange={(e) => update({ courtAddress: e.target.value || null })} />
            {!facts.courtAddress && <span className="missing">{t.notFound}</span>}
          </label>
          <label>
            {t.fieldANumber}
            <input
              inputMode="numeric"
              autoComplete="off"
              value={facts.aNumber ?? ''}
              onChange={(e) => update({ aNumber: e.target.value || null })}
            />
          </label>
        </div>

        {facts.dateToBeSet && <p className="info">{t.dateToBeSet}</p>}
        {facts.remote && <p className="info">{t.remoteNote}</p>}
      </section>

      <section className="card" aria-labelledby="reminders-title">
        <h2 id="reminders-title">{t.remindersTitle}</h2>
        <p className="hint">{t.remindersHint}</p>
        {reminder ? (
          <div className="row wrap">
            <button className="btn primary" onClick={() => downloadIcs(reminder)}>
              📅 {t.downloadIcs}
            </button>
            <a className="btn" href={googleCalendarUrl(reminder)} target="_blank" rel="noopener noreferrer">
              {t.googleCal}
            </a>
          </div>
        ) : (
          <p className="missing">{t.needDate}</p>
        )}
      </section>

      <section className="card" aria-labelledby="what-title">
        <h2 id="what-title">{t.whatIsThis}</h2>
        {IS_DRAFT && <p className="draft-inline small">{LEGAL[lang].draftBadge}</p>}
        <h3>{notice.title}</h3>
        {notice.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
        {hearing && (
          <>
            <h3>{hearing.title}</h3>
            {hearing.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </>
        )}
      </section>

      <section className="card" aria-labelledby="must-title">
        <h2 id="must-title">{t.mustKnowTitle}</h2>
        {IS_DRAFT && <p className="draft-inline small">{LEGAL[lang].draftBadge}</p>}
        <ul className="must">
          {t.mustKnow.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <details className="card subtle">
        <summary>{t.showText}</summary>
        <pre className="source">{sourceText}</pre>
      </details>

      <button className="btn big" onClick={onReset}>
        {t.startOver}
      </button>
    </>
  );
}

function LegalHelp({ lang }: { lang: Lang }) {
  const t = STRINGS[lang];
  const L = LINKS[lang];
  const links: [string, string][] = [
    [t.helpProBono, L.proBonoList],
    [t.helpDirectory, L.legalDirectory],
    [t.helpCaseStatus(L.caseStatusPhone), L.caseStatus],
    [t.helpCourtGuide, L.courtGuide],
    [t.helpForms, L.changeOfAddress],
  ];
  return (
    <section className="card help" aria-labelledby="help-title">
      <h2 id="help-title">{t.helpTitle}</h2>
      <p>{t.helpIntro}</p>
      <ul className="links">
        {links.map(([label, href]) => (
          <li key={href}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              {label} ↗
            </a>
          </li>
        ))}
        <li>
          <a href={`tel:+1${L.caseStatusPhone.replace(/-/g, '').slice(1)}`}>📞 {L.caseStatusPhone}</a>
        </li>
      </ul>
      <p className="warn">{t.notarioWarning}</p>
    </section>
  );
}
