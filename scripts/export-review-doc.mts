/**
 * Exports every piece of user-facing text in LexCourt, in English and Spanish,
 * to a Word document for attorney / translator review.
 *
 * The text is read straight from the app's source (src/lib/i18n.ts,
 * src/lib/legal.ts, src/lib/resources.ts), so the document always matches
 * what users see. Each row has an ID and the source key, so reviewer edits can
 * be mapped back to the code.
 *
 *   npm run review-doc            → review/LexCourt-text-for-attorney-review.docx
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  PageNumber,
  PageOrientation,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { STRINGS } from '../src/lib/i18n';
import { LEGAL, TERMS_VERSION, type LegalDoc } from '../src/lib/legal';
import { LINKS, OFFICIAL, STATE_LAWYER_LOOKUPS } from '../src/lib/resources';
import { recommend, type Answers, type Issue, type Who } from '../src/lib/report';
import { TOOLS } from '../src/lib/toolsText';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'review', 'LexCourt-text-for-attorney-review.docx');

const FONT = 'Arial';
const INK = '1A1F29';
const MUTED = '5B6472';
const BRAND = '1D3A5F';
const BORDER = 'C9CFD8';
const HEAD_FILL = 'E7ECF3';
const SECTION_FILL = 'F4F6F9';

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

type Row =
  | { kind: 'text'; id: string; where: string; key: string; en: string; es: string; note?: string; bold?: boolean }
  | { kind: 'heading'; text: string; textEs?: string };

interface Part {
  title: string;
  intro: string;
  rows: Row[];
}

function counter(prefix: string) {
  let n = 0;
  return () => `${prefix}-${++n}`;
}

const en = STRINGS.en;
const es = STRINGS.es;
type S = typeof en;
type StringKey = { [K in keyof S]: S[K] extends string ? K : never }[keyof S];

function uiRow(next: () => string, key: StringKey, where: string): Row {
  return { kind: 'text', id: next(), where, key: `i18n.${String(key)}`, en: en[key] as string, es: es[key] as string };
}

function listRows(next: () => string, key: 'privacy' | 'mustKnow', where: string): Row[] {
  return en[key].map((t, i) => ({
    kind: 'text' as const,
    id: next(),
    where: `${where} (item ${i + 1} of ${en[key].length})`,
    key: `i18n.${key}[${i}]`,
    en: t,
    es: es[key][i],
  }));
}

// Part 1: legal text that appears on screen ----------------------------------
const L = counter('L');
const lEn = LEGAL.en;
const lEs = LEGAL.es;
const partOnScreen: Part = {
  title: 'Legal text shown on screen',
  intro:
    'The short disclaimer appears at the top of every screen. The acceptance screen appears before first use; the app cannot be used until the checkbox is ticked. The draft label appears on the acceptance screen, on each legal page and in the footer while the text is a draft.',
  rows: [
    { kind: 'text', id: L(), where: 'Top of every screen (yellow bar)', key: 'legal.short', en: lEn.short, es: lEs.short },
    { kind: 'text', id: L(), where: 'Link at the end of the short disclaimer; footer link', key: 'legal.shortLinks.disclaimer', en: lEn.shortLinks.disclaimer, es: lEs.shortLinks.disclaimer },
    { kind: 'text', id: L(), where: 'Footer link on every screen', key: 'legal.shortLinks.terms', en: lEn.shortLinks.terms, es: lEs.shortLinks.terms },
    { kind: 'text', id: L(), where: 'Footer link on every screen', key: 'legal.shortLinks.privacy', en: lEn.shortLinks.privacy, es: lEs.shortLinks.privacy },
    { kind: 'heading', text: 'Acceptance screen (before first use)', textEs: 'Pantalla de aceptación (antes del primer uso)' },
    { kind: 'text', id: L(), where: 'Acceptance screen: title', key: 'legal.acceptTitle', en: lEn.acceptTitle, es: lEs.acceptTitle },
    ...lEn.acceptIntro.map((t, i): Row => ({
      kind: 'text', id: L(), where: `Acceptance screen: paragraph ${i + 1}`, key: `legal.acceptIntro[${i}]`, en: t, es: lEs.acceptIntro[i],
    })),
    { kind: 'text', id: L(), where: 'Acceptance screen: checkbox label (must be ticked to continue)', key: 'legal.acceptCheckbox', en: lEn.acceptCheckbox, es: lEs.acceptCheckbox },
    { kind: 'text', id: L(), where: 'Acceptance screen: button (disabled until the box is ticked)', key: 'legal.acceptButton', en: lEn.acceptButton, es: lEs.acceptButton },
    { kind: 'text', id: L(), where: 'Acceptance screen: note under the button', key: 'legal.acceptStorageNote', en: lEn.acceptStorageNote, es: lEs.acceptStorageNote },
    { kind: 'heading', text: 'Draft label and navigation', textEs: 'Etiqueta de borrador y navegación' },
    { kind: 'text', id: L(), where: 'Draft label (acceptance screen, legal pages, footer)', key: 'legal.draftBadge', en: lEn.draftBadge, es: lEs.draftBadge, note: 'Remove once the text is approved.' },
    { kind: 'text', id: L(), where: 'Draft banner, under the label', key: 'legal.draftNotice', en: lEn.draftNotice, es: lEs.draftNotice, note: 'Remove once the text is approved.' },
    { kind: 'text', id: L(), where: 'Legal pages: back link', key: 'legal.back', en: lEn.back, es: lEs.back },
  ],
};

const CHECKBOX_ID = (partOnScreen.rows.find((r) => r.kind === 'text' && r.key === 'legal.acceptCheckbox') as { id: string }).id;

// Parts 2–4: the three legal documents ----------------------------------------
function docPart(prefix: string, name: 'disclaimer' | 'terms' | 'privacy', intro: string): Part {
  const next = counter(prefix);
  const dEn: LegalDoc = lEn[name];
  const dEs: LegalDoc = lEs[name];
  const rows: Row[] = [
    { kind: 'text', id: next(), where: 'Page title', key: `legal.${name}.title`, en: dEn.title, es: dEs.title },
    { kind: 'text', id: next(), where: 'Date line under the title', key: `legal.${name}.updated`, en: dEn.updated, es: dEs.updated },
  ];
  dEn.sections.forEach((s, i) => {
    const t = dEs.sections[i];
    rows.push({ kind: 'text', id: next(), where: `Section ${i + 1}: heading`, key: `legal.${name}.sections[${i}].heading`, en: s.heading, es: t.heading, bold: true });
    s.paragraphs?.forEach((p, j) =>
      rows.push({ kind: 'text', id: next(), where: `Section ${i + 1}: paragraph ${j + 1}`, key: `legal.${name}.sections[${i}].paragraphs[${j}]`, en: p, es: t.paragraphs![j] }),
    );
    s.bullets?.forEach((b, j) =>
      rows.push({ kind: 'text', id: next(), where: `Section ${i + 1}: bullet ${j + 1}`, key: `legal.${name}.sections[${i}].bullets[${j}]`, en: `• ${b}`, es: `• ${t.bullets![j]}` }),
    );
  });
  return { title: dEn.title, intro, rows };
}

const partDisclaimer = docPart('D', 'disclaimer', 'Full Disclaimer page (#/disclaimer). Linked from the short disclaimer on every screen, the acceptance screen and the footer.');
const partTerms = docPart('T', 'terms', `Terms of Use page (#/terms). Users agree to these by ticking the checkbox on the acceptance screen (${CHECKBOX_ID}). Terms version: ${TERMS_VERSION}.`);
const partPrivacy = docPart('P', 'privacy', 'Privacy Policy page (#/privacy). Users agree to it with the same checkbox.');

// Part 5: explanations ---------------------------------------------------------
const E = counter('E');
const noticeLabels: Record<string, string> = {
  notice_of_hearing: 'Notice of Hearing',
  notice_to_appear: 'Notice to Appear (I-862)',
  judge_order: 'Order from an immigration judge',
  unknown: 'Document type not recognized',
};
const explanationRows: Row[] = [
  { kind: 'heading', text: 'What the document is (shown according to the type of notice detected)', textEs: 'Qué es el documento' },
  uiRow(E, 'whatIsThis', 'Results screen: section title'),
];
for (const k of Object.keys(en.notice) as (keyof S['notice'])[]) {
  const a = en.notice[k];
  const b = es.notice[k];
  explanationRows.push({ kind: 'text', id: E(), where: `When the notice is: ${noticeLabels[k]} (title)`, key: `i18n.notice.${k}.title`, en: a.title, es: b.title });
  a.body.forEach((p, i) =>
    explanationRows.push({ kind: 'text', id: E(), where: `When the notice is: ${noticeLabels[k]} (paragraph ${i + 1})`, key: `i18n.notice.${k}.body[${i}]`, en: p, es: b.body[i] }),
  );
}
explanationRows.push({ kind: 'heading', text: 'Type of hearing (shown when the notice names it)', textEs: 'Tipo de audiencia' });
for (const k of Object.keys(en.hearing) as (keyof S['hearing'])[]) {
  const a = en.hearing[k];
  const b = es.hearing[k];
  const label = k === 'master' ? 'Master calendar hearing' : 'Individual (merits) hearing';
  explanationRows.push({ kind: 'text', id: E(), where: `${label} (title)`, key: `i18n.hearing.${k}.title`, en: a.title, es: b.title });
  a.body.forEach((p, i) =>
    explanationRows.push({ kind: 'text', id: E(), where: `${label} (paragraph ${i + 1})`, key: `i18n.hearing.${k}.body[${i}]`, en: p, es: b.body[i] }),
  );
}
explanationRows.push(
  { kind: 'heading', text: 'Important things to know (shown on every result)', textEs: 'Cosas importantes que debe saber' },
  uiRow(E, 'mustKnowTitle', 'Results screen: section title'),
  ...listRows(E, 'mustKnow', 'Results screen: list'),
  { kind: 'heading', text: 'Notes shown with the results', textEs: 'Notas que aparecen con los resultados' },
  uiRow(E, 'checkWarning', 'Results screen: warning under the title, always shown'),
  uiRow(E, 'dateToBeSet', 'Results screen: shown when the notice says the date is “to be set”'),
  uiRow(E, 'remoteNote', 'Results screen: shown when the notice mentions an internet/video hearing'),
);
const partExplanations: Part = {
  title: 'Notice explanations and key information',
  intro:
    'Plain-language explanations shown after a notice is read. The app picks the explanation based on keywords it finds in the notice, so a user may see the wrong one if the notice is misread. Please check that these statements are accurate and stay on the information side of the information / advice line.',
  rows: explanationRows,
};

// Part 6: screens --------------------------------------------------------------
const U = counter('U');
const partScreens: Part = {
  title: 'App screens, buttons and messages',
  intro: 'Everything else the user reads, in the order it appears.',
  rows: [
    { kind: 'heading', text: 'Header and footer (every screen)', textEs: 'Encabezado y pie de página' },
    uiRow(U, 'appTagline', 'Header, under the name “LexCourt”'),
    uiRow(U, 'langToggle', 'Header: button that switches the language (shows the other language’s name)'),
    uiRow(U, 'footer', 'Footer, every screen'),
    { kind: 'heading', text: 'Start screen', textEs: 'Pantalla de inicio' },
    uiRow(U, 'startTitle', 'Start screen: title'),
    uiRow(U, 'startHint', 'Start screen: instructions'),
    uiRow(U, 'uploadPhoto', 'Start screen: button'),
    uiRow(U, 'uploadPdf', 'Start screen: button'),
    uiRow(U, 'orDescribe', 'Start screen: heading above the text box'),
    uiRow(U, 'typePlaceholder', 'Start screen: example text inside the empty text box'),
    uiRow(U, 'speak', 'Start screen: voice button'),
    uiRow(U, 'stopSpeaking', 'Start screen: voice button while recording'),
    uiRow(U, 'listening', 'Start screen: shown while recording'),
    uiRow(U, 'voicePrivacy', 'Start screen: privacy note under the voice button'),
    uiRow(U, 'voiceUnsupported', 'Start screen: shown instead when the browser has no voice input'),
    uiRow(U, 'readThis', 'Start screen: button that reads the typed text'),
    { kind: 'heading', text: 'Progress and error messages', textEs: 'Mensajes de progreso y de error' },
    uiRow(U, 'progressPdf', 'While reading a PDF'),
    uiRow(U, 'progressOcrLoading', 'While the photo reader loads'),
    uiRow(U, 'progressOcr', 'While reading a photo'),
    uiRow(U, 'errorUnsupported', 'Error: wrong type of file'),
    uiRow(U, 'errorRead', 'Error: file could not be read'),
    uiRow(U, 'errorNoText', 'Error: no text found'),
    { kind: 'heading', text: 'Results screen', textEs: 'Pantalla de resultados' },
    uiRow(U, 'resultTitle', 'Results screen: title'),
    uiRow(U, 'fieldDate', 'Results screen: field label'),
    uiRow(U, 'fieldTime', 'Results screen: field label'),
    uiRow(U, 'fieldCourt', 'Results screen: field label'),
    uiRow(U, 'fieldANumber', 'Results screen: field label'),
    uiRow(U, 'notFound', 'Results screen: shown under a field the app could not fill in'),
    uiRow(U, 'showText', 'Results screen: expandable section showing the text that was read'),
    uiRow(U, 'startOver', 'Results screen: button'),
    { kind: 'heading', text: 'Privacy summary (start screen)', textEs: 'Resumen de privacidad' },
    uiRow(U, 'privacyTitle', 'Privacy box: title'),
    ...listRows(U, 'privacy', 'Privacy box'),
  ],
};

// Part 7: reminders ------------------------------------------------------------
const R = counter('R');
const partReminders: Part = {
  title: 'Calendar reminders',
  intro:
    'Text on the reminders panel, and the text written into the calendar event the user saves (title and description). The event has alerts 1 week, 1 day and 2 hours before the hearing.',
  rows: [
    uiRow(R, 'remindersTitle', 'Results screen: reminders panel title'),
    uiRow(R, 'remindersHint', 'Reminders panel: explanation'),
    uiRow(R, 'downloadIcs', 'Reminders panel: button (saves a calendar file on the device)'),
    uiRow(R, 'googleCal', 'Reminders panel: button (opens Google Calendar)'),
    uiRow(R, 'needDate', 'Reminders panel: shown when there is no hearing date'),
    uiRow(R, 'reminderTitle', 'Calendar event: title'),
    {
      kind: 'text', id: R(), where: 'Calendar event: description', key: 'i18n.reminderDescription(true)',
      en: en.reminderDescription(true), es: es.reminderDescription(true),
      note: 'The sentence about the A-Number is left out when no A-Number was found.',
    },
  ],
};

// Part 8: legal help -----------------------------------------------------------
const H = counter('H');
const partHelp: Part = {
  title: 'Free legal help and links',
  intro: 'Shown on the start and results screens, including before the terms are accepted. Each label opens the link shown in the table at the end of this part.',
  rows: [
    uiRow(H, 'helpTitle', 'Legal help box: title'),
    uiRow(H, 'helpIntro', 'Legal help box: introduction'),
    uiRow(H, 'helpProBono', 'Link label'),
    uiRow(H, 'helpDirectory', 'Link label'),
    { kind: 'text', id: H(), where: 'Link label', key: 'i18n.helpCaseStatus(phone)', en: en.helpCaseStatus(LINKS.en.caseStatusPhone), es: es.helpCaseStatus(LINKS.es.caseStatusPhone) },
    uiRow(H, 'helpCourtGuide', 'Link label'),
    uiRow(H, 'helpForms', 'Link label'),
    uiRow(H, 'notarioWarning', 'Legal help box: warning at the bottom'),
  ],
};

const linkRows: [string, string, string][] = [
  ['EOIR List of Pro Bono Legal Service Providers', LINKS.en.proBonoList, LINKS.es.proBonoList],
  ['National Immigration Legal Services Directory (Immigration Advocates Network)', LINKS.en.legalDirectory, LINKS.es.legalDirectory],
  ['EOIR Automated Case Information (ACIS)', LINKS.en.caseStatus, LINKS.es.caseStatus],
  ['EOIR case information phone line', LINKS.en.caseStatusPhone, LINKS.es.caseStatusPhone],
  ['Immigration Court Online Resource (ICOR)', LINKS.en.courtGuide, LINKS.es.courtGuide],
  ['Online change of address, Form EOIR-33/IC', LINKS.en.changeOfAddress, LINKS.es.changeOfAddress],
];

// Parts 9–10: "Check a representative" and "Report a problem" (draft) ----------

/** Example values used to show text that is filled in by the app. */
const SAMPLES: Record<string, unknown[]> = {
  stepsTitle: ['“Juan Pérez”'],
  stateLookup: ['California'],
  signsSome: [2],
  stepOf: [2, 5],
  stateAgFor: ['Texas'],
};
const SAMPLE_NOTE: Record<string, string> = {
  stepsTitle: 'Shows the name the user typed, or “this person”.',
  stateLookup: 'Shows the state the user chose.',
  signsSome: 'Shows how many warning signs were checked (example: 2).',
  stepOf: 'Example: step 2 of 5.',
  stateAgFor: 'Shows the state the user chose.',
};

