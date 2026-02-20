// Client-safe super admin config — no server imports
// This file can be imported by both server and client components.

export const SUPER_ADMIN_EMAILS = new Set([
  'jeremy.botter@gdcgroup.com',
  'jeremy.botter@gmail.com',
]);

export function isSuperAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.has(email);
}
