import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const passwordStrength = useMemo(() => {
    let strength = 0;
    const p = formData.password;
    if (p.length >= 8) strength += 25;
    if (/[A-Z]/.test(p)) strength += 25;
    if (/[0-9]/.test(p)) strength += 25;
    if (/[^A-Za-z0-9]/.test(p)) strength += 25;
    return strength;
  }, [formData.password]);

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-error';
    if (passwordStrength < 75) return 'bg-secondary-container';
    return 'bg-primary';
  };

  const getStrengthLabel = () => {
    if (formData.password.length === 0) return '';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      setIsLoading(true);
      try {
        if (!formData.email || !formData.password) throw new Error('Email and password required.');
        const success = await login(formData.email, formData.password);
        if (success) {
          if (formData.email === 'admin@examsync.com') navigate('/admin');
          else navigate('/dashboard');
        } else {
          const authError = useAuthStore.getState().error;
          setError(authError || 'Invalid email or password.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Signup logic
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields to continue.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup(
        formData.email, 
        formData.password, 
        formData.name
      );
      if (success) {
        setIsLoading(false);
        navigate('/verify', { 
          state: { 
            email: formData.email, 
            name: formData.name,
            isNewSignup: true 
          },
          replace: true 
        });
      } else {
        const authError = useAuthStore.getState().error;
        setError(authError || 'Signup failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      setError('Please enter your email.');
      return;
    }
    setForgotLoading(true);
    setError('');
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../config/firebase');
      await setDoc(doc(db, 'otps', forgotPasswordEmail), {
        code,
        expiresAt: Date.now() + 15 * 60 * 1000,
        type: 'reset'
      });
      const api = (await import('../lib/api')).default;
      await api.post('/send-otp', { email: forgotPasswordEmail, code, name: 'Student', type: 'reset' });
      navigate('/verify', { state: { email: forgotPasswordEmail, isPasswordReset: true } });
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setForgotLoading(false);
    }
  };

  const features = [
    { icon: 'calendar_month', text: 'Lecture & Exam timetables in one place' },
    { icon: 'auto_awesome', text: 'AI extracts your courses from any PDF' },
    { icon: 'location_on', text: 'Venue mapping & reminders' },
    { icon: 'download', text: 'Download & share your schedule' },
  ];

  return (
    <div className="min-h-screen bg-surface flex text-on-surface font-sans overflow-hidden transition-colors duration-500">

      {/* ─── LEFT PANEL — Branding ─── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-primary text-on-primary">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[300px] h-[300px] bg-on-primary/10 blur-[60px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-on-primary/5 blur-[60px] rounded-full" />
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-on-primary text-primary flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-xl">sync</span>
            </div>
            <span className="text-xl font-black tracking-tight text-on-primary group-hover:opacity-80 transition-opacity">ExamSync</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-on-primary/10 border border-on-primary/20 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-on-primary animate-pulse" />
              <span className="text-xs font-bold text-on-primary tracking-wider uppercase">Smart Scheduling</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-[1.1]">
              One place for all your <span className="opacity-70">academic</span> schedules.
            </h1>
            <p className="text-on-primary/80 text-lg leading-relaxed max-w-md">
              Stop manually hunting through 50-page PDFs. ExamSync reads them so you don't have to.
            </p>
          </div>

          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-4 group"
              >
                <div className="w-9 h-9 rounded-lg bg-on-primary/5 border border-on-primary/10 flex items-center justify-center group-hover:bg-on-primary/10 group-hover:border-on-primary/30 transition-all">
                  <span className="material-symbols-outlined text-on-primary/70 group-hover:text-on-primary transition-colors text-[18px]">{f.icon}</span>
                </div>
                <span className="text-sm text-on-primary/70 group-hover:text-on-primary transition-colors font-medium">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-on-primary/60">
          <span>Built with</span>
          <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-error">❤</motion.span>
          <span>by <span className="text-on-primary font-semibold">Glory Adeniran</span></span>
        </div>
      </div>

      {/* ─── RIGHT PANEL — Form ─── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-10 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface">
              {isLogin ? 'Welcome back.' : 'Create account.'}
            </h2>
            <p className="text-on-surface-variant text-base">
              {isLogin ? 'Sign in to access your personal schedule.' : 'Start with your basic info.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {!isLogin && (
                <Field label="Full name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} icon="person" />
              )}
              <Field label="Email address" name="email" type="email" placeholder="you@university.edu" value={formData.email} onChange={handleChange} icon="email" />
              
              <div className="space-y-1.5">
                <Field label="Password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} icon="lock"
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  }
                />
                {!isLogin && formData.password && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Password Strength</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${passwordStrength < 50 ? 'text-error' : passwordStrength < 75 ? 'text-secondary-container' : 'text-primary'}`}>
                        {getStrengthLabel()}
                      </span>
                    </div>
                    <div className="flex gap-1 h-1.5 mb-2">
                      {[1, 2, 3, 4].map(level => (
                        <div key={level} className={`flex-1 rounded-full transition-colors duration-500 ${passwordStrength >= level * 25 ? getStrengthColor() : 'bg-outline/20'}`} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {!isLogin && (
                <Field label="Confirm Password" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} icon="lock_reset" />
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">Forgot password?</button>
                </div>
              )}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-error/10 border border-error/20 rounded-xl flex items-center gap-3 text-error text-sm font-medium">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary-container hover:bg-secondary disabled:opacity-60 disabled:cursor-not-allowed text-on-secondary-container hover:text-on-secondary font-black py-4 rounded-xl text-base tracking-wide transition-all shadow-md flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="material-symbols-outlined text-xl">sync</motion.span>
                  <span>{isLogin ? 'Authenticating...' : 'Joining ExamSync...'}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <span className="material-symbols-outlined text-xl">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-primary font-bold hover:text-primary/80 transition-colors">
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>

          {!isLogin && (
            <p className="text-center text-[10px] text-on-surface-variant leading-relaxed uppercase font-bold tracking-widest opacity-60">
              By joining, you agree to our <Link to="/terms" className="text-primary hover:underline">Terms</Link> & <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          )}
        </div>

        {/* Forgot Password Modal */}
        <AnimatePresence>
          {showForgotModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-surface-card border border-outline/10 p-8 rounded-3xl w-full max-w-sm shadow-modal relative">
                <button onClick={() => setShowForgotModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"><span className="material-symbols-outlined">close</span></button>
                <h3 className="text-2xl font-black text-on-surface mb-2">Reset Password</h3>
                <p className="text-on-surface-variant text-sm mb-6">Enter your email and we'll send a 6-digit reset code.</p>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <Field label="Email Address" name="forgotEmail" type="email" placeholder="you@university.edu" value={forgotPasswordEmail} onChange={(e) => setForgotPasswordEmail(e.target.value)} icon="email" />
                  <button type="submit" disabled={forgotLoading} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary font-black py-3 rounded-xl transition-all">{forgotLoading ? 'Sending...' : 'Send Code'}</button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: string;
  rightIcon?: React.ReactNode;
}

const Field = ({ label, name, type = 'text', placeholder, value, onChange, icon, rightIcon }: FieldProps) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      {icon && <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">{icon}</span>}
      <input
        name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full bg-surface-container border border-outline/10 rounded-xl py-3.5 text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:bg-surface-container-high transition-all ${icon ? 'pl-11 pr-4' : 'px-4'} ${rightIcon ? 'pr-12' : ''}`}
      />
      {rightIcon && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightIcon}</div>}
    </div>
  </div>
);

export default AuthPage;
