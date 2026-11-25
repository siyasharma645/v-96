import { Hero } from '@/components/Hero';
import { ServiceDiscovery } from '@/components/ServiceDiscovery';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { ProcessSection } from '@/components/ProcessSection';
import { AboutSection } from '@/components/AboutSection';
import { ProjectsSection } from '@/components/ProjectsSection';
import { Testimonials } from '@/components/Testimonials';
import { ServiceAreas } from '@/components/ServiceAreas';
import { FAQ } from '@/components/FAQ';
import { FinalCTA } from '@/components/FinalCTA';
import { JsonLd } from '@/components/JsonLd';

export default function HomePage() {
  return (
    <main id="main">
      <JsonLd />
      <Hero />
      <ServiceDiscovery />
      <WhyChooseUs />
      <ProcessSection />
      <ProjectsSection />
      <Testimonials />
      <AboutSection />
      <ServiceAreas />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
