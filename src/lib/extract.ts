/**
 * Rule-based extraction of key facts from the text of an immigration court
 * notice (from OCR, a PDF, or a spoken/typed description).
 *
 * Everything here runs on the user's device. Nothing is sent anywhere.
 * Results are best-effort guesses: the UI always lets the user check and
 * correct them against the paper notice.
 */

export type NoticeType =
  | 'notice_of_hearing'
  | 'notice_to_appear'
  | 'judge_order'
  | 'unknown';

export type HearingType = 'master' | 'individual' | 'unknown';

export interface NoticeFacts {
  noticeType: NoticeType;
  hearingType: HearingType;
  /** Hearing date as YYYY-MM-DD, or null if not found. */
  date: string | null;
  /** Hearing time as 24h HH:MM, or null if not found. */
  time: string | null;
  /** True when the notice says the date/time is "to be set" / TBD. */
  dateToBeSet: boolean;
  /** Court address as one or more lines, or null. */
  courtAddress: string | null;
  /** True when the notice mentions an internet/video (e.g. Webex) hearing. */
  remote: boolean;
  /** A-Number formatted as 000-000-000, or null. */
  aNumber: string | null;
}

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, ene: 1, enero: 1,
  feb: 2, february: 2, febrero: 2,
  mar: 3, march: 3, marzo: 3,
  apr: 4, april: 4, abr: 4, abril: 4,
  may: 5, mayo: 5,
  jun: 6, june: 6, junio: 6,
  jul: 7, july: 7, julio: 7,
  aug: 8, august: 8, ago: 8, agosto: 8,
  sep: 9, sept: 9, september: 9, septiembre: 9, setiembre: 9,
  oct: 10, october: 10, octubre: 10,
  nov: 11, november: 11, noviembre: 11,
  dec: 12, december: 12, dic: 12, diciembre: 12,
};

const MONTH_RE =
  '(jan(?:uary)?|feb(?:ruary|rero)?|mar(?:ch|zo)?|apr(?:il)?|abr(?:il)?|may(?:o)?|jun(?:e|io)?|jul(?:y|io)?|aug(?:ust)?|ago(?:sto)?|sept?(?:ember|iembre)?|setiembre|oct(?:ober|ubre)?|nov(?:ember|iembre)?|dec(?:ember)?|dic(?:iembre)?|ene(?:ro)?)';

const ORDINAL_WORDS: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7,
  eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13,
  fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17,
  eighteenth: 18, nineteenth: 19, twentieth: 20, 'twenty-first': 21,
  'twenty-second': 22, 'twenty-third': 23, 'twenty-fourth': 24,
  'twenty-fifth': 25, 'twenty-sixth': 26, 'twenty-seventh': 27,
  'twenty-eighth': 28, 'twenty-ninth': 29, thirtieth: 30, 'thirty-first': 31,
  primero: 1,
};
const ORDINAL_RE = `(${Object.keys(ORDINAL_WORDS)
  .sort((a, b) => b.length - a.length)
  .join('|')})`;

