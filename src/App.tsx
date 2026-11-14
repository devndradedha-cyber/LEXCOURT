import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CalendarClock,
  Camera,
  CircleCheck,
  ExternalLink,
  FileSearch,
  Globe,
  HeartHandshake,
  Info,
  Keyboard,
  Lightbulb,
  MapPin,
  Mic,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Square,
  TriangleAlert,
  UserCheck,
  Flag,
  Sparkles,
} from 'lucide-react';
import { extractNoticeFacts, type NoticeFacts } from './lib/extract';
import { LANGS, STRINGS, detectLang, langInfo, type Lang } from './lib/i18n';
import { IS_DRAFT, LEGAL, hasAcceptedTerms, recordTermsAccepted, type LegalDoc } from './lib/legal';
import { fileToText, type Progress } from './lib/readFile';
import { LINKS } from './lib/resources';
import { speechSupported, startListening, type Listener } from './lib/speech';
import { TOOLS } from './lib/toolsText';
import { CheckRepresentative } from './components/CheckRepresentative';
import { ReportProblem } from './components/ReportProblem';
import { CaseStatus } from './components/CaseStatus';
import { AidSummary } from './components/AidSummary';
import { GlossaryText, ListenButton, WordsToKnow } from './components/Reading';
import { FeedbackPrompt } from './components/Feedback';
import { AdminDashboard } from './components/AdminDashboard';
import { FEATURES } from './lib/featuresText';
import { DESIGN } from './lib/designText';
import { CardIcon, Icon, PeopleIllustration, ReadingArt } from './components/Art';
import { ReminderCard, ReminderLinkPage } from './components/Reminders';

type Phase = { kind: 'start' } | { kind: 'working'; label: string; fraction: number } | { kind: 'result' };

type LegalRoute = 'disclaimer' | 'terms' | 'privacy';
type ToolRoute = 'home' | 'status' | 'check' | 'report';
/** "reminder" = a confirm or stop link from a reminder email (#/reminder/confirm/<token>). */
type Route = ToolRoute | LegalRoute | 'admin' | 'reminder';
const LEGAL_ROUTES: Route[] = ['disclaimer', 'terms', 'privacy'];
const TOOL_ROUTES: Route[] = ['status', 'check', 'report'];
const isLegal = (r: Route): r is LegalRoute => LEGAL_ROUTES.includes(r);
/** Pages that work without accepting the terms first and have no tool tabs. */
const isStandalone = (r: Route) => isLegal(r) || r === 'admin' || r === 'reminder';