function flatten(prefix: string, next: () => string, a: unknown, b: unknown, path: string, where: string, rows: Row[]) {
  if (typeof a === 'string') {
    if (a) rows.push({ kind: 'text', id: next(), where, key: path, en: a, es: b as string });
    return;
  }
  if (typeof a === 'function') {
    const key = path.split('.').pop()!;
    const args = SAMPLES[key] ?? [];
    rows.push({
      kind: 'text', id: next(), where, key: `${path}(…)`,
      en: (a as (...x: unknown[]) => string)(...args), es: (b as (...x: unknown[]) => string)(...args), note: SAMPLE_NOTE[key],
    });
    return;
  }
  if (Array.isArray(a)) {
    a.forEach((v, i) => flatten(prefix, next, v, (b as unknown[])[i], `${path}[${i}]`, `${where} (item ${i + 1} of ${a.length})`, rows));
    return;
  }
  if (a && typeof a === 'object')
    for (const [k, v] of Object.entries(a)) flatten(prefix, next, v, (b as Record<string, unknown>)[k], `${path}.${k}`, where, rows);
}

function toolRows(prefix: string, sections: [string, string, unknown, unknown, string][]): Row[] {
  const next = counter(prefix);
  const rows: Row[] = [];
  for (const [heading, headingEs, a, b, path] of sections) {
    rows.push({ kind: 'heading', text: heading, textEs: headingEs });
    flatten(prefix, next, a, b, path, heading, rows);
  }
  return rows;
}

