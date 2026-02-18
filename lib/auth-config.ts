// Centralized super-admin configuration
// Add super-admin emails here instead of hardcoding them throughout the codebase

const SUPER_ADMIN_EMAILS = new Set([
  'jeremy.botter@gdcgroup.com',
  'jeremy.botter@gmail.com',
]);

export function isSuperAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.has(email);
}
