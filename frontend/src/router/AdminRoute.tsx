import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * AdminRoute — only allows users with role === 'admin' to access the wrapped route.
 * All other visitors (including unauthenticated users and regular students) are
 * silently redirected so they never see the admin UI.
 */
const AdminRoute = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    // Regular students get sent to their own dashboard, not a 404
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has the 'admin' role — render child route
  return <Outlet />;
};

export default AdminRoute;