const tEn = TOOLS.en;
const tEs = TOOLS.es;
const partCheck: Part = {
  title: 'Check a representative (new, draft)',
  intro:
    'New page (#/check). The user can type the name of their lawyer or representative and say what they claim to be. LexCourt does not search for them: it explains how to check, links to the official lists, and shows a checklist of notario-fraud warning signs. Nothing is stored or sent. All text is a draft that needs attorney review.',
  rows: toolRows('C', [
    ['Tabs (top of the Notice Reader, Check and Report pages)', 'Pestañas', tEn.nav, tEs.nav, 'tools.nav'],
    ['Shared notices on both new pages', 'Avisos comunes', { draftBadge: tEn.draftBadge, draftNotice: tEn.draftNotice, infoNotAdvice: tEn.infoNotAdvice, copy: tEn.copy, copied: tEn.copied, copyFailed: tEn.copyFailed, openNewTab: tEn.openNewTab }, { draftBadge: tEs.draftBadge, draftNotice: tEs.draftNotice, infoNotAdvice: tEs.infoNotAdvice, copy: tEs.copy, copied: tEs.copied, copyFailed: tEs.copyFailed, openNewTab: tEs.openNewTab }, 'tools'],
    ['Check a representative', 'Revisar un representante', tEn.check, tEs.check, 'tools.check'],
  ]),
};
const partReport: Part = {
  title: 'Report a problem (new, draft)',
  intro:
    'New page (#/report). A five-step questionnaire (who, what happened, immigration court case, state, optional details). The app then shows which offices usually handle the problem, links to their official complaint forms, and builds a summary the user can copy. LexCourt never submits anything. The routing rules are in the table at the end of this part. All text is a draft that needs attorney review.',
  rows: toolRows('R2', [
    ['Report a problem', 'Reportar un problema', tEn.report, tEs.report, 'tools.report'],
    ['Summary the user copies (language chosen by the user)', 'Resumen que el usuario copia', tEn.summary.en, tEn.summary.es, 'tools.summary'],
  ]).map((r) => (r.kind === 'text' ? { ...r, id: r.id.replace('R2-', 'Q-') } : r)),
};

