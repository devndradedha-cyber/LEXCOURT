import { useEffect, useMemo, useRef, useState } from 'react';
import { langInfo, type Lang } from '../lib/i18n';
import { EMPTY_DETAILS, ISSUES, buildSummary, recommend, type Answers, type AuthorityId, type CourtCase, type Details, type Who } from '../lib/report';
import { OFFICIAL, US_STATES } from '../lib/resources';
import { SUMMARY, TOOLS } from '../lib/toolsText';
import { CopyButton, ExtLink, InfoNotAdvice, ToolDraftBanner } from './ToolParts';

const STEPS = 5;
const WHO: Who[] = ['lawyer', 'accredited', 'nonlawyer', 'unsure'];
const COURT: CourtCase[] = ['yes', 'no', 'unsure'];
const DETAIL_FIELDS: (keyof Details)[] = ['name', 'business', 'contact', 'dates', 'amountPaid', 'story', 'documents'];

/**
 * "Report a problem". A short questionnaire → which offices usually handle it,
 * links to their official complaint forms, and a summary to copy.
 * Nothing is stored or sent; LexCourt never submits a complaint.
 */
export function ReportProblem({ lang }: { lang: Lang }) {
  const t = TOOLS[lang].report;
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({ who: null, issues: [], court: null, state: null, details: { ...EMPTY_DETAILS } });
  const [summaryLang, setSummaryLang] = useState<Lang>(lang);
  /** The user's own edits to the summary, or null to show the generated one. */
  const [editedSummary, setEditedSummary] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const stateName = US_STATES.find(([c]) => c === answers.state)?.[1] ?? null;
  const generated = useMemo(
    () => buildSummary(answers, SUMMARY[summaryLang], stateName),
    [answers, summaryLang, stateName],
  );
  const summary = editedSummary ?? generated;

  // Move focus to the new question when the user changes step (for screen
  // readers), but not when the page first opens, so the intro is read first.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const update = (patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch }));
  const canNext =
    (step === 1 && answers.who !== null) || (step === 2 && answers.issues.length > 0) || (step === 3 && answers.court !== null) || step === 4 || step === 5;

  function restart() {
    setAnswers({ who: null, issues: [], court: null, state: null, details: { ...EMPTY_DETAILS } });
    setEditedSummary(null);
    setStep(1);
  }

  return (
    <>
      <section className="card" aria-labelledby="report-title">
        <ToolDraftBanner lang={lang} />
        <h1 id="report-title">{t.title}</h1>
        {t.intro.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="info">
          <strong>🔒 </strong>
          {t.neverSubmit}
        </p>
        <InfoNotAdvice lang={lang} />
      </section>

      {step <= STEPS && (
        <section className="card" aria-labelledby="step-title">
          <p className="hint small">{t.stepOf(step, STEPS)}</p>
          <progress value={step} max={STEPS} aria-hidden="true" />

          {step === 1 && (
            <fieldset className="choices">
              <legend>
                <h2 id="step-title" tabIndex={-1} ref={headingRef}>
                  {t.whoQ}
                </h2>
              </legend>
              {WHO.map((w) => (
                <label key={w} className="choice">
                  <input type="radio" name="who" checked={answers.who === w} onChange={() => update({ who: w })} />
                  <span>{t.who[w]}</span>
                </label>
              ))}
            </fieldset>
          )}

          {step === 2 && (
            <fieldset className="choices">
              <legend>
                <h2 id="step-title" tabIndex={-1} ref={headingRef}>
                  {t.issuesQ}
                </h2>
                <span className="hint">{t.issuesHint}</span>
              </legend>
              {ISSUES.map((i) => (
                <label key={i} className="choice">
                  <input
                    type="checkbox"
                    checked={answers.issues.includes(i)}
                    onChange={(e) =>
                      update({ issues: e.target.checked ? [...answers.issues, i] : answers.issues.filter((x) => x !== i) })
                    }
                  />
                  <span>{t.issues[i]}</span>
                </label>
              ))}
            </fieldset>
          )}

          {step === 3 && (
            <fieldset className="choices">
              <legend>
                <h2 id="step-title" tabIndex={-1} ref={headingRef}>
                  {t.courtQ}
                </h2>
                <span className="hint">{t.courtHint}</span>
              </legend>
              {COURT.map((c) => (
                <label key={c} className="choice">
                  <input type="radio" name="court" checked={answers.court === c} onChange={() => update({ court: c })} />
                  <span>{t.court[c]}</span>
                </label>
              ))}
            </fieldset>
          )}

          {step === 4 && (
            <div className="fields">
              <h2 id="step-title" tabIndex={-1} ref={headingRef}>
                {t.stateQ}
              </h2>
              <p className="hint">{t.stateHint}</p>
              <select value={answers.state ?? ''} onChange={(e) => update({ state: e.target.value || null })} aria-label={t.stateQ}>
                <option value="">{t.statePlaceholder}</option>
                {US_STATES.map(([code, n]) => (
                  <option key={code} value={code}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 5 && (
            <div className="fields">
              <h2 id="step-title" tabIndex={-1} ref={headingRef}>
                {t.detailsQ}
              </h2>
              <p className="hint">{t.detailsHint}</p>
              {DETAIL_FIELDS.map((f) => (
                <label key={f}>
                  {t.fields[f]}
                  {f === 'story' ? (
                    <textarea
                      rows={5}
                      value={answers.details[f]}
                      placeholder={t.fieldPlaceholders[f]}
                      dir="auto"
                      onChange={(e) => update({ details: { ...answers.details, [f]: e.target.value } })}
                    />
                  ) : (
                    <input
                      value={answers.details[f]}
                      placeholder={t.fieldPlaceholders[f]}
                      dir="auto"
                      autoComplete="off"
                      onChange={(e) => update({ details: { ...answers.details, [f]: e.target.value } })}
                    />
                  )}
                </label>
              ))}
            </div>
          )}

          <div className="row">
            {step > 1 && (
              <button className="btn" onClick={() => setStep(step - 1)}>
                ← {t.back}
              </button>
            )}
            <button className="btn primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
              {step === STEPS ? t.seeResults : `${t.next} →`}
            </button>
          </div>
        </section>
      )}

      {step > STEPS && (
        <Results
          lang={lang}
          answers={answers}
          stateName={stateName}
          headingRef={headingRef}
          summary={summary}
          summaryLang={summaryLang}
          onSummaryLang={(l) => {
            setSummaryLang(l);
            setEditedSummary(null);
          }}
          onSummaryChange={setEditedSummary}
          onBack={() => {
            setEditedSummary(null); // regenerate from any changed answers
            setStep(STEPS);
          }}
          onRestart={restart}
        />
      )}
    </>
  );
}

function Results({
  lang,
  answers,
  stateName,
  headingRef,
  summary,
  summaryLang,
  onSummaryLang,
  onSummaryChange,
  onBack,
  onRestart,
}: {
  lang: Lang;
  answers: Answers;
  stateName: string | null;
  headingRef: React.RefObject<HTMLHeadingElement>;
  summary: string;
  summaryLang: Lang;
  onSummaryLang: (l: Lang) => void;
  onSummaryChange: (s: string) => void;
  onBack: () => void;
  onRestart: () => void;
}) {
  const t = TOOLS[lang].report;
  const recs = recommend(answers);
  const primary = recs.filter((r) => r.priority === 'primary');
  const also = recs.filter((r) => r.priority === 'also');
  const urgent = answers.issues.includes('missedDeadline') || answers.court !== 'no';

  return (
    <>
      <section className="card" aria-labelledby="results-title">
        <h2 id="results-title" tabIndex={-1} ref={headingRef}>
          {t.resultsTitle}
        </h2>
        {urgent && (
          <div className="alert">
            <p>
              <strong>⚠️ {t.urgentTitle}</strong>
            </p>
            <ul>
              {t.urgent.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
        )}
        <h3>{t.whereTitle}</h3>
        <p className="hint">{t.whereIntro}</p>
        {primary.length > 0 && <h4 className="rank">{t.primary}</h4>}
        {primary.map((r) => (
          <AuthorityCard key={r.id} lang={lang} id={r.id} reasons={r.reasons.map((x) => t.reasons[x])} stateName={stateName} />
        ))}
        {also.length > 0 && <h4 className="rank">{t.also}</h4>}
        {also.map((r) => (
          <AuthorityCard key={r.id} lang={lang} id={r.id} reasons={r.reasons.map((x) => t.reasons[x])} stateName={stateName} />
        ))}
      </section>

      <section className="card" aria-labelledby="summary-title">
        <h2 id="summary-title">{t.summaryTitle}</h2>
        {t.summaryIntro.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <fieldset className="row wrap seg" aria-label={t.summaryLang}>
          <legend className="hint small">{t.summaryLang}</legend>
          {/* Complaint forms are in English (some also in Spanish); the user's own language is offered too. */}
          {[...new Set<Lang>(['en', 'es', lang])].map((l) => (
            <label key={l} className="choice inline">
              <input type="radio" name="summaryLang" checked={summaryLang === l} onChange={() => onSummaryLang(l)} />
              <span lang={langInfo(l).locale}>{langInfo(l).name}</span>
            </label>
          ))}
        </fieldset>
        <textarea
          className="summary"
          rows={14}
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          aria-label={t.summaryTitle}
          lang={langInfo(summaryLang).locale}
          dir={langInfo(summaryLang).dir}
        />
        <p className="hint small">{t.summaryEdit}</p>
        <div className="row wrap">
          <CopyButton text={summary} lang={lang} className="btn primary" />
        </div>
        <ul className="before-file">
          {t.beforeYouFile.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </section>

      <div className="row">
        <button className="btn" onClick={onBack}>
          ← {t.back}
        </button>
        <button className="btn" onClick={onRestart}>
          {t.startOver}
        </button>
      </div>
    </>
  );
}

function AuthorityCard({ lang, id, reasons, stateName }: { lang: Lang; id: AuthorityId; reasons: string[]; stateName: string | null }) {
  const t = TOOLS[lang].report;
  const a = t.authorities[id];
  const links: [string, string][] = [];
  switch (id) {
    case 'stateDiscipline':
      links.push([OFFICIAL.abaDisciplineDirectory, a.linkLabel]);
      break;
    case 'eoirDiscipline':
      links.push([OFFICIAL.eoir44.en, a.linkLabel], [OFFICIAL.eoir44.es, a.link2Label!]);
      break;
    case 'eoirFraud':
      links.push([OFFICIAL.eoirFraudProgram, a.linkLabel]);
      break;
    case 'stateAG':
      links.push([OFFICIAL.naagFindAg, a.linkLabel]);
      break;
    case 'ftc':
      // Show the user's language first.
      links.push(
        ...((lang === 'es'
          ? [[OFFICIAL.ftcReport.es, a.link2Label!], [OFFICIAL.ftcReport.en, a.linkLabel]]
          : [[OFFICIAL.ftcReport.en, a.linkLabel], [OFFICIAL.ftcReport.es, a.link2Label!]]) as [string, string][]),
      );
      break;
  }
  if (id === 'eoirDiscipline' && lang === 'es') links.reverse();

  return (
    <article className="authority">
      <h4>{a.name}</h4>
      <p>{a.what}</p>
      <ul>
        {a.how.map((h) => (
          <li key={h}>{h}</li>
        ))}
        {id === 'stateAG' && stateName && <li>{t.stateAgFor(stateName)}</li>}
      </ul>
      <ul className="links">
        {links.map(([href, label]) => (
          <li key={href}>
            <ExtLink href={href} lang={lang}>
              {label}
            </ExtLink>
          </li>
        ))}
      </ul>
      <p className="hint small">
        <strong>{t.whyShown}</strong> {reasons.join(' ')}
      </p>
    </article>
  );
}
