import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isSendingInitial, setIsSendingInitial] = useState(false);
  const [hasSentInitial, setHasSentInitial] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const email = location.state?.email || user?.email;
  const isPasswordReset = location.state?.isPasswordReset || false;
  const isNewSignup = location.state?.isNewSignup || false;

  useEffect(() => {
    if (!email && !isInitializing) {
      navigate('/login');
    }
    const timer = setTimeout(() => setIsInitializing(false), 500);
    return () => clearTimeout(timer);
  }, [email, navigate, isInitializing]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendInitialCode = async () => {
    if (!email) {
      setError('Email address is missing. Please try logging in again.');
      return;
    }
    setIsSendingInitial(true);
    setError(null);
    setSuccess(null);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // 1. Save OTP to Firestore
      await setDoc(doc(db, 'otps', email), {
        code,
        expiresAt: Date.now() + 15 * 60 * 1000,
        type: isPasswordReset ? 'reset' : 'signup',
      });

      // 2. Send Email via API
      const response = await api.post('/send-otp', { 
        email, 
        code, 
        name: location.state?.name || 'Student', 
        type: isPasswordReset ? 'reset' : 'signup' 
      }, { timeout: 15000 }); // 15 second timeout

      if (response.data.success) {
        setHasSentInitial(true);
        setCountdown(60);
        setSuccess('Verification code sent to your inbox!');
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        throw new Error(response.data.error || 'Failed to deliver email.');
      }
    } catch (err: any) {
      console.error('Send OTP Error:', err);
      let msg = 'Failed to send code. Please try again.';
      if (err.code === 'ECONNABORTED') msg = 'Request timed out. Please check your connection.';
      else if (err.response?.data?.error) msg = err.response.data.error;
      else if (err.message) msg = err.message;
      
      setError(msg);
    } finally {
      setIsSendingInitial(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const fillCode = useCallback((code: string) => {
    const digits = code.replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    // Focus last filled or next empty
    const nextIdx = Math.min(digits.length, 5);
    setTimeout(() => inputRefs.current[nextIdx]?.focus(), 0);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      fillCode(value);
      return;
    }
    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      navigator.clipboard.readText().then(text => fillCode(text)).catch(() => {});
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    fillCode(e.clipboardData.getData('text'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const otpDoc = await getDoc(doc(db, 'otps', email));
      if (!otpDoc.exists()) {
        throw new Error('Verification code not found. Please click resend.');
      }

      const otpData = otpDoc.data();
      if (otpData.code !== code) {
        throw new Error('Incorrect code. Please try again.');
      }
      if (Date.now() > otpData.expiresAt) {
        throw new Error('Code has expired. Please request a new one.');
      }

      if (!isPasswordReset) {
        // Handle User Verification
        if (user) {
          await updateDoc(doc(db, 'users', user.uid), { 
            isVerified: true,
            verifiedAt: serverTimestamp()
          });
        }
        
        if (isNewSignup) {
          navigate('/complete-profile');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Handle Password Reset
        navigate('/new-password', { state: { email, verifiedCode: code } });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resendLoading) return;
    setResendLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await setDoc(doc(db, 'otps', email), {
        code,
        expiresAt: Date.now() + 15 * 60 * 1000,
        type: isPasswordReset ? 'reset' : 'signup',
      });
      await api.post('/send-otp', { email, code, name: user?.name || 'Student', type: isPasswordReset ? 'reset' : 'signup' });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setSuccess('A fresh verification code has been sent to your inbox.');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError('Failed to resend code. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  const filledCount = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary blur-[120px] rounded-full" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-surface-card border border-outline/10 rounded-[2.5rem] p-10 shadow-modal relative z-10">
        <div className="flex justify-center mb-8">
           <div className="w-20 h-20 rounded-[2rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary shadow-lg animate-pulse">
              <span className="material-symbols-outlined text-4xl font-black">mail</span>
           </div>
        </div>

        {!hasSentInitial ? (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
             <div className="text-center space-y-3">
                <h2 className="text-3xl font-black text-on-surface tracking-tight">Security First.</h2>
                <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                  To protect your account, we need to verify your identity at <br/>
                  <span className="text-primary font-black">{email}</span>
                </p>
             </div>

             {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-2xl flex items-center gap-3 text-error text-sm font-bold">
                   <span className="material-symbols-outlined text-[18px]">warning</span>
                   {error}
                </div>
             )}

             <button 
               onClick={sendInitialCode}
               disabled={isSendingInitial}
               className="w-full bg-primary text-on-primary py-5 rounded-2xl font-black shadow-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3 active:scale-95"
             >
                {isSendingInitial ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="material-symbols-outlined font-black">sync</motion.span>
                    Sending Secure Code...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined font-black">send</span>
                    Send Verification Code
                  </>
                )}
             </button>

             <p className="text-[10px] text-on-surface-variant/40 text-center font-bold uppercase tracking-widest leading-relaxed">
                By continuing, you'll receive a one-time <br/> 6-digit code in your inbox.
             </p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-on-surface tracking-tight mb-2">Verify Email.</h2>
              <p className="text-on-surface-variant text-sm font-medium">We've sent a 6-digit code to</p>
              <p className="text-primary font-black mt-1">{email}</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-center gap-3 text-error text-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">warning</span>
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3 text-primary text-sm font-bold">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {success}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-full aspect-[4/5] bg-surface-container border-2 rounded-2xl text-center text-3xl font-black text-on-surface outline-none transition-all ${digit ? 'border-primary bg-surface shadow-md scale-105' : 'border-outline/10 focus:border-primary/50'}`}
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <div className="flex flex-col gap-4">
                 <button
                  type="submit"
                  disabled={loading || filledCount !== 6}
                  className="w-full bg-primary text-on-primary py-5 rounded-2xl font-black shadow-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="material-symbols-outlined font-black">sync</motion.span>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined font-black">verified_user</span>
                      Complete Verification
                    </>
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={handleResend}
                  disabled={countdown > 0 || resendLoading}
                  className="w-full py-4 text-sm font-bold text-on-surface-variant hover:text-primary transition-all disabled:opacity-40"
                >
                   {resendLoading ? 'Sending new code...' : countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Verification Code'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-10 pt-10 border-t border-outline/5 text-center">
           <p className="text-[10px] text-on-surface-variant/50 font-black uppercase tracking-widest leading-relaxed">
             Secure verification powered by <br/> ExamSync Intelligence
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