const readMeta = (file: string) => readFileSync(join(root, file), 'utf8').match(/<meta name="description" content="([^"]+)"/)?.[1] ?? '';
const readManifest = (file: string) => JSON.parse(readFileSync(join(root, 'public', file), 'utf8')).description as string;
const partOther: Part = {
  title: 'Other text (search engines and home-screen icon)',
  intro:
    'Shown in search results and link previews, and when the app is added to a phone’s home screen. A web page has one description and one home-screen manifest, so the Spanish versions are served from a separate Spanish address, /es/ (which also opens the app in Spanish). The English address is /.',
  rows: [
    { kind: 'text', id: 'X-1', where: 'Search results and link previews (English page / , Spanish page /es/)', key: 'index.html meta description (+ es/)', en: readMeta('index.html'), es: readMeta('es/index.html') },
    { kind: 'text', id: 'X-2', where: 'Home-screen app description (English page / , Spanish page /es/)', key: 'manifest.webmanifest description (+ es/)', en: readManifest('manifest.webmanifest'), es: readManifest('es/manifest.webmanifest') },
  ],
};

const PARTS: Part[] = [partOnScreen, partDisclaimer, partTerms, partPrivacy, partExplanations, partScreens, partReminders, partHelp, partCheck, partReport, partOther];

// ---------------------------------------------------------------------------
// Revision tracking: what changed in this draft, marked on each row
// ---------------------------------------------------------------------------

