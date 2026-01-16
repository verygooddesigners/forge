'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isMicrosoftSSOEnabled, MICROSOFT_SSO_CONFIG } from '@/lib/auth-microsoft';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function SSOConfigStatus() {
  const [config, setConfig] = useState<{
    isEnabled: boolean;
    hasClientId: boolean;
    hasTenantId: boolean;
    tenantId: string;
  }>({
    isEnabled: false,
    hasClientId: false,
    hasTenantId: false,
    tenantId: '',
  });

  useEffect(() => {
    setConfig({
      isEnabled: isMicrosoftSSOEnabled(),
      hasClientId: !!MICROSOFT_SSO_CONFIG.clientId,
      hasTenantId: !!MICROSOFT_SSO_CONFIG.tenantId,
      tenantId: MICROSOFT_SSO_CONFIG.tenantId || 'common',
    });
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Microsoft SSO Configuration</CardTitle>
          <Badge variant={config.isEnabled ? 'default' : 'secondary'}>
            {config.isEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <CardDescription>
          OAuth authentication provider status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border-default">
            <div className="flex items-center gap-2">
              {getStatusIcon(config.hasClientId)}
              <span className="text-sm font-medium">Azure Client ID</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {config.hasClientId ? 'Configured' : 'Missing'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-border-default">
            <div className="flex items-center gap-2">
              {getStatusIcon(config.hasTenantId)}
              <span className="text-sm font-medium">Azure Tenant ID</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {config.hasTenantId ? config.tenantId : 'Using default (common)'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(config.isEnabled)}
              <span className="text-sm font-medium">SSO Status</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {config.isEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {!config.isEnabled && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Microsoft SSO is not configured</p>
              <p>
                Add <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 py-0.5 rounded">
                  NEXT_PUBLIC_AZURE_CLIENT_ID
                </code> to your environment variables to enable.
              </p>
              <p className="mt-2">
                See <code>docs/microsoft-sso-quick-start.md</code> for setup instructions.
              </p>
            </div>
          </div>
        )}

        {config.isEnabled && (
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-800 dark:text-green-200">
              <p className="font-medium mb-1">Microsoft SSO is ready!</p>
              <p>
                Users can now sign in with their Microsoft accounts on the login page.
              </p>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-border-default">
          <h4 className="text-xs font-medium mb-2">Next Steps:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            {!config.hasClientId && (
              <li>Request Azure credentials from IT department</li>
            )}
            {!config.hasClientId && (
              <li>Configure Azure provider in Supabase dashboard</li>
            )}
            {config.isEnabled && (
              <li>Test SSO flow on login page</li>
            )}
            {config.isEnabled && (
              <li>Verify user data syncs correctly</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
