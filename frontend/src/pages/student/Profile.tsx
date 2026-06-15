import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { useAcademicData } from '../../hooks/useAcademicData';
import MultiSelect from '../../components/ui/MultiSelect';
import { useNavigate } from 'react-router-dom';

const gradePoints: Record<string, number> = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1, 'F': 0 };

const SettingsPage = () => {
  const { user, updateProfile, uploadProfilePicture, logout, deleteAccount } = useAuth();
  const { uniData } = useAcademicData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'performance'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    faculty: user?.faculty || '',
    department: user?.department || '',
    semester: user?.semester || '',
    courses: user?.courses || [],
  });

  // Grades Form State
  const [grades, setGrades] = useState(user?.grades || {});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deriving cascade options
  const faculties = useMemo(() => {
    if (user?.uniId && uniData[user.uniId]) {
      return Object.keys(uniData[user.uniId]);
    }
    return [];
  }, [user?.uniId, uniData]);

  const departments = useMemo(() => {
    if (user?.uniId && formData.faculty && uniData[user.uniId]?.[formData.faculty]) {
      return Object.keys(uniData[user.uniId][formData.faculty]);
    }
    return [];
  }, [user?.uniId, formData.faculty, uniData]);

  const availableCourses = useMemo(() => {
    if (user?.uniId && formData.faculty && formData.department && formData.semester && uniData[user.uniId]?.[formData.faculty]?.[formData.department]?.[formData.semester]) {
      return uniData[user.uniId][formData.faculty][formData.department][formData.semester];
    }
    return [];
  }, [user?.uniId, formData.faculty, formData.department, formData.semester, uniData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'faculty' && { department: '', semester: '', courses: [] }),
      ...(name === 'department' && { semester: '', courses: [] }),
      ...(name === 'semester' && { courses: [] }),
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    await updateProfile({
      name: formData.name,
      faculty: formData.faculty,
      department: formData.department,
      semester: formData.semester,
      courses: formData.courses,
    });
    setLoading(false);
    setIsEditing(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadProfilePicture(e.target.files[0]);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      const success = await deleteAccount();
      if (success) navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/auth');
  };

  // Performance Logic
  const handleGradeChange = (course: string, field: 'score' | 'grade' | 'unit', value: string | number) => {
    const newGrades = { ...grades, [course]: { ...(grades[course] || { score: '', grade: 'A', unit: 3 }), [field]: value } };
    setGrades(newGrades);
  };

  const saveGrades = async () => {
    setLoading(true);
    await updateProfile({ grades });
    setLoading(false);
  };

  const cgpa = useMemo(() => {
    let totalPoints = 0;
    let totalUnits = 0;
    user?.courses?.forEach(course => {
      const g = grades[course];
      if (g && g.unit > 0 && gradePoints[g.grade] !== undefined) {
        totalPoints += gradePoints[g.grade] * g.unit;
        totalUnits += Number(g.unit);
      }
    });
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';
  }, [grades, user?.courses]);

  const progressPercentage = (Number(cgpa) / 5.0) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 max-w-4xl mx-auto"
    >
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-display-lg-mobile md:text-headline-lg font-display-lg text-primary tracking-tight">Account Settings</h1>
          <p className="text-on-surface-variant">Manage your profile, performance, and portal preferences.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <button 
            onClick={user?.googleCalendarLinked ? undefined : async () => await useAuth().linkGoogleCalendar()} 
            disabled={user?.googleCalendarLinked}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-bold border ${
              user?.googleCalendarLinked
                ? 'border-primary/50 bg-primary/10 text-primary cursor-not-allowed'
                : 'border-outline/30 bg-surface-container text-on-surface hover:bg-surface-container-high'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{user?.googleCalendarLinked ? 'cloud_done' : 'calendar_month'}</span>
            {user?.googleCalendarLinked ? 'Google Linked' : 'Link Google Calendar'}
          </button>
          <button onClick={handleSignOut} className="flex items-center justify-center gap-2 text-error hover:bg-error/10 px-4 py-2 rounded-full transition-colors text-sm font-bold">
            <span className="material-symbols-outlined text-xl">logout</span>
            Sign Out
          </button>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex bg-surface-container rounded-full p-1.5 w-fit">
        <button onClick={() => setActiveTab('profile')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-secondary text-on-secondary shadow-md' : 'text-on-surface-variant hover:text-primary'}`}>
          Profile details
        </button>
        <button onClick={() => setActiveTab('performance')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'performance' ? 'bg-secondary text-on-secondary shadow-md' : 'text-on-surface-variant hover:text-primary'}`}>
          Academic Performance
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'profile' ? (
          <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-surface-card rounded-[2.5rem] shadow-elevated border border-outline/10 overflow-hidden">
            <div className="p-8 md:p-12 space-y-10">
              {/* Profile Section */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative group w-24 h-24 rounded-[2rem] bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-inner border-4 border-surface overflow-hidden cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="material-symbols-outlined text-white">photo_camera</span>
                      </div>
                      <input type="file" hidden ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary">{user?.name}</h3>
                      <p className="text-on-surface-variant text-body-sm">{user?.department} · {user?.semester}</p>
                      <button onClick={() => fileInputRef.current?.click()} className="text-secondary font-bold text-[10px] uppercase tracking-widest mt-2 hover:underline">Change Photo</button>
                    </div>
                  </div>
                  <Button variant={isEditing ? 'outline' : 'primary'} onClick={() => {
                    if (isEditing) { setFormData({ name: user?.name||'', faculty: user?.faculty||'', department: user?.department||'', semester: user?.semester||'', courses: user?.courses||[] }); setIsEditing(false); } 
                    else setIsEditing(true);
                  }}>
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} readOnly={!isEditing} icon="person" />
                  <Input label="Email Address" value={user?.email} readOnly icon="mail" />
                  
                  {isEditing ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Faculty</label>
                        <select name="faculty" value={formData.faculty} onChange={handleChange} className="w-full bg-surface border border-surface-variant rounded-xl px-4 py-3 text-primary text-sm focus:outline-none focus:border-secondary transition-all">
                          {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Department</label>
                        <select name="department" value={formData.department} onChange={handleChange} className="w-full bg-surface border border-surface-variant rounded-xl px-4 py-3 text-primary text-sm focus:outline-none focus:border-secondary transition-all">
                          {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Semester</label>
                        <select name="semester" value={formData.semester} onChange={handleChange} className="w-full bg-surface border border-surface-variant rounded-xl px-4 py-3 text-primary text-sm focus:outline-none focus:border-secondary transition-all">
                          <option value="Harmattan (1st)">Harmattan (1st Semester)</option>
                          <option value="Rain (2nd)">Rain (2nd Semester)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5 col-span-1 md:col-span-2">
                        <MultiSelect label="Courses" placeholder="Update your courses" options={availableCourses} selectedValues={formData.courses} onChange={(vals) => setFormData(p => ({...p, courses: vals}))} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Input label="Faculty" value={user?.faculty} readOnly icon="apartment" />
                      <Input label="Department" value={user?.department} readOnly icon="biotech" />
                      <div className="col-span-1 md:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Courses</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-surface border border-surface-variant rounded-xl">
                          {user?.courses?.map(c => <span key={c} className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-lg text-sm font-bold">{c}</span>)}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {isEditing && (
                  <div className="pt-6 flex justify-end">
                    <Button variant="primary" onClick={handleSaveProfile} isLoading={loading}>Save Profile Changes</Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="performance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 bg-surface-card rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-elevated border border-primary/20">
              <h3 className="text-on-surface font-bold mb-8">Current CGPA</h3>
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-outline/20" />
                  <motion.circle 
                    initial={{ strokeDasharray: "0 1000" }}
                    animate={{ strokeDasharray: `${(progressPercentage / 100) * (2 * Math.PI * 88)} 1000` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeLinecap="round" className="text-primary" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-on-surface tracking-tighter">{cgpa}</span>
                  <span className="text-on-surface-variant text-xs tracking-widest uppercase mt-1">/ 5.00</span>
                </div>
              </div>
              <p className="text-primary/80 text-sm mt-8">Keep up the good work!</p>
            </div>

            <div className="md:col-span-2 bg-surface-card rounded-[2.5rem] p-8 md:p-10 shadow-elevated border border-outline/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-primary">Course Results</h3>
                <Button variant="primary" onClick={saveGrades} isLoading={loading} className="py-2 text-sm">Save Grades</Button>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {user?.courses?.map(course => (
                  <div key={course} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-surface-container-low border border-surface-variant/30 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                        <span className="material-symbols-outlined">menu_book</span>
                      </div>
                      <span className="font-bold text-primary">{course}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        placeholder="Score" 
                        value={grades[course]?.score || ''}
                        onChange={(e) => handleGradeChange(course, 'score', e.target.value)}
                        className="w-20 bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary"
                      />
                      <select 
                        value={grades[course]?.grade || 'A'}
                        onChange={(e) => handleGradeChange(course, 'grade', e.target.value)}
                        className="w-20 bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                      </select>
                      <input 
                        type="number" 
                        placeholder="Units" 
                        min="1" max="6"
                        value={grades[course]?.unit || 3}
                        onChange={(e) => handleGradeChange(course, 'unit', parseInt(e.target.value) || 0)}
                        className="w-20 bg-white border border-surface-variant rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-secondary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="bg-error/5 border border-error/10 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 mt-12">
         <div className="space-y-1">
            <h4 className="font-bold text-error">Danger Zone</h4>
            <p className="text-[11px] text-on-surface-variant">Permanently delete your account and all saved timetable and grade data.</p>
         </div>
         <Button variant="outline" onClick={handleDeleteAccount} className="text-error border-error/20 hover:bg-error/5">Delete Account</Button>
      </section>
    </motion.div>
  );
};

export default SettingsPage;
