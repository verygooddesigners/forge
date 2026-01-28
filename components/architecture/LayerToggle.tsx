'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Layers } from 'lucide-react';

type LayerKey = 'frontend' | 'api' | 'agent' | 'database' | 'external';

interface LayerToggleProps {
  layers: Record<LayerKey, boolean>;
  onToggle: (layer: LayerKey) => void;
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
    <Card className="w-56 bg-bg-elevated/70 backdrop-blur-md border-border-subtle shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Layers size={16} className="flex-shrink-0" />
          <span className="truncate">Layers</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {layerInfo.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-2">
            <Checkbox
              id={key}
              checked={layers[key]}
              onCheckedChange={() => onToggle(key)}
              className="border-border-subtle data-[state=checked]:bg-accent-primary data-[state=checked]:border-accent-primary flex-shrink-0"
            />
            <Label
              htmlFor={key}
              className={`text-sm cursor-pointer truncate ${color} ${
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
