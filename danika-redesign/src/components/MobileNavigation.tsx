'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { aboutLinks, electricalAll, electricalGroups, plumbingAll, plumbingGroups, topLinks, type NavLink } from '@/data/nav';
import { orig } from '@/data/site';
import { hasCurrent, isCurrentHref } from '@/lib/nav-state';
import { cn } from '@/lib/utils';
import { HomeLink } from '@/components/HomeLink';
import { CallNowButton } from '@/components/CallNowButton';

// Every top-level row shares one height, inset and type style; sub-links are indented one step.
const row =
  'flex min-h-[52px] w-full items-center rounded-btn px-2 text-left text-[1.0625rem] font-semibold text-fg transition-colors duration-150 hover:bg-cream active:bg-cream aria-[current=page]:text-primary aria-expanded:text-primary';
const subLink =
  'flex min-h-11 items-center rounded-btn pl-5 pr-2 text-[0.9375rem] font-medium text-fg-soft transition-colors duration-150 hover:bg-cream hover:text-primary aria-[current=page]:bg-cream aria-[current=page]:text-primary';

const aboutGroups: Group[] = [{ links: aboutLinks }];
const areaLinks: Group[] = [{ links: [
  { label: 'Service area map and cities', href: topLinks.serviceAreas.href },
  { label: 'All 25 cities we serve', href: orig('/service-area/') },
] }];

/**
 * While the drawer is open the page is scroll-locked (html overflow hidden), and the browser performs a hash jump
 * during the click, before React unlocks. So for same-page "/#id" links: cancel the default, let the drawer close,
 * then scroll (smooth scroll + scroll-padding-top keep the section clear of the sticky header).
 * Links to other pages, and "/#id" clicked from another page, stay normal navigations.
 */
function jumpToSection(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  const m = href.match(/^\/#([\w-]+)$/);
  if (!m || window.location.pathname !== '/') return;
  const target = document.getElementById(m[1]);
  if (!target) return;
  e.preventDefault();
  window.setTimeout(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', `/#${m[1]}`);
  }, 60);
}

type Group = { heading?: string; links: NavLink[] };

function Accordion({ id, label, groups, all, pathname, open, onToggle, onNavigate }: { id: string; label: string; groups: Group[]; all?: NavLink; pathname: string | null; open: boolean; onToggle: () => void; onNavigate: () => void }) {
  const parentOfCurrent = hasCurrent([...groups.flatMap((g) => g.links), ...(all ? [all] : [])], pathname);
  return (
    <div className="border-b border-line">
      <button type="button" className={cn(row, 'justify-between', parentOfCurrent && 'text-primary')} aria-expanded={open} aria-controls={`m-${id}`} onClick={onToggle}>
        <span>
          {label}
          {parentOfCurrent && <span className="sr-only">, current section</span>}
        </span>
        <ChevronDown className={cn('h-[18px] w-[18px] text-fg-soft transition-transform duration-200', open && 'rotate-180')} strokeWidth={2} aria-hidden />
      </button>
      <div id={`m-${id}`} className={cn('grid transition-[grid-template-rows] duration-200 ease-out', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          {/* inert while collapsed: hidden links are neither focusable nor announced */}
          <div className="pb-3 pt-0.5" inert={!open}>
            {groups.map((g, i) => (
              <div key={g.heading ?? i} role={g.heading ? 'group' : undefined} aria-label={g.heading} className={cn(i > 0 && 'mt-2')}>
                {g.heading && <p className="px-2 pb-0.5 pt-2 text-xs font-bold uppercase tracking-wider text-primary" aria-hidden>{g.heading}</p>}
                <ul>
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} onClick={(e) => { onNavigate(); jumpToSection(e, l.href); }} aria-current={isCurrentHref(l.href, pathname) ? 'page' : undefined} className={subLink}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {all && (
              <a href={all.href} onClick={onNavigate} aria-current={isCurrentHref(all.href, pathname) ? 'page' : undefined} className={cn(subLink, 'mt-2 justify-between border-t border-line pr-3 font-semibold text-primary')}>
                {all.label}<ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Navigation drawer for everything below 1100px, opened from the header's menu button.
 * Phones: a full-width sheet directly under the header. Tablet: a 26rem panel on the right. Both sit over a light scrim.
 * The header stays on screen (so CALL NOW and the close button remain visible); the sheet scrolls on its own and keeps CALL NOW pinned at its foot.
 * Modal behaviour (scroll lock, inert page, focus cycling, Escape) lives in `useModalDrawer`, called by Header.
 *  - onNavigate: a link was followed (focus is left alone)
 *  - onDismiss:  closed without navigating (scrim click); Header returns focus to the menu button
 */
export function MobileNavigation({ open, onNavigate, onDismiss }: { open: boolean; onNavigate: () => void; onDismiss: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => { if (!open) setExpanded(null); }, [open]);
  const toggle = (id: string) => setExpanded((cur) => (cur === id ? null : id));

  return (
    <>
      <div
        aria-hidden
        onClick={onDismiss}
        className={cn(
          'fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 bg-primary-dark/35 transition-[opacity,visibility] duration-200 ease-out',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        )}
      />
      <div
        id="site-menu"
        role="dialog"
        aria-label="Site menu"
        inert={!open}
        className={cn(
          'on-light fixed inset-x-0 top-[var(--header-h)] z-50 flex max-h-[calc(100dvh-var(--header-h))] flex-col bg-white text-fg shadow-menu',
          'transition-[opacity,transform,visibility] duration-200 ease-out',
          'md:inset-x-auto md:right-0 md:w-[26rem] md:rounded-bl-card md:border-b md:border-l md:border-line',
          open ? 'visible translate-y-0 opacity-100 md:translate-x-0' : 'invisible -translate-y-2 opacity-0 md:translate-y-0 md:translate-x-2',
        )}
      >
        <nav aria-label="Main menu" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-1">
          <div className="border-b border-line">
            <HomeLink onNavigate={onNavigate} aria-current={isCurrentHref(topLinks.home.href, pathname) ? 'page' : undefined} className={row}>{topLinks.home.label}</HomeLink>
          </div>
          <Accordion id="plumbing" label="Plumbing" groups={plumbingGroups} all={plumbingAll} pathname={pathname} open={expanded === 'plumbing'} onToggle={() => toggle('plumbing')} onNavigate={onNavigate} />
          <Accordion id="electrical" label="Electrical" groups={electricalGroups} all={electricalAll} pathname={pathname} open={expanded === 'electrical'} onToggle={() => toggle('electrical')} onNavigate={onNavigate} />
          <Accordion id="about" label="About" groups={aboutGroups} pathname={pathname} open={expanded === 'about'} onToggle={() => toggle('about')} onNavigate={onNavigate} />
          <Accordion id="areas" label="Service Areas" groups={areaLinks} pathname={pathname} open={expanded === 'areas'} onToggle={() => toggle('areas')} onNavigate={onNavigate} />
        </nav>
        <div className="shrink-0 border-t border-line bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3">
          <CallNowButton variant="drawer" onClick={onNavigate} />
        </div>
      </div>
    </>
  );
}
