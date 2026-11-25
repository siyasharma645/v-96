import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

// Title and breadcrumb wording come from the original page (danikaplumbing.com/blog/).
export const metadata: Metadata = {
  title: 'Plumbing Tips & Guides',
  alternates: { canonical: '/blog' },
  robots: { index: false, follow: true }, // keep out of search until the listing is built
};

/** Blog page shell: intro band + an empty main content container. Article listing, filters and pagination come in later steps. */
export default function BlogPage() {
  return (
    <main id="main">
      <section aria-labelledby="blog-title" className="section surface surface-cream bg-cream">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-fg-soft">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="underline-offset-4 hover:underline">Home</Link></li>
              <li aria-hidden><ChevronRight className="h-3.5 w-3.5" /></li>
              <li aria-current="page" className="font-semibold text-primary-dark">Blog</li>
            </ol>
          </nav>
          <h1 id="blog-title" className="h2">Blog</h1>
        </div>
      </section>

      {/* Main content container for the upcoming article listing. */}
      <section id="blog-content" aria-label="Articles" className="section bg-white">
        <div className="container-x" />
      </section>
    </main>
  );
}