const REVISION = 'draft 2';
interface Change {
  n: number;
  what: string;
  kind: 'NEW' | 'CHANGED';
  keys: string[];
}
const CHANGES: Change[] = [
  { n: 1, kind: 'CHANGED', what: 'Privacy Policy: LexCourt never receives the notice or its details; hosting records described below.', keys: ['legal.privacy.sections[1].paragraphs[1]'] },
  { n: 2, kind: 'NEW', what: 'Users under 18: new Terms section and the same sentence on the acceptance screen. (Terms sections 6–12 renumbered.)', keys: ['legal.terms.sections[5].heading', 'legal.terms.sections[5].paragraphs[0]', 'legal.acceptIntro[4]'] },
  { n: 3, kind: 'CHANGED', what: 'Judge’s order: example of the 30-day appeal deadline to the Board of Immigration Appeals.', keys: ['i18n.notice.judge_order.body[2]'] },
  { n: 4, kind: 'NEW', what: 'Important things to know: ICE check-ins are different from court hearings.', keys: ['i18n.mustKnow[1]'] },
  { n: 5, kind: 'CHANGED', what: 'Interpreter: provided at no cost if the person does not speak English well.', keys: ['i18n.mustKnow[5]'] },
  { n: 6, kind: 'CHANGED', what: 'Spanish only: “seguido” → “con frecuencia”.', keys: ['i18n.mustKnow[2]'] },
  { n: 7, kind: 'CHANGED', what: 'Spanish only: master calendar hearing title → “Audiencia de calendario principal”.', keys: ['i18n.hearing.master.title'] },
  { n: 8, kind: 'CHANGED', what: 'EOIR-33/IC link label: removed “no account needed” (could not be confirmed).', keys: ['i18n.helpForms'] },
  { n: 9, kind: 'NEW', what: 'Terms: Severability and Entire agreement sections.', keys: ['legal.terms.sections[12].heading', 'legal.terms.sections[12].paragraphs[0]', 'legal.terms.sections[13].heading', 'legal.terms.sections[13].paragraphs[0]'] },
  { n: 10, kind: 'CHANGED', what: 'No warranty and Limitation of liability: reviewer note on Pennsylvania law (wording unchanged).', keys: ['legal.terms.sections[9].paragraphs[0]', 'legal.terms.sections[10].paragraphs[0]'] },
  { n: 11, kind: 'CHANGED', what: 'Terms: governed by Pennsylvania law; operator name and contact email placeholders.', keys: ['legal.terms.sections[14].paragraphs[0]'] },
  { n: 12, kind: 'CHANGED', what: 'Privacy Policy: operator name and contact email placeholders.', keys: ['legal.privacy.sections[6].paragraphs[0]'] },
  { n: 13, kind: 'NEW', what: 'Spanish search description and home-screen description (served at /es/).', keys: ['index.html meta description (+ es/)', 'manifest.webmanifest description (+ es/)'] },
];
/** Reviewer notes added in this draft. `decision` ones are also listed under “Decisions needed”. */
const NOTES: Record<string, { note: string; decision?: boolean }> = {
  'i18n.hearing.master.title': { note: 'Translator to confirm the standard term.', decision: true },
  'legal.terms.sections[9].paragraphs[0]': { note: 'Confirm enforceability under Pennsylvania law and the Pennsylvania Unfair Trade Practices and Consumer Protection Law; free service, no payment.', decision: true },
  'legal.terms.sections[10].paragraphs[0]': { note: 'Confirm enforceability under Pennsylvania law and the Pennsylvania Unfair Trade Practices and Consumer Protection Law; free service, no payment.', decision: true },
  'legal.terms.sections[14].paragraphs[0]': { note: 'No venue / forum clause yet: add one if wanted.', decision: true },
  'i18n.helpForms': { note: 'Whether the online form needs an account could not be confirmed (site not reachable from the build environment), so the claim was removed.' },
};
const RENUMBERED = [6, 7, 8, 9, 10, 11].map((i) => `legal.terms.sections[${i}].heading`);

const changeOf = new Map<string, Change>();
for (const c of CHANGES) for (const k of c.keys) changeOf.set(k, c);
const idOfKey = new Map<string, string>();
for (const part of PARTS)
  for (const r of part.rows) {
    if (r.kind !== 'text') continue;
    idOfKey.set(r.key, r.id);
    const notes: string[] = [];
    const c = changeOf.get(r.key);
    if (c) notes.push(`${c.kind} in ${REVISION} (item ${c.n}) — draft, needs attorney review.`);
    else if (RENUMBERED.includes(r.key)) notes.push(`Renumbered in ${REVISION} (new section 6 added before it).`);
    if (NOTES[r.key]) notes.push(NOTES[r.key].note);
    if (r.note) notes.push(r.note);
    if (notes.length) r.note = notes.join(' ');
  }
for (const c of CHANGES) for (const k of c.keys) if (!idOfKey.has(k)) throw new Error(`change ${c.n}: no row with key ${k}`);
for (const k of Object.keys(NOTES)) if (!idOfKey.has(k)) throw new Error(`note: no row with key ${k}`);

// Routing table: which offices are shown for each kind of answer.
const WHO_LABEL: Record<Who, string> = { lawyer: 'Lawyer', accredited: 'Accredited representative', nonlawyer: 'Notario / non-lawyer', unsure: 'Not sure' };
const AUTH_LABEL: Record<string, string> = {
  stateDiscipline: 'State lawyer discipline office',
  eoirDiscipline: 'EOIR Disciplinary Counsel (Form EOIR-44)',
  eoirFraud: 'EOIR Fraud & Abuse Prevention Program',
  stateAG: 'State attorney general',
  ftc: 'FTC',
};
const ISSUE_SETS: [string, Issue[]][] = [
  ['Missed a deadline', ['missedDeadline']],
  ['Charged for free forms', ['freeForms']],
  ['Pretended to be a lawyer + took money', ['fakeLawyer', 'tookMoney']],
];
const routingRows: string[][] = [];
for (const who of ['lawyer', 'accredited', 'nonlawyer', 'unsure'] as Who[])
  for (const court of ['yes', 'no'] as const)
    for (const [label, issues] of ISSUE_SETS) {
      const a: Answers = { who, issues, court, state: null, details: { name: '', business: '', contact: '', dates: '', amountPaid: '', story: '', documents: '' } };
      const r = recommend(a);
      routingRows.push([
        WHO_LABEL[who],
        court === 'yes' ? 'Yes' : 'No',
        label,
        r.filter((x) => x.priority === 'primary').map((x) => AUTH_LABEL[x.id]).join('; ') || '—',
        r.filter((x) => x.priority === 'also').map((x) => AUTH_LABEL[x.id]).join('; ') || '—',
      ]);
    }

// ---------------------------------------------------------------------------
// Document building
// ---------------------------------------------------------------------------

const PLACEHOLDER = /(\[[A-Za-zÁÉÍÓÚáéíóú][^\]]*\])/g;

