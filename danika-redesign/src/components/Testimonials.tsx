'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Star } from 'lucide-react';
import { reviews } from '@/data/reviews';
import { orig } from '@/data/site';
import { Reveal } from '@/components/ui/Reveal';
import { ButtonLink } from '@/components/ui/Button';

function Stars() {
  return (
    <span className="flex gap-0.5" role="img" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" aria-hidden />)}
    </span>
  );
}

/** One compact review card. Wording is rendered exactly as stored in src/data/reviews.ts. */
function ReviewCard({ review }: { review: (typeof reviews)[number] }) {
  return (
    <li className="rv-card flex">
      <figure className="flex w-full flex-col rounded-card border border-line bg-cream p-4 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <Stars />
          <time className="text-xs font-medium text-fg-soft">{review.date}</time>
        </div>
        <blockquote className="mt-2.5 flex-1 text-[0.9375rem] leading-relaxed text-fg">&ldquo;{review.text}&rdquo;</blockquote>
        <figcaption className="mt-3 border-t border-line pt-2.5 leading-snug">
          <strong className="block font-heading text-base text-primary-dark">{review.job}</strong>
          <span className="block text-xs text-fg-soft">Google review</span>
        </figcaption>
      </figure>
    </li>
  );
}

function ReviewGroup({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="rv-group" aria-hidden={hidden || undefined} aria-label={hidden ? undefined : 'Customer reviews'}>
      {reviews.map((r) => <ReviewCard key={r.job + r.date} review={r} />)}
    </ul>
  );
}

/**
 * Continuously moving review strip: a pure CSS marquee (see "Testimonials marquee" in globals.css).
 * - The review list is rendered twice back to back and the track slides left by exactly one list width,
 *   so the loop restarts invisibly. No JavaScript timers drive the movement.
 * - Hovering (mouse) or keyboard-focusing the strip pauses it; moving away resumes it from the same spot.
 *   Touch devices keep scrolling, since there is no hover on a phone.
 * - Off screen, the animation is paused (one IntersectionObserver, no polling) so it costs nothing.
 * - A small pause/play button lets anyone stop the motion (WCAG 2.2.2).
 * - With prefers-reduced-motion, the strip becomes a static grid of every review and the duplicate is removed.
 */
export function Testimonials() {
  const stripRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = stripRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => { el.dataset.offscreen = e.isIntersecting ? 'false' : 'true'; });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="section overflow-x-clip bg-white">
      <div className="container-x">
        <Reveal className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Testimonials</p>
            <h2 id="reviews-title" className="h2">What People Say About Us</h2>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm text-fg-soft">Reviews shown exactly as posted by customers on Google.</p>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? 'Resume scrolling reviews' : 'Pause scrolling reviews'}
              className="rv-pause btn-motion grid h-9 w-9 flex-none place-items-center rounded-full border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white"
            >
              {paused ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </Reveal>

        <Reveal index={1} className="mt-5 sm:mt-6">
          {/* Bleeds to the screen edges on phones; clipped by .rv-viewport so nothing escapes the section. */}
          <div ref={stripRef} className="rv-marquee -mx-4 sm:-mx-6 lg:mx-0" data-paused={paused} data-offscreen="false">
            <div
              className="rv-viewport focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-primary"
              role="region"
              aria-label="Customer reviews, scrolling automatically"
              tabIndex={0}
            >
              <div className="rv-track">
                <ReviewGroup />
                <ReviewGroup hidden />
              </div>
            </div>
          </div>

          <ButtonLink href={orig('/reviews/')} variant="primary" className="mt-5 w-full justify-center sm:mx-auto sm:flex sm:w-fit">Read our customer reviews</ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
