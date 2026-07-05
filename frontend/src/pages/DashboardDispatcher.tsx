import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import StudentDashboard from './student/StudentDashboard';
import RepDashboard from './classrep/RepDashboard';

const DashboardDispatcher = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect admin to the standalone admin portal
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Class Reps and Assistant Reps get the Upload/Schedule editing dashboard
  if (user.role === 'classRep' || user.role === 'assistantRep') {
    return <RepDashboard />;
  }

  // Regular students and other roles get the standard personalized student dashboard
  return <StudentDashboard />;
};

export default DashboardDispatcher;