/** Runs for a piece of app text, with [ATTORNEY REVIEW] placeholders highlighted. */
function textRuns(text: string, opts: { size?: number; color?: string; bold?: boolean } = {}): TextRun[] {
  return text
    .split(PLACEHOLDER)
    .filter((s) => s !== '')
    .map((s) =>
      /^\[[A-Za-zÁÉÍÓÚáéíóú][^\]]*\]$/.test(s)
        ? new TextRun({ text: s, font: FONT, size: opts.size ?? 19, bold: true, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'FFF59D' }, color: INK })
        : new TextRun({ text: s, font: FONT, size: opts.size ?? 19, color: opts.color ?? INK, bold: opts.bold }),
    );
}

const cellBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
  left: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
  right: { style: BorderStyle.SINGLE, size: 4, color: BORDER },
};
const margins = { top: 80, bottom: 80, left: 110, right: 110 };

// Landscape US Letter, 0.75" margins → 15840 − 2×1080 = 13680 DXA of text width.
const PAGE_W = 15840;
const MARGIN = 1080;
const TEXT_W = PAGE_W - 2 * MARGIN;
const COLS = [760, 2000, 4280, 4280, 2360];
if (COLS.reduce((a, b) => a + b) !== TEXT_W) throw new Error('column widths must add up to the text width');

function noteRuns(note?: string): TextRun[] {
  if (!note) return [];
  const m = note.match(/^((?:NEW|CHANGED) in [^—]+—[^.]+\.)\s*(.*)$/);
  if (!m) return [new TextRun({ text: note, font: FONT, size: 16, italics: true, color: MUTED })];
  return [
    new TextRun({ text: m[1], font: FONT, size: 16, bold: true, color: 'B42318' }),
    ...(m[2] ? [new TextRun({ text: ` ${m[2]}`, font: FONT, size: 16, italics: true, color: MUTED })] : []),
  ];
}

function cell(children: Paragraph[], width: number, fill?: string, span?: number): TableCell {
  return new TableCell({
    children,
    width: { size: width, type: WidthType.DXA },
    borders: cellBorders,
    margins,
    columnSpan: span,
    shading: fill ? { type: ShadingType.CLEAR, color: 'auto', fill } : undefined,
  });
}

function p(runs: TextRun[], opts: { after?: number; keepNext?: boolean } = {}): Paragraph {
  return new Paragraph({ children: runs, spacing: { before: 0, after: opts.after ?? 0, line: 264 }, keepNext: opts.keepNext });
}

function headerRow(labels: string[]): TableRow {
  return new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: labels.map((l, i) => cell([p([new TextRun({ text: l, font: FONT, size: 18, bold: true, color: BRAND })])], COLS[i], HEAD_FILL)),
  });
}

function textTable(rows: Row[]): Table {
  const trs: TableRow[] = [headerRow(['ID', 'Where it appears', 'English', 'Spanish (Español)', 'Reviewer notes'])];
  for (const r of rows) {
    if (r.kind === 'heading') {
      trs.push(
        new TableRow({
          cantSplit: true,
          children: [
            cell(
              [p([new TextRun({ text: r.text, font: FONT, size: 19, bold: true, color: BRAND }), ...(r.textEs ? [new TextRun({ text: `  /  ${r.textEs}`, font: FONT, size: 19, color: MUTED })] : [])], { keepNext: true })],
              TEXT_W,
              SECTION_FILL,
              5,
            ),
          ],
        }),
      );
      continue;
    }
    trs.push(
      new TableRow({
        cantSplit: true,
        children: [
          cell([p([new TextRun({ text: r.id, font: FONT, size: 18, bold: true, color: BRAND })])], COLS[0]),
          cell(
            [
              p([new TextRun({ text: r.where, font: FONT, size: 17, color: INK })], { after: 40 }),
              p([new TextRun({ text: r.key, font: 'Consolas', size: 14, color: MUTED })]),
            ],
            COLS[1],
          ),
          cell([p(textRuns(r.en, { bold: r.bold }))], COLS[2], r.bold ? SECTION_FILL : undefined),
          cell([p(textRuns(r.es, { bold: r.bold }))], COLS[3], r.bold ? SECTION_FILL : undefined),
          cell([p(noteRuns(r.note))], COLS[4]),
        ],
      }),
    );
  }
  return new Table({ width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: COLS, rows: trs });
}

function simpleTable(head: string[], rows: string[][], widths: number[]): Table {
  const mk = (cells: string[], isHead = false) =>
    new TableRow({
      tableHeader: isHead,
      cantSplit: true,
      children: cells.map((c, i) =>
        new TableCell({
          children: [p([new TextRun({ text: c, font: !isHead && /^(https?:|[A-Za-z.]+@)/.test(c) ? 'Consolas' : FONT, size: isHead ? 18 : 17, bold: isHead, color: isHead ? BRAND : INK })])],
          width: { size: widths[i], type: WidthType.DXA },
          borders: cellBorders,
          margins,
          shading: isHead ? { type: ShadingType.CLEAR, color: 'auto', fill: HEAD_FILL } : undefined,
        }),
      ),
    });
  return new Table({ width: { size: widths.reduce((x, y) => x + y), type: WidthType.DXA }, columnWidths: widths, rows: [mk(head, true), ...rows.map((r) => mk(r))] });
}

