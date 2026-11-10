/**
 * "Report a problem": decides which authorities to show, and builds a summary
 * the user can copy into a complaint form.
 *
 * Pure functions, no I/O: nothing is stored or sent anywhere. LexCourt never
 * submits a complaint; it only links to official forms.
 *
 * ⚠️ DRAFT — the routing rules below need attorney review.
 */

export type Who = 'lawyer' | 'accredited' | 'nonlawyer' | 'unsure';

export type Issue =
  | 'fakeLawyer'
  | 'falseStatements'
  | 'freeForms'
  | 'tookMoney'
  | 'missedDeadline'
  | 'keptDocuments'
  | 'other';

export const ISSUES: Issue[] = ['fakeLawyer', 'falseStatements', 'freeForms', 'tookMoney', 'missedDeadline', 'keptDocuments', 'other'];

export type CourtCase = 'yes' | 'no' | 'unsure';

export type AuthorityId = 'stateDiscipline' | 'eoirDiscipline' | 'eoirFraud' | 'stateAG' | 'ftc';

/** Why an authority is shown. Each id has plain-language text in toolsText.ts. */
export type ReasonId =
  | 'licensedLawyer'
  | 'beforeImmigrationCourt'
  | 'maybeImmigrationCourt'
  | 'accreditedByEoir'
  | 'nonLawyerScam'
  | 'consumerFraud'
  | 'freeFormsFraud'
  | 'unauthorizedPractice'
  | 'ifLawyer'
  | 'ifLawyerOrAccredited';

export interface Recommendation {
  id: AuthorityId;
  priority: 'primary' | 'also';
  reasons: ReasonId[];
}

export interface Details {
  name: string;
  business: string;
  contact: string;
  dates: string;
  amountPaid: string;
  story: string;
  documents: string;
}

export interface Answers {
  who: Who | null;
  issues: Issue[];
  court: CourtCase | null;
  /** Two-letter state code, or null. */
  state: string | null;
  details: Details;
}

export const EMPTY_DETAILS: Details = { name: '', business: '', contact: '', dates: '', amountPaid: '', story: '', documents: '' };

const MONEY_ISSUES: Issue[] = ['tookMoney', 'freeForms', 'falseStatements'];

export function recommend(a: Answers): Recommendation[] {
  const out = new Map<AuthorityId, Recommendation>();
  const add = (id: AuthorityId, priority: 'primary' | 'also', reason: ReasonId) => {
    const r = out.get(id);
    if (!r) out.set(id, { id, priority, reasons: [reason] });
    else {
      if (priority === 'primary') r.priority = 'primary';
      if (!r.reasons.includes(reason)) r.reasons.push(reason);
    }
  };
  const has = (i: Issue) => a.issues.includes(i);
  const moneyProblem = MONEY_ISSUES.some(has);

  switch (a.who) {
    case 'lawyer':
      add('stateDiscipline', 'primary', 'licensedLawyer');
      if (a.court === 'yes') add('eoirDiscipline', 'primary', 'beforeImmigrationCourt');
      else if (a.court === 'unsure' || a.court === null) add('eoirDiscipline', 'also', 'maybeImmigrationCourt');
      if (moneyProblem) add('stateAG', 'also', 'consumerFraud');
      if (has('freeForms')) add('ftc', 'also', 'freeFormsFraud');
      break;
    case 'accredited':
      add('eoirDiscipline', 'primary', 'accreditedByEoir');
      if (moneyProblem) add('stateAG', 'also', 'consumerFraud');
      if (has('freeForms')) add('ftc', 'also', 'freeFormsFraud');
      break;
    case 'nonlawyer':
      add('stateAG', 'primary', 'nonLawyerScam');
      add('ftc', 'primary', 'nonLawyerScam');
      if (has('freeForms')) add('ftc', 'primary', 'freeFormsFraud');
      add('eoirFraud', a.court === 'yes' || has('fakeLawyer') ? 'primary' : 'also', 'unauthorizedPractice');
      break;
    case 'unsure':
    default:
      add('stateAG', 'primary', 'nonLawyerScam');
      add('ftc', 'primary', 'nonLawyerScam');
      if (has('freeForms')) add('ftc', 'primary', 'freeFormsFraud');
      add('eoirFraud', 'also', 'unauthorizedPractice');
      add('stateDiscipline', 'also', 'ifLawyer');
      if (a.court !== 'no') add('eoirDiscipline', 'also', 'ifLawyerOrAccredited');
      break;
  }

  const order: AuthorityId[] = ['stateDiscipline', 'eoirDiscipline', 'eoirFraud', 'stateAG', 'ftc'];
  return [...out.values()].sort(
    (x, y) => (x.priority === y.priority ? order.indexOf(x.id) - order.indexOf(y.id) : x.priority === 'primary' ? -1 : 1),
  );
}

/** Text used to build the summary, per language. */
export interface SummaryText {
  heading: string;
  person: string;
  business: string;
  contact: string;
  role: Record<Who, string>;
  whatHappened: string;
  issues: Record<Issue, string>;
  inMyWords: string;
  dates: string;
  amountPaid: string;
  court: string;
  courtAnswer: Record<CourtCase, string>;
  state: string;
  documents: string;
  closing: string;
}

/**
 * A plain-text summary to paste into a complaint form. Only includes what the
 * user entered or selected; blank fields are left out.
 */
export function buildSummary(a: Answers, t: SummaryText, stateName: string | null): string {
  const lines: string[] = [t.heading, ''];
  const d = a.details;
  const role = a.who ? t.role[a.who] : '';
  const person = [d.name.trim(), role && `(${role})`].filter(Boolean).join(' ');
  if (person) lines.push(`${t.person}: ${person}`);
  if (d.business.trim()) lines.push(`${t.business}: ${d.business.trim()}`);
  if (d.contact.trim()) lines.push(`${t.contact}: ${d.contact.trim()}`);
  if (stateName) lines.push(`${t.state}: ${stateName}`);
  if (a.court) lines.push(`${t.court}: ${t.courtAnswer[a.court]}`);
  if (d.dates.trim()) lines.push(`${t.dates}: ${d.dates.trim()}`);
  if (d.amountPaid.trim()) lines.push(`${t.amountPaid}: ${d.amountPaid.trim()}`);

  const issues = ISSUES.filter((i) => a.issues.includes(i) && i !== 'other');
  if (issues.length) {
    lines.push('', `${t.whatHappened}:`);
    for (const i of issues) lines.push(`- ${t.issues[i]}`);
  }
  if (d.story.trim()) lines.push('', `${t.inMyWords}:`, d.story.trim());
  if (d.documents.trim()) lines.push('', `${t.documents}: ${d.documents.trim()}`);
  lines.push('', t.closing);
  return lines.join('\n');
}
