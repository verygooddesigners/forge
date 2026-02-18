'use client';

import { Card } from '@/components/ui/card';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, className }: ChartCardProps) {
  return (
    <Card className={`p-5 ${className || ''}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        {subtitle && (
          <p className="text-xs text-text-tertiary mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="w-full">{children}</div>
    </Card>
  );
}
