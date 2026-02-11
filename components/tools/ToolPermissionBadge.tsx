'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ToolPermission } from '@/types/tools';

interface ToolPermissionBadgeProps {
  permission: ToolPermission;
  showIcon?: boolean;
}

export function ToolPermissionBadge({ permission, showIcon = true }: ToolPermissionBadgeProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-red-500';
      default:
        return 'text-text-secondary';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <ShieldCheck className="w-3 h-3" />;
      case 'medium':
        return <Shield className="w-3 h-3" />;
      case 'high':
        return <ShieldAlert className="w-3 h-3" />;
      default:
        return <Shield className="w-3 h-3" />;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`cursor-help ${getRiskColor(permission.risk_level)}`}
          >
            {showIcon && (
              <span className="mr-1.5">
                {getRiskIcon(permission.risk_level)}
              </span>
            )}
            {permission.display_name}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{permission.display_name}</p>
            <p className="text-sm text-text-secondary">{permission.description}</p>
            <p className="text-xs text-text-tertiary">
              Risk level: <span className={getRiskColor(permission.risk_level)}>
                {permission.risk_level.toUpperCase()}
              </span>
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface PermissionKeyBadgeProps {
  permissionKey: string;
}

export function PermissionKeyBadge({ permissionKey }: PermissionKeyBadgeProps) {
  // Simple badge for when we don't have the full permission object
  const [category, action] = permissionKey.split('.');
  
  return (
    <Badge variant="outline" className="text-xs">
      <span className="font-semibold">{category}</span>
      {action && <span className="ml-1 text-text-tertiary">.{action}</span>}
    </Badge>
  );
}
