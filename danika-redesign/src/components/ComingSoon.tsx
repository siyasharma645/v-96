import { ButtonLink } from '@/components/ui/Button';

/** Temporary page body for routes that are reserved but not built yet. */
export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <main id="main">
      <section aria-labelledby="soon-title" className="section bg-cream">
        <div className="container-x flex flex-col items-start gap-5">
          <h1 id="soon-title" className="h2">{title}</h1>
          <p className="max-w-xl text-[1.0625rem] text-fg-soft">{blurb}</p>
          <ButtonLink href="/" variant="primary">Back to home</ButtonLink>
        </div>
      </section>
    </main>
  );
}