function linksTable(): Table {
  const widths = [3880, 4900, 4900];
  const row = (cells: string[], head = false) =>
    new TableRow({
      tableHeader: head,
      cantSplit: true,
      children: cells.map((c, i) =>
        new TableCell({
          children: [p([new TextRun({ text: c, font: head ? FONT : i === 0 ? FONT : 'Consolas', size: head ? 18 : 17, bold: head, color: head ? BRAND : INK })])],
          width: { size: widths[i], type: WidthType.DXA },
          borders: cellBorders,
          margins,
          shading: head ? { type: ShadingType.CLEAR, color: 'auto', fill: HEAD_FILL } : undefined,
        }),
      ),
    });
  return new Table({
    width: { size: TEXT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [row(['Resource', 'Link in English', 'Link in Spanish'], true), ...linkRows.map((r) => row(r))],
  });
}

const body = (text: string, after = 120) => new Paragraph({ children: textRuns(text, { size: 21 }), spacing: { after, line: 276 } });
const bullet = (text: string, level = 0) =>
  new Paragraph({ children: textRuns(text, { size: 21 }), numbering: { reference: 'bullets', level }, spacing: { after: 60, line: 276 } });
const h1 = (text: string, pageBreak = true) => new Paragraph({ text, heading: HeadingLevel.HEADING_1, pageBreakBefore: pageBreak });
const h2 = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_2 });

// Decisions needed: every [ATTORNEY REVIEW] placeholder, with its row ID.
const decisions: { id: string; text: string }[] = [];
for (const part of PARTS)
  for (const r of part.rows) {
    if (r.kind !== 'text') continue;
    for (const m of r.en.matchAll(/\[ATTORNEY REVIEW:\s*([^\]]+)\]/g)) decisions.push({ id: r.id, text: m[1].trim() });
    const fills = [...r.en.matchAll(/\[([A-Z][A-Z ]+)\]/g)].map((m) => `[${m[1]}]`);
    if (fills.length) decisions.push({ id: r.id, text: `fill in ${fills.join(' and ')}.` });
    if (NOTES[r.key]?.decision) decisions.push({ id: r.id, text: NOTES[r.key].note });
  }

let commit = 'unknown';
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim();
} catch {
  /* not a git checkout */
}
const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const textRowCount = PARTS.reduce((n, part) => n + part.rows.filter((r) => r.kind === 'text').length, 0);

const metaTable = new Table({
  width: { size: 9000, type: WidthType.DXA },
  columnWidths: [2600, 6400],
  rows: [
    ['Prepared', today],
    ['App version', `Git commit ${commit}`],
    ['Terms version', TERMS_VERSION],
    ['Languages', 'English and Spanish, side by side'],
    ['Contents', `${textRowCount} pieces of user-facing text, each with an ID`],
  ].map(
    ([k, v]) =>
      new TableRow({
        children: [
          new TableCell({ children: [p([new TextRun({ text: k, font: FONT, size: 19, bold: true, color: BRAND })])], width: { size: 2600, type: WidthType.DXA }, borders: cellBorders, margins, shading: { type: ShadingType.CLEAR, color: 'auto', fill: HEAD_FILL } }),
          new TableCell({ children: [p([new TextRun({ text: v, font: FONT, size: 19, color: INK })])], width: { size: 6400, type: WidthType.DXA }, borders: cellBorders, margins }),
        ],
      }),
  ),
});

const intro: (Paragraph | Table)[] = [
  new Paragraph({ children: [new TextRun({ text: 'DRAFT — FOR ATTORNEY REVIEW', font: FONT, size: 20, bold: true, color: 'B42318' })], spacing: { after: 120 } }),
  new Paragraph({ text: 'LexCourt: All User-Facing Text', heading: HeadingLevel.TITLE }),
  new Paragraph({ children: [new TextRun({ text: 'English and Spanish, including the explanations, disclaimer, Terms of Use and Privacy Policy', font: FONT, size: 26, color: MUTED })], spacing: { after: 280 } }),
  metaTable,
  new Paragraph({ spacing: { after: 120 }, children: [] }),

  h2('About LexCourt'),
  body(
    'LexCourt is a free, mobile-first web app for people in U.S. immigration court who do not have a lawyer. Its first feature, the Notice Reader, lets a person take a photo of their court notice, choose a PDF, or describe the notice by voice or text. The app then shows the hearing date, time and court address it found, explains the notice in plain language, offers calendar reminders, and links to free legal help. It is available in English and Spanish.',
  ),
  body(
    'Everything runs on the user’s own phone or computer. The notice is never uploaded, and the app has no accounts, analytics or cookies. The only thing it stores is a note on the device that the user accepted the terms. The details the app extracts are automatic guesses; users can correct them, and the app tells them to check every detail against the notice and the court.',
  ),

  h2(`What changed in this revision (${REVISION})`),
  body(`Every new or changed row is marked “NEW in ${REVISION}” or “CHANGED in ${REVISION}” in its Reviewer notes column. All of it is a draft that needs attorney review. Adding a Terms section renumbered some rows, so row IDs differ from the previous version of this document; use the IDs below.`, 160),
  simpleTable(
    ['#', 'Change', 'Rows (new IDs)'],
    CHANGES.map((c) => [String(c.n), `${c.kind}: ${c.what}`, c.keys.map((k) => idOfKey.get(k)).join(', ')]),
    [600, 10080, 3000],
  ),
  new Paragraph({ spacing: { after: 120 }, children: [] }),

  h2('What we are asking you to review'),
  bullet(`Disclaimer, Terms of Use and Privacy Policy (Parts 1–4): adequacy and enforceability, including the first-use checkbox acceptance (${CHECKBOX_ID}) and the no-warranty and liability clauses.`),
  bullet('Information vs. advice (Part 5 especially): whether any explanation crosses from general legal information into legal advice, or could be read that way.'),
  bullet('Accuracy of the legal statements, for example: in absentia orders for missed hearings; the 5-day deadline to file Form EOIR-33/IC after moving; the right to counsel at no expense to the government; free interpreters at hearings; the descriptions of master calendar and individual hearings, Notices to Appear and Notices of Hearing.'),
  bullet('Privacy Policy accuracy against how the app works (described above), and any notices required by state privacy laws.'),
  bullet('Spanish: whether each Spanish text says the same thing as the English, with no change in legal meaning. A qualified legal translator should also review it.'),
  bullet('New “Check a representative” and “Report a problem” pages (Parts 9–10): accuracy of how to verify lawyers and accredited representatives, the notario warning signs, which offices handle which complaints (routing table), and the wording around filing complaints, including the note for people worried about how a complaint could affect them.'),
  bullet('The decisions listed below, which the draft leaves open.'),

  h2('Decisions needed'),
  body('Open items in the draft: placeholders (highlighted in yellow in the tables) and questions in the Reviewer notes column.'),
  ...[...new Set(decisions.map((d) => d.id))].map((id) =>
    bullet(`${id}: ${decisions.filter((d) => d.id === id).map((d) => d.text.replace(/^./, (c) => c.toUpperCase())).join(' ')}`),
  ),

  h2('How to mark changes'),
  bullet('Edit the English or Spanish text directly with Track Changes on, or add Word comments. You can also write in the Reviewer notes column.'),
  bullet('Please refer to rows by their ID (for example T-14). The grey code under each location (for example legal.terms.sections[3].paragraphs[1]) lets the developer apply your changes exactly.'),
  bullet('Text in [square brackets] highlighted in yellow is a placeholder for you to complete or decide.'),
  bullet('Bullets (•) mark items shown as a bulleted list in the app.'),

  h2('Contents'),
  ...PARTS.map((part, i) => bullet(`Part ${i + 1}. ${part.title}`)),
];

