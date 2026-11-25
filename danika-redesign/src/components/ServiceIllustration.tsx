import type { ReactNode } from 'react';

export type ServiceScene = 'emergency-electrician' | 'ev-charger';

const C = {
  bg: 'rgb(var(--c-background))',
  sand: 'rgb(var(--c-border))',
  white: 'rgb(var(--c-surface))',
  red: 'rgb(var(--c-primary))',
  dark: 'rgb(var(--c-primary-dark))',
};

/**
 * Original, service-specific artwork for cards that have no genuine photo.
 * Drawn on a 320x200 canvas and scaled with "slice" (like object-cover), so the subject sits in the centre
 * (x 85-235, y 30-170) and survives both the tall phone thumbnail and the wide tablet/desktop band.
 * Same palette, stroke weight and warm backdrop for every scene, so the set reads as one family next to the photos.
 */
const SCENES: Record<ServiceScene, ReactNode> = {
  // A scorched wall outlet with a spark, a warning badge and a wire that has gone dead.
  'emergency-electrician': (
    <>
      <g transform="translate(16 15) scale(.9)">
        <path d="M0 148h320" stroke={C.sand} strokeWidth="2" />
        <path d="M0 92h108" stroke={C.dark} strokeWidth="3" strokeLinecap="round" />
        <path d="M212 92h108" stroke={C.dark} strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" opacity=".55" />
        <rect x="112" y="42" width="96" height="112" rx="12" fill={C.white} stroke={C.dark} strokeWidth="3" />
        <circle cx="160" cy="52" r="3" fill={C.dark} />
        <circle cx="160" cy="144" r="3" fill={C.dark} />
        {[70, 108].map((y) => (
          <g key={y}>
            <rect x="136" y={y} width="48" height="30" rx="8" fill={C.bg} stroke={C.dark} strokeWidth="2.5" />
            <rect x="146" y={y + 8} width="4" height="12" rx="2" fill={C.dark} />
            <rect x="170" y={y + 8} width="4" height="12" rx="2" fill={C.dark} />
          </g>
        ))}
        <circle cx="160" cy="123" r="22" fill={C.red} opacity=".12" />
        <path d="M154 20l-14 26h12l-8 20 24-30h-13l9-16z" fill={C.red} stroke={C.dark} strokeWidth="2" strokeLinejoin="round" />
        <path d="M118 34l-9-6M204 36l9-7M112 58l-10-1M210 58l10-1" stroke={C.red} strokeWidth="3" strokeLinecap="round" />
        <circle cx="205" cy="48" r="17" fill={C.red} stroke={C.white} strokeWidth="3" />
        <path d="M205 40v10" stroke={C.white} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="205" cy="56.5" r="2.2" fill={C.white} />
  
      </g>
    </>
  ),
  // A wall-mounted home charger, its cable looped to a plug, and the side of a car at the garage door.
  'ev-charger': (
    <>
      <path d="M0 150h320" stroke={C.sand} strokeWidth="2" />
      {[30, 58, 86, 114].map((y) => <path key={y} d={`M0 ${y}h320`} stroke={C.sand} strokeWidth="1.5" opacity=".7" />)}
      <path d="M250 150v-22c0-9 6-14 15-16l22-5c9-2 19-8 28-8v51z" fill={C.dark} opacity=".9" />
      <circle cx="285" cy="152" r="11" fill={C.bg} stroke={C.dark} strokeWidth="3" />
      <rect x="104" y="40" width="58" height="98" rx="14" fill={C.white} stroke={C.dark} strokeWidth="3" />
      <rect x="116" y="53" width="34" height="22" rx="5" fill={C.dark} />
      <path d="M135 56l-8 11h6l-3 7 9-11h-6l4-7z" fill={C.white} />
      <circle cx="122" cy="92" r="3" fill={C.red} />
      <circle cx="133" cy="92" r="3" fill={C.red} opacity=".55" />
      <circle cx="144" cy="92" r="3" fill={C.red} opacity=".25" />
      <path d="M133 138c0 30 66 32 66 0v-26" fill="none" stroke={C.dark} strokeWidth="5" strokeLinecap="round" />
      <rect x="188" y="84" width="22" height="30" rx="6" fill={C.red} stroke={C.dark} strokeWidth="3" />
      <path d="M194 84v-9M204 84v-9" stroke={C.dark} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M56 78l-9 16h8l-5 13 15-18h-8l6-11z" fill={C.red} opacity=".85" />
    </>
  ),
};

export function ServiceIllustration({ scene }: { scene: ServiceScene }) {
  return (
    <svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden focusable="false" className="absolute inset-0 h-full w-full" style={{ background: C.bg }}>
      {SCENES[scene]}
    </svg>
  );
}
