import { useRef, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Icon } from './Art';
import { GlossaryText, ListenButton } from './Reading';
import { FeedbackPrompt } from './Feedback';
import type { Lang } from '../lib/i18n';
import { OFFICIAL, STATE_LAWYER_LOOKUPS, US_STATES } from '../lib/resources';
import { TOOLS } from '../lib/toolsText';
import { CopyButton, ExtLink, InfoNotAdvice, ToolDraftBanner, scrollToHelp } from './ToolParts';

type Role = 'lawyer' | 'accredited' | 'notario' | 'unsure';

/**
 * "Check your representative". Everything the user enters stays in memory on
 * this page: nothing is stored or sent. LexCourt does not look anyone up; it
 * explains how to check the official lists and links to them.
 */
export function CheckRepresentative({ lang, onReport }: { lang: Lang; onReport: () => void }) {
  const t = TOOLS[lang].check;
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [state, setState] = useState('');
  const [signs, setSigns] = useState<boolean[]>(() => t.signs.map(() => false));
  const who = name.trim() ? `“${name.trim()}”` : t.someone;
  const stateName = US_STATES.find(([c]) => c === state)?.[1];
  const lookup = state ? STATE_LAWYER_LOOKUPS[state] : undefined;
  const signCount = signs.filter(Boolean).length;
  const introRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLElement>(null);

  const showLawyer = role === 'lawyer' || role === 'unsure';
  const showAccredited = role === 'accredited' || role === 'unsure';
  const showNotario = role === 'notario' || role === 'unsure';

  return (
    <>
      <section className="card" aria-labelledby="check-title" ref={introRef}>
        <ToolDraftBanner lang={lang} />
        <h1 id="check-title">{t.title}</h1>
        <ListenButton lang={lang} target={introRef} />
        {t.intro.map((p) => (
          <p key={p}>
            <GlossaryText text={p} lang={lang} />
          </p>
        ))}
        <InfoNotAdvice lang={lang} />

        <div className="fields">
          <label>
            {t.nameLabel}
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" spellCheck={false} dir="auto" />
            <span className="hint small">{t.nameHint}</span>
          </label>
          <p className="hint small">{t.namePrivacy}</p>

          <fieldset className="choices">
            <legend>{t.roleLabel}</legend>
            {(Object.keys(t.roles) as Role[]).map((r) => (
              <label key={r} className="choice">
                <input type="radio" name="role" checked={role === r} onChange={() => setRole(r)} />
                <span>{t.roles[r]}</span>
              </label>
            ))}
          </fieldset>

          {showLawyer && (
            <label>
              {t.stateLabel}
              <select value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">{t.statePlaceholder}</option>
                {US_STATES.map(([code, n]) => (
                  <option key={code} value={code}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </section>

      {role && (
        <section className="card" aria-labelledby="steps-title" aria-live="polite" ref={stepsRef}>
          <h2 id="steps-title">{t.stepsTitle(who)}</h2>
          <ListenButton lang={lang} target={stepsRef} />
          {name.trim() && (
            <div className="row wrap">
              <CopyButton text={name.trim()} lang={lang} />
            </div>
          )}
          <p className="hint small">{t.findTip}</p>

          {showLawyer && (
            <>
              <h3>{t.roles.lawyer}</h3>
              <ol className="steps">
                <li>{t.lawyerSteps.askBar}</li>
                <li>
                  {lookup && stateName ? t.lawyerSteps.stateLookup(stateName) : t.lawyerSteps.stateLookupGeneric}{' '}
                  {t.lawyerSteps.whatToSee}
                  <ul className="links">
                    {lookup && (
                      <li>
                        <ExtLink href={lookup.url} lang={lang}>
                          {t.lawyerSteps.stateLookupLink}: {lookup.name}
                        </ExtLink>
                      </li>
                    )}
                    <li>
                      <ExtLink href={OFFICIAL.abaDisciplineDirectory} lang={lang}>
                        {t.lawyerSteps.abaLink}
                      </ExtLink>
                    </li>
                  </ul>
                </li>
              </ol>
            </>
          )}

          {showAccredited && (
            <>
              <h3>{t.roles.accredited}</h3>
              <ol className="steps">
                <li>{t.accreditedSteps.askOrg}</li>
                <li>
                  {t.accreditedSteps.roster}
                  <ul className="links">
                    <li>
                      <ExtLink href={OFFICIAL.accreditedRoster} lang={lang}>
                        {t.accreditedSteps.rosterLink}
                      </ExtLink>
                    </li>
                  </ul>
                </li>
                <li>{t.accreditedSteps.fullVsPartial}</li>
              </ol>
            </>
          )}

          {(showLawyer || showAccredited) && (
            <ul className="steps">
              <li>
                {t.disciplineSteps.current}
                <ul className="links">
                  <li>
                    <ExtLink href={OFFICIAL.disciplinedList} lang={lang}>
                      {t.disciplineSteps.currentLink}
                    </ExtLink>
                  </li>
                </ul>
              </li>
              <li>
                {t.disciplineSteps.previous}
                <ul className="links">
                  <li>
                    <ExtLink href={OFFICIAL.previouslyDisciplinedList} lang={lang}>
                      {t.disciplineSteps.previousLink}
                    </ExtLink>
                  </li>
                </ul>
              </li>
            </ul>
          )}

          {showNotario && (
            <>
              <h3>{t.roles.notario}</h3>
              {t.notarioExplain.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </>
          )}

          <p className="info">{t.notFound}</p>
        </section>
      )}

      <section className="card" aria-labelledby="signs-title">
        <h2 id="signs-title">{t.signsTitle}</h2>
        <p className="hint">{t.signsIntro}</p>
        <div className="checklist">
          {t.signs.map((s, i) => (
            <label key={s} className="choice">
              <input
                type="checkbox"
                checked={signs[i]}
                onChange={(e) => setSigns(signs.map((v, j) => (j === i ? e.target.checked : v)))}
              />
              <span>{s}</span>
            </label>
          ))}
        </div>
        <div aria-live="polite">
          {signCount === 0 ? (
            <p className="hint">{t.signsNone}</p>
          ) : (
            <div className="alert">
              <p>
                <strong>
                  <Icon as={TriangleAlert} /> {t.signsSome(signCount)}
                </strong>
              </p>
              <p>{t.signsAction}</p>
              <div className="row wrap">
                <button className="btn primary" onClick={onReport}>
                  {t.goReport}
                </button>
                <button className="btn" onClick={scrollToHelp}>
                  {t.getHelp}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      {role && <FeedbackPrompt lang={lang} feature="rep_check" />}
    </>
  );
}