interface Found<T> {
  value: T;
  index: number;
  end: number;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function validDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Year to use when the text names a month and day but no year. */
function inferYear(m: number, d: number, today: Date): number {
  const y = today.getFullYear();
  const candidate = new Date(y, m - 1, d);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return candidate < startOfToday ? y + 1 : y;
}

function normalizeYear(raw: string): number {
  const n = parseInt(raw, 10);
  return raw.length === 2 ? 2000 + n : n;
}

/** Find every date-looking string in the text. */
export function findDates(text: string, today = new Date()): Found<string>[] {
  const out: Found<string>[] = [];
  const push = (y: number, m: number, d: number, index: number, end: number) => {
    if (validDate(y, m, d)) out.push({ value: `${y}-${pad(m)}-${pad(d)}`, index, end });
  };
  let match: RegExpExecArray | null;

  // "Mar 3, 2027", "March 3rd 2027", "March 3" (year optional)
  const monthFirst = new RegExp(
    `\\b${MONTH_RE}\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b`,
    'gi',
  );
  while ((match = monthFirst.exec(text))) {
    const m = MONTHS[match[1].toLowerCase()];
    const d = parseInt(match[2], 10);
    const y = match[3] ? parseInt(match[3], 10) : inferYear(m, d, today);
    push(y, m, d, match.index, match.index + match[0].length);
  }

  // "March third, 2027"
  const monthOrdinal = new RegExp(
    `\\b${MONTH_RE}\\s+(?:the\\s+)?${ORDINAL_RE}(?:,?\\s+(\\d{4}))?\\b`,
    'gi',
  );
  while ((match = monthOrdinal.exec(text))) {
    const m = MONTHS[match[1].toLowerCase()];
    const d = ORDINAL_WORDS[match[2].toLowerCase()];
    const y = match[3] ? parseInt(match[3], 10) : inferYear(m, d, today);
    push(y, m, d, match.index, match.index + match[0].length);
  }

  // "3 March 2027", "3rd of March", "3 de marzo de 2027", "el 3 de marzo del 2027"
  const dayFirst = new RegExp(
    `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:de\\s+|of\\s+)?${MONTH_RE}\\.?(?:,?\\s+(?:de(?:l)?\\s+)?(\\d{4}))?\\b`,
    'gi',
  );
  while ((match = dayFirst.exec(text))) {
    const d = parseInt(match[1], 10);
    const m = MONTHS[match[2].toLowerCase()];
    const y = match[3] ? parseInt(match[3], 10) : inferYear(m, d, today);
    push(y, m, d, match.index, match.index + match[0].length);
  }

  // "the third of March"
  const ordinalFirst = new RegExp(
    `\\b(?:the\\s+)?${ORDINAL_RE}\\s+(?:of\\s+|de\\s+)?${MONTH_RE}(?:,?\\s+(\\d{4}))?\\b`,
    'gi',
  );
  while ((match = ordinalFirst.exec(text))) {
    const d = ORDINAL_WORDS[match[1].toLowerCase()];
    const m = MONTHS[match[2].toLowerCase()];
    const y = match[3] ? parseInt(match[3], 10) : inferYear(m, d, today);
    push(y, m, d, match.index, match.index + match[0].length);
  }

  // Numeric US style: 03/03/2027, 3-3-27. (U.S. court notices use month first.)
  const numeric = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{4}|\d{2})\b/g;
  while ((match = numeric.exec(text))) {
    push(normalizeYear(match[3]), parseInt(match[1], 10), parseInt(match[2], 10), match.index, match.index + match[0].length);
  }

  // ISO: 2027-03-03
  const iso = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
  while ((match = iso.exec(text))) {
    push(parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10), match.index, match.index + match[0].length);
  }

  // Drop matches fully contained in another match (e.g. "March 3" inside "March 3, 2027").
  return out
    .filter(
      (a) =>
        !out.some(
          (b) => b !== a && b.index <= a.index && b.end >= a.end && b.end - b.index > a.end - a.index,
        ),
    )
    .sort((a, b) => a.index - b.index);
}

