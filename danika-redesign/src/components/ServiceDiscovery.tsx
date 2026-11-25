import Image from 'next/image';
import { ServiceCard } from '@/components/ServiceCard';
import { ServiceIllustration } from '@/components/ServiceIllustration';
import { ServiceMore } from '@/components/ServiceMore';
import { ServiceTabs } from '@/components/ServiceTabs';
import { StockImage } from '@/components/StockImage';
import { ServiceIcon } from '@/components/icons/ServiceIcon';
import { Reveal } from '@/components/ui/Reveal';
import { getImage } from '@/lib/images';
import { discoveryCategories, type DiscoveryMedia, type DiscoveryRow } from '@/data/service-discovery';

const SIZES = '(min-width: 1024px) 300px, (min-width: 640px) 50vw, 112px';

function Media({ media, icon }: { media: DiscoveryMedia; icon: DiscoveryRow['icon'] }) {
  if (media.kind === 'danika') {
    const img = getImage(media.key);
    return <Image src={img.src} alt={img.alt} fill loading="lazy" sizes={SIZES} className="img-zoom object-cover" style={{ objectPosition: media.position ?? 'center' }} />;
  }
  if (media.kind === 'art') return <ServiceIllustration scene={media.scene} />;
  if (media.kind === 'stock') return <StockImage slot={media.slot} compact zoom sizes={SIZES} position={media.position} />;
  // No photo for this service yet: the same branded tile the site uses for missing stock images, carrying the service's own icon.
  return (
    <span className="blueprint absolute inset-0 grid place-items-center bg-primary-dark" aria-hidden>
      <ServiceIcon name={icon} size={52} className="text-white/85" />
    </span>
  );
}

/**
 * Unified service discovery: choose Plumbing or Electrical, see that category's four most popular services first, then open "More ... services" for the rest or follow "View all".
 * Server component: it builds every card (both categories are in the HTML, so links are crawlable); <ServiceTabs> only switches which panel shows.
 */
export function ServiceDiscovery() {
  const panels = Object.fromEntries(
    discoveryCategories.map((c) => [
      c.id,
      <div key={c.id}>
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {c.rows.map((r, i) => (
            <ServiceCard key={r.title} index={i} title={r.title} text={r.text} href={r.href} media={<Media media={r.media} icon={r.icon} />} />
          ))}
        </ul>
        <ServiceMore label={`More ${c.label.toLowerCase()} services`} items={c.more} all={c.all} />
      </div>,
    ]),
  );

  return (
    <section id="services" aria-labelledby="services-title" className="on-red surface surface-dark bg-primary-dark text-white section">
      <div className="container-x">
        <Reveal as="header" className="max-w-3xl">
          <h2 id="services-title" className="h2 !text-white">What Do You Need Help With?</h2>
          <p className="lead !text-white/85">Explore our plumbing and electrical services to find the right solution for your home.</p>
        </Reveal>

        <ServiceTabs
          className="mt-6"
          categories={discoveryCategories.map(({ id, label, description }) => ({ id, label, description }))}
          panels={panels as Record<'plumbing' | 'electrical', React.ReactNode>}
        />
      </div>
    </section>
  );
}