const partsContent: (Paragraph | Table)[] = [];
PARTS.forEach((part, i) => {
  partsContent.push(h1(`Part ${i + 1}. ${part.title}`), body(part.intro, 200), textTable(part.rows));
  if (part === partCheck) {
    partsContent.push(
      new Paragraph({ children: [], spacing: { after: 120 } }),
      h2('Links used on this page'),
      simpleTable(['Resource', 'Link'], [
        ['EOIR roster of recognized organizations and accredited representatives', OFFICIAL.accreditedRoster],
        ['EOIR list of currently disciplined practitioners', OFFICIAL.disciplinedList],
        ['EOIR list of previously disciplined practitioners', OFFICIAL.previouslyDisciplinedList],
        ['ABA page with the Directory of State Disciplinary Agencies', OFFICIAL.abaDisciplineDirectory],
        ...Object.values(STATE_LAWYER_LOOKUPS).map((l) => [l.name, l.url]),
      ], [5200, 8480]),
      body('Official lawyer searches are linked for California, Florida, Illinois, New Jersey, New York and Texas. For other states the page points to the ABA directory of state lawyer regulators.'),
    );
  }
  if (part === partReport) {
    partsContent.push(
      new Paragraph({ children: [], spacing: { after: 120 } }),
      h2('Routing rules: which offices are shown'),
      body('Generated from the app’s routing code (src/lib/report.ts). “Start here” offices are listed first; “Also” offices are shown under “You may also report to”. Please check that each office is appropriate for each situation. For a lawyer, answering “Not sure” about an immigration court case shows EOIR Disciplinary Counsel under “Also”.', 160),
      simpleTable(['Who', 'Immigration court case?', 'What happened (example)', 'Start here', 'Also'], routingRows, [2200, 1500, 2900, 3880, 3200]),
      new Paragraph({ children: [], spacing: { after: 120 } }),
      h2('Complaint links used on this page'),
      simpleTable(['Office', 'Link or address'], [
        ['Form EOIR-44 (English)', OFFICIAL.eoir44.en],
        ['Form EOIR-44 (Spanish)', OFFICIAL.eoir44.es],
        ['EOIR Disciplinary Counsel email', OFFICIAL.eoirDisciplineEmail],
        ['EOIR Fraud & Abuse Prevention Program', OFFICIAL.eoirFraudProgram],
        ['EOIR Fraud Program email', OFFICIAL.eoirFraudEmail],
        ['FTC (English)', OFFICIAL.ftcReport.en],
        ['FTC (Spanish)', OFFICIAL.ftcReport.es],
        ['NAAG — find your state attorney general', OFFICIAL.naagFindAg],
        ['ABA — Directory of State Disciplinary Agencies', OFFICIAL.abaDisciplineDirectory],
      ], [5200, 8480]),
    );
  }
  if (part === partHelp) {
    partsContent.push(
      new Paragraph({ children: [], spacing: { after: 120 } }),
      h2('Links and phone number used in the app'),
      body('Links open in the user’s language where the site offers one. Each was checked on November 10, 2026.', 160),
      linksTable(),
    );
  }
});
partsContent.push(
  new Paragraph({ children: [], spacing: { after: 160 } }),
  body('Dates and times on the results screen (for example “Wednesday, March 3, 2027 · 8:30 AM”) are formatted by the user’s browser in the selected language.'),
);

const doc = new Document({
  creator: 'LexCourt',
  title: 'LexCourt: All User-Facing Text (draft for attorney review)',
  description: 'English and Spanish user-facing text of the LexCourt app for legal review.',
  styles: {
    default: { document: { run: { font: FONT, size: 21, color: INK } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { font: FONT, size: 48, bold: true, color: BRAND }, paragraph: { spacing: { before: 0, after: 80 }, keepNext: true } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 32, bold: true, color: BRAND }, paragraph: { spacing: { before: 0, after: 120 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 25, bold: true, color: BRAND }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE },
          margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN, header: 500, footer: 500 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER, space: 4 } },
              children: [
                new TextRun({ text: 'LexCourt — user-facing text (EN/ES)  ·  ', font: FONT, size: 16, color: MUTED }),
                new TextRun({ text: 'DRAFT — confidential, prepared for legal review', font: FONT, size: 16, bold: true, color: 'B42318' }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: `Commit ${commit}  ·  Page `, font: FONT, size: 16, color: MUTED }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: MUTED }),
                new TextRun({ text: ' of ', font: FONT, size: 16, color: MUTED }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: MUTED }),
              ],
            }),
          ],
        }),
      },
      children: [...intro, ...partsContent],
    },
  ],
});


mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, await Packer.toBuffer(doc));
console.log(`Wrote ${OUT}: ${textRowCount} text rows, ${decisions.length} decisions needed.`);
