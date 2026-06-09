// SIGARAM64 — Auth Route (Reverse Guard)
// If user is already logged in, redirect to their role home page.
// Otherwise, show the login screen.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME } from '../../config/roleConfig';
import LoginScreen from '../pages/public/LoginScreen';

export default function AuthRoute() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  return <LoginScreen />;
}
