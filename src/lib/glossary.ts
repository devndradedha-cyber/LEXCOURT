/**
 * Glossary: which words in the app's text are linked to a plain-language
 * meaning. Matching is per language, and also matches the English term in
 * brackets that the Hindi, Punjabi and Urdu text keeps (for example
 * "(Notice to Appear)").
 */
import type { Lang } from './i18n';
import type { TermId } from './featuresText';

/** Words or phrases that link to each term, per language (longest first is not required). */
const PATTERNS: Record<Lang, Partial<Record<TermId, string[]>>> = {
  en: {
    removal: ['removal', 'removed'],
    relief: ['relief'],
    asylum: ['asylum'],
    inAbsentia: ['in absentia'],
    noticeToAppear: ['Notice to Appear'],
    masterHearing: ['master calendar hearing', 'master hearing'],
    individualHearing: ['individual (merits) hearing', 'individual hearing', 'merits hearing'],
    aNumber: ['A-Number'],
    accreditedRep: ['accredited representative', 'DOJ-accredited representative'],
    appeal: ['appeal'],
  },
  es: {
    removal: ['remoción', 'removido', 'removida'],
    relief: ['alivio'],
    asylum: ['asilo'],
    inAbsentia: ['in absentia'],
    noticeToAppear: ['Notificación de Comparecencia', 'Notice to Appear'],
    masterHearing: ['audiencia de calendario principal', 'master calendar hearing'],
    individualHearing: ['audiencia individual'],
    aNumber: ['Número A', 'A-Number'],
    accreditedRep: ['representante acreditado'],
    appeal: ['apelación', 'apelar'],
  },
  hi: {
    removal: ['देश से निकालने', 'removal'],
    relief: ['राहत'],
    asylum: ['शरण'],
    inAbsentia: ['in absentia'],
    noticeToAppear: ['हाज़िर होने का नोटिस', 'हाज़िर होने के नोटिस', 'Notice to Appear'],
    masterHearing: ['मास्टर कैलेंडर सुनवाई', 'master calendar hearing'],
    individualHearing: ['व्यक्तिगत सुनवाई'],
    aNumber: ['ए-नंबर', 'A-Number'],
    accreditedRep: ['मान्यता प्राप्त प्रतिनिधि'],
    appeal: ['अपील'],
  },
  pa: {
    removal: ['ਦੇਸ਼ ’ਚੋਂ ਕੱਢਣ', 'removal'],
    relief: ['ਰਾਹਤ'],
    asylum: ['ਸ਼ਰਨ'],
    inAbsentia: ['in absentia'],
    noticeToAppear: ['ਹਾਜ਼ਰ ਹੋਣ ਦਾ ਨੋਟਿਸ', 'ਹਾਜ਼ਰ ਹੋਣ ਦੇ ਨੋਟਿਸ', 'Notice to Appear'],
    masterHearing: ['ਮਾਸਟਰ ਕੈਲੰਡਰ ਸੁਣਵਾਈ', 'master calendar hearing'],
    individualHearing: ['ਵਿਅਕਤੀਗਤ ਸੁਣਵਾਈ'],
    aNumber: ['ਏ-ਨੰਬਰ', 'A-Number'],
    accreditedRep: ['ਮਾਨਤਾ ਪ੍ਰਾਪਤ ਪ੍ਰਤੀਨਿਧੀ'],
    appeal: ['ਅਪੀਲ'],
  },
  ur: {
    removal: ['ملک سے نکالنے', 'removal'],
    relief: ['ریلیف'],
    asylum: ['پناہ'],
    inAbsentia: ['in absentia'],
    noticeToAppear: ['حاضر ہونے کا نوٹس', 'حاضر ہونے کے نوٹس', 'Notice to Appear'],
    masterHearing: ['ماسٹر کیلنڈر سماعت', 'master calendar hearing'],
    individualHearing: ['انفرادی سماعت'],
    aNumber: ['اے نمبر', 'A-Number'],
    accreditedRep: ['منظور شدہ نمائندہ', 'منظور شدہ نمائندے'],
    appeal: ['اپیل'],
  },
};

export interface Segment {
  text: string;
  term?: TermId;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cache = new Map<Lang, RegExp>();

function matcher(lang: Lang): { re: RegExp; byText: Map<string, TermId> } {
  const byText = new Map<string, TermId>();
  for (const [id, words] of Object.entries(PATTERNS[lang]) as [TermId, string[]][])
    for (const w of words) byText.set(w.normalize('NFC').toLowerCase(), id);
  if (!cache.has(lang)) {
    const alts = [...byText.keys()].sort((a, b) => b.length - a.length).map(escape);
    // Not inside a longer word, in any script (\b does not work for Devanagari, Gurmukhi or Urdu).
    cache.set(lang, new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])(${alts.join('|')})(?![\\p{L}\\p{M}\\p{N}])`, 'giu'));
  }
  return { re: cache.get(lang)!, byText };
}

/**
 * Split text into plain pieces and glossary terms. Only the first appearance
 * of each term in the text is linked, so a paragraph isn't full of underlines.
 */
export function segmentGlossary(text: string, lang: Lang): Segment[] {
  const { re, byText } = matcher(lang);
  const normalized = text.normalize('NFC');
  const out: Segment[] = [];
  const seen = new Set<TermId>();
  let last = 0;
  for (const m of normalized.matchAll(new RegExp(re.source, re.flags))) {
    const id = byText.get(m[1].toLowerCase());
    if (!id || seen.has(id)) continue;
    seen.add(id);
    if (m.index! > last) out.push({ text: normalized.slice(last, m.index) });
    out.push({ text: m[1], term: id });
    last = m.index! + m[1].length;
  }
  if (last < normalized.length) out.push({ text: normalized.slice(last) });
  return out;
}

/** Terms that appear in a text (used by tests and the review document). */
export function termsIn(text: string, lang: Lang): TermId[] {
  return segmentGlossary(text, lang).flatMap((s) => (s.term ? [s.term] : []));
}
