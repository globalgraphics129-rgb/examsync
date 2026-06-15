import { Link, useLocation } from 'react-router-dom';
import Logo from '../ui/Logo';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  
  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
    { label: 'Uploads', icon: 'cloud_upload', path: '/rep/dashboard', active: location.pathname === '/rep/dashboard' },
    { label: 'WA Export', icon: 'send', path: '/rep/export', active: location.pathname === '/rep/export' },
    { label: 'Analytics', icon: 'analytics', path: '/admin/dashboard', active: location.pathname === '/admin/dashboard' },
    { label: 'Settings', icon: 'settings', path: '/settings', active: location.pathname === '/settings' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container shadow-md hidden md:flex flex-col py-6 px-4 space-y-2 z-40">
      <div className="mb-8 px-2">
        <Link to="/">
          <Logo size="md" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`px-4 py-3 flex items-center space-x-3 transition-all rounded-xl ${
              item.active 
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-md shadow-secondary/10 translate-x-1' 
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: item.active ? "'FILL' 1" : "" }}>
              {item.icon}
            </span>
            <span className="text-label-md">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Role Indicator */}
      <div className="mt-auto pt-6 px-2">
        <div className="bg-primary-container rounded-2xl p-5 mb-6 border border-on-primary-container/10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="material-symbols-outlined text-on-primary-container text-sm">verified_user</span>
            <span className="text-[10px] font-bold text-on-primary-container uppercase tracking-widest">
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'classRep' ? 'Class Representative' : 'Student'}
            </span>
          </div>
          <p className="text-body-sm text-on-primary-container/80 font-medium">
            {user?.role === 'admin' ? 'Managing Platform' : `${user?.department || 'General'}`}
          </p>
        </div>
        
        <div className="space-y-1">
          <button className="w-full text-on-surface-variant px-4 py-2.5 flex items-center space-x-3 hover:text-primary transition-colors text-label-md font-bold group">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">help</span>
            <span>Help Center</span>
          </button>
          <button onClick={() => logout()} className="w-full text-on-surface-variant px-4 py-2.5 flex items-center space-x-3 hover:text-error transition-colors text-label-md font-bold group">
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
