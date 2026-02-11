// Tool Registry System
// This file manages the loading and registration of RotoWrite Tools

import type { Tool } from '@/types/tools';

/**
 * Tool Registry
 * 
 * For MVP, tools are manually integrated after admin approval.
 * Future enhancement: Dynamic loading from GitHub repos
 */

export interface RegisteredTool {
  manifest: Tool;
  component: React.ComponentType<any>;
  apiRoutes?: Record<string, any>;
}

// Registry of all registered tools
const toolRegistry = new Map<string, RegisteredTool>();

/**
 * Register a tool in the system
 */
export function registerTool(slug: string, tool: RegisteredTool) {
  toolRegistry.set(slug, tool);
}

/**
 * Get a registered tool by slug
 */
export function getTool(slug: string): RegisteredTool | undefined {
  return toolRegistry.get(slug);
}

/**
 * Get all registered tools
 */
export function getAllTools(): RegisteredTool[] {
  return Array.from(toolRegistry.values());
}

/**
 * Check if a tool is registered
 */
export function isToolRegistered(slug: string): boolean {
  return toolRegistry.has(slug);
}

/**
 * Load a tool component dynamically
 * 
 * For MVP, tools are imported statically.
 * Future: Dynamic imports from approved GitHub repos
 */
export async function loadToolComponent(slug: string): Promise<React.ComponentType<any> | null> {
  const tool = getTool(slug);
  if (!tool) {
    console.error(`Tool not found: ${slug}`);
    return null;
  }
  
  return tool.component;
}

/**
 * Initialize the tool registry
 * This is called on app startup to register all available tools
 */
export function initializeToolRegistry() {
  // Tools are registered here after admin approval
  // Example:
  // registerTool('example-tool', {
  //   manifest: { ... },
  //   component: ExampleToolComponent,
  //   apiRoutes: { ... }
  // });
  
  console.log('[Tool Registry] Initialized with', toolRegistry.size, 'tools');
}

/**
 * Validate tool manifest
 */
export function validateToolManifest(manifest: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!manifest.name) errors.push('Missing required field: name');
  if (!manifest.slug) errors.push('Missing required field: slug');
  if (!manifest.version) errors.push('Missing required field: version');
  if (!manifest.description?.short) errors.push('Missing required field: description.short');
  if (!manifest.description?.long) errors.push('Missing required field: description.long');
  if (!Array.isArray(manifest.permissions)) errors.push('Missing or invalid field: permissions');
  if (!manifest.sidebar?.label) errors.push('Missing required field: sidebar.label');
  if (!manifest.sidebar?.icon) errors.push('Missing required field: sidebar.icon');
  if (typeof manifest.sidebar?.order !== 'number') errors.push('Missing or invalid field: sidebar.order');
  
  // Validate slug format (lowercase, hyphens only)
  if (manifest.slug && !/^[a-z0-9-]+$/.test(manifest.slug)) {
    errors.push('Invalid slug format: must be lowercase letters, numbers, and hyphens only');
  }
  
  // Validate version format (semantic versioning)
  if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push('Invalid version format: must be semantic versioning (e.g., 1.0.0)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
