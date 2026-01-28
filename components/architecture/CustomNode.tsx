'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomNodeProps {
  data: {
    label: string;
    type: 'frontend' | 'api' | 'agent' | 'database' | 'external';
    icon: string;
    highlighted?: boolean;
    dimmed?: boolean;
    onSelect: () => void;
  };
}

const typeColors = {
  frontend: 'bg-violet-500/20 border-violet-500 text-violet-300',
  api: 'bg-blue-500/20 border-blue-500 text-blue-300',
  agent: 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
  database: 'bg-amber-500/20 border-amber-500 text-amber-300',
  external: 'bg-slate-500/20 border-slate-500 text-slate-300',
};

const typeIconColors = {
  frontend: 'text-violet-400',
  api: 'text-blue-400',
  agent: 'text-emerald-400',
  database: 'text-amber-400',
  external: 'text-slate-400',
};

export const CustomNode = memo(({ data }: CustomNodeProps) => {
  const IconComponent = (Icons as any)[data.icon] || Icons.Box;

  return (
    <div
      onClick={data.onSelect}
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-lg cursor-pointer transition-all duration-200',
        'hover:shadow-xl hover:scale-105',
        'min-w-[180px] max-w-[220px]',
        typeColors[data.type],
        data.highlighted && 'ring-4 ring-white/50 scale-110 shadow-2xl',
        data.dimmed && 'opacity-30'
      )}
    >
      <Handle type="target" position={Position.Left} className="!bg-white !w-3 !h-3" />
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', typeIconColors[data.type])}>
          <IconComponent size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight break-words">
            {data.label}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-white !w-3 !h-3" />
    </div>
  );
});

CustomNode.displayName = 'CustomNode';
