import { ArrowRight, ChevronDown } from 'lucide-react';

/**
 * Access to every service that is not a featured card.
 * Native <details>: works without JavaScript, is keyboard and screen-reader operable out of the box, and the links are already in the
 * server HTML (crawlable) while collapsed. The summary and each row are full-width, 48px-tall tap targets.
 */
export function ServiceMore({ label, items, all }: {
  label: string;
  items: { title: string; href: string }[];
  all: { label: string; href: string };
}) {
  return (
    <div className="mt-3 sm:mt-4">
      {items.length > 0 && (
        <details className="group/more rounded-card border border-white/30 bg-white/[0.06] open:bg-white/[0.1]">
          <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-3 rounded-card px-4 py-2 text-base font-bold text-white marker:hidden hover:bg-white/[0.08] focus-visible:outline-offset-2 focus-visible:outline-white [&::-webkit-details-marker]:hidden">
            <span>{label}</span>
            <ChevronDown className="h-5 w-5 shrink-0 transition-transform duration-base ease-out-soft group-open/more:rotate-180" strokeWidth={2.25} aria-hidden />
          </summary>
          <ul className="grid gap-px border-t border-white/20 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <li key={s.href + s.title}>
                <a
                  href={s.href}
                  className="group flex min-h-[48px] items-center justify-between gap-3 px-4 py-2.5 text-base text-white transition-colors duration-base ease-out-soft hover:bg-white/[0.1] focus-visible:bg-white/[0.1] focus-visible:outline-offset-[-3px] focus-visible:outline-white"
                >
                  <span className="min-w-0 leading-snug">{s.title}</span>
                  <ArrowRight className="arrow-nudge h-4 w-4 shrink-0 text-white/80" strokeWidth={2} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
      <a
        href={all.href}
        className="group mt-2 inline-flex min-h-[48px] items-center gap-2 rounded-md text-base font-semibold text-white underline decoration-white/40 underline-offset-4 transition-colors duration-base ease-out-soft hover:decoration-white"
      >
        {all.label}
        <ArrowRight className="arrow-nudge h-4 w-4" strokeWidth={2} aria-hidden />
      </a>
    </div>
  );
}
