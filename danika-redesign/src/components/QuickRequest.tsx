'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, HelpCircle, Info, Layers, Loader2, Phone, Siren, Wrench, Zap, type LucideIcon } from 'lucide-react';
import { SITE, orig } from '@/data/site';
import { OTHER_OPTION } from '@/data/quote-options';
import { validateLead, type LeadErrors, type LeadInput } from '@/lib/validation';
import { checkZip, isCompleteZip, type ZipStatus } from '@/lib/zip';
import { cn } from '@/lib/utils';
import { buttonClasses } from '@/components/ui/Button';
import { ContactVisibility } from '@/components/ContactVisibility';
import { Field, field, input } from '@/components/QuoteForm';
import { useHelp } from '@/components/help/HelpProvider';

type Cat = 'plumbing' | 'electrical' | 'both' | 'not_sure';
type Status = 'idle' | 'submitting' | 'success' | 'not_configured' | 'error';

const CATS: { id: Cat; label: string; Icon: LucideIcon }[] = [
  { id: 'plumbing', label: 'Plumbing', Icon: Wrench },
  { id: 'electrical', label: 'Electrical', Icon: Zap },
  { id: 'both', label: 'Both', Icon: Layers },
  { id: 'not_sure', label: 'Not Sure', Icon: HelpCircle },
];

// Every name below is on the API's allow-list (ALL_SERVICE_OPTIONS), so the webhook only ever receives known values.
const PLUMBING = ['Emergency Plumbing', 'Drain Cleaning', 'Water Heater Services', 'Leak Detection', 'Sewer Repair'];
const ELECTRICAL = ['Electrical Repair', 'Electrical Panel Upgrades', 'EV Charger Installation', 'Emergency Electrician'];
const EMERGENCY_PLUMBING = 'Emergency Plumbing';
const EMERGENCY_ELECTRICAL = 'Emergency Electrician';

const chipsFor = (c: Cat): { label?: string; items: string[] }[] => {
  if (c === 'plumbing') return [{ items: [...PLUMBING, OTHER_OPTION] }];
  if (c === 'electrical') return [{ items: [...ELECTRICAL, OTHER_OPTION] }];
  if (c === 'both') return [{ label: 'Plumbing', items: PLUMBING }, { label: 'Electrical', items: [...ELECTRICAL, OTHER_OPTION] }];
  return [];
};

/**
 * Homepage Quick Request: short callback form. It is rendered once, inside the hero's right-hand column (`variant="hero"`);
 * `variant="section"` keeps the original stand-alone band for any page that wants it.
 * Submits to the same /api/lead endpoint as the detailed form, as a `callback` request
 * (name + phone required, everything else optional), tagged `homepage-quick-request`.
 */
