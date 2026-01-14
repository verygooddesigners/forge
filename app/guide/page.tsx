import type { Metadata } from 'next';
import UserGuidePage from './UserGuidePage';

export const metadata: Metadata = {
  title: 'User Guide - RotoWrite | AI-Powered SEO Content Creation',
  description: 'Complete guide to using RotoWrite for creating SEO-optimized content with AI while maintaining your authentic voice. Learn about Writer Models, Briefs, and the SEO Wizard.',
  keywords: [
    'RotoWrite user guide',
    'AI content creation',
    'SEO writing tool',
    'content optimization',
    'writer models',
    'SEO wizard',
    'content briefs',
  ],
  openGraph: {
    title: 'RotoWrite User Guide',
    description: 'Master AI-powered SEO content creation with RotoWrite',
    type: 'website',
  },
};

export default function Page() {
  return <UserGuidePage />;
}



