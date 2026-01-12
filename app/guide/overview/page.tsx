import type { Metadata } from 'next';
import OverviewPage from './OverviewPage';

export const metadata: Metadata = {
  title: 'App Overview - RotoWrite | AI-Powered Content Creation Platform',
  description: 'Discover what makes RotoWrite special: RAG-based writer models that learn your style, intelligent SEO optimization, and AI-powered content generation for sports betting content.',
  keywords: [
    'RotoWrite overview',
    'AI content platform',
    'writer models',
    'SEO content creation',
    'sports betting content',
    'RAG technology',
    'content workflow',
  ],
  openGraph: {
    title: 'RotoWrite App Overview',
    description: 'AI-powered content creation platform for sports betting articles',
    type: 'website',
  },
};

export default function Page() {
  return <OverviewPage />;
}
