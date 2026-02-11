'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PermissionKeyBadge } from '@/components/tools/ToolPermissionBadge';
import {
  ArrowLeft,
  Download,
  Check,
  Loader2,
  Package,
  ExternalLink,
  Shield,
  User,
  Calendar,
  X,
} from 'lucide-react';
import type { Tool } from '@/types/tools';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ToolWithInstall extends Tool {
  is_installed?: boolean;
  is_enabled?: boolean;
  author?: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export function ToolProfileClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [tool, setTool] = useState<ToolWithInstall | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTool();
  }, [slug]);

  const fetchTool = async () => {
    setLoading(true);
    try {
      // First get tool by slug
      const response = await fetch(`/api/tools?search=${slug}`);
      if (response.ok) {
        const data = await response.json();
        const foundTool = data.tools.find((t: Tool) => t.slug === slug);
        
        if (foundTool) {
          // Then get full details with install status
          const detailResponse = await fetch(`/api/tools/${foundTool.id}`);
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            setTool(detailData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching tool:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    if (!tool) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/tools/${tool.id}/install`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchTool();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to install tool');
      }
    } catch (error) {
      console.error('Error installing tool:', error);
      alert('Failed to install tool');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUninstall = async () => {
    if (!tool) return;

    if (!confirm('Are you sure you want to uninstall this tool?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/tools/${tool.id}/uninstall`, {
        method: 'POST',
      });

      if (response.ok) {
        await fetchTool();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to uninstall tool');
      }
    } catch (error) {
      console.error('Error uninstalling tool:', error);
      alert('Failed to uninstall tool');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary p-10">
        <div className="max-w-4xl mx-auto">
          <div className="h-96 bg-bg-elevated rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-bg-primary p-10">
        <div className="max-w-4xl mx-auto text-center py-20">
          <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Tool not found
          </h2>
          <p className="text-text-secondary mb-6">
            The tool you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/tools">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Link href="/tools">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>
        </Link>

        {/* Header Card */}
        <Card className="p-8">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-violet-500/10 flex items-center justify-center">
              {tool.icon_url ? (
                <img
                  src={tool.icon_url}
                  alt={tool.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Package className="w-10 h-10 text-violet-500" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary">
                    {tool.name}
                  </h1>
                  <p className="text-text-secondary mt-2">
                    {tool.description_short}
                  </p>
                </div>
                <Badge variant="secondary">v{tool.version}</Badge>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-text-secondary">
                {tool.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{tool.author.full_name || tool.author.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(tool.created_at).toLocaleDateString()}
                  </span>
                </div>
                <a
                  href={tool.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-violet-500 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on GitHub</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                {tool.is_installed ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleUninstall}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uninstalling...
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          Uninstall
                        </>
                      )}
                    </Button>
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-500 px-4 py-2"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Installed
                    </Badge>
                  </>
                ) : (
                  <Button onClick={handleInstall} disabled={actionLoading}>
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Installing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Install Tool
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            About this Tool
          </h2>
          <div className="prose prose-invert max-w-none text-text-secondary">
            {tool.description_long.split('\n').map((paragraph, i) => (
              <p key={i} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </Card>

        {/* Permissions */}
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-violet-500" />
            <h2 className="text-xl font-semibold text-text-primary">
              Permissions Required
            </h2>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            This tool requires the following permissions to function:
          </p>
          {tool.permissions_requested.length === 0 ? (
            <p className="text-sm text-text-tertiary italic">
              No special permissions required
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tool.permissions_requested.map((permission) => (
                <PermissionKeyBadge
                  key={permission}
                  permissionKey={permission}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