export function QuickRequest({ variant = 'section' }: { variant?: 'section' | 'hero' }) {
  const hero = variant === 'hero';
  const { open: openFullForm } = useHelp();
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const formRef = useRef<HTMLFormElement>(null);
  const sending = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const [attempted, setAttempted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [zip, setZip] = useState('');
  const [message, setMessage] = useState('');
  const [cat, setCat] = useState<Cat | ''>('');
  const [services, setServices] = useState<string[]>([]);
  const [errors, setErrors] = useState<LeadErrors & { category?: string }>({});
  const [status, setStatus] = useState<Status>('idle');
  // ZIP feedback shown to the visitor. null = nothing to show (not checked yet, still typing, or empty).
  const [zipResult, setZipResult] = useState<Exclude<ZipStatus, 'empty'> | null>(null);

  // Any link marked data-quick-service="plumbing|electrical|both|not_sure" preselects that card (it also scrolls here via its #quick-request href).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest<HTMLElement>('[data-quick-service]');
      const v = el?.dataset.quickService as Cat | undefined;
      if (v && CATS.some((c) => c.id === v)) pick(v);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // The form unmounts on success, which would drop keyboard/screen-reader focus. Move it to the confirmation instead.
  useEffect(() => {
    if (status !== 'success') return;
    successRef.current?.focus({ preventScroll: true });
    successRef.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, [status]);

  /** Back to an empty form after a successful send, for a second request. */
  function resetForm() {
    setName(''); setPhone(''); setZip(''); setMessage(''); setCat(''); setServices([]);
    setErrors({}); setZipResult(null); setAttempted(false); setStatus('idle');
  }

  function pick(c: Cat) {
    setCat(c);
    setErrors((cur) => ({ ...cur, category: undefined }));
    const allowed = chipsFor(c).flatMap((g) => g.items);
    setServices((cur) => cur.filter((s) => allowed.includes(s)));
  }
  const toggle = (s: string) => setServices((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  const plumbingUrgent = services.includes(EMERGENCY_PLUMBING);
  const electricalUrgent = services.includes(EMERGENCY_ELECTRICAL);
  const urgent = plumbingUrgent || electricalUrgent;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const values: LeadInput = {
      firstName: name, lastName: '', phone, email: '', message, type: 'callback', zip,
      // "Not Sure" has no category of its own on the backend: send no category plus the existing "Other / Not Sure" service.
      serviceCategory: cat === 'not_sure' ? '' : cat,
      services: cat === 'not_sure' ? [OTHER_OPTION] : services,
    };
    const found: LeadErrors & { category?: string } = validateLead(values, 'callback');
    // ZIP stays optional: an empty, outside or unknown ZIP never blocks the request. Only a malformed one is flagged (as before).
    showZip(zip);
    if (found.firstName) found.firstName = 'Please enter your name.';
    if (!cat) found.category = 'Choose what you need help with.';
    setErrors(found);
    setAttempted(true);
    const first = (['firstName', 'phone', 'category', 'zip', 'message'] as const).find((k) => found[k]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(first === 'category' ? '[name="quickCategory"]' : `[name="${first}"]`)?.focus();
      return;
    }

    if (sending.current) return;
    sending.current = true;
    setStatus('submitting');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Never leave the visitor on an endless spinner: after 15 s the request is treated as failed (their details stay in the form).
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ ...values, source: 'homepage-quick-request', website: String(new FormData(e.currentTarget).get('website') ?? '') }),
      });
      // Success only after the server confirms delivery. Every other outcome keeps what the visitor typed.
      if (res.ok) { setStatus('success'); return; }
      if (res.status === 503) { setStatus('not_configured'); return; }
      if (res.status === 422) {
        const data = await res.json().catch(() => null);
        setErrors(data?.errors ?? {});
        if (data?.errors?.zip) setZipResult('invalid');
        setStatus('idle');
        return;
      }
      setStatus('error');
    } catch {
      setStatus('error');
    } finally {
      sending.current = false;
    }
  }

  /** Check a ZIP and show the result below the field. Empty means nothing to say. */
  function showZip(value: string) {
    const r = checkZip(value);
    setZipResult(r === 'empty' ? null : r);
  }
  function onZipChange(value: string) {
    setZip(value);
    clear('zip');
    // No feedback while typing: hide any earlier result as soon as the ZIP is edited, and check again once it is complete.
    if (isCompleteZip(value)) showZip(value);
    else setZipResult(null);
  }

  /** Phone is checked when the visitor leaves the field (only if they typed something), so a typo is caught before they reach the button. */
  function checkPhoneOnBlur() {
    if (!phone.trim()) return;
    const msg = validateLead({ firstName: 'x', lastName: '', phone, email: '', message: '', type: 'callback' }, 'callback').phone;
    if (msg) setErrors((cur) => ({ ...cur, phone: msg }));
  }
  const errorCount = Object.values(errors).filter(Boolean).length;

  const clear = (k: keyof LeadInput) => setErrors((cur) => (cur[k] ? { ...cur, [k]: undefined } : cur));
  const border = (k: keyof LeadInput) => (errors[k] ? 'border-error bg-white' : 'border-line');
  const zipBorder = zipResult === 'invalid' ? 'border-error bg-white' : zipResult === 'served' ? 'border-primary/60' : 'border-line';
  const bad = (k: keyof LeadInput) => (errors[k] ? true : undefined);
  const desc = (k: keyof LeadInput) => (errors[k] ? `${id(k)}-error` : undefined);

  // Hero controls: 44px tall (still a comfortable touch target, 16px text so iOS never zooms), tighter label gap.
  const ctl = hero
    ? 'mt-1 block h-12 w-full rounded-ui border bg-white px-3.5 text-base text-fg placeholder:text-fg-soft transition-[border-color,box-shadow,background-color] duration-base ease-out [@media(hover:hover)]:hover:border-primary/60 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 lg:h-11'
    : input;

  const card = hero
    ? 'on-light w-full rounded-card border-t-[5px] border-t-primary bg-white p-4 text-fg shadow-[0_28px_70px_-20px_rgba(0,0,0,0.6)] ring-1 ring-black/5 sm:px-6 sm:py-5 lg:px-5 lg:py-3.5'
    : 'mx-auto max-w-3xl rounded-card bg-white p-6 text-fg shadow-card sm:p-8';

  const zipMessages: Record<Exclude<ZipStatus, 'empty'>, { Icon: LucideIcon; text: string; tone: string; call?: boolean }> = {
    served: { Icon: CheckCircle2, text: 'Great! We serve your area. You can continue with your service request.', tone: 'text-primary' },
    outside: { Icon: Info, text: 'We may not currently serve your area. Please contact our team to confirm availability.', tone: 'text-fg', call: true },
    unknown: { Icon: Info, text: 'Please contact our team to confirm service availability in your area.', tone: 'text-fg', call: true },
    invalid: { Icon: AlertTriangle, text: 'Please enter a valid 5-digit ZIP code.', tone: 'text-error' },
  };
  const zipMsg = zipResult ? zipMessages[zipResult] : null;
  // The live region is always mounted (and collapses when empty) so screen readers announce each result as it appears.
  const zipFeedback = (
    <div id={id('zip-status')} role="status" aria-live="polite" className={cn('empty:hidden', hero ? 'col-span-2' : 'mt-1.5')}>
      {zipMsg && (
        <p className={cn('flex items-start gap-2 text-[0.8125rem] leading-snug', zipMsg.tone, zipResult !== 'invalid' && 'font-medium')}>
          <zipMsg.Icon className="mt-px h-4 w-4 shrink-0" aria-hidden />
          <span>
            {zipMsg.text}
            {zipMsg.call && <> <a href={SITE.phoneHref} className="inline-flex min-h-6 items-center gap-1 whitespace-nowrap font-bold text-primary underline"><Phone className="h-3.5 w-3.5" aria-hidden />Call Now · {SITE.phone}</a></>}
          </span>
        </p>
      )}
    </div>
  );

  const content = (
        <div className={card}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="quick-title" className={hero ? 'h3-compact !text-[clamp(1.375rem,1.1rem+0.9vw,1.75rem)] lg:!text-[1.5rem]' : 'h3-compact'}>Request a Quick Callback</h2>
            <p className="shrink-0 text-xs font-semibold text-fg-soft"><span className="text-primary" aria-hidden>*</span> Required</p>
          </div>
          <p className={cn('text-fg-soft', hero ? 'mt-1 text-sm leading-snug lg:hidden' : 'mt-3 max-w-xl')}>{hero ? 'Tell us what you need and our team will call you back.' : 'Tell us what you need help with. Our team will have the details to guide you to the right service.'}</p>

          {status === 'success' ? (
            <div ref={successRef} tabIndex={-1} role="status" className="mt-5 rounded-card border border-line border-l-4 border-l-primary bg-white p-5 outline-none sm:p-6">
              <CheckCircle2 className="h-9 w-9 text-primary" aria-hidden />
              <h3 className="mt-3 text-xl font-bold !text-primary">Thank you{name.trim() ? `, ${name.trim().split(/\s+/)[0]}` : ''}!</h3>
              <p className="mt-2 text-[0.95rem]">Your request has been received. Our team will be in touch. We have your number as <strong className="whitespace-nowrap">{phone.trim()}</strong>.</p>
              <p className="mt-2 text-[0.95rem]">For anything urgent, call <a className="font-bold text-primary underline" href={SITE.phoneHref}>{SITE.phone}</a>. We answer 24/7 for plumbing emergencies.</p>
              <button type="button" onClick={resetForm} className={buttonClasses('secondary', 'md', 'mt-5 w-full sm:w-auto')}>Send another request</button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={status === 'submitting'} aria-describedby={id('note')} className={cn(hero ? 'mt-3 space-y-3 lg:mt-2.5 lg:space-y-2.5' : 'mt-6 space-y-5')}>
              <div className={cn('grid sm:grid-cols-2', hero ? 'gap-3' : 'gap-5')}>
                <Field id={id('firstName')} label="Your name" error={errors.firstName}>
                  <input id={id('firstName')} name="firstName" value={name} onChange={(e) => { setName(e.target.value); clear('firstName'); }} autoComplete="name" autoCapitalize="words" enterKeyHint="next" spellCheck={false} aria-invalid={bad('firstName')} aria-describedby={desc('firstName')} className={cn(ctl, border('firstName'))} />
                </Field>
                <Field id={id('phone')} label="Phone number" error={errors.phone}>
                  <input id={id('phone')} name="phone" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" placeholder="(425) 555-0123" value={phone} onChange={(e) => { setPhone(e.target.value); clear('phone'); }} onBlur={checkPhoneOnBlur} aria-invalid={bad('phone')} aria-describedby={desc('phone')} className={cn(ctl, border('phone'))} />
                </Field>
              </div>

              <fieldset aria-describedby={errors.category ? id('cat-error') : undefined}>
                <legend className="text-sm font-semibold text-fg">What do you need help with?<span className="text-primary" aria-hidden> *</span><span className="sr-only">(required)</span></legend>
                <div className={cn('mt-1 grid sm:grid-cols-4', hero ? 'grid-cols-4 gap-2 max-[359px]:grid-cols-2' : 'mt-1.5 grid-cols-2 gap-3')}>
                  {CATS.map(({ id: c, label, Icon }) => (
                    <label
                      key={c}
                      className={cn(
                        'relative flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-ui border-2 text-center font-bold leading-tight transition duration-200',
                        hero ? 'min-h-[56px] gap-1 px-1 py-1.5 text-[0.8125rem] lg:min-h-[46px] lg:py-1' : 'min-h-[72px] px-2 py-3 text-[0.95rem]',
                        'has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary',
                        cat === c ? 'border-primary bg-primary text-white' : 'border-line bg-white text-primary [@media(hover:hover)]:hover:border-primary [@media(hover:hover)]:hover:bg-cream',
                      )}
                    >
                      <input type="radio" name="quickCategory" value={c} checked={cat === c} onChange={() => pick(c)} className="sr-only" />
                      <Icon className={hero ? 'h-[18px] w-[18px]' : 'h-5 w-5'} aria-hidden />{label}
                    </label>
                  ))}
                </div>
                {errors.category && <p id={id('cat-error')} role="alert" className="mt-1.5 text-sm font-semibold text-error">{errors.category}</p>}

                {!hero && chipsFor(cat || 'not_sure').length > 0 && (
                  <div className={cn('space-y-2', hero ? 'mt-3' : 'mt-4 space-y-3')}>
                    <p className="text-[0.8125rem] font-semibold text-fg sm:text-sm">Pick a service <span className="font-normal text-fg-soft">(optional)</span></p>
                    {chipsFor(cat as Cat).map((g, gi) => (
                      <div key={g.label ?? gi}>
                        {g.label && <p className="mb-1.5 text-xs font-bold text-fg-soft">{g.label}</p>}
                        <ul className={cn('flex flex-wrap', hero ? 'gap-1.5' : 'gap-2')}>
                          {g.items.map((s) => (
                            <li key={s}>
                              <label className={cn('flex cursor-pointer items-center rounded-btn border border-line bg-white font-semibold', hero ? 'min-h-11 px-3 text-[0.8125rem] sm:min-h-9' : 'min-h-[44px] px-3.5 text-sm') + ' text-fg transition hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary'}>
                                <input type="checkbox" checked={services.includes(s)} onChange={() => toggle(s)} className="sr-only" />
                                {s}
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </fieldset>

              {/* Homepage hero: name, phone and "what do you need help with" only. ZIP, specific service and the message box are not shown here;
                  they stay in the full request form (QuoteForm, opened from the link under the card) and in the stand-alone `section` variant below. */}
              {!hero && (
              <div className="space-y-5">
              <div className="sm:max-w-[calc(50%-0.625rem)]">
                <Field id={id('zip')} label="ZIP code" required={false} optionalHint>
                  <input id={id('zip')} name="zip" inputMode="numeric" pattern="[0-9]*" autoComplete="postal-code" enterKeyHint="next" maxLength={10} placeholder="98204" value={zip} onChange={(e) => onZipChange(e.target.value)} onBlur={(e) => showZip(e.target.value)} aria-invalid={zipResult === 'invalid' ? true : undefined} aria-describedby={zipResult ? id('zip-status') : undefined} className={cn(ctl, zipBorder)} />
                </Field>
                {zipFeedback}
              </div>
              <Field id={id('message')} label="Brief description" required={false} optionalHint error={errors.message}>
                <textarea id={id('message')} name="message" autoCapitalize="sentences" rows={3} maxLength={2000} placeholder="Briefly describe what is happening..." value={message} onChange={(e) => { setMessage(e.target.value); clear('message'); }} aria-invalid={bad('message')} aria-describedby={desc('message')} className={cn(field, border('message'), 'min-h-[96px] resize-y py-3.5 leading-relaxed')} />
              </Field>
              </div>
              )}

              {/* Honeypot: hidden from people and assistive tech */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
                <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              </div>

              {/* Urgent selections: the phone number comes first, the form stays available but is clearly not dispatch. */}
              <div aria-live="polite">
                {urgent && (
                  <div className="rounded-card border border-primary border-l-4 border-l-primary bg-cream p-4">
                    <p className="flex items-start gap-3 text-[0.95rem] leading-snug">
                      <Siren className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                      <span>
                        {plumbingUrgent ? (
                          <>
                            <strong className="text-base text-primary">Emergency plumbing? Call now.</strong>
                            <span className="mt-1 block">For urgent plumbing assistance, call our team directly. Emergency plumbing is available 24/7. Sending this form does not dispatch a plumber.</span>
                          </>
                        ) : (
                          <>
                            <strong className="text-base text-primary">Electrical problem? Call us directly.</strong>
                            <span className="mt-1 block">Speak with our team by phone. If there is fire, smoke, sparking or a burning smell, call 911 first. This form is not an emergency response service.</span>
                          </>
                        )}
                      </span>
                    </p>
                    <a href={SITE.phoneHref} className={buttonClasses('primary', 'lg', 'mt-4 w-full')}><Phone className="h-5 w-5" aria-hidden /> Call Now · {SITE.phone}</a>
                  </div>
                )}
              </div>

              {/* Visual-only recap: each field's own message is already announced, so this is hidden from assistive tech. */}
              {attempted && errorCount > 0 && (
                <p aria-hidden className="flex items-center gap-2 rounded-field border border-error bg-white px-3 py-2 text-sm font-semibold text-error">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {errorCount === 1 ? 'One field needs your attention.' : `${errorCount} fields need your attention.`}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className={buttonClasses(urgent ? 'secondary' : 'primary', 'md', cn('w-full disabled:cursor-wait disabled:opacity-70', hero ? '!min-h-[56px] !text-[1.0625rem] shadow-lg lg:!min-h-[52px]' : 'sm:w-auto sm:min-w-[240px]'))}
              >
                {status === 'submitting' ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Sending…</> : <>Request a Callback{hero && <ArrowRight className="h-5 w-5" aria-hidden />}</>}
              </button>

              <p id={id('note')} className={cn('text-fg-soft', hero ? 'text-xs leading-snug lg:text-[0.6875rem] lg:leading-[1.3]' : 'text-xs leading-relaxed')}>
                Once you submit our form, we may reach out to you via phone, email, or text to communicate service details, which you can opt out of at any time.
                This form consent is not a condition of purchase. Message/data rates apply.{' '}
                <a className="font-semibold underline" href={orig('/terms-conditions/')}>Terms and Conditions</a> | <a className="font-semibold underline" href={orig('/privacy-policy/')}>Privacy Policy</a>.
              </p>

              <div aria-live="polite">
                {status === 'submitting' && <p className="sr-only">Sending your request…</p>}
                {status === 'not_configured' && (
                  <div role="alert" className="flex gap-3 rounded-field border border-line border-l-4 border-l-primary bg-white p-4 text-sm text-fg">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <p><strong>Online requests aren&rsquo;t connected yet on this site.</strong> Nothing was sent. Please call <a href={SITE.phoneHref} className="font-bold underline">{SITE.phone}</a>.</p>
                  </div>
                )}
                {status === 'error' && (
                  <div role="alert" className="flex gap-3 rounded-field border border-error border-l-4 bg-white p-4 text-sm text-fg">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <p>Something went wrong and your request may not have been sent. Your details are still here. Please try again, or call <a href={SITE.phoneHref} className="font-bold underline">{SITE.phone}</a>.</p>
                  </div>
                )}
              </div>
            </form>
          )}
        </div>
  );

  if (hero) {
    // Lives inside the hero: no band of its own. The id stays so "#quick-request" links and data-quick-service buttons keep working.
    return (
      <section id="quick-request" aria-labelledby="quick-title" className="scroll-mt-24">
        <ContactVisibility targetId="quick-request" />
        {content}
        {/* Everything the short form leaves out (ZIP code, specific service, message) lives in the full request form. */}
        <p className="mt-3 text-center text-sm leading-snug text-white/90 lg:text-left">
          Need to add your ZIP code or more details?{' '}
          <button type="button" aria-haspopup="dialog" onClick={() => openFullForm('quote', true)} className="inline-block whitespace-nowrap py-2 font-bold text-white underline underline-offset-4 hover:text-cream">
            Use the full request form
          </button>
        </p>
      </section>
    );
  }
  return (
    <section id="quick-request" aria-labelledby="quick-title" className="bg-cream py-10 lg:py-14">
      <ContactVisibility targetId="quick-request" />
      <div className="container-x">{content}</div>
    </section>
  );
}
