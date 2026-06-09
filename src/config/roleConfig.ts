// SIGARAM64 — Centralized Role Configuration
import type { UserRole } from '../data/users';

/**
 * Default home page for each role.
 * Used by ProtectedRoute (wrong-role redirect) and RoleRedirect (post-login redirect).
 */
export const ROLE_HOME: Record<UserRole, string> = {
  student: '/dashboard',
  admin: '/admin',
  manager: '/district-activity',
};
