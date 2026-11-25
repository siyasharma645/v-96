'use client';

import { useEffect, useRef } from 'react';

const format = (n: number, decimals: number) => n.toFixed(decimals);

/**
 * Number that counts up from 0 the first time it scrolls into view (once only).
 *  - The final value is what the server renders, so it is correct without JavaScript and in the first paint.
 *  - An invisible copy of the final text reserves the width, so the layout never jiggles while digits change.
 *  - Screen readers get the final value once (the animated digits are aria-hidden).
 *  - Visitors who prefer reduced motion simply see the final value.
 *  - Frames write straight to the DOM (no React re-render per frame), so it stays smooth on phones.
 */
export function CountUp({ value, decimals = 0, suffix = '', duration = 1100, className }: { value: number; decimals?: number; suffix?: string; duration?: number; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const live = useRef<HTMLSpanElement>(null);
  const final = format(value, decimals);

  useEffect(() => {
    const el = root.current;
    const out = live.current;
    if (!el || !out || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    out.textContent = `${format(0, decimals)}${suffix}`;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4); // ease-out quart: quick start, soft landing
          out.textContent = t < 1 ? `${format(value * eased, decimals)}${suffix}` : `${final}${suffix}`;
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); out.textContent = `${final}${suffix}`; };
  }, [value, decimals, suffix, duration, final]);

  return (
    <span ref={root} className={`relative inline-block tabular-nums ${className ?? ''}`}>
      <span className="invisible" aria-hidden>{final}{suffix}</span>
      <span ref={live} className="absolute inset-0 text-center" aria-hidden>{final}{suffix}</span>
      <span className="sr-only">{final}{suffix}</span>
    </span>
  );
}

/** Animates a display string such as "17", "4.7" or "690+": keeps its decimals and any trailing "+". */
export function StatNumber({ text }: { text: string }) {
  const m = text.match(/^(\d+(?:\.(\d+))?)(\D*)$/);
  if (!m) return <>{text}</>;
  return <CountUp value={parseFloat(m[1])} decimals={m[2]?.length ?? 0} suffix={m[3]} />;
}
