import { Phone, Siren } from 'lucide-react';
import { SITE } from '@/data/site';
import { buttonClasses } from '@/components/ui/Button';
import { QuickRequest } from '@/components/QuickRequest';
import { HeroCallback } from '@/components/HeroCallback';
import { HeroVideo } from '@/components/HeroVideo';
import { HeroTrust, HeroTrustDesktop } from '@/components/HeroTrust';

/**
 * Hero: background video (see HeroVideo) under a brick-tinted dark gradient (`.hero-scrim` in globals.css: an eased curve on phones/tablets, the original linear one from lg), with all text and buttons layered above.
 *  - Desktop (lg+): same treatment as phones. The video fills the whole hero under the shared brick scrim (`scrim`), which deepens to solid brick
 *    at the bottom and so continues straight into the next (brick) section. Left column = what Danika does, why to call, Call Now + Request a Callback;
 *    right = compact callback form; the statistics and credentials (HeroTrustDesktop) run along the bottom, inside the same video backdrop.
 *  - Mobile (below lg): one vertical hero + contact section that starts right under the header and reads top to bottom:
 *    headline, description, 24/7 line, Call Now / Request a Callback, trust indicators (HeroTrust), then the callback form, always visible.
 *    The video and its brick scrim sit behind the top block only (`mobile block`) and fade to solid brick, so the form sits on a clean surface.
 *    On desktop that block uses `lg:contents`, so it adds no box and the video/scrims fill the whole hero as before.
 */
export function Hero() {
  return (
    <div className="on-red relative isolate flex flex-col overflow-hidden bg-primary-dark text-white lg:min-h-[calc(100svh-var(--header-h))]">
      {/* No `relative` here: on desktop the video, scrims and caption position against the full-width hero above. */}
      <div className="container-x grid gap-0 pb-6 lg:flex-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:content-center lg:items-start lg:gap-10 lg:pb-6 lg:pt-10 xl:gap-16">
        {/* Mobile block: full-bleed (cancels the container gutters), holds the video behind the text. lg:contents = no box on desktop. */}
        <div className="relative -mx-4 px-4 pb-12 pt-[2.625rem] sm:-mx-6 sm:px-6 sm:pt-10 lg:mx-0 lg:contents lg:p-0">
          <HeroVideo />

          {/* Dark brick scrim over the video, heavy enough for the headline at the top, fading to solid brick where the form starts (phones)
              or where the statistics row ends (desktop, where this block has no box so the scrim covers the whole hero). It must stay AFTER
              <HeroVideo /> in the DOM, otherwise the video paints on top of it. */}
          <div aria-hidden className="hero-scrim absolute inset-0 -z-10" />
          <p aria-hidden className="absolute bottom-3 left-4 z-0 text-[0.6875rem] font-semibold tracking-wide text-white/90 sm:left-6 lg:bottom-4 lg:left-[max(2rem,calc((100vw-1240px)/2+2rem))]">
            Illustrative video · not a Danika project
          </p>

          <section aria-labelledby="hero-title">
            <div className="flex max-w-xl flex-col lg:block lg:max-w-none">
              <h1 id="hero-title" className="h1 rise order-1 text-balance !text-white !text-[clamp(1.875rem,8.4vw,2.5rem)] !leading-[1.05] sm:!text-[clamp(2.5rem,6.4vw,3.5rem)] lg:-mt-2.5 lg:max-w-[44rem] lg:!text-[clamp(2.75rem,4.9vw,4.5rem)] lg:!leading-[1.02]" style={{ animationDelay: '.05s' }}>
                Local plumbers <span className="lg:hidden">&amp; electricians</span><span className="hidden lg:inline">&amp;&nbsp;electricians</span> you can trust.
              </h1>
              <p className="rise order-2 mt-2.5 max-w-[34rem] text-[0.9375rem] leading-relaxed text-white/90 sm:text-base lg:mt-5 lg:max-w-[36rem] lg:text-[1.1875rem] lg:leading-[1.55] xl:text-[1.25rem]" style={{ animationDelay: '.1s' }}>
                Fast, honest repairs and installations for homeowners in Everett, Snohomish County and North King County, since {SITE.founded}.
              </p>
              {/* Phones: the 24/7 line follows the description, right above the buttons. Desktop: it stays above the headline (order-none). */}
              <p className="rise order-3 mt-3 inline-flex items-center gap-2 text-[0.8125rem] font-bold uppercase tracking-[0.12em] text-white/90 lg:order-none lg:mt-5" style={{ animationDelay: '.1s' }}>
                <Siren className="h-4 w-4" aria-hidden /> 24/7 emergency plumbing
              </p>

              <div className="rise order-4 mt-3 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 lg:mt-6" style={{ animationDelay: '.15s' }}>
                <a href={SITE.phoneHref} aria-label={`Call now ${SITE.phone}`} className={buttonClasses('light', 'lg', 'w-full max-sm:!min-h-[52px] sm:w-auto')}>
                  <Phone className="h-5 w-5" aria-hidden /> Call Now · {SITE.phone}
                </a>
                <a href="#quick-request" className={buttonClasses('outline-white', 'lg', 'w-full max-sm:!min-h-[48px] sm:w-auto')}>
                  Request a Callback
                </a>
              </div>

              {/* Phones and tablets: rating, reviews, licence and warranty live here, under the buttons. */}
              <div className="order-5">
                <HeroTrust />
              </div>

            </div>
          </section>
        </div>

        <HeroCallback>
          <QuickRequest variant="hero" />
        </HeroCallback>
      </div>

      {/* Desktop only: statistics and credentials along the bottom of the hero, over the same video and scrim. */}
      <HeroTrustDesktop />
    </div>
  );
}
