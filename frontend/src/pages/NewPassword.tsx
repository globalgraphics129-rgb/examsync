import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';

const NewPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const verifiedCode = location.state?.verifiedCode;

  useEffect(() => {
    if (!email || !verifiedCode) {
      navigate('/login');
    }
  }, [email, verifiedCode, navigate]);

  const passwordStrength = React.useMemo(() => {
    let strength = 0;
    const p = password;
    if (p.length >= 8) strength += 25;
    if (/[A-Z]/.test(p)) strength += 25;
    if (/[0-9]/.test(p)) strength += 25;
    if (/[^A-Za-z0-9]/.test(p)) strength += 25;
    return strength;
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-error';
    if (passwordStrength < 75) return 'bg-secondary-container';
    return 'bg-primary';
  };

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/reset-password', { email, code: verifiedCode, newPassword: password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-surface-card border border-outline/10 rounded-3xl p-8 relative z-10 shadow-modal"
      >
        <h2 className="text-3xl font-black text-on-surface mb-2 text-center">New Password</h2>
        <p className="text-on-surface-variant text-center mb-8 text-sm">
          Please enter your new password below.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full bg-surface-container border border-outline/10 rounded-xl py-3.5 px-4 text-on-surface text-sm focus:outline-none focus:border-primary focus:bg-surface-container-high transition-all"
            />
            {password && (
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
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  For a secure password, use 8+ characters, a mix of uppercase letters, numbers, and special characters.
                </p>
              </motion.div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full bg-surface-container border border-outline/10 rounded-xl py-3.5 px-4 text-on-surface text-sm focus:outline-none focus:border-primary focus:bg-surface-container-high transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-black text-lg shadow-md hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {loading ? 'Updating...' : 'Set Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default NewPassword;
