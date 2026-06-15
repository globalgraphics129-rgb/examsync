import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExamStore } from '../../store/examStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import api from '../../lib/api';

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const { exams, fetchExams, isLoading } = useExamStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPwaPrompt, setShowPwaPrompt] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [suggestType, setSuggestType] = useState<'course' | 'feature' | 'other'>('course');
  const [suggestValue, setSuggestValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.showPwaPrompt) {
      setShowPwaPrompt(true);
    }
  }, [location.state]);

  const handleInstallApp = async () => {
    // Note: Actual browser install prompt requires 'beforeinstallprompt' event capture
    // This UI simulates the flow and provides guidance.
    alert("To install: \n\nOn Desktop: Click the Install icon in the URL bar.\nOn Mobile: Tap 'Add to Home Screen' in your browser menu.");
    setShowPwaPrompt(false);
  };

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestValue.trim()) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'pending_corrections'), {
        userStatement: suggestValue,
        university: user?.uniId || 'Unknown',
        type: suggestType === 'course' ? 'course' : 'suggestion',
        status: 'pending',
        userName: user?.name,
        userEmail: user?.email,
        timestamp: serverTimestamp()
      });

      api.post('/notify-suggestion', {
        userEmail: user?.email,
        userName: user?.name,
        university: user?.uniId,
        type: suggestType,
        value: suggestValue
      }).catch(() => {});

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuggestModal(false);
        setShowSuccess(false);
        setSuggestValue('');
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchExams({
        dept: user.department,
        level: user.level,
        session: '2025/2026'
      });
    }
  }, [user, fetchExams]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 text-on-surface">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-outline/10"
      >
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-on-surface">
            Schedule Overview
          </h1>
          <p className="text-on-surface-variant">
            Welcome back, <span className="text-primary font-semibold">{user?.name?.split(' ')[0] || 'Student'}</span>. Your intelligent timetable is ready.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="bg-surface-container border border-outline/20 text-on-surface px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-surface-container-high transition-colors flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">cloud_upload</span>
            Upload Timetable
          </button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Schedule Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* PWA Prompt */}
          <AnimatePresence>
            {showPwaPrompt && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-primary text-on-primary p-6 rounded-2xl shadow-elevated flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-on-primary/10 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl">install_mobile</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">Install ExamSync App</h3>
                        <p className="text-on-primary/80 text-sm">Access your timetable faster and offline, directly from your home screen.</p>
                      </div>
                   </div>
                   <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={handleInstallApp} className="flex-1 md:flex-none bg-on-primary text-primary px-6 py-2.5 rounded-xl font-black text-sm shadow-md active:scale-95 transition-all">Install Now</button>
                      <button onClick={() => setShowPwaPrompt(false)} className="px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-on-primary/10 transition-colors">Later</button>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Today's Classes */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <h2 className="text-2xl font-bold text-on-surface">Today's Classes</h2>
              <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                2 Classes
              </span>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {[
                { code: 'CSC 401', title: 'Human Computer Interaction', time: '08:00 AM - 10:00 AM', venue: 'LT 1', type: 'Lecture' },
                { code: 'CSC 403', title: 'Software Engineering', time: '12:00 PM - 02:00 PM', venue: 'Engineering Block', type: 'Practical' }
              ].map((cls, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className="bg-surface-card border border-outline/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-card hover:border-primary/30 hover:shadow-elevated group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-on-surface">{cls.code}</div>
                      <div className="text-sm text-on-surface-variant">{cls.title}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="text-right">
                      <div className="font-semibold text-on-surface">{cls.time}</div>
                      <div className="text-xs text-secondary font-medium">Today</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="font-semibold text-primary">{cls.venue}</div>
                      <div className="text-xs text-on-surface-variant font-medium">{cls.type}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Upcoming Exams */}
          <div className="space-y-4">
            <div className="flex justify-between items-end pt-4 border-t border-outline/10">
              <h2 className="text-2xl font-bold text-on-surface">Upcoming Exams</h2>
              <span className="text-sm font-medium bg-secondary/10 text-secondary px-3 py-1 rounded-full border border-secondary/20">
                {exams.length} Exams
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 bg-surface-container rounded-2xl animate-pulse border border-outline/5"></div>
                ))}
              </div>
            ) : exams.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {exams.map((exam, i) => (
                  <motion.div
                    key={exam.id || i}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="bg-surface-card border border-outline/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-card hover:border-secondary/30 hover:shadow-elevated group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
                        <span className="material-symbols-outlined">menu_book</span>
                      </div>
                      <div>
                        <div className="font-bold text-lg text-on-surface">{exam.courseCode}</div>
                        <div className="text-sm text-on-surface-variant">{exam.courseTitle}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-8">
                      <div className="text-right">
                        <div className="font-semibold text-on-surface">{exam.date}</div>
                        <div className="text-xs text-primary font-medium">{exam.time}</div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <div className="font-semibold text-secondary">{exam.venue}</div>
                        <div className="text-xs text-on-surface-variant font-medium">{exam.examType || 'Written'}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-surface-container border-2 border-dashed border-outline/20 rounded-3xl p-16 text-center flex flex-col items-center justify-center"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-4xl">inbox</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 text-on-surface">No Schedule Uploaded</h3>
                <p className="text-on-surface-variant max-w-md mx-auto mb-8">Upload your departmental timetable PDF or paste the text to let the AI organize your life.</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:bg-primary/90 shadow-md transition-all"
                >
                  Upload Now
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar: Quick Actions & AI */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 space-y-6"
        >
          {/* Quick Actions */}
          <div className="bg-surface-card border border-outline/10 rounded-[2.5rem] p-8 shadow-card space-y-6">
            <h3 className="text-xl font-black text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">bolt</span>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => { setSuggestType('course'); setShowSuggestModal(true); }}
                className="w-full p-4 rounded-2xl bg-surface-container hover:bg-primary/5 border border-outline/5 hover:border-primary/20 text-left transition-all group flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">auto_stories</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">Suggest Course</p>
                  <p className="text-xs text-on-surface-variant">Help us add a missing class.</p>
                </div>
              </button>
              
              <button 
                onClick={handleInstallApp}
                className="w-full p-4 rounded-2xl bg-surface-container hover:bg-secondary/5 border border-outline/5 hover:border-secondary/20 text-left transition-all group flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">install_mobile</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">Install Application</p>
                  <p className="text-xs text-on-surface-variant">Add ExamSync to home screen.</p>
                </div>
              </button>

              <button 
                onClick={() => { setSuggestType('feature'); setShowSuggestModal(true); }}
                className="w-full p-4 rounded-2xl bg-surface-container hover:bg-outline/10 border border-outline/5 text-left transition-all group flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-outline/10 text-on-surface-variant flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">lightbulb</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-on-surface">Request Feature</p>
                  <p className="text-xs text-on-surface-variant">Tell us what's missing.</p>
                </div>
              </button>
            </div>
          </div>

          {/* AI Planner Card */}
          <div className="bg-gradient-to-b from-primary/10 to-secondary/10 rounded-[2.5rem] border border-primary/20 p-8 space-y-6 relative overflow-hidden shadow-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-4 border-b border-outline/10 pb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-on-surface">Study Planner</h3>
                <p className="text-sm text-primary">ExamSync AI Assistant</p>
              </div>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="bg-surface-container rounded-2xl p-4 text-sm text-on-surface-variant border border-outline/10">
                "Hi! Ask me anything about your schedule, or request a custom study plan."
              </div>
              <div className="relative">
                <input type="text" placeholder="Plan my week..." className="w-full bg-surface-container-high border border-outline/10 rounded-xl py-4 pl-4 pr-14 text-sm text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-on-primary text-xl">arrow_upward</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Suggest Modal */}
      <AnimatePresence>
        {showSuggestModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-surface/90 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-surface-card border border-outline/10 rounded-[2.5rem] p-8 shadow-modal text-center overflow-hidden">
              {!showSuccess ? (
                <>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                    <span className="material-symbols-outlined text-3xl">{suggestType === 'course' ? 'auto_stories' : 'campaign'}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-2">
                    {suggestType === 'course' ? 'Suggest a Course' : 'Share a Feature Idea'}
                  </h3>
                  <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                    {suggestType === 'course' 
                      ? "Missing a class? Tell us the course title and we'll add it for everyone at your Uni."
                      : "Have a great idea to make ExamSync better? We're all ears!"
                    }
                  </p>
                  <form onSubmit={handleSuggest} className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant uppercase ml-1">Your Suggestion</label>
                      <textarea 
                        rows={4}
                        value={suggestValue} 
                        onChange={e => setSuggestValue(e.target.value)} 
                        placeholder={suggestType === 'course' ? 'e.g. CSC 405 — Distributed Systems' : 'e.g. I want to see class locations on a map...'} 
                        className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3.5 font-bold focus:border-primary outline-none resize-none text-on-surface" 
                        required 
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setShowSuggestModal(false)} className="flex-1 py-4 font-bold text-on-surface-variant hover:bg-outline/5 rounded-xl transition-colors">Cancel</button>
                      <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-on-primary font-black py-4 rounded-xl shadow-md">
                        {isSubmitting ? 'Sending...' : 'Submit Now'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-12">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl animate-in zoom-in-50 duration-500">celebration</span>
                  </div>
                  <h3 className="text-3xl font-black mb-4">You're Awesome!</h3>
                  <p className="text-on-surface-variant">Your suggestion has been logged and sent to our team. Check your email for confirmation!</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
