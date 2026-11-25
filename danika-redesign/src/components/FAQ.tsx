'use client';

import { useId, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { electricalFaqs, faqs, type FaqCategory } from '@/data/faqs';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils';

const tabs: { id: FaqCategory; label: string }[] = [
  { id: 'plumbing', label: 'Plumbing' },
  { id: 'electrical', label: 'Electrical' },
];

/**
 * Compact single-open accordion (WAI-ARIA disclosure pattern).
 * - All questions start collapsed. Tap or click a question to open it; the previously open answer closes. Tapping the open one closes it.
 * - Hover-capable devices (mouse): hovering a question opens it and closes the previous one. Moving the cursor away leaves it open until another question is hovered.
 *   Touch and pen input never use hover (checked via pointerType and the `(hover: hover)` media query), so they keep tap-to-toggle.
 *   A real mouse click on a question hover already opened keeps it open (no flicker-close); keyboard Enter/Space still toggles.
 * - Keyboard: Tab to reach questions, Enter/Space toggle (native button), Arrow Up/Down move between questions, Home/End jump.
 * - Closed answers are `inert`, so they are out of the tab order and the accessibility tree.
 */
export function FAQ() {
  const base = useId();
  const [category, setCategory] = useState<FaqCategory>('plumbing');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastPointerType = useRef<string>('');
  const hoverLockUntil = useRef(0);
  const list = category === 'plumbing' ? faqs : electricalFaqs;

  /** Hover opens a question only for a real mouse on a hover-capable device. */
  function handleHover(e: PointerEvent<HTMLButtonElement>, i: number) {
    if (e.pointerType !== 'mouse') return;
    if (!window.matchMedia('(hover: hover)').matches) return;
    if (openIndex === i) return;
    // While the previous answer collapses, content shifts under a stationary cursor and can
    // fire a stray hover on a neighbour. Ignore hover until the 300ms height transition has settled.
    if (performance.now() < hoverLockUntil.current) return;
    hoverLockUntil.current = performance.now() + 300;
    setOpenIndex(i);
  }

  function handleClick(e: MouseEvent<HTMLButtonElement>, i: number, open: boolean) {
    // Mouse click (detail > 0) on a hover device: hover already opened it, so keep it open.
    if (lastPointerType.current === 'mouse' && e.detail > 0 && window.matchMedia('(hover: hover)').matches) {
      setOpenIndex(i);
    } else {
      setOpenIndex(open ? null : i); // touch tap, pen, or keyboard: toggle as before
    }
    lastPointerType.current = '';
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const triggers = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button[data-faq-trigger]') ?? []);
    const current = triggers.indexOf(e.target as HTMLButtonElement);
    if (current === -1) return;
    e.preventDefault();
    const last = triggers.length - 1;
    const next =
      e.key === 'ArrowDown' ? (current + 1) % triggers.length
      : e.key === 'ArrowUp' ? (current - 1 + triggers.length) % triggers.length
      : e.key === 'Home' ? 0
      : last;
    triggers[next]?.focus();
  }

  return (
    <section id="faq" aria-labelledby="faq-title" className="section bg-white">
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="eyebrow">Asked on the phone every week</p>
            <h2 id="faq-title" className="h2">
              <span className="block [text-wrap:balance]">Plumbing &amp; Electrical Questions</span>
              <span className="block [text-wrap:balance]">from Everett Homeowners</span>
            </h2>
            <p className="lead">Straight answers on emergencies, pricing and repairs.</p>
          </Reveal>

          <div role="group" aria-label="Question category" className="mt-4 inline-flex gap-0.5 rounded-btn border border-line bg-cream p-0.5 sm:mt-5">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={category === t.id}
                onClick={() => { setCategory(t.id); setOpenIndex(null); }}
                className={cn(
                  'min-h-9 rounded-btn px-4 font-heading text-sm font-semibold transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transition-none',
                  category === t.id ? 'bg-primary text-white' : 'text-primary [@media(hover:hover)]:hover:bg-white',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div ref={listRef} onKeyDown={handleKeyDown} className="mt-3 divide-y divide-line border-y border-line sm:mt-4">
            {list.map((f, i) => {
              const open = openIndex === i;
              const btnId = `${base}-${category}-q${i}`;
              const panelId = `${base}-${category}-a${i}`;
              return (
                <div key={f.q}>
                  <h3>
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      data-faq-trigger
                      onPointerDown={(e) => { lastPointerType.current = e.pointerType; }}
                      onPointerEnter={(e) => handleHover(e, i)}
                      onPointerMove={(e) => handleHover(e, i)}
                      onClick={(e) => handleClick(e, i, open)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 py-3.5 text-left font-heading text-[0.9375rem] font-medium leading-snug transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary motion-reduce:transition-none sm:text-base',
                        open ? 'text-primary' : 'text-fg [@media(hover:hover)]:hover:text-primary',
                      )}
                    >
                      <span className="[text-wrap:pretty]">{f.q}</span>
                      <span aria-hidden className="relative h-3.5 w-3.5 shrink-0 text-primary">
                        <span className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-current" />
                        <span className={cn('absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 rounded-full bg-current transition-transform duration-base ease-out motion-reduce:transition-none', open && 'scale-y-0')} />
                      </span>
                    </button>
                  </h3>
                  <div id={panelId} role="region" aria-labelledby={btnId} className={cn('grid transition-[grid-template-rows,opacity] [transition-duration:300ms,220ms] ease-out motion-reduce:transition-none', open ? 'grid-rows-[1fr] opacity-100 [transition-delay:0ms,60ms]' : 'grid-rows-[0fr] opacity-0')}>
                    <div className="min-h-0 overflow-hidden">
                      <p className="pb-3.5 pr-6 text-[0.9rem] leading-relaxed text-fg-soft sm:text-[0.95rem]" inert={!open}>{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
