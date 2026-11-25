'use client';

import { ClipboardList, Phone } from 'lucide-react';
import { SITE } from '@/data/site';
import { useHelp } from '@/components/help/HelpProvider';

/**
 * Fixed bottom action bar for phones and small tablets (hidden from lg, where the hero shows the form and the header the number).
 *  - Call Now: solid brick, opens the dialer.
 *  - Request Service: white with a brick outline, reveals and scrolls to the hero callback form (HeroCallback handles any "#quick-request" link).
 *    On a page without that form it opens the site's callback popup instead.
 * Layout contract (globals.css): --action-bar-h is the bar height without the safe area. Below lg the page gets matching bottom padding,
 * focus scrolling keeps clear of the bar, and the help widget sits above it. `.float-cta` hides the bar while a contact form is on screen,
 * so it never covers form controls. z-30 keeps it under the menu drawer (z-40), header (z-50) and popup dialog (top layer).
 */
export function MobileActionBar() {
  const { open } = useHelp();
  return (
    <nav
      aria-label="Quick contact"
      className="float-cta fixed inset-x-0 bottom-0 z-30 border-t border-line bg-cream shadow-[0_-6px_16px_-10px_rgba(112,39,31,0.45)] lg:hidden"
      style={{
        paddingTop: '0.5rem',
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0px))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0px))',
      }}
    >
      <div className="mx-auto grid max-w-xl grid-cols-2 gap-2">
        <a
          href={SITE.phoneHref}
          aria-label={`Call now ${SITE.phone}`}
          className="btn-motion inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-btn border-2 border-primary bg-primary px-2 text-[0.9375rem] font-bold leading-none whitespace-nowrap min-[400px]:text-base text-white active:bg-primary-dark"
        >
          <Phone className="h-5 w-5 shrink-0 max-[339px]:hidden" aria-hidden /> Call Now
        </a>
        <a
          href="#quick-request"
          onClick={(e) => {
            if (!document.getElementById('quick-request')) { e.preventDefault(); open('callback'); }
          }}
          className="btn-motion inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-btn border-2 border-primary bg-white px-2 text-[0.9375rem] font-bold leading-none whitespace-nowrap min-[400px]:text-base text-primary active:bg-cream"
        >
          <ClipboardList className="h-5 w-5 shrink-0 max-[339px]:hidden" aria-hidden /> Request Service
        </a>
      </div>
    </nav>
  );
}
