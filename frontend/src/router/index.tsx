import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import LandingPage from '../pages/Landing';
import StudentDashboard from '../pages/student/StudentDashboard';
import UploadPage from '../pages/student/Upload';
import LoginPage from '../pages/Auth';
import VerifyOTP from '../pages/VerifyOTP';
import NewPassword from '../pages/NewPassword';
import SettingsPage from '../pages/student/Profile';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import Maintenance from '../pages/Maintenance';
import CompleteOnboarding from '../pages/CompleteOnboarding';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import AppShell from '../components/layout/AppShell';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useAuth } from '../hooks/useAuth';

const MaintenanceGuard = ({ children }: { children: React.ReactNode }) => {
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const location = useLocation();
  
  // Allow access to /admin and /login even in maintenance mode so admins can log in and fix things
  const isAuthPage = location.pathname === '/login' || location.pathname === '/verify';
  const isAdminPage = location.pathname.startsWith('/admin');
  
  if (settings.maintenanceMode && user?.role !== 'admin' && !isAuthPage && !isAdminPage) {
    return <Maintenance />;
  }
  return <>{children}</>;
};

const AppRouter = () => {
  return (
    <MaintenanceGuard>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyOTP />} />
        <Route path="/new-password" element={<NewPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/maintenance" element={<Maintenance />} />

        {/* Admin-only route — protected by role check */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/complete-profile" element={<CompleteOnboarding />} />
          {/* Main Application Shell for logged-in users */}
          <Route element={<AppShell><Outlet /></AppShell>}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </MaintenanceGuard>
  );
};

export default AppRouter;
