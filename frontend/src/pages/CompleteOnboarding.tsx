import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAcademicData } from '../hooks/useAcademicData';
import { useAuth } from '../hooks/useAuth';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import MultiSelect from '../components/ui/MultiSelect';
import api from '../lib/api';
import Logo from '../components/ui/Logo';
import { useTheme } from '../contexts/ThemeContext';

const CompleteOnboarding = () => {
  const navigate = useNavigate();
  const { uniData } = useAcademicData();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Academic, 2: Theme
  
  const [formData, setFormData] = useState({
    university: '', faculty: '', customFaculty: '', department: '', customDepartment: '', semester: '', level: '', courses: [] as string[]
  });

  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionType, setCorrectionType] = useState<'faculty' | 'department'>('faculty');
  const [correctionInput, setCorrectionInput] = useState('');
  const [correctionLoading, setCorrectionLoading] = useState(false);
  const [correctionSuccess, setCorrectionSuccess] = useState(false);

  // Redirect if already onboarded
  useEffect(() => {
    if (user?.onboardingCompleted) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const openCorrection = (type: 'faculty' | 'department') => {
    if (!formData.university) return;
    setCorrectionType(type);
    setCorrectionInput('');
    setShowCorrectionModal(true);
  };

  const submitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionInput.trim() || !formData.university) return;
    
    setCorrectionLoading(true);
    try {
      await addDoc(collection(db, 'pending_corrections'), {
        userStatement: correctionInput,
        university: formData.university,
        faculty: correctionType === 'department' ? formData.faculty : null,
        type: correctionType,
        status: 'pending',
        timestamp: serverTimestamp(),
        userName: user?.name,
        userEmail: user?.email
      });

      api.post('/notify-suggestion', {
        userEmail: user?.email,
        userName: user?.name,
        university: formData.university,
        type: correctionType,
        value: correctionInput,
        faculty: correctionType === 'department' ? formData.faculty : null
      }).catch((err: any) => console.error('Notification failed:', err));

      setCorrectionSuccess(true);
      if (correctionType === 'faculty') {
         setFormData(prev => ({ ...prev, faculty: '__ADD_NEW__', customFaculty: correctionInput }));
      } else {
         setFormData(prev => ({ ...prev, department: '__ADD_NEW__', customDepartment: correctionInput }));
      }
      setTimeout(() => {
        setShowCorrectionModal(false);
        setCorrectionSuccess(false);
      }, 3500);
    } catch (err: any) {
      setError('Failed to submit correction to admin.');
      setShowCorrectionModal(false);
    } finally {
      setCorrectionLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'university' && { faculty: '', customFaculty: '', department: '', customDepartment: '', semester: '', level: '', courses: [] }),
      ...(name === 'faculty' && { customFaculty: '', department: '', customDepartment: '', semester: '', level: '', courses: [] }),
      ...(name === 'department' && { customDepartment: '', semester: '', level: '', courses: [] }),
      ...(name === 'semester' && { level: '', courses: [] }),
    }));
  };

  const universities = useMemo(() => Object.keys(uniData), [uniData]);
  const faculties = useMemo(() => {
    if (formData.university && uniData[formData.university]) {
      return Object.keys(uniData[formData.university]);
    }
    return [];
  }, [formData.university, uniData]);

  const departments = useMemo(() => {
    if (formData.university && formData.faculty && formData.faculty !== '__ADD_NEW__' && uniData[formData.university][formData.faculty]) {
      return Object.keys(uniData[formData.university][formData.faculty]);
    }
    return [];
  }, [formData.university, formData.faculty, uniData]);

  const availableCourses = useMemo(() => {
    if (formData.university && formData.faculty && formData.faculty !== '__ADD_NEW__' && formData.department && formData.department !== '__ADD_NEW__' && formData.semester && uniData[formData.university][formData.faculty]?.[formData.department]?.[formData.semester]) {
      return uniData[formData.university][formData.faculty][formData.department][formData.semester];
    }
    return [];
  }, [formData.university, formData.faculty, formData.department, formData.semester, uniData]);

  const handleNext = () => {
    const finalFaculty = formData.faculty === '__ADD_NEW__' ? formData.customFaculty.trim() : formData.faculty;
    const finalDepartment = formData.department === '__ADD_NEW__' ? formData.customDepartment.trim() : formData.department;

    if (!formData.university || !finalDepartment || !finalFaculty || !formData.semester || !formData.level) {
      setError('Please fill in all details to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const finalFaculty = formData.faculty === '__ADD_NEW__' ? formData.customFaculty.trim() : formData.faculty;
      const finalDepartment = formData.department === '__ADD_NEW__' ? formData.customDepartment.trim() : formData.department;

      await updateDoc(doc(db, 'users', user.uid), {
        uniId: formData.university,
        faculty: finalFaculty,
        department: finalDepartment,
        semester: formData.semester,
        level: formData.level,
        courses: formData.courses,
        onboardingCompleted: true
      });

      navigate('/dashboard', { state: { showPwaPrompt: true } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl bg-surface-card border border-outline/10 rounded-[2.5rem] p-8 md:p-12 shadow-modal relative z-10">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-black text-on-surface tracking-tight mb-2">Final Step.</h2>
                <p className="text-on-surface-variant text-sm">Tell us about your studies to personalize your schedule.</p>
              </div>

              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-medium flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">University</label>
                  <select name="university" value={formData.university} onChange={handleChange} className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-primary outline-none text-on-surface">
                    <option value="">Select University</option>
                    {universities.map(uni => <option key={uni} value={uni}>{uni}</option>)}
                  </select>
                </div>

                {formData.university && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1 flex justify-between">
                      Faculty
                      <button type="button" onClick={() => openCorrection('faculty')} className="text-primary hover:underline lowercase font-medium text-[10px]">+ Request addition</button>
                    </label>
                    <select name="faculty" value={formData.faculty} onChange={handleChange} className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-primary outline-none text-on-surface">
                      <option value="">Select Faculty</option>
                      {faculties.map(fac => <option key={fac} value={fac}>{fac}</option>)}
                      {formData.faculty === '__ADD_NEW__' && <option value="__ADD_NEW__">{formData.customFaculty}</option>}
                    </select>
                  </div>
                )}

                {formData.faculty && formData.faculty !== '__ADD_NEW__' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1 flex justify-between">
                      Department
                      <button type="button" onClick={() => openCorrection('department')} className="text-primary hover:underline lowercase font-medium text-[10px]">+ Request addition</button>
                    </label>
                    <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-primary outline-none text-on-surface">
                      <option value="">Select Department</option>
                      {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                      {formData.department === '__ADD_NEW__' && <option value="__ADD_NEW__">{formData.customDepartment}</option>}
                    </select>
                  </div>
                )}

                {formData.department && formData.department !== '__ADD_NEW__' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Semester</label>
                      <select name="semester" value={formData.semester} onChange={handleChange} className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-primary outline-none text-on-surface">
                        <option value="">Select</option>
                        <option value="Harmattan (1st)">Harmattan (1st)</option>
                        <option value="Rain (2nd)">Rain (2nd)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Level</label>
                      <select name="level" value={formData.level} onChange={handleChange} className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3.5 text-sm font-bold focus:border-primary outline-none text-on-surface">
                        <option value="">Select</option>
                        {['100', '200', '300', '400', '500', '600', '700'].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {formData.level && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                    <MultiSelect 
                      label="Your Courses"
                      options={availableCourses} 
                      selectedValues={formData.courses} 
                      onChange={(vals) => setFormData(p => ({...p, courses: vals}))} 
                    />
                  </div>
                )}
              </div>

              <button onClick={handleNext} className="w-full bg-primary text-on-primary py-5 rounded-2xl font-black shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3">
                Continue to Personalize
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </motion.div>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
               <div className="text-center">
                <h2 className="text-3xl font-black text-on-surface tracking-tight mb-2">Style your Dashboard.</h2>
                <p className="text-on-surface-variant text-sm">Choose a vibe that suits your study habits.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => setTheme('light')} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-outline/10 hover:border-outline/30 bg-surface-container/30'}`}>
                  <div className="w-12 h-12 rounded-full bg-white border border-outline/20 flex items-center justify-center text-slate-900 shadow-sm"><span className="material-symbols-outlined">light_mode</span></div>
                  <div className="text-left">
                    <p className="font-bold text-on-surface">Light Mode</p>
                    <p className="text-xs text-on-surface-variant">Crisp, clean, and professional.</p>
                  </div>
                  {theme === 'light' && <span className="material-symbols-outlined ml-auto text-primary">check_circle</span>}
                </button>

                <button onClick={() => setTheme('dark')} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-outline/10 hover:border-outline/30 bg-surface-container/30'}`}>
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm"><span className="material-symbols-outlined">dark_mode</span></div>
                  <div className="text-left">
                    <p className="font-bold text-on-surface">Dark Mode</p>
                    <p className="text-xs text-on-surface-variant">Easy on the eyes for night study.</p>
                  </div>
                  {theme === 'dark' && <span className="material-symbols-outlined ml-auto text-primary">check_circle</span>}
                </button>

                <button onClick={() => setTheme('ocean')} className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${theme === 'ocean' ? 'border-primary bg-primary/5' : 'border-outline/10 hover:border-outline/30 bg-surface-container/30'}`}>
                  <div className="w-12 h-12 rounded-full bg-sky-900 flex items-center justify-center text-sky-400 shadow-sm"><span className="material-symbols-outlined">water_drop</span></div>
                  <div className="text-left">
                    <p className="font-bold text-on-surface">Ocean vibe</p>
                    <p className="text-xs text-on-surface-variant">Deep blues for maximum focus.</p>
                  </div>
                  {theme === 'ocean' && <span className="material-symbols-outlined ml-auto text-primary">check_circle</span>}
                </button>
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setStep(1)} className="flex-1 py-5 font-bold text-on-surface-variant hover:bg-outline/5 rounded-2xl transition-all">Back</button>
                 <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-primary text-on-primary py-5 rounded-2xl font-black shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-3">
                   {loading ? 'Entering Portal...' : 'Enter Dashboard'}
                   <span className="material-symbols-outlined">rocket_launch</span>
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCorrectionModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/95 backdrop-blur-md">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-surface-card border border-outline/10 rounded-[2rem] p-8 shadow-modal text-center">
                {!correctionSuccess ? (
                  <>
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                      <span className="material-symbols-outlined text-3xl">help</span>
                    </div>
                    <h3 className="text-2xl font-black mb-2">Request Addition</h3>
                    <p className="text-on-surface-variant text-sm mb-8">Can't find your {correctionType}? Type it below and our team will verify and add it globally.</p>
                    <form onSubmit={submitCorrection} className="space-y-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-on-surface-variant uppercase ml-1">Name of {correctionType}</label>
                        <input type="text" value={correctionInput} onChange={e => setCorrectionInput(e.target.value)} placeholder={`e.g. ${correctionType === 'faculty' ? 'Faculty of Arts' : 'Linguistics'}`} className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3.5 font-bold focus:border-primary outline-none text-on-surface" required />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowCorrectionModal(false)} className="flex-1 py-4 font-bold text-on-surface-variant hover:bg-outline/5 rounded-xl transition-colors">Cancel</button>
                        <button type="submit" disabled={correctionLoading} className="flex-1 bg-primary text-on-primary font-black py-4 rounded-xl shadow-md">
                          {correctionLoading ? 'Sending...' : 'Submit'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-12">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                      <span className="material-symbols-outlined text-5xl animate-in zoom-in-50 duration-500">check_circle</span>
                    </div>
                    <h3 className="text-3xl font-black mb-4">Request Sent!</h3>
                    <p className="text-on-surface-variant">We've added <strong>"{correctionInput}"</strong> to your profile and alerted the team. You can continue with your setup now.</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CompleteOnboarding;
