import { describe, expect, it } from 'vitest';
import { EMPTY_DETAILS, ISSUES, buildSummary, recommend, type Answers, type AuthorityId } from './report';
import { TOOLS } from './toolsText';
import { OFFICIAL, STATE_LAWYER_LOOKUPS, US_STATES } from './resources';

const base = (over: Partial<Answers>): Answers => ({ who: null, issues: [], court: null, state: null, details: { ...EMPTY_DETAILS }, ...over });
const ids = (a: Answers) => recommend(a).map((r) => `${r.id}:${r.priority}`);
const primary = (a: Answers): AuthorityId[] => recommend(a).filter((r) => r.priority === 'primary').map((r) => r.id);

describe('recommend', () => {
  it('lawyer with an immigration court case → state discipline office and EOIR disciplinary counsel', () => {
    expect(primary(base({ who: 'lawyer', court: 'yes', issues: ['missedDeadline'] }))).toEqual(['stateDiscipline', 'eoirDiscipline']);
  });

  it('lawyer with no court case → state discipline office only (EOIR not shown)', () => {
    expect(ids(base({ who: 'lawyer', court: 'no', issues: ['missedDeadline'] }))).toEqual(['stateDiscipline:primary']);
  });

  it('lawyer who charged for free forms → also state AG and FTC', () => {
    expect(ids(base({ who: 'lawyer', court: 'no', issues: ['freeForms'] }))).toEqual(['stateDiscipline:primary', 'stateAG:also', 'ftc:also']);
  });

  it('accredited representative → EOIR disciplinary counsel', () => {
    expect(primary(base({ who: 'accredited', court: 'no', issues: ['keptDocuments'] }))).toEqual(['eoirDiscipline']);
  });

  it('notario pretending to be a lawyer → state AG, FTC and EOIR fraud program, never lawyer discipline', () => {
    const r = recommend(base({ who: 'nonlawyer', court: 'no', issues: ['fakeLawyer'] }));
    expect(r.map((x) => x.id)).toEqual(['eoirFraud', 'stateAG', 'ftc']);
    expect(r.every((x) => x.priority === 'primary')).toBe(true);
    expect(r.map((x) => x.id)).not.toContain('stateDiscipline');
    expect(r.map((x) => x.id)).not.toContain('eoirDiscipline');
  });

  it('notario who only charged for forms, no court case → EOIR fraud program is secondary', () => {
    expect(ids(base({ who: 'nonlawyer', court: 'no', issues: ['freeForms'] }))).toEqual(['stateAG:primary', 'ftc:primary', 'eoirFraud:also']);
  });

  it('not sure who they are → consumer offices first, lawyer offices as "also"', () => {
    expect(ids(base({ who: 'unsure', court: 'unsure', issues: ['tookMoney'] }))).toEqual([
      'stateAG:primary', 'ftc:primary', 'stateDiscipline:also', 'eoirDiscipline:also', 'eoirFraud:also',
    ]);
  });

  it('every recommendation has text and a link in both languages', () => {
    for (const who of ['lawyer', 'accredited', 'nonlawyer', 'unsure'] as const)
      for (const court of ['yes', 'no', 'unsure'] as const)
        for (const r of recommend(base({ who, court, issues: ['fakeLawyer', 'freeForms', 'tookMoney'] })))
          for (const lang of ['en', 'es'] as const) {
            const t = TOOLS[lang].report;
            expect(t.authorities[r.id].name).toBeTruthy();
            r.reasons.forEach((reason) => expect(t.reasons[reason], `${lang}.${reason}`).toBeTruthy());
          }
  });
});

describe('buildSummary', () => {
  const answers = base({
    who: 'nonlawyer',
    issues: ['fakeLawyer', 'tookMoney', 'other'],
    court: 'yes',
    state: 'TX',
    details: { ...EMPTY_DETAILS, name: 'Juan Pérez', amountPaid: '$1,500 cash', story: 'He said he was a lawyer.' },
  });

  it('includes what the user entered and selected, in the chosen language', () => {
    const s = buildSummary(answers, TOOLS.en.summary.en, 'Texas');
    expect(s).toContain('Person: Juan Pérez (notario / immigration consultant, not a lawyer)');
    expect(s).toContain('State: Texas');
    expect(s).toContain('Money paid: $1,500 cash');
    expect(s).toContain('- They said they were a lawyer or could represent me, but they are not.');
    expect(s).toContain('- They took my money and did not do the work.');
    expect(s).toContain('He said he was a lawyer.');
    const es = buildSummary(answers, TOOLS.en.summary.es, 'Texas');
    expect(es).toContain('Persona: Juan Pérez (notario / consultor de inmigración, no es abogado)');
    expect(es).toContain('- Tomó mi dinero y no hizo el trabajo.');
  });

  it('leaves out blank fields and the "something else" option', () => {
    const s = buildSummary(answers, TOOLS.en.summary.en, 'Texas');
    expect(s).not.toMatch(/Business:|Documents I have:|When:/);
    expect(s).not.toMatch(/^- $/m);
  });
});

describe('tools text', () => {
  it('English and Spanish have the same structure', () => {
    const shape = (o: unknown): unknown =>
      Array.isArray(o) ? o.map(shape) : typeof o === 'object' && o ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, shape(v)])) : typeof o;
    expect(shape(TOOLS.es)).toEqual(shape(TOOLS.en));
  });

  it('says it is information, not legal advice, and is marked as a draft', () => {
    expect(TOOLS.en.infoNotAdvice).toMatch(/not legal advice/);
    expect(TOOLS.en.infoNotAdvice).toMatch(/not a law firm/);
    expect(TOOLS.es.infoNotAdvice).toMatch(/no asesoría legal/);
    expect(TOOLS.es.infoNotAdvice).toMatch(/no es un bufete de abogados/);
    expect(TOOLS.en.draftBadge).toMatch(/DRAFT.*attorney review/);
    expect(TOOLS.es.draftBadge).toMatch(/BORRADOR.*abogado/);
  });

  it('says nothing is submitted automatically', () => {
    expect(TOOLS.en.report.neverSubmit).toMatch(/never sends or submits/);
    expect(TOOLS.es.report.neverSubmit).toMatch(/nunca envía ni presenta/);
  });
});

describe('official links', () => {
  it('are HTTPS links to official government, bar or nonprofit sites', () => {
    const allowed = /^https:\/\/([a-z0-9-]+\.)*(justice\.gov|ftc\.gov|naag\.org|americanbar\.org|calbar\.ca\.gov|floridabar\.org|iardc\.org|njstatelib\.org|nycourts\.gov|texasbar\.com)\//;
    const urls = [
      ...Object.values(OFFICIAL).flatMap((v) => (typeof v === 'string' ? [v] : Object.values(v))),
      ...Object.values(STATE_LAWYER_LOOKUPS).map((s) => s.url),
    ].filter((u) => u.startsWith('http'));
    expect(urls.length).toBeGreaterThan(10);
    for (const u of urls) expect(u).toMatch(allowed);
  });

  it('state lookups are for real state codes', () => {
    const codes = new Set(US_STATES.map(([c]) => c));
    for (const code of Object.keys(STATE_LAWYER_LOOKUPS)) expect(codes.has(code)).toBe(true);
  });

  it('lists every issue in both languages', () => {
    for (const lang of ['en', 'es'] as const) for (const i of ISSUES) expect(TOOLS[lang].report.issues[i]).toBeTruthy();
  });
});
