import { ArrowRight, Navigation } from 'lucide-react';
import { kingCounty, snohomishCounty } from '@/data/areas';
import { SITE, orig } from '@/data/site';
import { Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { CountyList } from '@/components/CountyList';
import { LazyMap } from '@/components/LazyMap';

export function ServiceAreas() {
  return (
    <section id="service-areas" aria-labelledby="areas-title" className="section surface surface-cream bg-cream">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Where the trucks go</p>
          <h2 id="areas-title" className="h2 max-w-4xl">Our Service Area: Snohomish County and King County</h2>
          <p className="lead">Our plumbers work from Everett north to Arlington, east to Monroe, and south through Lynnwood and Bothell into Seattle and the Eastside.</p>
        </Reveal>

        <div className="mt-8 grid gap-x-4 gap-y-8 max-sm:mt-6 max-sm:gap-y-6 lg:mt-9 lg:grid-cols-2 lg:gap-x-8 xl:gap-x-16">
          <CountyList title="Snohomish County Cities We Serve" areas={snohomishCounty} span="" />
          <CountyList title="King County and Seattle Neighborhoods We Serve" areas={kingCounty} span="" />
        </div>

        <div className="mt-8 flex flex-col gap-5 max-sm:mt-6 lg:mt-10 lg:items-center lg:gap-6 lg:text-center">
          <p className="rounded-field border border-line border-l-4 border-l-primary bg-white px-4 py-3 text-[0.95rem] font-medium lg:max-w-2xl lg:text-left">
            Emergency plumbing is available across the whole service area. If your town is not listed, call and ask.
          </p>
          <div><ButtonLink href={orig('/service-area/')} variant="primary">See all 25 areas we serve <ArrowRight className="h-4 w-4" aria-hidden /></ButtonLink></div>
        </div>

        {/* Map: below the city lists. Loads only on request; the box is responsive and reserved up front. */}
        <Reveal className="mx-auto mt-8 w-full max-w-4xl overflow-hidden rounded-card border border-line bg-white shadow-card max-sm:mt-6 lg:mt-12">
          <LazyMap title="Map showing Danika Plumbing & Electric at 11015 Airport Road, Everett, WA" src={SITE.mapEmbed} />
          <div className="flex flex-col gap-4 border-t-4 border-primary bg-white p-6 max-sm:gap-3 max-sm:p-4 sm:flex-row sm:items-center sm:justify-between">
            <address className="text-sm not-italic leading-relaxed text-fg-soft">
              <strong className="block text-base text-primary">Head office, Everett</strong>
              {SITE.address.street}, {SITE.address.city}, {SITE.address.region} {SITE.address.postal}
            </address>
            <ButtonLink href={SITE.directions} target="_blank" rel="noopener noreferrer" variant="secondary" className="max-sm:w-full">
              <Navigation className="h-4 w-4" aria-hidden /> Get directions<span className="sr-only"> (opens in a new tab)</span>
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
