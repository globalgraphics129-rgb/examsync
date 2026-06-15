import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-12 h-12 border-4 border-primary/10 border-t-secondary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user && (user as any).isVerified === false) {
    return <Navigate to="/verify" state={{ email: user.email }} />;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