function readRoute(): Route {
  const r = window.location.hash.replace(/^#\/?/, '');
  if (/^reminder\/(confirm|stop)\/[\w.-]+$/.test(r)) return 'reminder';
  return LEGAL_ROUTES.includes(r as Route) || TOOL_ROUTES.includes(r as Route) || r === 'admin' ? (r as Route) : 'home';
}

function reminderLink(): { action: 'confirm' | 'stop'; token: string } {
  const [, action, token] = window.location.hash.replace(/^#\/?/, '').split('/');
  return { action: action === 'stop' ? 'stop' : 'confirm', token: token ?? '' };
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
    const info = langInfo(lang);
    document.documentElement.lang = info.locale;
    document.documentElement.dir = info.dir;
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

  const heroFirst = route === 'home' && phase.kind === 'start';

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#/" aria-label="LexCourt">
          <img src="/icon.svg" alt="" width={40} height={40} />
          <div>
            <div className="brand-name">LexCourt</div>
            <div className="brand-tag">{t.appTagline}</div>
          </div>
        </a>
        <label className="lang">
          <Icon as={Globe} />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            // Labelled in every language, so anyone can find it.
            aria-label={LANGS.map((l) => STRINGS[l.code].langLabel).join(' / ')}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code} lang={l.locale} dir={l.dir}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      {/* On the welcome screen the hero comes first; the disclaimer and tabs follow it. */}
      {!heroFirst && <ShortDisclaimer lang={lang} />}

      {t.translationDraft && !heroFirst && <TranslationDraft text={t.translationDraft} />}

      {!isStandalone(route) && !heroFirst && <ToolNav lang={lang} route={route as ToolRoute} />}

      <main>
        {isLegal(route) && <LegalPage lang={lang} doc={legal[route]} />}

        {route === 'admin' && <AdminDashboard />}

        {route === 'reminder' && <ReminderLinkPage lang={lang} {...reminderLink()} key={window.location.hash} />}

        {heroFirst && (
          <>
            <Hero lang={lang} accepted={accepted} error={error} onFile={onFile} />
            {t.translationDraft && <TranslationDraft text={t.translationDraft} />}
            <ShortDisclaimer lang={lang} />
            <ToolNav lang={lang} route="home" />
          </>
        )}

        {!isStandalone(route) && !accepted && (
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
            {phase.kind === 'start' && <TypeInstead lang={lang} onText={analyze} />}

            {phase.kind === 'working' && <ReadingScreen lang={lang} label={phase.label} fraction={phase.fraction} />}

            {phase.kind === 'result' && facts && (
              <Result lang={lang} facts={facts} setFacts={setFacts} sourceText={sourceText} onReset={reset} headingRef={resultRef} />
            )}
          </>
        )}

        {route === 'status' && accepted && <CaseStatus lang={lang} aNumberFromNotice={facts?.aNumber ?? null} />}

        {route === 'check' && accepted && (
          <CheckRepresentative lang={lang} onReport={() => (window.location.hash = '#/report')} />
        )}

        {route === 'report' && accepted && <ReportProblem lang={lang} />}

        {/* On the results, free help is one of the three main cards instead. */}
        {!isStandalone(route) && !(route === 'home' && phase.kind === 'result') && <LegalHelp lang={lang} />}

        {route === 'home' && (
          <section className="card subtle" aria-labelledby="privacy-title">
            <h2 id="privacy-title">
              <Icon as={ShieldCheck} /> {t.privacyTitle}
            </h2>
            <ul>
              {t.privacy.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <a href="#/privacy">{legal.privacy.title}</a>
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

/** Tabs for the four tools. Plain links, so the browser's back button works. */
function ToolNav({ lang, route }: { lang: Lang; route: ToolRoute }) {
  const n = TOOLS[lang].nav;
  const tabs: [ToolRoute, string, string, typeof Camera][] = [
    ['home', '#/', n.notice, FileSearch],
    ['status', '#/status', FEATURES[lang].status.nav, Search],
    ['check', '#/check', n.check, UserCheck],
    ['report', '#/report', n.report, Flag],
  ];
  return (
    <nav className="tool-nav" aria-label="LexCourt">
      {tabs.map(([r, href, label, icon]) => (
        <a key={r} href={href} aria-current={route === r ? 'page' : undefined}>
          <Icon as={icon} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

function TranslationDraft({ text }: { text: string }) {
  return (
    <p className="translation-draft" role="note">
      {text}
    </p>
  );
}

/** Short disclaimer shown at the top of every screen. */
function ShortDisclaimer({ lang }: { lang: Lang }) {
  const legal = LEGAL[lang];
  return (
    <aside className="short-disclaimer" aria-label={legal.shortLinks.disclaimer}>
      <p>
        <Icon as={Info} />
        <span>
          {legal.short} <a href="#/disclaimer">{legal.shortLinks.disclaimer}</a>
        </span>
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
    <section className="card enter" aria-labelledby="accept-title">
      <DraftBanner lang={lang} />
      <h2 id="accept-title">{legal.acceptTitle}</h2>
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
      <p className="hint small">{legal.acceptLanguageNote}</p>
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
  const docRef = useRef<HTMLElement>(null);
  useEffect(() => ref.current?.focus(), [doc]);
  return (
    <article className="card legal-doc" aria-labelledby="legal-title" ref={docRef}>
      <a href="#/" className="back">
        {legal.back}
      </a>
      <DraftBanner lang={lang} />
      <h1 id="legal-title" tabIndex={-1} ref={ref}>
        {doc.title}
      </h1>
      <p className="hint small">{doc.updated}</p>
      <ListenButton lang={lang} target={docRef} />
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

/** Welcome: illustration, one sentence, one big button. */
function Hero({ lang, accepted, error, onFile }: { lang: Lang; accepted: boolean; error: string | null; onFile: (f: File | undefined) => void }) {
  const d = DESIGN[lang];
  const t = STRINGS[lang];
  return (
    <section className="hero" aria-labelledby="start-title">
      <PeopleIllustration />
      <h1 id="start-title">{d.heroTitle}</h1>
      {!accepted && <p className="lead">{d.heroText}</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {accepted && (
        <>
          {/* One button: the phone offers camera, photos or files (PDF). */}
          <label className="btn primary big hero-btn">
            <Icon as={Camera} />
            {d.scanButton}
            <input type="file" accept="image/*,application/pdf,.pdf" onChange={(e) => onFile(e.target.files?.[0])} hidden />
          </label>
          <p className="scan-sub">{t.startHint}</p>
          <p className="lead">{d.heroText}</p>
        </>
      )}
      <ul className="badges">
        {d.badges.map((b) => (
          <li key={b}>
            <Icon as={CircleCheck} size={20} />
            {b}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The other way in: type or say what the notice says. */
function TypeInstead({ lang, onText }: { lang: Lang; onText: (text: string) => void }) {
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
      langInfo(lang).speech,
      (finalText, interimText) => {
        setText(base + finalText);
        setInterim(interimText);
      },
      (err) => {
        setListening(false);
        setInterim('');
        if (err === 'language-not-supported') setVoiceError(t.voiceLangUnsupported);
        else if (err && err !== 'no-speech' && err !== 'aborted') setVoiceError(t.voiceUnsupported);
      },
    );
    setListening(listener.current !== null);
  }

  return (
    <details className="card type-instead">
      <summary>
        <CardIcon as={Keyboard} tone="navy" />
        <span id="type-title">{t.orDescribe}</span>
      </summary>
      <textarea
        value={text + (interim ? (text ? ' ' : '') + interim : '')}
        onChange={(e) => setText(e.target.value)}
        placeholder={t.typePlaceholder}
        rows={5}
        aria-labelledby="type-title"
        readOnly={listening}
        dir="auto"
      />
      <div className="row">
        {canSpeak && (
          <button className={'btn' + (listening ? ' recording' : '')} onClick={toggleVoice} aria-pressed={listening}>
            <Icon as={listening ? Square : Mic} /> {listening ? t.stopSpeaking : t.speak}
          </button>
        )}
        <button className="btn primary read-this" onClick={() => onText(text)} disabled={listening || !text.trim()}>
          <Icon as={Sparkles} /> {t.readThis}
        </button>
      </div>
      {listening && <p className="hint" aria-live="polite">{t.listening}</p>}
      <p className="hint small">{canSpeak ? t.voicePrivacy : t.voiceUnsupported}</p>
      {voiceError && <p className="error">{voiceError}</p>}
    </details>
  );
}

/** Calm loading screen while a photo or PDF is read on the device. */
function ReadingScreen({ lang, label, fraction }: { lang: Lang; label: string; fraction: number }) {
  const d = DESIGN[lang];
  return (
    <section className="card reading enter" aria-live="polite" aria-busy="true">
      <ReadingArt />
      <h1>{d.readingTitle}</h1>
      <p>{label}</p>
      <progress value={Math.round(fraction * 100)} max={100} aria-label={d.readingTitle} />
      <p className="hint small">
        <Icon as={ShieldCheck} size={18} /> {d.readingCalm}
      </p>
    </section>
  );
}

function formatDate(date: string, lang: Lang): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat(langInfo(lang).locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(y, m - 1, d));
}

function formatTime(time: string, lang: Lang): string {
  const [h, m] = time.split(':').map(Number);
  return new Intl.DateTimeFormat(langInfo(lang).locale, { hour: 'numeric', minute: '2-digit' }).format(
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
  const d = DESIGN[lang];
  const update = (patch: Partial<NoticeFacts>) => setFacts({ ...facts, ...patch });
  const notice = t.notice[facts.noticeType];
  const hearing = facts.hearingType !== 'unknown' ? t.hearing[facts.hearingType] : null;
  const whatRef = useRef<HTMLElement>(null);
  const mustRef = useRef<HTMLElement>(null);
  const i = (n: number) => ({ '--i': n }) as React.CSSProperties;

  return (
    <>
      <div className="result-head enter" style={i(0)}>
        <h1 id="result-title" tabIndex={-1} ref={headingRef}>
          <Icon as={CircleCheck} size={30} />
          {t.resultTitle}
        </h1>
        <p className="warn">
          <Icon as={TriangleAlert} />
          <span>{t.checkWarning}</span>
        </p>
      </div>

      {/* 1. What this means */}
      <section className="card meaning enter" aria-labelledby="what-title" ref={whatRef} style={i(1)}>
        <div className="card-head">
          <CardIcon as={Lightbulb} />
          <h2 id="what-title">{d.cardMeaning}</h2>
        </div>
        {IS_DRAFT && <p className="draft-inline small" data-no-read>{LEGAL[lang].draftBadge}</p>}
        <ListenButton lang={lang} target={whatRef} />
        <p className="hint small" data-no-read>{FEATURES[lang].glossary.tapHint}</p>
        <h3>
          <GlossaryText text={notice.title} lang={lang} />
        </h3>
        {notice.body.map((p) => (
          <p key={p}>
            <GlossaryText text={p} lang={lang} />
          </p>
        ))}
        {hearing && (
          <>
            <h3>
              <GlossaryText text={hearing.title} lang={lang} />
            </h3>
            {hearing.body.map((p) => (
              <p key={p}>
                <GlossaryText text={p} lang={lang} />
              </p>
            ))}
          </>
        )}
      </section>

      {/* 2. Your next date or deadline */}
      <section className="card deadline enter" aria-labelledby="date-title" style={i(2)}>
        <div className="card-head">
          <CardIcon as={CalendarClock} tone="coral" />
          <h2 id="date-title">{d.cardDate}</h2>
        </div>
        {facts.date ? (
          <div className="date-panel">
            <p className="big-date">
              {formatDate(facts.date, lang)}
              {facts.time && (
                <>
                  {' · '}
                  {/* Isolated so "8:30 AM" keeps its order inside Urdu (right-to-left) text. */}
                  <bdi dir="ltr">{formatTime(facts.time, lang)}</bdi>
                </>
              )}
            </p>
            {facts.courtAddress && (
              <p className="where">
                <Icon as={MapPin} />
                <span dir="auto">{facts.courtAddress}</span>
              </p>
            )}
          </div>
        ) : (
          <p className="missing">{d.noDate}</p>
        )}

        {facts.dateToBeSet && (
          <p className="info">
            <Icon as={Info} />
            <span>
              <GlossaryText text={t.dateToBeSet} lang={lang} />
            </span>
          </p>
        )}
        {facts.remote && (
          <p className="info">
            <Icon as={Info} />
            <span>{t.remoteNote}</span>
          </p>
        )}

        <details className="edit-details" open={!facts.date}>
          <summary>{d.editDetails}</summary>
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
              <textarea dir="auto" rows={3} value={facts.courtAddress ?? ''} onChange={(e) => update({ courtAddress: e.target.value || null })} />
              {!facts.courtAddress && <span className="missing">{t.notFound}</span>}
            </label>
            <label>
              {t.fieldANumber}
              <input
                inputMode="numeric"
                dir="ltr"
                autoComplete="off"
                value={facts.aNumber ?? ''}
                onChange={(e) => update({ aNumber: e.target.value || null })}
              />
            </label>
          </div>
        </details>
        <div className="row wrap">
          <a className="btn" href="#/status">
            <Icon as={Search} /> {FEATURES[lang].status.title}
          </a>
        </div>
      </section>

      <ReminderCard
        lang={lang}
        date={facts.date}
        time={facts.time}
        location={facts.courtAddress?.replace(/\n/g, ', ') ?? null}
        aNumberKnown={!!facts.aNumber}
        onDate={(date) => update({ date })}
        style={i(3)}
      />

      {/* 3. Where to get free help */}
      <LegalHelp lang={lang} title={d.cardHelp} style={i(4)} />

      <section className="card enter" aria-labelledby="must-title" ref={mustRef} style={i(6)}>
        <div className="card-head">
          <CardIcon as={BookOpen} />
          <h2 id="must-title">{t.mustKnowTitle}</h2>
        </div>
        {IS_DRAFT && <p className="draft-inline small" data-no-read>{LEGAL[lang].draftBadge}</p>}
        <ListenButton lang={lang} target={mustRef} />
        <ul className="must">
          {t.mustKnow.map((p) => (
            <li key={p}>
              <GlossaryText text={p} lang={lang} />
            </li>
          ))}
        </ul>
      </section>

      <AidSummary lang={lang} facts={facts} />

      <WordsToKnow lang={lang} />

      <FeedbackPrompt lang={lang} feature="notice_reader" />

      <details className="card subtle">
        <summary>{t.showText}</summary>
        <pre className="source">{sourceText}</pre>
      </details>

      <button className="btn big start-over" onClick={onReset}>
        <Icon as={RotateCcw} /> {t.startOver}
      </button>
    </>
  );
}

function LegalHelp({ lang, title, style }: { lang: Lang; title?: string; style?: React.CSSProperties }) {
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
    <section className="card help enter" aria-labelledby="help-title" style={style}>
      <div className="card-head">
        <CardIcon as={HeartHandshake} tone="navy" />
        <h2 id="help-title">{title ?? t.helpTitle}</h2>
      </div>
      <p>{t.helpIntro}</p>
      <ul className="links">
        {links.map(([label, href]) => (
          <li key={href}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              <span>{label}</span>
              <Icon as={ExternalLink} size={18} className="ext" />
            </a>
          </li>
        ))}
        <li>
          <a href={`tel:+1${L.caseStatusPhone.replace(/-/g, '').slice(1)}`}>
            <Icon as={Phone} />
            <bdi dir="ltr">{L.caseStatusPhone}</bdi>
          </a>
        </li>
      </ul>
      <p className="warn">
        <Icon as={TriangleAlert} />
        <span>{t.notarioWarning}</span>
      </p>
    </section>
  );
}

