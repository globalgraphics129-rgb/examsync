import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../ui/Logo';
import { useTheme } from '../../contexts/ThemeContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { settings } = useSiteSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/upload') || location.pathname.includes('/profile');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Banner */}
      {settings.announcement && (
        <div className="bg-primary text-on-primary text-[11px] md:text-xs font-bold py-1.5 px-4 text-center sticky top-0 z-[110] animate-in fade-in slide-in-from-top duration-500">
           {settings.announcement}
        </div>
      )}

      <nav className={`fixed ${settings.announcement ? 'top-[32px]' : 'top-0'} w-full z-[100] transition-all duration-300 ${isScrolled ? 'bg-surface shadow-md border-b border-outline/10 py-3' : 'bg-transparent py-5'}`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-12">
            <Link to="/" className="opacity-90 hover:opacity-100 transition-opacity">
              <Logo size="md" />
            </Link>
            
            {/* Desktop Nav Links */}
            <div className="hidden md:flex gap-8 items-center">
              {!isDashboard ? (
                <>
                  <a href="#features" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold tracking-wide">Features</a>
                  <a href="#how-it-works" className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold tracking-wide">How it Works</a>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className={`${location.pathname === '/dashboard' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary font-semibold'} text-sm tracking-wide transition-all`}>Home</Link>
                  <Link to="/upload" className={`${location.pathname === '/upload' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary font-semibold'} text-sm tracking-wide transition-all`}>Upload Timetable</Link>
                  <Link to="/profile" className={`${location.pathname === '/profile' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary font-semibold'} text-sm tracking-wide transition-all`}>Profile</Link>
                  {isAdmin && (
                    <Link to="/admin" className="text-secondary-container hover:text-secondary transition-colors text-sm font-semibold tracking-wide flex items-center gap-1 bg-secondary-container/10 px-3 py-1 rounded-full border border-secondary-container/20">
                      <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            
            {/* Theme Toggle */}
            <div className="relative">
              <button 
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'water_drop'}</span>
              </button>
              <AnimatePresence>
                {isThemeMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-40 bg-surface-card border border-outline-variant/30 rounded-xl shadow-modal overflow-hidden z-50">
                    <button onClick={() => { setTheme('light'); setIsThemeMenuOpen(false); }} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container transition-colors ${theme === 'light' ? 'text-secondary font-bold bg-secondary-container/20' : 'text-on-surface'}`}>
                      <span className="material-symbols-outlined text-[18px]">light_mode</span> Light
                    </button>
                    <button onClick={() => { setTheme('dark'); setIsThemeMenuOpen(false); }} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container transition-colors border-t border-outline-variant/10 ${theme === 'dark' ? 'text-secondary font-bold bg-secondary-container/20' : 'text-on-surface'}`}>
                      <span className="material-symbols-outlined text-[18px]">dark_mode</span> Dark
                    </button>
                    <button onClick={() => { setTheme('ocean'); setIsThemeMenuOpen(false); }} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-surface-container transition-colors border-t border-outline-variant/10 ${theme === 'ocean' ? 'text-secondary font-bold bg-secondary-container/20' : 'text-on-surface'}`}>
                      <span className="material-symbols-outlined text-[18px]">water_drop</span> Ocean
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isDashboard ? (
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-on-surface font-bold hover:text-primary transition-colors text-sm tracking-wide">Sign In</Link>
                <Link to="/login" className="bg-secondary-container text-on-secondary-container px-6 py-2.5 rounded-xl text-sm font-black hover:bg-secondary transition-all shadow-md hover:-translate-y-0.5">Get Started</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/settings" className="flex items-center gap-3 bg-surface-container hover:bg-surface-container-high transition-colors py-2 px-3 rounded-full border border-outline/10 cursor-pointer">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/30">
                    <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left mr-2">
                    <p className="text-sm font-bold text-on-surface leading-none">{user?.name || 'User'}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{user?.role || 'Student'}</p>
                  </div>
                </Link>
                <button 
                  onClick={async () => { await logout(); navigate('/auth'); }}
                  className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'ocean' : 'light')}
              className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface"
            >
              <span className="material-symbols-outlined text-[20px]">
                {theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'water_drop'}
              </span>
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-on-surface hover:text-primary p-2">
              <span className="material-symbols-outlined text-2xl">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 pt-20 bg-surface md:hidden overflow-y-auto"
          >
            <div className="flex flex-col p-6 gap-1 text-base">
              {!isDashboard ? (
                <>
                  <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant font-semibold border-b border-outline/10 py-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">auto_awesome</span>Features
                  </a>
                  <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface-variant font-semibold border-b border-outline/10 py-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">help_outline</span>How it Works
                  </a>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface font-bold border-b border-outline/10 py-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">login</span>Sign In
                  </Link>
                  <div className="pt-4">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="bg-primary text-on-primary text-center px-6 py-3.5 rounded-xl font-black shadow-md block">
                      Get Started Free
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  {/* User Profile Card */}
                  <div className="flex items-center gap-3 bg-surface-container rounded-2xl p-4 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/30">
                      <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface leading-none">{user?.name || 'User'}</p>
                      <p className="text-[11px] text-primary uppercase tracking-widest font-bold mt-1">{user?.role || 'Student'}</p>
                    </div>
                  </div>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface font-semibold border-b border-outline/10 py-4 flex items-center gap-3 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">dashboard</span>Home
                  </Link>
                  <Link to="/upload" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface font-semibold border-b border-outline/10 py-4 flex items-center gap-3 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">cloud_upload</span>Upload Timetable
                  </Link>
                  <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface font-semibold border-b border-outline/10 py-4 flex items-center gap-3 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-on-surface-variant">manage_accounts</span>Profile & Settings
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-secondary font-semibold border-b border-outline/10 py-4 flex items-center gap-3">
                      <span className="material-symbols-outlined">admin_panel_settings</span>
                      Admin Dashboard
                    </Link>
                  )}
                  {/* Theme Switcher */}
                  <div className="mt-4 mb-2">
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-3">Theme</p>
                    <div className="flex gap-2">
                      {(['light', 'dark', 'ocean'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTheme(t); }}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize border transition-all flex items-center justify-center gap-1.5 ${
                            theme === t
                              ? 'bg-primary text-on-primary border-primary shadow-md'
                              : 'bg-surface-container text-on-surface-variant border-outline/10 hover:border-primary/30'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {t === 'dark' ? 'dark_mode' : t === 'light' ? 'light_mode' : 'water_drop'}
                          </span>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={async () => { await logout(); navigate('/auth'); setIsMobileMenuOpen(false); }}
                    className="mt-2 w-full py-3.5 rounded-xl bg-error/10 text-error font-bold flex items-center justify-center gap-2 hover:bg-error/20 transition-colors"
                  >
                    <span className="material-symbols-outlined">logout</span>Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacing for fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;
