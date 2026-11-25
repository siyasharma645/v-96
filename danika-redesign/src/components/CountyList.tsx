'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import type { Area } from '@/data/areas';
import { cn } from '@/lib/utils';

const DESKTOP = '(min-width: 1024px)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
/** True from lg up. The server and first client render assume mobile, which has the same markup apart from the button. */
function useIsDesktop() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => false);
}

const headingCls =
  'font-heading text-xl font-bold text-primary max-sm:text-lg';

/**
 * One county group.
 * - lg and up: a static heading and the full city grid, on the shared 9-column subgrid so all 25 names align.
 * - Below lg: the heading becomes a disclosure button that expands or collapses the city list.
 *   Every city stays in the DOM and in the page source; collapsed cities are only hidden visually and from keyboard/AT.
 */
export function CountyList({ title, areas, span }: { title: string; areas: Area[]; span: string }) {
  const id = useId();
  const panelId = `${id}-cities`;
  const [open, setOpen] = useState(false);
  const desktop = useIsDesktop();

  return (
    <div className={`${span} lg:min-w-0`}>
      <h3 className="lg:max-xl:flex lg:max-xl:min-h-[4.25rem] lg:max-xl:items-end">
        {desktop ? (
          <span className={cn(headingCls, 'block w-full border-b-2 border-primary pb-2')}>{title}</span>
        ) : (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
            className={cn(
              'flex min-h-[56px] w-full items-center justify-between gap-3 rounded-card border-2 bg-white px-4 py-3 text-left transition-[border-color,box-shadow] duration-base ease-out-soft motion-reduce:transition-none',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              open ? 'border-primary shadow-card' : 'border-line',
            )}
          >
            <span className="min-w-0">
              <span className={cn(headingCls, 'block leading-snug')}>{title}</span>
              <span className="mt-0.5 block text-sm font-medium text-fg-soft">{areas.length} cities · {open ? 'Tap to hide' : 'Tap to show'}</span>
            </span>
            <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-base motion-reduce:transition-none', open ? 'bg-primary text-white' : 'bg-cream text-primary')}>
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-base ease-out-soft motion-reduce:transition-none', open && 'rotate-180')} aria-hidden />
            </span>
          </button>
        )}
      </h3>

      <div
        id={panelId}
        className={cn(
          'grid transition-[grid-template-rows,visibility] duration-base ease-out-soft motion-reduce:transition-none',
          'lg:block lg:visible',
          open ? 'grid-rows-[1fr] visible' : 'grid-rows-[0fr] invisible',
        )}
      >
        {/* -m-1/p-1 keeps focus rings from being clipped by the collapse's overflow: hidden. */}
        <div className="-m-1 min-h-0 overflow-hidden p-1 lg:m-0 lg:overflow-visible lg:p-0">
          <ul className="mt-3 grid auto-rows-[3.25rem] grid-cols-2 gap-x-4 sm:grid-cols-3 md:grid-cols-4 lg:mt-4 lg:auto-rows-[2.75rem] lg:grid-cols-[repeat(auto-fill,minmax(8.75rem,1fr))] lg:gap-x-3 xl:grid-cols-3 xl:gap-x-6">
            {areas.map((a) => {
              const home = a.name === 'Everett';
              return (
                <li key={a.name}>
                  <a
                    href={a.href}
                    className={cn(
                      'flex h-full min-h-[44px] flex-col justify-center rounded-md text-base leading-snug transition-colors duration-fast ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:text-[0.9375rem] xl:text-[1.0625rem]',
                      '[@media(hover:hover)]:hover:text-primary [@media(hover:hover)]:hover:underline',
                      home ? 'font-heading font-extrabold text-primary' : 'font-semibold',
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {home && <MapPin className="h-4 w-4 shrink-0" aria-hidden />}
                      {a.name}
                    </span>
                    {home && <span className="mt-0.5 w-fit rounded bg-primary px-1.5 py-0.5 text-[0.6875rem] font-bold leading-none text-white">Home base</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
