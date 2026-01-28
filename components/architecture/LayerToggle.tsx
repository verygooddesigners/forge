'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Layers } from 'lucide-react';

interface LayerToggleProps {
  layers: {
    frontend: boolean;
    api: boolean;
    agent: boolean;
    database: boolean;
    external: boolean;
  };
  onToggle: (layer: keyof typeof layers) => void;
}

const layerInfo = [
  { key: 'frontend' as const, label: 'Frontend', color: 'text-violet-400' },
  { key: 'api' as const, label: 'API Layer', color: 'text-blue-400' },
  { key: 'agent' as const, label: 'AI Agents', color: 'text-emerald-400' },
  { key: 'database' as const, label: 'Database', color: 'text-amber-400' },
  { key: 'external' as const, label: 'External Services', color: 'text-slate-400' },
];

export function LayerToggle({ layers, onToggle }: LayerToggleProps) {
  return (
    <Card className="w-64 bg-bg-elevated/95 backdrop-blur-sm border-border-subtle shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Layers size={16} />
          Layers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {layerInfo.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <Checkbox
              id={key}
              checked={layers[key]}
              onCheckedChange={() => onToggle(key)}
              className="border-border-subtle data-[state=checked]:bg-accent-primary data-[state=checked]:border-accent-primary"
            />
            <Label
              htmlFor={key}
              className={`text-sm cursor-pointer ${color} ${
                !layers[key] && 'opacity-50'
              }`}
            >
              {label}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
