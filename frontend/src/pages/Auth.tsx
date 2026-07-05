import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle } = useAuth();
  const { error: authError, setError: setAuthError, user } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Clear global auth errors when switching tabs
  useEffect(() => {
    setAuthError(null);
    setLocalError('');
  }, [isLogin, setAuthError]);

  // If user is already authenticated and has completed onboarding, send to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.onboardingCompleted) {
        navigate('/dashboard');
      } else {
        navigate('/complete-profile');
      }
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setLocalError('');
    setAuthError(null);
    try {
      const success = await loginWithGoogle();
      if (success) {
        const updatedUser = useAuthStore.getState().user;
        if (updatedUser?.role === 'admin') {
          navigate('/admin');
        } else if (updatedUser?.onboardingCompleted) {
          navigate('/dashboard');
        } else {
          navigate('/complete-profile');
        }
      }
    } catch (err: any) {
      setLocalError(err.message || 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setAuthError(null);

    // Validations
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Sign In
        const success = await login(email, password);
        if (success) {
          const updatedUser = useAuthStore.getState().user;
          if (updatedUser?.role === 'admin') {
            navigate('/admin');
          } else if (updatedUser?.onboardingCompleted) {
            navigate('/dashboard');
          } else {
            navigate('/complete-profile');
          }
        }
      } else {
        // Sign Up
        if (!name.trim()) {
          setLocalError('Name is required.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setLocalError('Passwords do not match.');
          setIsLoading(false);
          return;
        }

        const success = await signup(email, password, name.trim());
        if (success) {
          // New signups go to verification OTP page first
          navigate('/verify', { state: { email: email.trim(), isNewSignup: true, name: name.trim() } });
        }
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-primary/30 selection:text-on-surface">
      {/* Dynamic Background Orbs */}
      <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[130px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[45%] h-[45%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* Header Logo */}
      <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-on-primary font-bold text-[20px]">school</span>
          </div>
          <span className="text-xl font-black tracking-tight text-on-surface">
            Exam<span className="text-primary">Sync</span>
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md px-6 z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-surface-card border border-outline/10 p-8 md:p-10 rounded-[2.5rem] shadow-card backdrop-blur-xl relative"
        >
          {/* Tabs for switching Login / Signup */}
          <div className="flex p-1 bg-surface-container border border-outline/10 rounded-2xl mb-8 relative z-10">
            <button
              onClick={() => setIsLogin(true)}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                isLogin ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
                !isLogin ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-on-surface tracking-tight">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-on-surface-variant text-xs mt-1">
              {isLogin ? 'Access your personalized academic scheduler' : 'Get started with ExamSync in minutes'}
            </p>
          </div>

          {displayedError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 mb-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-2 text-error text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
              <span className="flex-1">{displayedError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                      person
                    </span>
                    <input
                      type="text"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-surface-container border border-outline/10 rounded-xl py-3 pl-11 pr-4 text-on-surface text-sm focus:outline-none focus:border-primary focus:bg-surface-container-high transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="w-full bg-surface-container border border-outline/10 rounded-xl py-3 pl-11 pr-4 text-on-surface text-sm focus:outline-none focus:border-primary focus:bg-surface-container-high transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Password
                </label>
                {isLogin && (
                  <Link
                    to="/verify"
                    state={{ isPasswordReset: true }}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container border border-outline/10 rounded-xl py-3 pl-11 pr-4 text-on-surface text-sm focus:outline-none focus:border-primary focus:bg-surface-container-high transition-all"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  key="confirm-password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider ml-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">
                      lock_reset
                    </span>
                    <input
                      type="password"
                      required={!isLogin}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-surface-container border border-outline/10 rounded-xl py-3 pl-11 pr-4 text-on-surface text-sm focus:outline-none focus:border-primary focus:bg-surface-container-high transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary font-black py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="material-symbols-outlined text-[18px]"
                  >
                    sync
                  </motion.span>
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Social Auth Divider */}
          <div className="relative my-6 text-center">
            <hr className="border-outline/10" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-card px-3 text-[10px] uppercase font-bold text-on-surface-variant">
              or continue with
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-surface-container border border-outline/10 hover:bg-surface-container-high text-on-surface font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Google Account</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
