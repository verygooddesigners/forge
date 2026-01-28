'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Workflow as WorkflowIcon, X } from 'lucide-react';
import { Workflow } from '@/lib/architecture-data';
import { cn } from '@/lib/utils';

interface WorkflowSelectorProps {
  workflows: Workflow[];
  selectedWorkflow: string | null;
  onSelect: (workflowId: string | null) => void;
}

export function WorkflowSelector({
  workflows,
  selectedWorkflow,
  onSelect,
}: WorkflowSelectorProps) {
  return (
    <Card className="w-56 bg-bg-elevated/70 backdrop-blur-md border-border-subtle shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-text-primary flex items-center gap-2 truncate">
            <WorkflowIcon size={16} className="flex-shrink-0" />
            <span className="truncate">Workflows</span>
          </CardTitle>
          {selectedWorkflow && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSelect(null)}
              className="h-6 w-6 text-text-secondary hover:text-text-primary flex-shrink-0"
            >
              <X size={14} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {workflows.map((workflow) => (
          <Button
            key={workflow.id}
            variant="ghost"
            size="sm"
            onClick={() =>
              onSelect(selectedWorkflow === workflow.id ? null : workflow.id)
            }
            className={cn(
              'w-full justify-start text-left h-auto py-2 px-3',
              'hover:bg-bg-surface',
              selectedWorkflow === workflow.id &&
                'bg-bg-surface border-l-2 text-text-primary'
            )}
            style={{
              borderLeftColor:
                selectedWorkflow === workflow.id ? workflow.color : 'transparent',
            }}
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-medium truncate">{workflow.name}</span>
              <span className="text-[10px] text-text-secondary font-normal line-clamp-2">
                {workflow.description}
              </span>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
