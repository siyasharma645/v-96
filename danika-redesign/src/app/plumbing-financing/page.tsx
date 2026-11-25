import type { Metadata } from 'next';
import { ComingSoon } from '@/components/ComingSoon';

export const metadata: Metadata = {
  title: 'Plumbing Financing',
  alternates: { canonical: '/plumbing-financing' },
  robots: { index: false, follow: true }, // placeholder until the page is built
};

export default function PlumbingFinancingPage() {
  return <ComingSoon title="Plumbing Financing" blurb="Details on financing options are coming soon. Call us any time to talk through your project." />;
}
