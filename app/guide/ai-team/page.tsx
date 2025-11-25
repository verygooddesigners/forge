import type { Metadata } from 'next';
import AITeamPage from './AITeamPage';

export const metadata: Metadata = {
  title: 'AI Team Architecture - RotoWrite | Multi-Agent System Documentation',
  description: 'Technical documentation for RotoWrite\'s multi-agent AI system. Learn how 7 specialized AI agents collaborate to produce SEO-optimized content. Includes API requirements, cost analysis, and security compliance information.',
  keywords: [
    'RotoWrite AI architecture',
    'multi-agent system',
    'Claude AI',
    'content generation AI',
    'SEO optimization',
    'AI agents',
    'technical documentation',
    'API integration',
  ],
  openGraph: {
    title: 'RotoWrite AI Team Architecture',
    description: 'Technical documentation for RotoWrite\'s 7-agent AI system',
    type: 'website',
  },
};

export default function Page() {
  return <AITeamPage />;
}

