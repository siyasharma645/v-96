'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';

/**
 * Wraps the hero callback form. It is always visible: in the right-hand column from lg, and in the hero's vertical flow below lg
 * (under the trust indicators), so nobody has to open a popup or reveal anything first.
 * Any link to "#quick-request" (the hero's Request a Callback button, the Final CTA, a service card) scrolls to the form
 * and moves focus to the first field.
 */
export function HeroCallback({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);

  const reveal = useCallback(() => {
    requestAnimationFrame(() => {
      const target = document.getElementById('quick-request');
      if (!target) return;
      const desktop = window.matchMedia('(min-width: 1024px)').matches;
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: desktop ? 'nearest' : 'start' });
      wrap.current?.querySelector<HTMLElement>('input[name="firstName"]')?.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest('a[href="#quick-request"]');
      if (!a) return;
      e.preventDefault();
      reveal();
    };
    const onShow = () => {
      if (document.getElementById('quick-request')) reveal();
      else document.getElementById('quote')?.scrollIntoView({ block: 'start' });
    };
    document.addEventListener('click', onClick);
    window.addEventListener('danika:show-quick-request', onShow);
    if (window.location.hash === '#quick-request') reveal();
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('danika:show-quick-request', onShow); };
  }, [reveal]);

  return (
    <div ref={wrap} className="hero-callback rise w-full" style={{ animationDelay: '.25s' }}>
      {children}
    </div>
  );
}
