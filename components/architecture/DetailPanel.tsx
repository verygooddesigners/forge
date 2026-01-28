'use client';

import { X, FileCode, Wrench } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArchitectureNode } from '@/lib/architecture-data';
import { cn } from '@/lib/utils';

interface DetailPanelProps {
  node: ArchitectureNode;
  onClose: () => void;
}

const typeLabels = {
  frontend: 'Frontend Component',
  api: 'API Endpoint',
  agent: 'AI Agent',
  database: 'Database Table',
  external: 'External Service',
};

const typeBadgeColors = {
  frontend: 'bg-violet-500/20 text-violet-300 border-violet-500/50',
  api: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  agent: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
  database: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
  external: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
};

export function DetailPanel({ node, onClose }: DetailPanelProps) {
  const IconComponent = (Icons as any)[node.icon] || Icons.Box;

  return (
    <div className="absolute top-32 right-4 z-20 w-96 max-h-[calc(100vh-180px)] overflow-auto">
      <Card className="bg-bg-elevated border-border-subtle shadow-2xl">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn('mt-1', `text-${node.type === 'frontend' ? 'violet' : node.type === 'api' ? 'blue' : node.type === 'agent' ? 'emerald' : node.type === 'database' ? 'amber' : 'slate'}-400`)}>
              <IconComponent size={24} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-text-primary">
                {node.label}
              </CardTitle>
              <Badge className={cn('mt-2', typeBadgeColors[node.type])}>
                {typeLabels[node.type]}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-text-secondary hover:text-text-primary"
          >
            <X size={18} />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-2">
              Description
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {node.description}
            </p>
          </div>

          {/* Features */}
          {node.features.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                Key Features
              </h3>
              <ul className="space-y-2">
                {node.features.map((feature, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-text-secondary flex items-start gap-2"
                  >
                    <span className="text-accent-primary mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technology Stack */}
          {node.tech.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wrench size={14} className="text-text-secondary" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Technology Stack
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {node.tech.map((tech, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-bg-surface text-text-secondary border-border-subtle"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Code Files */}
          {node.files && node.files.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileCode size={14} className="text-text-secondary" />
                <h3 className="text-sm font-semibold text-text-primary">
                  Code Location
                </h3>
              </div>
              <div className="space-y-2">
                {node.files.map((file, idx) => (
                  <code
                    key={idx}
                    className="block text-xs text-accent-primary bg-bg-surface px-3 py-2 rounded border border-border-subtle break-all"
                  >
                    {file}
                  </code>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
