'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePermissions(userId: string) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchPermissions() {
      setLoading(true);
      const supabase = createClient();

      // Get user's current role
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Fetch role permissions and user overrides in parallel
      const [{ data: rolePerms }, { data: overrides }] = await Promise.all([
        supabase
          .from('role_permissions')
          .select('permission_key, enabled')
          .eq('role', profile.role),
        supabase
          .from('user_permission_overrides')
          .select('permission_key, enabled')
          .eq('user_id', userId),
      ]);

      const perms: Record<string, boolean> = {};

      // Role permissions first
      for (const row of rolePerms ?? []) {
        perms[row.permission_key] = row.enabled;
      }

      // User overrides take precedence
      for (const row of overrides ?? []) {
        perms[row.permission_key] = row.enabled;
      }

      setPermissions(perms);
      setLoading(false);
    }

    fetchPermissions();
  }, [userId]);

  function hasPermission(key: string): boolean {
    return permissions[key] === true;
  }

  return { permissions, loading, hasPermission };
}
