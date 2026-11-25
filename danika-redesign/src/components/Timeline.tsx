'use client';

import { useEffect, useRef } from 'react';
import { CalendarCheck, ClipboardCheck, FileSignature, PhoneCall, ScanSearch, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Step = { title: string; text: string };

/** One icon per step, in order: call, book, diagnose, estimate, finish. */
const ICONS: LucideIcon[] = [PhoneCall, CalendarCheck, ScanSearch, FileSignature, ClipboardCheck];

/**
 * Five-step process. Phones: vertical timeline (rail on the left, node + text per row).
 * Desktop (lg+): horizontal stepper, one column per step, rail running through the node centres.
 * The brick-red rail fills as the list scrolls through view (static when motion is reduced).
 */
export function Timeline({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.7 - r.top) / r.height));
      el.style.setProperty('--p', String(p));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <ol ref={ref} className="relative grid gap-5 lg:grid-cols-5 lg:gap-6" style={{ '--p': 1 } as React.CSSProperties}>
      {/* Desktop rail runs through the node centres (node is 2.75rem). On phones each row draws its own connector down to the next node. */}
      <span className="absolute left-[calc((100%-4*1.5rem)/10)] right-[calc((100%-4*1.5rem)/10)] top-[1.375rem] hidden h-px bg-line lg:block" aria-hidden />
      <span className="absolute left-[calc((100%-4*1.5rem)/10)] right-[calc((100%-4*1.5rem)/10)] top-[1.375rem] hidden h-px origin-left bg-primary lg:block" style={{ transform: 'scaleX(var(--p))' }} aria-hidden />

      {steps.map((s, i) => {
        const Icon = ICONS[i] ?? ClipboardCheck;
        const last = i === steps.length - 1;
        return (
          <li key={s.title} className="relative flex gap-4 lg:flex-col lg:items-center lg:gap-3 lg:text-center">
            <span className={cn(
              'relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full ring-1 ring-primary/30 ring-offset-4 ring-offset-white',
              last ? 'bg-primary text-white' : 'bg-white text-primary',
            )}>
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              <span className="absolute -right-1 -top-1 grid h-[1.125rem] w-[1.125rem] place-items-center rounded-full bg-primary-dark font-sans text-[0.625rem] font-bold leading-none text-white ring-2 ring-white" aria-hidden>{i + 1}</span>
            </span>
            {!last && <span className="absolute -bottom-5 left-[1.375rem] top-[2.75rem] w-px -translate-x-1/2 bg-primary/30 lg:hidden" aria-hidden />}
            <div className="min-w-0 pt-0.5 lg:pt-0">
              <h3 className="font-heading text-[1.0625rem] font-bold leading-tight !text-primary-dark lg:text-lg">{s.title}</h3>
              <p className="mt-1 max-w-md text-[0.875rem] leading-snug text-fg-soft lg:mx-auto lg:text-[0.9375rem]">{s.text}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
