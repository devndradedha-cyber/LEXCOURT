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

const HEARING_KEYWORDS =
  /(scheduled|hearing|appear|audiencia|comparecer|programad[ao]|court date|cita|corte)/gi;
const ISSUE_DATE_KEYWORDS = /(date\s*:|fecha\s*:|dated|served|mailed|enviad[ao]|certificate of service)/gi;

function keywordPositions(text: string, re: RegExp): number[] {
  const pos: number[] = [];
  let m: RegExpExecArray | null;
  const r = new RegExp(re.source, re.flags);
  while ((m = r.exec(text))) pos.push(m.index + m[0].length);
  return pos;
}

function pickHearingDate(text: string, dates: Found<string>[], times: Found<string>[]): Found<string> | null {
  if (dates.length === 0) return null;
  const hearingKw = keywordPositions(text, HEARING_KEYWORDS);
  const issueKw = keywordPositions(text, ISSUE_DATE_KEYWORDS);
  let best: Found<string> | null = null;
  let bestScore = -Infinity;
  for (const d of dates) {
    let score = 0;
    if (hearingKw.some((p) => d.index >= p && d.index - p <= 120)) score += 3;
    if (issueKw.some((p) => d.index >= p && d.index - p <= 25)) score -= 4;
    if (times.some((t) => Math.abs(t.index - d.end) <= 40)) score += 2;
    if (score > bestScore || (score === bestScore && best && d.value > best.value)) {
      best = d;
      bestScore = score;
    }
  }
  return best;
}

function pickTime(times: Found<string>[], date: Found<string> | null): string | null {
  if (times.length === 0) return null;
  if (!date) return times[0].value;
  let best = times[0];
  let bestDist = Infinity;
  for (const t of times) {
    const dist = t.index >= date.end ? t.index - date.end : (date.index - t.end) * 2;
    if (dist < bestDist) {
      best = t;
      bestDist = dist;
    }
  }
  return bestDist <= 200 ? best.value : times[0].value;
}

const CITY_STATE_ZIP = /^(.*?[A-Za-z][A-Za-z .'-]+),?\s+([A-Z]{2})\.?,?\s+(\d{5})(?:-\d{4})?\s*$/;

function pickCourtAddress(text: string, hearingDate: Found<string> | null): string | null {
  const lines = text.split(/\r?\n/);
  const offsets: number[] = [];
  let acc = 0;
  for (const l of lines) {
    offsets.push(acc);
    acc += l.length + 1;
  }
  const candidates: { lines: string[]; index: number; score: number }[] = [];
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!CITY_STATE_ZIP.test(trimmed)) return;
    // Walk back up to two lines for street / floor / room.
    const block = [trimmed];
    for (let j = i - 1; j >= Math.max(0, i - 2); j--) {
      const prev = lines[j].trim();
      if (!prev) break;
      if (/\d|floor|suite|room|ste\.?|plaza|street|st\.|ave|avenue|blvd|road|rd\.|drive|piso|sala|calle/i.test(prev) && prev.length < 80) {
        // Strip a leading "at:" / "en:" label.
        block.unshift(prev.replace(/^.*?\b(at|en)\s*:\s*/i, ''));
      } else break;
    }
    const index = offsets[i - (block.length - 1)];
    const before = text.slice(Math.max(0, index - 250), index);
    let score = 0;
    if (/immigration court|corte de inmigraci[oó]n|tribunal de inmigraci[oó]n|\bat\s*:|\ben\s*:/i.test(before)) score += 3;
    if (hearingDate && index > hearingDate.index && index - hearingDate.end < 400) score += 3;
    if (/\b(to|para|a)\s*:\s*[^\n]*\n?[^\n]*$/i.test(text.slice(Math.max(0, index - 120), index))) score -= 4;
    candidates.push({ lines: block, index, score });
  });
  if (candidates.length === 0) {
    // Fall back to an "at: ..." phrase on one line (common in spoken/typed descriptions).
    const m = text.match(/\b(?:at|en)\s*:?\s+(\d+[^\n.]{5,80})/i);
    return m ? m[1].trim() : null;
  }
  candidates.sort((a, b) => b.score - a.score || a.index - b.index);
  return candidates[0].lines.join('\n');
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
  if (/\bindividual\b|\bmerits\b|\bm[eé]rito/i.test(text)) return 'individual';
  if (/\bmaster\b|calendario\s+principal|audiencia\s+preliminar|primera\s+audiencia|first\s+hearing/i.test(text)) return 'master';
  return 'unknown';
}

export function findANumber(text: string): string | null {
  const m = text.match(
    /\b(?:A[-\s]?(?:number|no\.?|#)?|alien\s+(?:registration\s+)?(?:number|no\.?)|n[uú]mero\s+A|file\s+no\.?)\s*[:#]?\s*A?[-\s]?(\d{3})[-\s]?(\d{3})[-\s]?(\d{3})\b/i,
  );
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const bare = text.match(/\bA[-\s]?(\d{3})[-\s](\d{3})[-\s](\d{3})\b/);
  return bare ? `${bare[1]}-${bare[2]}-${bare[3]}` : null;
}

export function extractNoticeFacts(text: string, today = new Date()): NoticeFacts {
  const clean = text.replace(/ /g, ' ').replace(/[ \t]+/g, ' ');
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
