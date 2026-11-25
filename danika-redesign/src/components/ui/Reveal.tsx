'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { stagger } from '@/lib/motion';

/**
 * Scroll reveal (CSS transition from the motion tokens in globals.css).
 * - ONE shared IntersectionObserver serves every <Reveal> on the page (was one observer per element).
 * - The class is toggled directly on the DOM node, so revealing never triggers a React re-render.
 * - Animates once: each element is unobserved after its first reveal.
 * - Opacity and transform only, so nothing shifts layout.
 * - Content is only hidden when the `js` class is on <html>, and reduced-motion users get it instantly (globals.css).
 * Pass `index` for a gentle stagger among siblings (or `delay` in ms for a custom value).
 */
let observer: IntersectionObserver | null = null;
function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer?.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
  }
  return observer;
}

export function Reveal({
  children, className, delay, index, as: Tag = 'div',
}: { children: ReactNode; className?: string; delay?: number; index?: number; as?: 'div' | 'li' | 'article' | 'header' | 'span' }) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { el.classList.add('is-visible'); return; }
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);

  const ms = delay ?? (index !== undefined ? stagger(index) : 0);
  return (
    <Tag
      ref={ref as never}
      className={cn('reveal', className)}
      style={ms ? { transitionDelay: `${ms}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
