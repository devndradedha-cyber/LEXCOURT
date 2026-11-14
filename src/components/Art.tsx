import type { LucideIcon } from 'lucide-react';

/** A simple line icon (Lucide), hidden from screen readers: the text next to it says what it means. */
export function Icon({ as: C, size = 22, className }: { as: LucideIcon; size?: number; className?: string }) {
  return <C size={size} strokeWidth={2} aria-hidden="true" focusable="false" className={className ? `icon ${className}` : 'icon'} />;
}

/** Round icon badge used at the top of each result card. */
export function CardIcon({ as, tone = 'teal' }: { as: LucideIcon; tone?: 'teal' | 'coral' | 'navy' }) {
  return (
    <span className={`card-icon ${tone}`} aria-hidden="true">
      <Icon as={as} size={24} />
    </span>
  );
}

/**
 * Welcome illustration: four people of different backgrounds, one holding a
 * notice with a check mark, with speech bubbles in the app's five scripts.
 * Decorative only (hidden from screen readers). Deliberately nothing official:
 * no seals, eagles, flags or government buildings.
 */
export function PeopleIllustration() {
  const navy = '#1E2A5A';
  const line = { stroke: navy, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const face = (x: number, y: number, smile = true) => (
    <>
      <circle cx={x - 6} cy={y} r={1.8} fill={navy} />
      <circle cx={x + 6} cy={y} r={1.8} fill={navy} />
      {smile && <path d={`M${x - 5} ${y + 7} Q${x} ${y + 11} ${x + 5} ${y + 7}`} fill="none" {...line} strokeWidth={1.8} />}
    </>
  );
  const bubble = (x: number, y: number, text: string, lang: string, fontSize = 17) => (
    <g>
      <rect x={x - 19} y={y - 17} width={38} height={30} rx={11} fill="#FFFFFF" stroke="#14B8A6" strokeWidth={2} />
      <path d={`M${x - 5} ${y + 13} L${x - 9} ${y + 21} L${x + 3} ${y + 13}`} fill="#FFFFFF" stroke="#14B8A6" strokeWidth={2} strokeLinejoin="round" />
      <rect x={x - 6} y={y + 10} width={10} height={4} fill="#FFFFFF" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={fontSize} fontWeight={700} fill={navy} lang={lang} style={{ fontFamily: 'inherit' }}>
        {text}
      </text>
    </g>
  );
  return (
    <svg className="hero-art" viewBox="0 0 360 230" aria-hidden="true" focusable="false">
      {/* soft background */}
      <ellipse cx={180} cy={132} rx={170} ry={92} fill="#E6F7F4" />
      <ellipse cx={180} cy={222} rx={150} ry={7} fill="#E8E1D4" />
      <circle cx={42} cy={70} r={6} fill="#FDE7C2" />
      <circle cx={330} cy={92} r={8} fill="#FDE7C2" />

      {bubble(64, 38, 'Aa', 'en')}
      {bubble(126, 22, 'ñ', 'es')}
      {bubble(186, 34, 'अ', 'hi')}
      {bubble(244, 20, 'ਪ', 'pa')}
      {bubble(304, 40, 'ع', 'ur', 19)}

      {/* 1. Woman in a hijab */}
      <path d="M38 222 C38 176 50 158 72 158 C94 158 106 176 106 222 Z" fill="#F2C14E" {...line} />
      <path d="M46 128 C46 96 98 96 98 128 L100 160 C88 170 56 170 44 160 Z" fill="#0F766E" {...line} />
      <circle cx={72} cy={128} r={17} fill="#B97A57" {...line} />
      {face(72, 126)}

      {/* 2. Sikh man in a turban, with a beard */}
      <path d="M116 222 C116 166 130 146 152 146 C174 146 188 166 188 222 Z" fill="#CCFBF1" {...line} />
      <path d="M144 136 L144 148 L160 148 L160 136" fill="#A8704B" {...line} />
      <circle cx={152} cy={114} r={20} fill="#A8704B" {...line} />
      <path d="M133 117 C134 142 170 142 171 117 C163 128 141 128 133 117 Z" fill="#2E2A28" {...line} />
      <path d="M150 124 Q152 126 154 124" fill="none" stroke="#FAF7F2" strokeWidth={1.8} strokeLinecap="round" />
      <path d="M130 110 C126 82 178 82 174 110 C166 100 138 100 130 110 Z" fill={navy} {...line} />
      <path d="M140 92 C150 98 158 98 166 90" fill="none" stroke="#5B6CB0" strokeWidth={2} strokeLinecap="round" />
      <circle cx={146} cy={111} r={1.8} fill={navy} />
      <circle cx={158} cy={111} r={1.8} fill={navy} />

      {/* 3. Woman holding a notice with a check mark */}
      <path d="M198 222 C198 174 210 156 232 156 C254 156 266 174 266 222 Z" fill="#14B8A6" {...line} />
      <circle cx={232} cy={100} r={9} fill="#3B2418" {...line} />
      <circle cx={232} cy={124} r={20} fill="#3B2418" {...line} />
      <circle cx={232} cy={128} r={16} fill="#E3AE85" {...line} />
      <path d="M216 124 C218 108 246 108 248 124 C240 116 224 116 216 124 Z" fill="#3B2418" />
      {face(232, 128)}
      <g transform="rotate(-8 232 186)">
        <rect x={212} y={164} width={40} height={50} rx={5} fill="#FFFFFF" {...line} />
        <path d="M220 176 H244 M220 184 H244 M220 192 H236" {...line} strokeWidth={2} />
        <circle cx={242} cy={204} r={8} fill="#14B8A6" stroke={navy} strokeWidth={2} />
        <path d="M238 204 L241 207 L246 201" fill="none" {...line} strokeWidth={2} />
      </g>
      <circle cx={210} cy={190} r={6} fill="#E3AE85" {...line} />
      <circle cx={254} cy={186} r={6} fill="#E3AE85" {...line} />

      {/* 4. Older man with glasses and grey hair */}
      <path d="M276 222 C276 180 286 164 306 164 C326 164 336 180 336 222 Z" fill="#F2E3C9" {...line} />
      <path d="M306 168 L306 222" {...line} strokeWidth={1.8} />
      <circle cx={306} cy={184} r={2} fill={navy} />
      <circle cx={306} cy={198} r={2} fill={navy} />
      <circle cx={306} cy={136} r={18} fill="#6B4226" {...line} />
      <path d="M288 134 C288 112 324 112 324 134 C318 124 294 124 288 134 Z" fill="#D9D6D0" {...line} />
      <circle cx={300} cy={138} r={5.5} fill="none" {...line} strokeWidth={1.8} />
      <circle cx={312} cy={138} r={5.5} fill="none" {...line} strokeWidth={1.8} />
      <path d="M305.5 138 H306.5" {...line} strokeWidth={1.8} />
      <circle cx={300} cy={138} r={1.4} fill={navy} />
      <circle cx={312} cy={138} r={1.4} fill={navy} />
      <path d="M301 146 Q306 150 311 146" fill="none" {...line} strokeWidth={1.8} />
    </svg>
  );
}

/** Calm "reading your document" animation: a page with a slow scan line and gently appearing lines. */
export function ReadingArt() {
  return (
    <svg className="reading-art" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
      <circle className="breathe" cx={60} cy={70} r={58} fill="#E6F7F4" />
      <rect x={28} y={20} width={64} height={86} rx={8} fill="#FFFFFF" stroke="#1E2A5A" strokeWidth={2.5} />
      <g stroke="#1E2A5A" strokeWidth={3} strokeLinecap="round" opacity={0.85}>
        <line className="ln ln1" x1={40} y1={38} x2={80} y2={38} />
        <line className="ln ln2" x1={40} y1={50} x2={80} y2={50} />
        <line className="ln ln3" x1={40} y1={62} x2={72} y2={62} />
        <line className="ln ln4" x1={40} y1={74} x2={80} y2={74} />
        <line className="ln ln5" x1={40} y1={86} x2={64} y2={86} />
      </g>
      <rect className="scan" x={22} y={26} width={76} height={6} rx={3} fill="#14B8A6" opacity={0.75} />
    </svg>
  );
}
