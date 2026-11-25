import { BadgeCheck, ExternalLink, FileCheck2, ShieldCheck, Star } from 'lucide-react';
import { SITE } from '@/data/site';
import { Reveal } from '@/components/ui/Reveal';
import { StatNumber } from '@/components/CountUp';

/**
 * Compact credibility band directly under the hero. The three statistics count up once as they scroll into view (see CountUp); the card fades up once, like every other section.
 * Every figure comes from data already in the project, nothing is typed in by hand:
 *  - years in business: current year minus SITE.founded (2009)
 *  - Google rating and review count: SITE.rating (4.7, "690+ Google reviews")
 *  - licence number and verification link: SITE.license / SITE.licenseUrl
 * "Licensed & insured" and the one-year parts and labor warranty are the business's own stated assurances (same wording as the hero and footer).
 * NOTE: this standalone band is no longer rendered on the homepage. The same facts now live inside the hero on every screen size
 * (HeroTrust below lg, HeroTrustDesktop from lg). This file stays as the single source of the `trustStats` data both use.
 * Layout: three equal statistic cards on top, a quieter credentials row below (separate groups, no shared container).
 */
const reviewCount = SITE.rating.label.match(/^\d+\+?/)?.[0] ?? '';
const years = new Date().getFullYear() - SITE.founded;

export const trustStats = [
  { value: String(years), label: 'Years in business', note: `Since ${SITE.founded}` },
  { value: SITE.rating.value, label: 'Google rating', star: true },
  { value: reviewCount, label: 'Google reviews' },
];

export function TrustBar() {
  return (
    <section aria-labelledby="trust-title" className="hidden border-b border-line bg-cream py-10 sm:py-12 lg:block lg:py-14">
      <div className="container-x">
        <h2 id="trust-title" className="sr-only">Why homeowners trust Danika Plumbing &amp; Electric</h2>

        {/* Statistics: 2 columns on phones (third card spans the row), 3 equal cards from 640px. */}
        <Reveal>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:gap-6">
            {trustStats.map(({ value, label, note, star }) => (
              <li
                key={label}
                className="flex flex-col items-center rounded-card bg-white px-2 py-6 text-center min-[360px]:px-3 ring-1 ring-line [&:nth-child(3)]:col-span-2 sm:px-4 sm:py-8 sm:[&:nth-child(3)]:col-span-1 lg:py-10"
              >
                <p className="flex items-center gap-1.5 font-heading text-[clamp(2.5rem,1.9rem+2.4vw,3.5rem)] font-extrabold leading-none text-primary tabular-nums">
                  <StatNumber text={value} />
                  {star && <Star className="h-[0.5em] w-[0.5em] fill-primary text-primary" strokeWidth={1.5} role="img" aria-label="out of 5 stars" />}
                </p>
                <p className="mt-3 whitespace-nowrap text-sm font-bold leading-tight text-fg min-[360px]:text-[0.9375rem] sm:text-base">{label}</p>
                {note && <p className="mt-1 text-xs leading-snug text-fg-soft min-[360px]:text-[0.8125rem] sm:text-sm">{note}</p>}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Credentials: stacked on phones, three across from 640px. Icons sit in a soft tint; no boxes or dividers. */}
        <Reveal>
          <ul className="mx-auto mt-8 grid max-w-md gap-4 sm:mt-10 sm:max-w-none sm:grid-cols-3 sm:gap-6 lg:mt-12 lg:gap-10">
            <li className="flex items-center gap-3.5 sm:justify-center sm:gap-3 lg:gap-3.5">
              <IconTile><ShieldCheck className="h-5 w-5" strokeWidth={1.8} aria-hidden /></IconTile>
              <p className="text-sm leading-snug"><span className="block font-bold text-fg">Licensed &amp; insured</span></p>
            </li>
            <li className="flex items-center gap-3.5 sm:justify-center sm:gap-3 lg:gap-3.5">
              <IconTile><FileCheck2 className="h-5 w-5" strokeWidth={1.8} aria-hidden /></IconTile>
              <p className="text-sm leading-snug">
                <span className="block whitespace-nowrap font-bold text-fg">License {SITE.license}</span>
                <a href={SITE.licenseUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-6 items-center gap-1 whitespace-nowrap font-semibold text-primary underline underline-offset-2">
                  Verify with WA L&amp;I <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </p>
            </li>
            <li className="flex items-center gap-3.5 sm:justify-center sm:gap-3 lg:gap-3.5">
              <IconTile><BadgeCheck className="h-5 w-5" strokeWidth={1.8} aria-hidden /></IconTile>
              <p className="text-sm leading-snug"><span className="block font-bold text-fg">1-year warranty</span></p>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function IconTile({ children }: { children: React.ReactNode }) {
  return <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">{children}</span>;
}
