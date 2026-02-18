'use client';

import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, UsersRound } from 'lucide-react';
import { canManageTeams } from '@/lib/auth-config';

interface TeamManagementProps {
  adminUser: User;
}

export function TeamManagement({ adminUser }: TeamManagementProps) {
  const canManage = canManageTeams(adminUser.role);

  return (
    <div className="space-y-6">
      <Card className="border border-border-subtle bg-bg-surface">
        <CardHeader>
          <CardTitle className="text-lg">Manage Teams</CardTitle>
          <CardDescription>
            Create and edit teams to organize users and control access. Team membership can be used to scope projects and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canManage ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-lg bg-bg-elevated border border-border-subtle flex items-center justify-center mb-4">
                <UsersRound className="w-6 h-6 text-text-tertiary" />
              </div>
              <p className="text-sm text-text-secondary max-w-md mb-6">
                Team management will be available here once the teams feature is fully wired. You can create teams, add or remove members, and assign team leaders.
              </p>
              <Button disabled className="gap-2" variant="secondary">
                <Plus className="w-4 h-4" />
                Create team (coming soon)
              </Button>
            </div>
          ) : (
            <p className="text-sm text-text-tertiary">You don’t have permission to manage teams.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
