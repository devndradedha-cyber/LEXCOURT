/**
 * Feedback moderation rules, shared by the app (to warn people before they
 * send) and the server (to enforce). Pure functions, no I/O.
 *
 * ⚠️ DRAFT — these rules need attorney review. Automatic detection is a first
 * filter only: every comment that could be published is also reviewed by an
 * administrator.
 */

export type FeedbackLang = 'en' | 'es' | 'hi' | 'pa' | 'ur';

// ---------------------------------------------------------------------------
// Sensitive details (never collected): A-Numbers, case/receipt numbers,
// Social Security numbers, phone numbers, email addresses, immigration status.
// ---------------------------------------------------------------------------

export type SensitiveKind = 'aNumber' | 'caseNumber' | 'ssn' | 'phone' | 'email' | 'status';

const SENSITIVE: [SensitiveKind, RegExp][] = [
  ['email', /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[A-Za-z]{2,}/gu],
  ['ssn', /(?<!\d)\d{3}-\d{2}-\d{4}(?!\d)/g],
  // USCIS receipt numbers (3 letters + 10 digits) and "case/receipt/file number …"
  ['caseNumber', /\b(?:EAC|WAC|LIN|SRC|NBC|MSC|IOE|YSC|NSC|TSC|VSC|CSC)\s?\d{10}\b/gi],
  ['caseNumber', /\b(?:case|file|receipt|caso|expediente|recibo)\s*(?:no\.?|number|num\.?|número|#)?\s*[:#]?\s*[A-Z]{0,3}[\s-]?\d[\d\s-]{4,}\d/giu],
  ['aNumber', /(?<![\p{L}\p{N}])A[\s-]?\d{2,3}[\s-]?\d{3}[\s-]?\d{3}(?!\d)/giu],
  ['aNumber', /(?<![\d-])\d{3}-\d{3}-\d{3}(?![\d-])/g],
  ['aNumber', /(?<!\d)\d{8,9}(?!\d)/g],
  ['phone', /(?<![\d-])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}(?![\d-])/g],
  [
    'status',
    new RegExp(
      [
        // English
        'undocumented', 'illegal(?:ly)?(?:\\s+(?:immigrant|alien))?', '(?:no|without)\\s+papers', 'overstay(?:ed)?', 'visa\\s+(?:expired|overstay)',
        'out\\s+of\\s+status', 'DACA', 'TPS', 'green\\s*card(?:\\s+holder)?', 'asylee', 'refugee\\s+status', 'my\\s+(?:immigration\\s+)?status',
        // Spanish
        'indocumentad[oa]s?', 'sin\\s+papeles', 'ilegal(?:es)?', 'tarjeta\\s+verde', 'residente\\s+permanente', 'mi\\s+estatus', 'estatus\\s+migratorio',
        // Hindi
        'बिना\\s+कागज़?', 'अवैध', 'ग्रीन\\s+कार्ड', 'वीज़ा\\s+ख़त्म', 'मेरा\\s+स्टेटस',
        // Punjabi
        'ਬਿਨਾਂ\\s+ਕਾਗ਼ਜ਼', 'ਗ਼ੈਰਕਾਨੂੰਨੀ', 'ਗ੍ਰੀਨ\\s+ਕਾਰਡ', 'ਮੇਰਾ\\s+ਸਟੇਟਸ',
        // Urdu
        'غیر\\s*قانونی', 'بغیر\\s+کاغذات', 'گرین\\s+کارڈ', 'میرا\\s+اسٹیٹس',
      ]
        .map((p) => p.normalize('NFC'))
        .map((p) => `(?<![\\p{L}\\p{M}])${p}(?![\\p{L}\\p{M}])`)
        .join('|'),
      'giu',
    ),
  ],
];

export interface SensitiveMatch {
  kind: SensitiveKind;
  text: string;
  index: number;
}

/** Public phone numbers people may mention: the court's case information lines. */
const PUBLIC_NUMBERS = ['8008987180', '8008281120'];

export function findSensitive(text: string): SensitiveMatch[] {
  const t = text.normalize('NFC');
  const out: SensitiveMatch[] = [];
  for (const [kind, re] of SENSITIVE)
    for (const m of t.matchAll(new RegExp(re.source, re.flags)))
      if (kind === 'phone' && PUBLIC_NUMBERS.includes(m[0].replace(/\D/g, '').replace(/^1(?=\d{10}$)/, ''))) continue;
      else if (!out.some((o) => m.index! < o.index + o.text.length && o.index < m.index! + m[0].length))
        out.push({ kind, text: m[0], index: m.index! });
  return out.sort((a, b) => a.index - b.index);
}

/** Replace sensitive details with a placeholder (server-side safety net). */
export function removeSensitive(text: string, placeholder = '[removed]'): { text: string; kinds: SensitiveKind[] } {
  const t = text.normalize('NFC');
  const found = findSensitive(t);
  let out = '';
  let last = 0;
  for (const f of found) {
    out += t.slice(last, f.index) + placeholder;
    last = f.index + f.text.length;
  }
  return { text: out + t.slice(last), kinds: [...new Set(found.map((f) => f.kind))] };
}

// ---------------------------------------------------------------------------
// Fraud / scam / misconduct accusations: never published; the person is
// pointed to "Report a problem" instead.
// ---------------------------------------------------------------------------

const SCAM = new RegExp(
  [
    'fraud(?:ulent|ster)?', 'scam(?:s|med|mer|mers)?', 'stole', 'stolen', 'cheat(?:ed|ing)?', 'ripped\\s+off', 'rip-?off', 'con\\s+artist',
    'took\\s+my\\s+money', 'fake\\s+(?:lawyer|attorney)', 'misconduct', 'malpractice', 'unethical', 'swindl(?:e|ed|er)',
    'fraude', 'estaf(?:a|as|ar|ador|adora|adores|aron|ó|aste)', 'me\\s+rob(?:ó|aron)', 'me\\s+engañ(?:ó|aron)', 'abogad[oa]\\s+falso', 'mala\\s+conducta', 'negligencia',
    'धोखा', 'धोखाधड़ी', 'ठगी', 'ठग', 'फ़्रॉड', 'फ्रॉड', 'स्कैम',
    'ਧੋਖਾ', 'ਧੋਖਾਧੜੀ', 'ਠੱਗੀ', 'ਠੱਗ', 'ਫਰਾਡ', 'ਫ਼ਰਾਡ', 'ਸਕੈਮ',
    'دھوکہ', 'دھوکا', 'دھوکے', 'فراڈ', 'ٹھگ', 'ٹھگی', 'اسکیم\\s+کی',
  ]
    .map((p) => p.normalize('NFC'))
    .map((p) => `(?<![\\p{L}\\p{M}])${p}(?![\\p{L}\\p{M}])`)
    .join('|'),
  'iu',
);

export function mentionsScam(text: string): boolean {
  return SCAM.test(text.normalize('NFC'));
}

// ---------------------------------------------------------------------------
// Names of people and law firms: removed before anything could be published.
// Over-removal is fine: an administrator reviews every public comment.
// ---------------------------------------------------------------------------

export const NAME_PLACEHOLDER: Record<FeedbackLang, string> = {
  en: '[name removed]',
  es: '[nombre eliminado]',
  hi: '[नाम हटाया गया]',
  pa: '[ਨਾਂ ਹਟਾਇਆ ਗਿਆ]',
  ur: '[نام ہٹا دیا گیا]',
};

/** Capitalised phrases that are not people or firms. */
const ALLOW = new Set(
  [
    'LexCourt', 'New York', 'Los Angeles', 'San Francisco', 'San Diego', 'San Antonio', 'Las Vegas', 'New Jersey', 'New Mexico', 'North Carolina',
    'South Carolina', 'United States', 'Immigration Court', 'Notice to Appear', 'Notice of Hearing', 'Board of Immigration Appeals',
    'Department of Justice', 'Homeland Security', 'Google Calendar', 'Automated Case Information', 'Report a Problem', 'Check a Representative',
    'Words to Know', 'Estados Unidos', 'Corte de Inmigración', 'Puerto Rico', 'Federal Plaza',
  ].map((s) => s.toLowerCase()),
);

const CAP = "\\p{Lu}[\\p{Ll}'’\\-]+";
const NAME_WORDS = `${CAP}(?:\\s+(?:de|del|de la|van|von|da|di|la|le|bin|al)?\\s*${CAP}){0,3}`;
const TITLES =
  "(?:Mr|Mrs|Ms|Miss|Dr|Atty|Attorney|Lawyer|Counsel|Judge|Esq|Abogad[oa]|Licenciad[oa]|Lic|Lcdo|Lcda|Sr|Sra|Srta|Don|Doña|Notari[oa]|Consultant|Consultor[a]?)";
/** Role words in either case (the rule itself must stay case-sensitive so names are still capitalised). */
const ROLE_WORDS = `(?:${['lawyer', 'attorney', 'notario', 'notaria', 'consultant', 'representative', 'paralegal', 'abogado', 'abogada', 'consultor', 'consultora', 'representante', 'licenciado', 'licenciada']
  .map((w) => `[${w[0]}${w[0].toUpperCase()}]${w.slice(1)}`)
  .join('|')})`;

/** Words that can start a capitalised run without being part of a name. */
const STOP = new Set(['the', 'my', 'our', 'a', 'an', 'el', 'la', 'los', 'las', 'mi', 'mis', 'un', 'una', 'i', 'this', 'it', 'very', 'muy', 'thank', 'thanks', 'gracias', 'and', 'y', 'great', 'good', 'excellent', 'excelente', 'super']);
const TITLE_WORD = new RegExp(`^${TITLES}\\.?$`, 'u');

/** Latin-script patterns, most specific first. Each removes the whole match except a kept prefix. */
const LATIN_RULES: { re: RegExp; keep?: number; generic?: boolean }[] = [
  // Firms: "Law Office(s) of X", "X & Associates", "X Law Firm/Group/PC/LLP", "X, LLC", "Bufete X", "X Abogados", "X Immigration Services"
  { re: new RegExp(`\\b(?:the\\s+)?Law\\s+Offices?\\s+of\\s+${NAME_WORDS}`, 'gu') },
  { re: new RegExp(`${NAME_WORDS}\\s*(?:&|and|y)\\s*(?:Associates|Asociados|Partners)`, 'gu') },
  { re: new RegExp(`${NAME_WORDS}\\s+(?:Law(?:\\s+(?:Firm|Group|Office|Center|Centre))?|Legal(?:\\s+Services)?|Immigration(?:\\s+(?:Services|Law|Center|Consultants?))?|Abogados|Notar[íi]a)(?:,?\\s+(?:PC|P\\.C\\.|PLLC|LLP|LLC|Inc\\.?))?`, 'gu') },
  { re: new RegExp(`${NAME_WORDS},?\\s+(?:PC|P\\.C\\.|PLLC|LLP|LLC|Inc\\.?)(?![\\p{L}])`, 'gu') },
  { re: new RegExp(`\\b(?:Bufete|Despacho|Firma)\\s+${NAME_WORDS}`, 'gu') },
  // Title + name: "Attorney Smith", "Lic. García" (title kept)
  { re: new RegExp(`\\b(${TITLES}\\.?\\s+)${NAME_WORDS}`, 'gu'), keep: 1 },
  // Role word + name: "my lawyer John Smith", "el abogado Pérez" (role kept)
  { re: new RegExp(`\\b(${ROLE_WORDS}\\s+(?:named\\s+|called\\s+|llamad[oa]\\s+)?)${NAME_WORDS}`, 'gu'), keep: 1 },
  // Any other run of two or more capitalised words ("Juan Pérez helped me").
  { re: new RegExp(`${CAP}\\.?(?:\\s+(?:de|del|de la|van|von|da|di|bin|al)?\\s*${CAP}\\.?){1,3}`, 'gu'), generic: true },
];

/** Hindi, Punjabi and Urdu: honorifics or titles next to a name. */
const INDIC_RULES: { re: RegExp; keep?: number; keepEnd?: boolean }[] = [
  // Before the name: श्री / वकील / ਸ੍ਰੀ / ਵਕੀਲ / جناب / وکیل … + one or two words
  {
    re: new RegExp(
      `((?:श्री|श्रीमती|सुश्री|वकील|एडवोकेट|अधिवक्ता|नोटारियो|ਸ੍ਰੀ|ਸ਼੍ਰੀ|ਸ੍ਰੀਮਤੀ|ਵਕੀਲ|ਐਡਵੋਕੇਟ|ਨੋਟਾਰੀਓ|جناب|محترم|محترمہ|وکیل|ایڈووکیٹ|نوٹاریو)\\s+)[\\p{L}\\p{M}]+(?:\\s+[\\p{L}\\p{M}]+)?`.normalize('NFC'),
      'gu',
    ),
    keep: 1,
  },
  // After the name: शर्मा जी / ਸਿੰਘ ਜੀ / خان صاحب
  { re: new RegExp(`[\\p{L}\\p{M}]+(\\s+(?:जी|साहब|ਜੀ|ਸਾਹਿਬ|صاحب|صاحبہ))(?![\\p{L}\\p{M}])`.normalize('NFC'), 'gu'), keepEnd: true },
];

export function removeNames(text: string, lang: FeedbackLang): { text: string; removed: number } {
  const placeholder = NAME_PLACEHOLDER[lang];
  let removed = 0;
  let out = text.normalize('NFC');
  const apply = (re: RegExp, keep?: number, keepEnd?: boolean, generic?: boolean) => {
    out = out.replace(re, (match: string, ...groups: unknown[]) => {
      if (ALLOW.has(match.toLowerCase().replace(/^(?:the|my|el|la)\s+/i, ''))) return match;
      if (generic) {
        // Leading "The/My/El…" and titles are not names; what is left must still be two or more words.
        const words = match.split(/\s+/);
        let i = 0;
        while (i < words.length && (STOP.has(words[i].toLowerCase()) || TITLE_WORD.test(words[i]))) i++;
        const rest = words.slice(i);
        if (rest.length < 2 || rest.some((w) => TITLE_WORD.test(w)) || ALLOW.has(rest.join(' ').toLowerCase())) return match;
        removed++;
        return [...words.slice(0, i), placeholder].join(' ');
      }
      removed++;
      const g = groups.filter((x) => typeof x === 'string') as string[];
      if (keep) return `${g[0]}${placeholder}`;
      if (keepEnd) return `${placeholder}${g[0]}`;
      return placeholder;
    });
  };
  for (const r of INDIC_RULES) apply(r.re, r.keep, r.keepEnd);
  for (const r of LATIN_RULES) apply(r.re, r.keep, undefined, r.generic);
  return { text: out, removed };
}

// ---------------------------------------------------------------------------
// What could be published
// ---------------------------------------------------------------------------

export type Flag = 'names_removed' | 'sensitive_removed' | 'scam_mentioned';

export interface PublicCandidate {
  /** Text with names and sensitive details removed, or null if it must not be published. */
  publicText: string | null;
  flags: Flag[];
}

export function preparePublic(comment: string, lang: FeedbackLang): PublicCandidate {
  const flags: Flag[] = [];
  if (mentionsScam(comment)) return { publicText: null, flags: ['scam_mentioned'] };
  const s = removeSensitive(comment);
  if (s.kinds.length) flags.push('sensitive_removed');
  const n = removeNames(s.text, lang);
  if (n.removed) flags.push('names_removed');
  return { publicText: n.text, flags };
}
