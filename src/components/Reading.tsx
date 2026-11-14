import { useEffect, useId, useRef, useState } from 'react';
import { BookOpen, Square, Volume2 } from 'lucide-react';
import { Icon } from './Art';
import { FEATURES, TERM_IDS, type TermId } from '../lib/featuresText';
import { segmentGlossary } from '../lib/glossary';
import { langInfo, type Lang } from '../lib/i18n';
import { speak, speechSupported, stopSpeaking } from '../lib/readAloud';

const SPEAK_EVENT = 'lexcourt-speak';

/** Languages the person agreed to hear with an online voice (this visit only). */
const onlineOk = new Set<string>();

/** Text a screen reader would read in a section: headings, paragraphs, list items. */
function readableText(root: HTMLElement): string {
  const parts: string[] = [];
  root.querySelectorAll<HTMLElement>('h1, h2, h3, h4, p, li, dt, dd').forEach((el) => {
    if (el.closest('[data-no-read]')) return;
    // Skip a paragraph that is inside a list item (the list item is read).
    if (el.tagName === 'P' && el.parentElement?.closest('li, dd')) return;
    const clone = el.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('[data-no-read], button.term-def-close').forEach((n) => n.remove());
    const t = clone.textContent?.trim();
    if (t) parts.push(/[.!?।۔؟:]$/u.test(t) ? t : `${t}.`);
  });
  return parts.join(' ');
}

/**
 * "Listen" button: reads the section it is in aloud, in the selected language,
 * using a voice on the device. Shows a note if there is no such voice.
 */
export function ListenButton({ lang, target }: { lang: Lang; target: React.RefObject<HTMLElement> }) {
  const t = FEATURES[lang].listen;
  const id = useId();
  const [viaHindi, setViaHindi] = useState(false);
  const [state, setState] = useState<'idle' | 'speaking' | 'noVoice' | 'onlineOnly' | 'unsupported'>('idle');

  useEffect(() => {
    const other = (e: Event) => {
      if ((e as CustomEvent).detail !== id) setState((s) => (s === 'speaking' ? 'idle' : s));
    };
    window.addEventListener(SPEAK_EVENT, other);
    return () => window.removeEventListener(SPEAK_EVENT, other);
  }, [id]);

  // Stop when the language changes or the section goes away.
  useEffect(() => {
    setState('idle');
    return () => stopSpeaking();
  }, [lang]);

  async function toggle(agreeOnline = false) {
    if (agreeOnline) onlineOk.add(lang);
    if (state === 'speaking') {
      stopSpeaking();
      setState('idle');
      return;
    }
    if (!speechSupported()) return setState('unsupported');
    const root = target.current;
    if (!root) return;
    window.dispatchEvent(new CustomEvent(SPEAK_EVENT, { detail: id }));
    setState('speaking');
    const result = await speak(
      readableText(root),
      langInfo(lang).speech,
      () => setState((s) => (s === 'speaking' ? 'idle' : s)),
      onlineOk.has(lang),
    );
    setViaHindi(result === 'viaHindi');
    if (result !== 'ok' && result !== 'viaHindi') setState(result);
  }

  return (
    <div className="listen" data-no-read>
      <button type="button" className="btn listen-btn" onClick={() => toggle()} aria-pressed={state === 'speaking'}>
        <Icon as={state === 'speaking' ? Square : Volume2} /> {state === 'speaking' ? t.stop : t.listen}
      </button>
      {state === 'noVoice' && (
        <p className="hint small" role="status">
          {t.noVoice(langInfo(lang).name)}
        </p>
      )}
      {viaHindi && state === 'speaking' && t.viaHindi && (
        <p className="hint small" role="status">
          {t.viaHindi}
        </p>
      )}
      {state === 'onlineOnly' && (
        <div className="hint small" role="status">
          <p>{t.onlineOffer(langInfo(lang).name)}</p>
          <button type="button" className="btn" onClick={() => toggle(true)}>
            {t.useOnline}
          </button>
        </div>
      )}
      {state === 'unsupported' && (
        <p className="hint small" role="status">
          {t.unsupported}
        </p>
      )}
    </div>
  );
}

/**
 * Text with glossary terms underlined. Tapping a term shows its meaning right
 * below; tapping again (or Close) hides it.
 */
export function GlossaryText({ text, lang }: { text: string; lang: Lang }) {
  const g = FEATURES[lang].glossary;
  const [open, setOpen] = useState<TermId | null>(null);
  const base = useId();
  const segments = segmentGlossary(text, lang);
  return (
    <>
      {segments.map((s, i) =>
        s.term ? (
          // An inline span (not <button>) so the line can wrap normally around it.
          <span
            key={i}
            role="button"
            tabIndex={0}
            className="term"
            aria-expanded={open === s.term}
            aria-controls={`${base}-${s.term}`}
            onClick={() => setOpen(open === s.term ? null : s.term!)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(open === s.term ? null : s.term!);
              }
            }}
          >
            {s.text}
          </span>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
      {open && (
        <span className="term-def" id={`${base}-${open}`} role="note" data-no-read>
          <strong>{g.terms[open].term}</strong>
          <span>{g.terms[open].definition}</span>
          <button type="button" className="term-def-close" onClick={() => setOpen(null)}>
            {g.close}
          </button>
        </span>
      )}
    </>
  );
}

/** "Words to know": every glossary term with its meaning. */
export function WordsToKnow({ lang }: { lang: Lang }) {
  const g = FEATURES[lang].glossary;
  const ref = useRef<HTMLDivElement>(null);
  return (
    <details className="card subtle glossary">
      <summary>
        <Icon as={BookOpen} /> {g.title}
      </summary>
      <div ref={ref}>
        <p className="hint small">{g.hint}</p>
        <ListenButton lang={lang} target={ref} />
        <dl>
          {TERM_IDS.map((id) => (
            <div key={id}>
              <dt>{g.terms[id].term}</dt>
              <dd>{g.terms[id].definition}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}
