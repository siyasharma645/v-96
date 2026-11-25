import { BadgeCheck, ExternalLink, FileCheck2, ShieldCheck, Star } from 'lucide-react';
import { SITE } from '@/data/site';
import { trustStats } from '@/components/TrustBar';
import { StatNumber } from '@/components/CountUp';

/**
 * Phone/tablet trust indicators, shown inside the hero between the buttons and the callback form (hidden from lg,
 * where HeroTrustDesktop shows the same facts along the bottom of the hero instead).
 * Same facts and the same data as the desktop strip: years in business, Google rating, review count, Licensed & insured,
 * licence number with its verification link, and the one-year warranty.
 * Compact: one row of three statistic tiles, then two small equal-height credential cards side by side.
 */
export function HeroTrust() {
  const tile = 'rounded-ui bg-white/10 ring-1 ring-white/25';
  return (
    <div className="rise mt-3 lg:hidden" style={{ animationDelay: '.2s' }}>
      <h2 className="sr-only">Why homeowners trust Danika Plumbing &amp; Electric</h2>

      {/* Statistics: one row of three equal tiles, number + label only. */}
      <ul className="grid grid-cols-3 gap-1.5">
        {trustStats.map(({ value, label, star }) => (
          <li key={label} className={`${tile} flex min-w-0 flex-col items-center px-1 py-1.5 text-center`}>
            <p className="flex items-center gap-1 font-heading text-[1.25rem] font-extrabold leading-none tabular-nums text-white">
              <StatNumber text={value} />
              {star && <Star className="h-[0.6em] w-[0.6em] fill-current" strokeWidth={1.5} role="img" aria-label="out of 5 stars" />}
            </p>
            <p className="mt-1 text-[0.6875rem] font-bold leading-tight text-white">{label}</p>
          </li>
        ))}
      </ul>

      {/* Credentials: two small cards side by side, icon left, two short lines each. */}
      <ul className="mt-1.5 grid grid-cols-[1.3fr_1fr] items-stretch gap-1.5">
        <li className={`${tile} flex min-w-0 items-center gap-1.5 px-2 py-1.5`}>
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
          <p className="min-w-0 whitespace-nowrap text-[0.6875rem] leading-tight text-white/95">
            <strong className="block text-[0.75rem] font-bold text-white">Licensed &amp; Insured</strong>
            <span className="font-semibold text-white">{SITE.license}</span>
            <span aria-hidden className="mx-0.5">·</span>
            <a href={SITE.licenseUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-6 items-center gap-0.5 font-semibold underline underline-offset-2">
              Verify <ExternalLink className="h-2.5 w-2.5 shrink-0" aria-hidden />
            </a>
          </p>
        </li>
        <li className={`${tile} flex min-w-0 items-center gap-1.5 px-2 py-1.5`}>
          <BadgeCheck className="h-4 w-4 shrink-0" aria-hidden />
          <p className="min-w-0 text-[0.75rem] font-bold leading-tight text-white">1-Year Warranty</p>
        </li>
      </ul>
    </div>
  );
}

/**
 * Desktop (lg+) trust strip: the last row of the hero, over the same video and brick scrim as everything above it
 * (no band or background of its own). Same frosted tiles as the phone version (`HeroTrust`), scaled up.
 *  - xl+: one row of six tiles: three statistics, then the three credentials.
 *  - lg (1024-1279px): two rows of three, so the licence number never has to squeeze.
 * The bottom padding leaves room for the "Illustrative video" caption and the pause button, which sit at the hero's bottom edge.
 */
export function HeroTrustDesktop() {
  const tile = 'rounded-ui bg-white/10 ring-1 ring-white/25';
  return (
    <div className="container-x rise hidden pb-12 lg:block" style={{ animationDelay: '.2s' }}>
      <h2 className="sr-only">Why homeowners trust Danika Plumbing &amp; Electric</h2>

      <div className="grid gap-3 xl:grid-cols-[repeat(3,minmax(0,1fr))_repeat(3,minmax(0,1.3fr))]">
        {/* Statistics */}
        <ul className="grid grid-cols-3 gap-3 xl:contents">
          {trustStats.map(({ value, label, star }) => (
            <li key={label} className={`${tile} flex min-w-0 flex-col items-center justify-center px-3 py-3.5 text-center`}>
              <p className="flex items-center gap-1.5 font-heading text-[2rem] font-extrabold leading-none tabular-nums text-white">
                <StatNumber text={value} />
                {star && <Star className="h-[0.55em] w-[0.55em] fill-current" strokeWidth={1.5} role="img" aria-label="out of 5 stars" />}
              </p>
              <p className="mt-1.5 text-[0.8125rem] font-bold leading-tight text-white">{label}</p>
            </li>
          ))}
        </ul>

        {/* Credentials */}
        <ul className="grid grid-cols-3 gap-3 xl:contents">
          <li className={`${tile} flex min-w-0 items-center justify-center gap-2.5 px-3 py-3.5`}>
            <ShieldCheck className="h-5 w-5 shrink-0" strokeWidth={1.8} aria-hidden />
            <p className="text-sm font-bold leading-snug text-white">Licensed &amp; Insured</p>
          </li>
          <li className={`${tile} flex min-w-0 items-center justify-center gap-2.5 px-3 py-3.5`}>
            <FileCheck2 className="h-5 w-5 shrink-0" strokeWidth={1.8} aria-hidden />
            <p className="min-w-0 text-sm leading-snug">
              <span className="block whitespace-nowrap font-bold text-white">License {SITE.license}</span>
              <a href={SITE.licenseUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-6 items-center gap-1 whitespace-nowrap font-semibold text-white/95 underline underline-offset-2">
                Verify with WA L&amp;I <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </p>
          </li>
          <li className={`${tile} flex min-w-0 items-center justify-center gap-2.5 px-3 py-3.5`}>
            <BadgeCheck className="h-5 w-5 shrink-0" strokeWidth={1.8} aria-hidden />
            <p className="text-sm font-bold leading-snug text-white">1-Year Warranty</p>
          </li>
        </ul>
      </div>
    </div>
  );
}
