'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

const legendItems = [
  { color: 'bg-violet-500', label: 'Frontend' },
  { color: 'bg-blue-500', label: 'API' },
  { color: 'bg-emerald-500', label: 'AI Agents' },
  { color: 'bg-amber-500', label: 'Database' },
  { color: 'bg-slate-500', label: 'External' },
];

export function Legend() {
  return (
    <Card className="w-64 bg-bg-elevated/95 backdrop-blur-sm border-border-subtle shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Info size={16} />
          Legend
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {legendItems.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs text-text-secondary">{label}</span>
          </div>
        ))}
        <div className="pt-2 mt-2 border-t border-border-subtle">
          <p className="text-[10px] text-text-tertiary">
            Click any node for details
          </p>
          <p className="text-[10px] text-text-tertiary mt-1">
            Select workflows to highlight paths
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
