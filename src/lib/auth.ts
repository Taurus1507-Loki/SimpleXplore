export const PRIMARY_ADMIN_EMAIL = 'simplore01@gmail.com';

/**
 * Checks if a user has full Master Admin privileges across all application functions.
 * simplore01@gmail.com has absolute administrator authority.
 */
export function isUserAdmin(email?: string | null, role?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  const configuredAdmin = (process.env.ADMIN_EMAIL || PRIMARY_ADMIN_EMAIL).toLowerCase().trim();

  if (
    normalized === PRIMARY_ADMIN_EMAIL.toLowerCase() ||
    normalized === configuredAdmin ||
    normalized === 'admin@simplexplore.com'
  ) {
    return true;
  }

  return role === 'admin';
}

