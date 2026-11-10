import { useState } from 'react';
import type { Lang } from '../lib/i18n';
import { TOOLS, TOOLS_DRAFT } from '../lib/toolsText';

/** Red "draft — needs attorney review" banner for the new tools. */
export function ToolDraftBanner({ lang }: { lang: Lang }) {
  if (!TOOLS_DRAFT) return null;
  const t = TOOLS[lang];
  return (
    <div className="draft-banner" role="note">
      <strong>{t.draftBadge}</strong>
      <span>{t.draftNotice}</span>
    </div>
  );
}

export function InfoNotAdvice({ lang }: { lang: Lang }) {
  return <p className="warn">{TOOLS[lang].infoNotAdvice}</p>;
}

/** Link to an official site. Opens in a new tab and sends no referrer. */
export function ExtLink({ href, children, lang }: { href: string; children: React.ReactNode; lang: Lang }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children} ↗<span className="sr-only"> {TOOLS[lang].openNewTab}</span>
    </a>
  );
}

/** Copies text to the clipboard only when the user taps the button. */
export function CopyButton({ text, lang, className = 'btn' }: { text: string; lang: Lang; className?: string }) {
  const t = TOOLS[lang];
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState('copied');
    } catch {
      setState('failed');
    }
    setTimeout(() => setState('idle'), 2500);
  }
  return (
    <>
      <button type="button" className={className} onClick={copy} disabled={!text.trim()}>
        {state === 'copied' ? `✓ ${t.copied}` : `📋 ${t.copy}`}
      </button>
      {state === 'failed' && (
        <span className="error" role="alert">
          {t.copyFailed}
        </span>
      )}
      <span className="sr-only" aria-live="polite">
        {state === 'copied' ? t.copied : ''}
      </span>
    </>
  );
}

export function scrollToHelp() {
  document.getElementById('help-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
