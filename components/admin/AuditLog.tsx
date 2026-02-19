'use client';

import { ScrollText, Construction } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AuditLog() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-accent-primary" />
          Audit Log
        </h1>
        <p className="text-text-secondary mt-1">
          Track all administrative actions and user activity across the platform.
        </p>
      </div>

      <Card className="bg-bg-surface border-border-default">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Construction className="w-5 h-5 text-yellow-500" />
            <div>
              <CardTitle className="text-text-primary">Coming Soon</CardTitle>
              <CardDescription className="text-text-secondary">
                Audit log system is under development
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-text-secondary">
            The Audit Log will provide a comprehensive history of all actions taken within Forge:
          </p>
          <ul className="space-y-2 text-sm text-text-secondary list-none">
            {[
              'User login and logout events',
              'Role and permission changes',
              'Content creation, edits, and deletions',
              'Admin configuration changes',
              'API key usage and rotations',
              'Export and sharing events',
              'Failed authentication attempts',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10">
            Planned for v2.0
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
