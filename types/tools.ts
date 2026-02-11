// TypeScript types for RotoWrite Tools/Plugins Marketplace system

export type ToolStatus = 'pending' | 'approved' | 'rejected' | 'archived';
export type PermissionRiskLevel = 'low' | 'medium' | 'high';

// Tool manifest structure (from GitHub repos)
export interface ToolManifest {
  name: string;
  slug: string;
  version: string;
  description: {
    short: string;
    long: string;
  };
  author: string;
  permissions: string[];
  sidebar: {
    label: string;
    icon: string;
    order: number;
  };
  entrypoint: string;
  api_routes?: Array<{
    path: string;
    handler: string;
  }>;
}

// Database types
export interface Tool {
  id: string;
  name: string;
  slug: string;
  description_short: string;
  description_long: string;
  github_repo_url: string;
  version: string;
  author_id: string;
  icon_url: string | null;
  status: ToolStatus;
  permissions_requested: string[];
  sidebar_label: string;
  sidebar_icon: string;
  sidebar_order: number;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface UserInstalledTool {
  id: string;
  user_id: string;
  tool_id: string;
  installed_at: string;
  enabled: boolean;
}

export interface ToolPermission {
  id: string;
  permission_key: string;
  display_name: string;
  description: string;
  risk_level: PermissionRiskLevel;
  created_at: string;
}

export interface ToolData {
  id: string;
  tool_id: string;
  user_id: string;
  key: string;
  value: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface ToolWithAuthor extends Tool {
  author: {
    id: string;
    email: string;
    full_name: string | null;
  };
}

export interface ToolWithInstallStatus extends Tool {
  is_installed: boolean;
  is_enabled: boolean;
  install_count: number;
}

export interface InstalledToolWithDetails extends UserInstalledTool {
  tool: Tool;
}

// API request/response types
export interface SubmitToolRequest {
  github_repo_url: string;
  contact_email?: string;
  notes?: string;
}

export interface ApproveToolRequest {
  tool_id: string;
  approved: boolean;
  rejection_reason?: string;
}

export interface InstallToolRequest {
  tool_id: string;
}

export interface ToggleToolRequest {
  tool_id: string;
  enabled: boolean;
}

export interface ToolDataRequest {
  tool_id: string;
  key: string;
  value: Record<string, any>;
}

// Tool component props
export interface ToolComponentProps {
  userId: string;
  toolId: string;
  permissions: string[];
}

// Permission check result
export interface PermissionCheckResult {
  granted: boolean;
  permission: string;
  reason?: string;
}

// Marketplace filter/search types
export interface ToolFilters {
  search?: string;
  status?: ToolStatus;
  author_id?: string;
  has_permission?: string;
}

export interface ToolSearchResult {
  tools: ToolWithInstallStatus[];
  total: number;
  page: number;
  per_page: number;
}