/** Find every time-looking string in the text, as 24h HH:MM. */
export function findTimes(text: string): Found<string>[] {
  const out: Found<string>[] = [];
  const re =
    /\b(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?|de la ma[ñn]ana|de la tarde|de la noche|in the morning|in the afternoon|in the evening|hrs?\b|horas\b)?/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    const hasMinutes = match[2] !== undefined;
    const suffix = (match[3] || '').toLowerCase().replace(/[\s.]/g, '');
    if (!hasMinutes && !suffix) continue; // a bare number is not a time
    let h = parseInt(match[1], 10);
    const min = hasMinutes ? parseInt(match[2], 10) : 0;
    if (h > 23 || min > 59) continue;
    const pm = suffix.startsWith('pm') || suffix.includes('tarde') || suffix.includes('noche') || suffix.includes('afternoon') || suffix.includes('evening');
    const am = suffix.startsWith('am') || suffix.includes('ma') || suffix.includes('morning');
    if (pm && h < 12) h += 12;
    if (am && h === 12) h = 0;
    if ((pm || am) && parseInt(match[1], 10) > 12) continue;
    // Avoid things like "10:30" inside a date-ish "2027-10-30"? Regex boundary already prevents most.
    out.push({ value: `${pad(h)}:${pad(min)}`, index: match.index, end: match.index + match[0].length });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Choosing the hearing date
//
// A notice usually has several dates: the hearing date, the date the notice was
// printed ("Date: ..."), and sometimes a certificate-of-service date. We only
// return a date when the text gives positive evidence that it's the hearing
// date. Dates labeled as the printed / mailed / service date are never used.
// If nothing qualifies we return null and the person types the date in, which
// is much safer than showing the wrong day.
// ---------------------------------------------------------------------------

const HEARING_KEYWORDS =
  /(scheduled|hearing|appear|audiencia|comparecer|programad[ao]|court date|cita|corte)/gi;

/** Labels that mark a date as the notice's own date, not the hearing date. */
const ISSUE_DATE_LABEL =
  /\b(date|dated|issued|mailed|served|date of service|fecha|fecha de (?:env[ií]o|emisi[oó]n|notificaci[oó]n)|enviad[ao]|emitid[ao])\s*[:;.]?\s*$/i;

const SERVICE_SECTION = /certificate\s+of\s+service|certificado\s+de\s+(?:notificaci[oó]n|servicio|entrega)/i;

function keywordPositions(text: string, re: RegExp): number[] {
  const pos: number[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags);
  while ((m = r.exec(text))) pos.push(m.index + m[0].length);
  return pos;
}

function lineStart(text: string, index: number): number {
  return text.lastIndexOf('\n', index - 1) + 1;
}

/** True when a date is labeled as the notice's printed/mailed/service date. */
export function isIssueDate(text: string, d: { index: number }): boolean {
  const start = lineStart(text, d.index);
  const before = text.slice(start, d.index);
  if (ISSUE_DATE_LABEL.test(before)) return true;
  // Label alone on the line above: "Date:\n11/02/2026"
  if (!before.trim()) {
    const prevStart = lineStart(text, start - 1);
    const prev = text.slice(prevStart, Math.max(prevStart, start - 1));
    if (/^\s*(date|dated|fecha)\s*[:;.]?\s*$/i.test(prev)) return true;
  }
  const service = text.search(SERVICE_SECTION);
  return service !== -1 && d.index > service;
}

function pickHearingDate(text: string, dates: Found<string>[], times: Found<string>[]): Found<string> | null {
  const hearingKw = keywordPositions(text, HEARING_KEYWORDS);
  let best: Found<string> | null = null;
  let bestScore = 0;
  for (const d of dates) {
    if (isIssueDate(text, d)) continue;
    let score = 0;
    if (hearingKw.some((p) => d.index >= p && d.index - p <= 120)) score += 3;
    if (times.some((t) => t.index >= d.end && t.index - d.end <= 40)) score += 2;
    if (/\b(on|el|for|para|para el)\s*:?\s*$/i.test(text.slice(Math.max(0, d.index - 12), d.index))) score += 2;
    // Require positive evidence. Ties go to the later date.
    if (score > bestScore || (score === bestScore && score > 0 && best && d.value > best.value)) {
      best = d;
      bestScore = score;
    }
  }
  return best;
}

function pickTime(times: Found<string>[], date: Found<string> | null): string | null {
  if (times.length === 0) return null;
  if (!date) return times.length === 1 ? times[0].value : null;
  let best: Found<string> | null = null;
  let bestDist = Infinity;
  for (const t of times) {
    const dist = t.index >= date.end ? t.index - date.end : (date.index - t.end) * 2;
    if (dist < bestDist) {
      best = t;
      bestDist = dist;
    }
  }
  return best && bestDist <= 200 ? best.value : null;
}

// ---------------------------------------------------------------------------
// Choosing the court address
//
// A notice usually shows two addresses: the court's, and the person's own
// mailing address (under "To:" and their name). The person's address must
// never be shown as the court address. We find every "City, ST 12345", rebuild
// the address around it, throw out any that look like the person's own, and
// keep the court address only when there is positive evidence (it follows "at:"
// / "Location:" after the hearing date, or sits under "Immigration Court").
// ---------------------------------------------------------------------------

/** "City, ST 12345" — the state and ZIP may wrap onto the next line in OCR text. */
const CITY_STATE_ZIP = /([A-Za-z][A-Za-z.' ]{1,30}?),?[ \t]*\n?[ \t]*([A-Z]{2})\.?,?\s+(\d{5})(?:-\d{4})?(?!\d)/g;
const ADDRESS_WORDS =
  /\d|floor|fl\.|suite|ste\.?|room|rm\.?|plaza|street|st\.|ave|avenue|blvd|boulevard|road|rd\.|drive|dr\.|way|lane|ln\.|piso|sala|calle|oficina|p\.?o\.? box/i;
const PLACE_LABEL = /(?:\bat|\ben|\blocation|\bubicaci[oó]n|\blugar|\bdirecci[oó]n|\baddress)\s*[:;]?(?:\s+|$)/gi;

/** Text after a place label that starts like a street address (a number that isn't a clock time). */
function startsLikeStreet(s: string): boolean {
  return /^\s*\d/.test(s) && !/^\s*\d{1,2}:\d{2}/.test(s);
}

/** The text after the last place label on a line, if it starts like a street address. */
function afterPlaceLabel(line: string): string | null {
  const labels = [...line.matchAll(new RegExp(PLACE_LABEL.source, 'gi'))];
  for (let i = labels.length - 1; i >= 0; i--) {
    const rest = line.slice(labels[i].index! + labels[i][0].length);
    if (startsLikeStreet(rest)) return rest;
  }
  return null;
}
/** Text from another column that OCR glued onto the end of an address line. */
const OTHER_COLUMN = /\s+(?:date|dated|fecha|riders?|a-?\s?number|n[uú]mero\s+a|file)\b.*$/i;
const RESPONDENT_LABEL = /^\s*(?:to|para|respondent|demandado|encuestado)\b\s*(?:name)?\s*[:;.]?/i;
/** A name line as notices print it: "DOE, JANE" / "GARCIA LOPEZ, MARIA E". */
const NAME_LINE = /^[A-ZÁÉÍÓÚÑ'.-]+(?:\s[A-ZÁÉÍÓÚÑ'.-]+)*,\s*[A-ZÁÉÍÓÚÑ'.-]+(?:\s[A-ZÁÉÍÓÚÑ'.-]+)*$/;

interface AddressCandidate {
  text: string;
  start: number;
  end: number;
  respondent: boolean;
  score: number;
}

function findAddressCandidates(text: string, hearingDate: Found<string> | null): AddressCandidate[] {
  const out: AddressCandidate[] = [];
  const re = new RegExp(CITY_STATE_ZIP.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const cityStart = m.index + (m[0].length - m[0].trimStart().length);
    const end = m.index + m[0].length;
    let start = lineStart(text, cityStart);
    let labeled = false;

    // Text before the city on the same line ("... at 26 FEDERAL PLAZA, ").
    const prefix = text.slice(start, cityStart);
    const afterLabel = afterPlaceLabel(prefix);
    if (afterLabel !== null) {
      start = cityStart - afterLabel.length;
      labeled = true;
    } else if (prefix.trim() && !ADDRESS_WORDS.test(prefix)) {
      start = cityStart; // unrelated words before the city
    }

    // Walk back over up to 3 earlier lines that look like street / floor / room.
    const lines: string[] = [];
    let cursor = lineStart(text, start);
    let skippedBlank = false;
    while (!labeled && lines.length < 3 && cursor > 0) {
      const prevStart = lineStart(text, cursor - 1);
      const raw = text.slice(prevStart, cursor - 1);
      const line = raw.replace(OTHER_COLUMN, '').trim();
      if (!line) {
        if (skippedBlank) break;
        skippedBlank = true;
        cursor = prevStart;
        continue;
      }
      const rest = afterPlaceLabel(line);
      if (rest !== null) {
        lines.unshift(rest.trim());
        labeled = true;
        cursor = prevStart;
        break;
      }
      // A line ending in "at:" / "Location:" means the address starts on the next line.
      if (/(?:\bat|\ben|location|ubicaci[oó]n|lugar|direcci[oó]n|address)\s*[:;]?\s*$/i.test(line)) break;
      if (!ADDRESS_WORDS.test(line) || line.length > 90 || RESPONDENT_LABEL.test(line) || NAME_LINE.test(line)) break;
      lines.unshift(line);
      cursor = prevStart;
    }
    const blockStart = lines.length ? cursor : start;

    const sameLine = text.slice(start, end).replace(/\s*\n\s*/g, ' ').replace(OTHER_COLUMN, '').trim();
    const parts = [...lines, sameLine].map((l) => l.replace(/[,;]\s*$/, '').trim()).filter(Boolean);
    // "26 FEDERAL PLAZA, ROOM 1237, NEW YORK, NY 10278" → put the city line on its own line.
    const joined = parts.join('\n').replace(/,\s*([A-Za-z][A-Za-z.' ]{1,30},?\s+[A-Z]{2}\.?,?\s+\d{5}(?:-\d{4})?)$/, '\n$1');

    // Context: the lines just above the address, and the start of its own line.
    const above = text.slice(Math.max(0, lineStart(text, Math.max(0, blockStart - 1)) - 200), blockStart);
    const aboveLines = above.split('\n').map((l) => l.trim()).filter(Boolean).slice(-3);
    const ownLine = text.slice(lineStart(text, blockStart), blockStart);
    const firstLine = joined.split('\n')[0];
    const respondent =
      !labeled &&
      (RESPONDENT_LABEL.test(ownLine) ||
        RESPONDENT_LABEL.test(firstLine) ||
        aboveLines.slice(-2).some((l) => NAME_LINE.test(l.replace(OTHER_COLUMN, '').replace(RESPONDENT_LABEL, '').trim())) ||
        aboveLines.some((l) => RESPONDENT_LABEL.test(l)));

    let score = 0;
    const labelBefore = /(?:\bat|\ben|location|ubicaci[oó]n|lugar|direcci[oó]n|address)\s*[:;]?\s*$/i;
    if (labeled || (aboveLines.length && labelBefore.test(aboveLines[aboveLines.length - 1]))) score += 5;
    if (hearingDate && blockStart >= hearingDate.index && blockStart - hearingDate.end < 400) score += 3;
    if (aboveLines.slice(-2).some((l) => /immigration court|corte de inmigraci[oó]n|tribunal de inmigraci[oó]n/i.test(l))) score += 2;

    out.push({ text: joined, start: blockStart, end, respondent, score });
  }
  return out;
}

function normalizeAddress(a: string): string {
  return a.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function pickCourtAddress(text: string, hearingDate: Found<string> | null): string | null {
  const candidates = findAddressCandidates(text, hearingDate);
  const respondentZips = new Set(
    candidates.filter((c) => c.respondent).map((c) => normalizeAddress(c.text)),
  );
  const court = candidates
    .filter((c) => !c.respondent && c.score > 0 && !respondentZips.has(normalizeAddress(c.text)))
    .sort((a, b) => b.score - a.score || b.text.length - a.text.length || a.start - b.start);
  if (court.length) return court[0].text;
  if (candidates.length) return null; // only the person's own address (or no evidence): leave it blank
  // Spoken/typed descriptions: "the court is at 26 Federal Plaza in New York".
  const m = text.match(/\b(?:at|en)\s*:?\s+(\d+[^\n.]{5,80})/i);
  return m ? m[1].trim() : null;
}

export function detectNoticeType(text: string): NoticeType {
  if (/notice\s+of\s+(?:in[-\s]?person\s+|internet[-\s]?based\s+|video\s+|telephonic\s+)?(?:master\s+|individual\s+)?hearing|aviso\s+de\s+audiencia|notificaci[oó]n\s+de\s+audiencia/i.test(text))
    return 'notice_of_hearing';
  if (/notice\s+to\s+appear|\bI[-\s]?862\b|aviso\s+de\s+comparecencia|notificaci[oó]n\s+de\s+comparecencia/i.test(text))
    return 'notice_to_appear';
  if (/order\s+of\s+the\s+immigration\s+judge|orden\s+del\s+juez|decision\s+(?:and\s+order\s+)?of\s+the\s+immigration\s+judge/i.test(text))
    return 'judge_order';
  return 'unknown';
}

export function detectHearingType(text: string): HearingType {
  // Match the hearing's own label, not boilerplate such as
  // "an attorney or other individual authorized to practice".
  if (/\bindividual\s+(?:calendar\s+|merits\s+)?hearing|\bmerits\s+hearing|audiencia\s+individual|audiencia\s+de\s+m[eé]ritos|hearing\s+type\s*:\s*individual/i.test(text))
    return 'individual';
  if (/\bmaster\b|calendario\s+principal|audiencia\s+preliminar|primera\s+audiencia|first\s+hearing/i.test(text)) return 'master';
  return 'unknown';
}

export function findANumber(text: string): string | null {
  const m = text.match(
    /\b(?:A[-\s]?(?:number|no\.?|#)?|alien\s+(?:registration\s+)?(?:number|no\.?)|n[uú]mero\s+A|file\s+no\.?)\s*[:#]?\s*A?[-\s]?(\d{3})[-\s]?(\d{3})[-\s]?(\d{3})\b/i,
  );
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const bare = text.match(/\bA[-\s]?(\d{3})[-\s](\d{3})[-\s](\d{3})\b/);
  if (bare) return `${bare[1]}-${bare[2]}-${bare[3]}`;
  // Two-column layouts put the label and the number on different lines.
  // 3-3-3 digits is the A-Number shape (phone numbers are 3-3-4).
  if (/A-?\s?Number|N[uú]mero\s+A|Alien\s+(?:Registration\s+)?N/i.test(text)) {
    const loose = text.match(/(?<![\d-])(\d{3})-(\d{3})-(\d{3})(?![\d-])/);
    if (loose) return `${loose[1]}-${loose[2]}-${loose[3]}`;
  }
  return null;
}

export function extractNoticeFacts(text: string, today = new Date()): NoticeFacts {
  const clean = text.replace(/ /g, ' ').replace(/[ \t]+/g, ' ').replace(/\r\n?/g, '\n');
  const dates = findDates(clean, today);
  const times = findTimes(clean).filter(
    // Ignore "times" that are really part of a date we already matched.
    (t) => !dates.some((d) => t.index >= d.index && t.end <= d.end),
  );
  const hearingDate = pickHearingDate(clean, dates, times);
  const dateToBeSet =
    /(to\s+be\s+(?:set|determined)|\bTBD\b|\bTBA\b|por\s+determinar|por\s+fijar|se\s+fijar[aá])/i.test(clean);

  return {
    noticeType: detectNoticeType(clean),
    hearingType: detectHearingType(clean),
    date: hearingDate ? hearingDate.value : null,
    time: pickTime(times, hearingDate),
    dateToBeSet: dateToBeSet && !hearingDate,
    courtAddress: pickCourtAddress(clean, hearingDate),
    remote: /webex|internet[-\s]?based|video\s?conferenc|videoconferencia|por\s+internet|por\s+video|virtual|remote|remota|teleconferenc/i.test(clean),
    aNumber: findANumber(clean),
  };
}
