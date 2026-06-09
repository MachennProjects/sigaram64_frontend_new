// SIGARAM64 — Role-Adaptive Layouts
// These layout route components render different layouts based on the logged-in user's role.
// Used for routes that are accessible by multiple roles but should display role-specific layouts.
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './AdminLayout';
import StudentLayout from './StudentLayout';

/**
 * For student pages (/dashboard, /puzzle, /analysis, etc.)
 * - Admin and Manager see AdminLayout (stays in portal layout)
 * - Student sees StudentLayout (student sidebar + bottom nav)
 */
export function StudentPagesLayout() {
  const { user } = useAuth();
  if (user?.role === 'admin' || user?.role === 'manager') {
    return <AdminLayout />;
  }
  return <StudentLayout />;
}



