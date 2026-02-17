import type { Metadata } from 'next';
import TimeSavingsPage from './TimeSavingsPage';

export const metadata: Metadata = {
  title: 'Time Savings Calculator - Forge | Calculate Your Content ROI',
  description:
    'Calculate how much time your team could save with Forge. Interactive calculator shows weekly, monthly, and annual time savings for new articles, updates, and complex data-driven content.',
  keywords: [
    'Forge time savings',
    'content creation ROI',
    'AI writing efficiency',
    'team productivity calculator',
    'content automation savings',
    'writing time reduction',
    'SEO content efficiency',
  ],
  openGraph: {
    title: 'Time Savings Calculator - Forge',
    description: 'Calculate how much time your team could save with AI-powered content creation',
    type: 'website',
  },
};

export default function Page() {
  return <TimeSavingsPage />;
}


