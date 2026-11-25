import { processSteps } from '@/data/services';
import { Reveal } from '@/components/ui/Reveal';
import { Timeline } from '@/components/Timeline';

/** How the process works: what happens from the first call to finished work. */
export function ProcessSection() {
  return (
    <section id="process" aria-labelledby="process-title" className="section surface surface-dots bg-white">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow justify-center">The Danika way</p>
          <h2 id="process-title" className="h2">From your first call to finished work</h2>
        </Reveal>
        <Reveal className="mt-6 sm:mt-8">
          <Timeline steps={processSteps} />
        </Reveal>
      </div>
    </section>
  );
}
