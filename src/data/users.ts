// SIGARAM64 — User Types
// Hardcoded user store removed — auth is now handled by Firebase Auth + Firestore.
// This file only exports the shared types used across the app.

export type UserRole = 'student' | 'admin' | 'manager';

// Re-export AppUser type alias from AuthContext for convenience
export type { AppUser } from '../context/AuthContext';

// Demo credentials for development use only
export const DEMO_ACCOUNTS = {
  student: { email: 'harshit02@machenn.com', password: 'student123' },
  admin:   { email: 'admin@sigaram64.app', password: 'adminPassword123!' },
  manager: { email: 'manager@sigaram64.app', password: 'managerPassword123!' },
};
