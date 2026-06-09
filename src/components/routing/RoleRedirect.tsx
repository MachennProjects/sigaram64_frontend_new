// SIGARAM64 — Role Redirect
// After login, send each role to their home screen
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME } from '../../config/roleConfig';

export default function RoleRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={ROLE_HOME[user.role]} replace />;
}
