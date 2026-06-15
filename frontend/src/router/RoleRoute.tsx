import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/user.types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
};

export default RoleRoute;
