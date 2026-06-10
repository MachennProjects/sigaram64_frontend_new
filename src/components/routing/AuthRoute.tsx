// SIGARAM64 — Auth Route (Reverse Guard)
// If user is already logged in, redirect to their role home page.
// Otherwise, show the login screen.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME } from '../../config/roleConfig';
import LoginScreen from '../pages/public/LoginScreen';

export default function AuthRoute() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated && user) {
    const from = (location.state as any)?.from?.pathname ?? ROLE_HOME[user.role];
    const target = (from === '/login' || from === '/home') ? ROLE_HOME[user.role] : from;
    return <Navigate to={target} replace />;
  }

  return <LoginScreen />;
}
