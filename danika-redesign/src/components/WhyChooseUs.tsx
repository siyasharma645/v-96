import Image from 'next/image';
import { TrustIcon, type TrustIconName } from '@/components/icons/TrustIcon';
import { Reveal } from '@/components/ui/Reveal';
import { SITE } from '@/data/site';
import { getImage, type ImageKey } from '@/lib/images';
import { cn } from '@/lib/utils';

/** Every line restates something already on the site (address, service areas, in-house trades, one-year warranty). */
const points: { icon: TrustIconName; title: string; text: string; accent?: boolean }[] = [
  {
    icon: 'local', title: 'Local to Everett',
    text: `Our shop is at ${SITE.address.street}, not a regional dispatch center. We serve homes across Snohomish and King County.`,
  },
  {
    icon: 'honest', title: 'Honest recommendations',
    text: 'We explain what we find and your options, with no scripted upsell. If a cheaper repair will hold, you will hear it first.',
  },
  {
    icon: 'one-company', title: 'Plumbing & electrical in-house',
    text: 'Both trades under one roof: one call, one dispatcher, one invoice.',
  },
  {
    icon: 'warranty', title: '1-year warranty',
    text: 'Parts and labor are covered for a year. We stand behind our work and the products we install.', accent: true,
  },
];

/** Genuine Danika photos from images.json (the same ones used in the services and projects sections). Captions follow each photo's alt text. */
const photos: { key: ImageKey; caption: string; position: string; className: string; sizes: string }[] = [
  { key: 'waterHeater', caption: 'Water heater install', position: 'center 40%', className: 'col-span-2 aspect-[16/9] sm:aspect-[2/1] lg:col-span-1 lg:row-span-2 lg:aspect-auto', sizes: '(min-width: 1024px) 22vw, 100vw' },
  { key: 'drain', caption: 'Drain cleaning', position: 'center 40%', className: 'aspect-square lg:aspect-auto', sizes: '(min-width: 1024px) 22vw, 50vw' },
  { key: 'van', caption: 'Our Everett service van', position: 'center', className: 'aspect-square lg:aspect-auto', sizes: '(min-width: 1024px) 22vw, 50vw' },
];

export function WhyChooseUs() {
  return (
    <section id="why-danika" aria-labelledby="why-title" className="section surface surface-cream bg-cream text-fg">
      <div className="container-x">
        <Reveal as="header" className="max-w-2xl">
          <p className="eyebrow">Why Danika</p>
          <h2 id="why-title" className="h2">
            Homeowners trust a crew they can see.
          </h2>
          <p className="lead">
            Local, licensed technicians in plumbing and electrical, who tell you what you actually need.
          </p>
        </Reveal>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-[5fr_7fr] lg:gap-5">
          {/* Genuine photos: one large, two small. On desktop the grid stretches to match the card column. */}
          <Reveal className="grid grid-cols-2 gap-2 sm:gap-3 lg:min-h-[21rem] lg:grid-rows-2">
            {photos.map((p) => {
              const img = getImage(p.key);
              return (
                <figure key={p.key} className={cn('group relative min-h-0 overflow-hidden rounded-card bg-primary-dark', p.className)}>
                  <Image src={img.src} alt={img.alt} fill loading="lazy" sizes={p.sizes} style={{ objectPosition: p.position }} className="img-zoom object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-primary-dark/70 to-transparent" aria-hidden />
                  <figcaption className="absolute bottom-2 left-2 rounded-md bg-white/95 px-2 py-0.5 text-[0.6875rem] font-bold text-primary-dark shadow-card sm:bottom-2.5 sm:left-2.5 sm:text-xs">
                    {p.caption}
                  </figcaption>
                </figure>
              );
            })}
          </Reveal>

          <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            {points.map((p, i) => (
              <Reveal as="li" index={i} key={p.title} className={cn(
                'flex items-start gap-3 rounded-card border p-3.5 shadow-card sm:flex-col sm:gap-2.5 sm:p-4',
                p.accent ? 'on-red border-primary bg-primary text-white' : 'border-line bg-white',
              )}>
                <span className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-lg sm:h-12 sm:w-12', p.accent ? 'bg-white' : 'bg-primary/[.08] ring-1 ring-primary/10')}>
                  <TrustIcon name={p.icon} className={cn('h-6 w-6 sm:h-7 sm:w-7', p.accent ? 'text-primary-dark' : 'text-fg')} />
                </span>
                <div className="min-w-0">
                  <h3 className={cn('font-heading text-[1.0625rem] font-bold leading-tight sm:text-xl', p.accent ? '!text-white' : '!text-fg')}>{p.title}</h3>
                  <p className={cn('mt-1 text-[0.8125rem] leading-snug sm:text-[0.9375rem]', p.accent ? 'text-white/90' : 'text-fg-soft')}>{p.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
