import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

/**
 * One featured service, compact and uniform.
 *  - phones: picture strip on the left, text on the right (keeps four cards short when stacked)
 *  - tablet and up: picture band across the top (fixed height, so it never dominates), then title, short summary and "Read More" pinned to the bottom
 * Title and summary sit in a normal card; "Read More" is the one real link (named for the service) and is stretched over the card,
 * so the whole card is still clickable but a screen reader hears a clear link name instead of the whole card's text.
 */
export function ServiceCard({ title, text, href, media, index = 0 }: { title: string; text: string; href: string; media: ReactNode; index?: number }) {
  return (
    <Reveal as="li" index={index % 4} className="flex">
      <article className="group svc-card card-outline motion-lift relative flex w-full overflow-hidden rounded-card bg-white text-fg shadow-card hover:shadow-lift has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white sm:flex-col">
        <div className="relative w-28 shrink-0 overflow-hidden bg-primary-dark sm:h-32 sm:w-full [&_p]:text-[0.5625rem] [&_p]:leading-snug">{media}</div>
        <div className="flex min-w-0 flex-1 flex-col p-3.5 sm:p-4">
          <h3 className="font-heading text-lg font-bold leading-tight text-primary-dark sm:text-[1.1875rem]">{title}</h3>
          <p className="mt-1 text-sm leading-snug text-fg-soft sm:min-h-[2.75rem]">{text}</p>
          <a
            href={href}
            aria-label={`Read more about ${title}`}
            className="mt-auto inline-flex items-center gap-1.5 pt-2.5 text-sm font-bold text-primary before:absolute before:inset-0 before:z-[5] before:content-[''] focus-visible:outline-none sm:pt-3"
          >
            <span className="border-b-2 border-primary/30 pb-px transition-colors duration-base ease-out-soft group-hover:border-primary">Read More</span>
            <ArrowRight className="arrow-nudge h-4 w-4" strokeWidth={2.25} aria-hidden />
          </a>
        </div>
      </article>
    </Reveal>
  );
}
