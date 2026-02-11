'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Download, Check, Loader2 } from 'lucide-react';
import type { ToolWithInstallStatus } from '@/types/tools';
import Link from 'next/link';

interface ToolCardProps {
  tool: ToolWithInstallStatus;
  onInstallChange?: () => void;
}

export function ToolCard({ tool, onInstallChange }: ToolCardProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(tool.is_installed);

  const handleInstall = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInstalled) {
      // Navigate to tool profile for uninstall
      return;
    }

    setIsInstalling(true);
    try {
      const response = await fetch(`/api/tools/${tool.id}/install`, {
        method: 'POST',
      });

      if (response.ok) {
        setIsInstalled(true);
        onInstallChange?.();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to install tool');
      }
    } catch (error) {
      console.error('Error installing tool:', error);
      alert('Failed to install tool');
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Link href={`/tools/${tool.slug}`}>
      <Card className="group relative overflow-hidden border-border-default hover:border-violet-500 transition-all duration-200 cursor-pointer h-full">
        <div className="p-6 space-y-4">
          {/* Icon and Name */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center">
              {tool.icon_url ? (
                <img
                  src={tool.icon_url}
                  alt={tool.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <Package className="w-6 h-6 text-violet-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-text-primary group-hover:text-violet-500 transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                v{tool.version}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-text-secondary line-clamp-2">
            {tool.description_short}
          </p>

          {/* Stats and Install Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span>{tool.install_count} installs</span>
              <span>{tool.permissions_requested.length} permissions</span>
            </div>

            <Button
              size="sm"
              variant={isInstalled ? 'outline' : 'default'}
              onClick={handleInstall}
              disabled={isInstalling}
              className={isInstalled ? 'border-violet-500 text-violet-500' : ''}
            >
              {isInstalling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Installing...
                </>
              ) : isInstalled ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Installed
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </>
              )}
            </Button>
          </div>

          {/* Permissions Badge */}
          {tool.permissions_requested.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2 border-t border-border-default">
              {tool.permissions_requested.slice(0, 3).map((permission) => (
                <Badge
                  key={permission}
                  variant="secondary"
                  className="text-xs"
                >
                  {permission.split('.')[0]}
                </Badge>
              ))}
              {tool.permissions_requested.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{tool.permissions_requested.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
