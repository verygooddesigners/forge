'use client';

import { TrendingUp, Construction } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function OddsApiManagement() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-accent-primary" />
          Odds API Management
        </h1>
        <p className="text-text-secondary mt-1">
          Manage internal sports odds API integrations for dynamic content generation.
        </p>
      </div>

      <Card className="bg-bg-surface border-border-default">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Construction className="w-5 h-5 text-yellow-500" />
            <div>
              <CardTitle className="text-text-primary">Coming Soon</CardTitle>
              <CardDescription className="text-text-secondary">
                Odds API integration is under development
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-text-secondary">
            This screen will allow you to manage internal sports odds API integrations.
            Once live, you&apos;ll be able to:
          </p>
          <ul className="space-y-2 text-sm text-text-secondary list-none">
            {[
              'Connect to live odds data providers',
              'Configure sport leagues and data feeds',
              'Set refresh intervals for odds data',
              'Map odds data fields to content templates',
              'Monitor API usage and rate limits',
              'Configure fallback data sources',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10">
            Planned for v2.0
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
