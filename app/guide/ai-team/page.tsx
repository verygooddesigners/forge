import type { Metadata } from 'next';
import AITeamPage from './AITeamPage';

export const metadata: Metadata = {
  title: 'AI Team Architecture - Forge | Multi-Agent System Documentation',
  description: 'Technical documentation for Forge\'s multi-agent AI system. Learn how 7 specialized AI agents collaborate to produce SEO-optimized content. Includes API requirements, cost analysis, and security compliance information.',
  keywords: [
    'Forge AI architecture',
    'multi-agent system',
    'Claude AI',
    'content generation AI',
    'SEO optimization',
    'AI agents',
    'technical documentation',
    'API integration',
  ],
  openGraph: {
    title: 'Forge AI Team Architecture',
    description: 'Technical documentation for Forge\'s 7-agent AI system',
    type: 'website',
  },
};

export default function Page() {
  return <AITeamPage />;
}

