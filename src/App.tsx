import { useEffect, useRef, useState } from 'react';
import { extractNoticeFacts, type NoticeFacts } from './lib/extract';
import { STRINGS, detectLang, type Lang } from './lib/i18n';
import { fileToText, type Progress } from './lib/readFile';
import { downloadIcs, googleCalendarUrl, type ReminderInput } from './lib/reminders';
import { LINKS } from './lib/resources';
import { speechSupported, startListening, type Listener } from './lib/speech';

type Phase = { kind: 'start' } | { kind: 'working'; label: string; fraction: number } | { kind: 'result' };

export default function App() {
  const [lang, setLang] = useState<Lang>(detectLang);
  const t = STRINGS[lang];
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

      <main>
        <section className="notice-box" aria-labelledby="disclaimer-title">
          <h2 id="disclaimer-title">{t.disclaimerTitle}</h2>
          <p>{t.disclaimer}</p>
        </section>

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

        <LegalHelp lang={lang} />

        <section className="card subtle" aria-labelledby="privacy-title">
          <h2 id="privacy-title">{t.privacyTitle}</h2>
          <ul>
            {t.privacy.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </section>
      </main>

      <footer>{t.footer}</footer>
    </>
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
  const links: [string, string][] = [
    [t.helpProBono, LINKS.proBonoList],
    [t.helpDirectory, LINKS.legalDirectory],
    [t.helpCaseStatus(LINKS.caseStatusPhone), LINKS.caseStatus],
    [t.helpCourtGuide, LINKS.courtGuide],
    [t.helpForms, LINKS.eoirForms],
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
          <a href={`tel:${LINKS.caseStatusPhone.replace(/-/g, '')}`}>📞 {LINKS.caseStatusPhone}</a>
        </li>
      </ul>
      <p className="warn">{t.notarioWarning}</p>
    </section>
  );
}
