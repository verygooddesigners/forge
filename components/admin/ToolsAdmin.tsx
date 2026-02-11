'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PermissionKeyBadge } from '@/components/tools/ToolPermissionBadge';
import {
  Check,
  X,
  ExternalLink,
  Package,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { ToolWithAuthor } from '@/types/tools';

export function ToolsAdmin() {
  const [pendingTools, setPendingTools] = useState<ToolWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingTools();
  }, []);

  const fetchPendingTools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tools/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingTools(data.tools);
      }
    } catch (error) {
      console.error('Error fetching pending tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (toolId: string) => {
    setActionLoading(toolId);
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      });

      if (response.ok) {
        await fetchPendingTools();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to approve tool');
      }
    } catch (error) {
      console.error('Error approving tool:', error);
      alert('Failed to approve tool');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (toolId: string) => {
    const reason = prompt('Rejection reason (optional):');
    
    setActionLoading(toolId);
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved: false,
          rejection_reason: reason,
        }),
      });

      if (response.ok) {
        await fetchPendingTools();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to reject tool');
      }
    } catch (error) {
      console.error('Error rejecting tool:', error);
      alert('Failed to reject tool');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-bg-elevated rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (pendingTools.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Package className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">
          No pending tools
        </h3>
        <p className="text-text-secondary">
          All tool submissions have been reviewed
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-yellow-500" />
        <p className="text-sm text-text-secondary">
          {pendingTools.length} tool{pendingTools.length !== 1 ? 's' : ''} awaiting review
        </p>
      </div>

      {/* Pending Tools List */}
      {pendingTools.map((tool) => (
        <Card key={tool.id} className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
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
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {tool.description_short}
                  </p>
                </div>
              </div>
              <Badge variant="secondary">v{tool.version}</Badge>
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <span>
                <strong>Author:</strong>{' '}
                {tool.author?.full_name || tool.author?.email}
              </span>
              <span>
                <strong>Submitted:</strong>{' '}
                {new Date(tool.created_at).toLocaleDateString()}
              </span>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">
                Description
              </h4>
              <p className="text-sm text-text-secondary">
                {tool.description_long}
              </p>
            </div>

            {/* GitHub Link */}
            <div>
              <a
                href={tool.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-violet-500 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                View GitHub Repository
              </a>
            </div>

            {/* Permissions */}
            {tool.permissions_requested.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">
                  Requested Permissions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {tool.permissions_requested.map((permission) => (
                    <PermissionKeyBadge
                      key={permission}
                      permissionKey={permission}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sidebar Config */}
            <div className="bg-bg-elevated p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-text-primary mb-2">
                Sidebar Configuration
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-text-tertiary">Label:</span>
                  <p className="text-text-primary font-medium">
                    {tool.sidebar_label}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Icon:</span>
                  <p className="text-text-primary font-medium">
                    {tool.sidebar_icon}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Order:</span>
                  <p className="text-text-primary font-medium">
                    {tool.sidebar_order}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleApprove(tool.id)}
                disabled={actionLoading === tool.id}
                className="flex-1"
              >
                {actionLoading === tool.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Approve Tool
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReject(tool.id)}
                disabled={actionLoading === tool.id}
                className="flex-1"
              >
                {actionLoading === tool.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Reject Tool
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
