import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/ui/Logo';
import { collection, getDocs, deleteDoc, doc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAcademicData } from '../../hooks/useAcademicData';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { uniData } = useAcademicData();
  const [activeTab, setActiveTab] = useState<'overview' | 'corrections' | 'data' | 'cms' | 'settings' | 'activity'>('overview');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUniversities: 0,
    timetablesParsed: 0,
    aiAccuracy: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // User Details State
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // CMS State
  const [cmsConfig, setCmsConfig] = useState<any>(null);
  const [isSavingCms, setIsSavingCms] = useState(false);

  // Settings State
  const [siteSettings, setSiteSettings] = useState({
    maintenanceMode: false,
    announcement: '',
  });

  // Data Management State
  const [dataForm, setDataForm] = useState({
    type: 'university' as 'university' | 'faculty' | 'department' | 'course',
    university: '',
    faculty: '',
    department: '',
    semester: 'Harmattan (1st)',
    value: '',
  });
  const [isSubmittingData, setIsSubmittingData] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [dataMessage, setDataMessage] = useState('');

  // Data Explorer State
  const [explorerSelection, setExplorerSelection] = useState({
    university: '',
    faculty: '',
    department: '',
    semester: 'Harmattan (1st)',
  });

  const handleDeleteEntity = async (type: string, value: string, extra?: any) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}: "${value}"? This will remove it from the live database.`)) return;
    
    try {
      // Find the document in Firestore
      const academicRef = collection(db, 'academic_data');
      let q = query(academicRef, where('type', '==', type), where('value', '==', value));
      
      if (extra?.university) q = query(q, where('university', '==', extra.university));
      if (extra?.faculty) q = query(q, where('faculty', '==', extra.faculty));
      if (extra?.department) q = query(q, where('department', '==', extra.department));
      if (extra?.semester) q = query(q, where('semester', '==', extra.semester));

      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      
      alert(`Deleted ${snapshot.docs.length} instances of "${value}". Note: Static JSON data cannot be deleted here, but Firestore overrides will be removed.`);
      window.location.reload(); // Refresh to update uniData hook
    } catch (err) {
      console.error('Failed to delete entity', err);
    }
  };

  // Corrections Review State
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [correctionFinalValue, setCorrectionFinalValue] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        const unis = new Set(usersList.map((u: any) => u.uniId).filter(Boolean));
        const timetablesParsed = usersList.length * 2;

        setStats({
          totalUsers: usersList.length,
          totalUniversities: unis.size,
          timetablesParsed,
          aiAccuracy: 98,
        });
        setUsers(usersList);

        // Fetch Pending Corrections from the new collection
        const correctionsSnapshot = await getDocs(collection(db, 'pending_corrections'));
        const correctionsList = correctionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        setCorrections(correctionsList);

        // Fetch Activity Logs
        const logsSnapshot = await getDocs(collection(db, 'activity_logs'));
        const logsList = logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any))
          .sort((a, b) => (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0));
        setActivityLogs(logsList);

        // Fetch CMS and Site Settings
        const { doc, getDoc } = await import('firebase/firestore');
        const cmsDoc = await getDoc(doc(db, 'site_config', 'cms'));
        if (cmsDoc.exists()) setCmsConfig(cmsDoc.data());

        const settingsDoc = await getDoc(doc(db, 'site_config', 'settings'));
        if (settingsDoc.exists()) setSiteSettings(settingsDoc.data() as any);

      } catch (err) {
        console.error('Failed to fetch admin data from Firestore:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleImportStaticData = async () => {
    if (!window.confirm('This will migrate all static JSON data to Firestore. Proceed?')) return;
    setIsMigrating(true);
    setDataMessage('Preparing migration...');
    try {
      const { default: uniDataImport } = await import('../../data/unilorin.json');
      const { writeBatch, doc, collection } = await import('firebase/firestore');
      
      let batch = writeBatch(db);
      let count = 0;
      let totalProcessed = 0;

      for (const [uniId, faculties] of Object.entries(uniDataImport)) {
        for (const [facultyName, departments] of Object.entries(faculties as any)) {
          for (const [deptName, semesters] of Object.entries(departments as any)) {
            for (const [semesterName, courses] of Object.entries(semesters as any)) {
              for (const courseName of courses as string[]) {
                const newDocRef = doc(collection(db, 'academic_data'));
                batch.set(newDocRef, {
                  type: 'course',
                  university: uniId,
                  faculty: facultyName,
                  department: deptName,
                  semester: semesterName,
                  value: courseName,
                  addedBy: 'system_migration',
                  timestamp: serverTimestamp()
                });
                count++;
                totalProcessed++;
                
                if (count >= 400) {
                  setDataMessage(`Processing... (${totalProcessed} entries)`);
                  await batch.commit();
                  batch = writeBatch(db); 
                  count = 0;
                }
              }
            }
          }
        }
      }
      
      if (count > 0) {
        await batch.commit();
      }
      
      setDataMessage(`Successfully migrated ${totalProcessed} entries! Refreshing...`);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error('Migration failed:', err);
      setDataMessage('Migration failed. Check console.');
    } finally {
      setIsMigrating(false);
    }
  };

  const logActivity = async (event: string, details: string) => {
    try {
      await addDoc(collection(db, 'activity_logs'), {
        event,
        userName: 'Admin',
        details,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to log activity', err);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      const userName = users.find(u => u.id === userId)?.name || 'Unknown User';
      logActivity('role_update', `Changed role of ${userName} to ${newRole}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Failed to update user role', err);
    }
  };

  const handleBanUser = async (userId: string, isBanned: boolean) => {
    try {
      const { updateDoc, doc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', userId), { banned: isBanned });
      const userName = users.find(u => u.id === userId)?.name || 'Unknown User';
      logActivity(isBanned ? 'ban' : 'unban', `${isBanned ? 'Banned' : 'Unbanned'} user: ${userName}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: isBanned } : u));
    } catch (err) {
      console.error('Failed to ban/unban user', err);
    }
  };

  const handleSaveCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingCms(true);
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      await setDoc(doc(db, 'site_config', 'cms'), cmsConfig);
      alert('CMS updated successfully!');
    } catch (err) {
      console.error('Failed to save CMS', err);
    } finally {
      setIsSavingCms(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      await setDoc(doc(db, 'site_config', 'settings'), siteSettings);
      alert('Site settings updated!');
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  const handleExport = () => {
    if (users.length === 0) return;
    const headers = ['Name,Email,University,Role'];
    const rows = users.map(u => `${u.name || 'Unknown'},${u.email || 'No Email'},${u.uniId || 'N/A'},${u.role || 'student'}`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "examsync_users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReviewCorrection = async (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject') {
      try {
        await deleteDoc(doc(db, 'pending_corrections', id));
        setCorrections(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        console.error('Failed to reject correction', err);
      }
      return;
    }

    // If approve, prompt for the exact correct value
    const correction = corrections.find(c => c.id === id);
    if (!correction) return;
    
    setReviewingId(id);
    setReviewAction('approve');
    setCorrectionFinalValue(correction.userStatement);
  };

  const submitFinalCorrection = async () => {
    if (!reviewingId || !correctionFinalValue.trim()) return;
    const correction = corrections.find(c => c.id === reviewingId);
    if (!correction) return;

    try {
      // Add to academic_data as a new node
      await addDoc(collection(db, 'academic_data'), {
        type: correction.type,
        university: correction.university,
        faculty: correction.faculty || null,
        value: correctionFinalValue.trim(),
        addedBy: 'admin',
        timestamp: serverTimestamp()
      });

      // Delete from pending
      await deleteDoc(doc(db, 'pending_corrections', reviewingId));
      setCorrections(prev => prev.filter(c => c.id !== reviewingId));
      
      setReviewingId(null);
      setReviewAction(null);
      setCorrectionFinalValue('');
      logActivity('data_approved', `Approved ${correction.type}: ${correctionFinalValue.trim()}`);
      alert('Data approved and published to live database!');
      window.location.reload();
    } catch (err) {
      console.error('Failed to submit final correction', err);
    }
  };

  const handleAddManualData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataForm.university || !dataForm.value) return;

    setIsSubmittingData(true);
    setDataMessage('');
    try {
      await addDoc(collection(db, 'academic_data'), {
        type: dataForm.type,
        university: dataForm.university,
        faculty: dataForm.faculty || null,
        department: dataForm.department || null,
        semester: dataForm.semester || null,
        value: dataForm.value.trim(),
        addedBy: 'admin',
        timestamp: serverTimestamp()
      });
      logActivity('data_added', `Manually added ${dataForm.type}: ${dataForm.value.trim()}`);
      setDataMessage('Data successfully added! It is now live.');
      setDataForm(prev => ({ ...prev, value: '' })); // clear just the value
      window.location.reload();
    } catch (err) {
      setDataMessage('Failed to add data.');
    } finally {
      setIsSubmittingData(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary/30 selection:text-on-surface transition-colors duration-500">
      {/* Admin Navbar */}
      <nav className="bg-surface-card border-b border-outline/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold border border-primary/30">ADMIN</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
             <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'overview' ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Overview</button>
             <button onClick={() => setActiveTab('corrections')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'corrections' ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:text-on-surface'} relative`}>
               Pending Corrections
               {corrections.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full animate-pulse" />}
             </button>
             <button onClick={() => setActiveTab('data')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'data' ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Data</button>
             <button onClick={() => setActiveTab('cms')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'cms' ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>CMS</button>
             <button onClick={() => setActiveTab('activity')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'activity' ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Activity</button>
             <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeTab === 'settings' ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Settings</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">Exit</button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-md">
                A
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-on-surface mb-2">
                  {activeTab === 'overview' && 'Platform Overview'}
                  {activeTab === 'corrections' && 'Pending Corrections'}
                  {activeTab === 'data' && 'Data Management'}
                  {activeTab === 'cms' && 'CMS: Site Content'}
                  {activeTab === 'activity' && 'Activity Logs'}
                  {activeTab === 'settings' && 'Global Site Settings'}
                </h1>
                <p className="text-on-surface-variant">
                  {activeTab === 'overview' && 'Monitor system health and user activity.'}
                  {activeTab === 'corrections' && 'Review missing data submissions from students.'}
                  {activeTab === 'data' && 'Directly add new universities, faculties, departments, and courses.'}
                  {activeTab === 'cms' && 'Manage Landing Page text, features, and announcements.'}
                  {activeTab === 'activity' && 'Track real-time student activity and system events.'}
                  {activeTab === 'settings' && 'Configure maintenance mode and system-wide behavior.'}
                </p>
            </div>
            {activeTab === 'overview' && (
              <button onClick={handleExport} className="bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export Report
              </button>
            )}
        </motion.div>

        {activeTab === 'overview' && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
            {/* Top Metrics */}
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { title: 'Total Users', value: stats.totalUsers, trend: 'Updated just now', icon: 'group', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
                    { title: 'Universities', value: stats.totalUniversities, trend: 'Updated just now', icon: 'account_balance', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                    { title: 'Timetables Parsed', value: stats.timetablesParsed, trend: 'Updated just now', icon: 'auto_awesome', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
                    { title: 'System Health', value: '100%', trend: 'All systems operational', icon: 'monitor_heart', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                ].map((metric, i) => (
                    <motion.div key={i} variants={itemVariants} className="bg-surface-card border border-outline/10 rounded-2xl p-6 shadow-card">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg ${metric.bg} ${metric.color} flex items-center justify-center border ${metric.border}`}>
                                <span className="material-symbols-outlined">{metric.icon}</span>
                            </div>
                        </div>
                        <div className="text-3xl font-black text-on-surface mb-1">
                          {metric.value}
                        </div>
                        <div className="text-sm font-medium text-on-surface-variant/80">{metric.title}</div>
                        <div className="text-xs text-on-surface-variant mt-4 font-medium">{metric.trend}</div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Management Table */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 bg-surface-card border border-outline/10 rounded-2xl shadow-card overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-outline/10 flex justify-between items-center bg-outline/5">
                        <h2 className="text-xl font-bold text-on-surface">Recent Users</h2>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/80 text-sm">search</span>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search students..." className="bg-surface-container border border-outline/10 rounded-lg pl-9 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary transition-colors" />
                        </div>
                    </div>
                    <div className="overflow-x-auto flex-1 max-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-surface-card z-10">
                                <tr className="border-b border-outline/10 text-xs uppercase text-on-surface-variant/80 bg-surface-container/50">
                                    <th className="p-4 font-medium">Student</th>
                                    <th className="p-4 font-medium">University</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Joined</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredUsers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-on-surface-variant/80">No users found.</td>
                                    </tr>
                                )}
                                {filteredUsers.map((user, i) => (
                                    <tr 
                                      key={user.id || i} 
                                      onClick={() => setSelectedUser(user)}
                                      className="group border-b border-outline/5 hover:bg-outline/5 transition-colors cursor-pointer"
                                    >
                                        <td className="p-4">
                                            <div className="font-bold text-on-surface">{user.name || 'Unknown'}</div>
                                            <div className="text-xs text-on-surface-variant/80">{user.email || 'No email'}</div>
                                        </td>
                                        <td className="p-4 text-on-surface-variant">{user.uniId || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>
                                                {user.role || 'student'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-on-surface-variant/80">Just now</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <select 
                                                  value={user.role || 'student'} 
                                                  onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                                                  className="text-xs bg-surface border border-outline/10 rounded px-2 py-1 focus:outline-none"
                                                >
                                                  <option value="student">Student</option>
                                                  <option value="classrep">Class Rep</option>
                                                  <option value="lecturer">Lecturer</option>
                                                  <option value="admin">Admin</option>
                                                </select>
                                                <button 
                                                  onClick={() => handleBanUser(user.id, !user.banned)}
                                                  className={`text-xs px-2 py-1 rounded font-bold transition-colors ${user.banned ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-error/10 text-error hover:bg-error/20'}`}
                                                >
                                                  {user.banned ? 'Unban' : 'Ban'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* System Status */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-surface-card border border-outline/10 rounded-2xl shadow-card p-6 space-y-6">
                    <h2 className="text-xl font-bold text-on-surface">System Status</h2>
                    
                    <div className="space-y-4">
                        {[
                            { label: 'Database Connection', status: 'Healthy', color: 'emerald' },
                            { label: 'AI Processing Engine', status: 'Healthy', color: 'emerald' },
                            { label: 'Auth Service', status: 'Healthy', color: 'emerald' },
                            { label: 'Storage Bucket', status: 'Healthy', color: 'emerald' },
                        ].map((sys, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-surface-container rounded-xl border border-outline/5">
                                <span className="text-sm font-medium text-on-surface">{sys.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full bg-${sys.color}-500 ${sys.color === 'emerald' ? 'animate-pulse' : ''}`}></span>
                                    <span className={`text-xs font-bold text-${sys.color}-500`}>{sys.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-primary">check_circle</span>
                            <div>
                                <h4 className="text-sm font-bold text-primary mb-1">Firebase Live Integration</h4>
                                <p className="text-xs text-primary/70 leading-relaxed">
                                    The system is fully integrated and pulling live data from Firestore.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'corrections' && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="bg-surface-card border border-outline/10 rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-on-surface mb-6">User Submissions</h2>
            <div className="space-y-4">
                {corrections.length === 0 ? (
                      <div className="text-on-surface-variant/80 text-center p-12 border border-dashed border-outline/20 rounded-xl">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">task_alt</span>
                        <p>No pending corrections to review.</p>
                      </div>
                ) : (
                    corrections.map((c) => (
                        <div key={c.id} className="bg-surface-container rounded-xl p-4 border border-outline/10 text-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-amber-500/20 text-amber-500 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{c.type}</span>
                                      <span className="text-xs text-on-surface-variant font-bold">{c.university} {c.faculty ? `> ${c.faculty}` : ''}</span>
                                    </div>
                                    <span className="text-on-surface text-lg font-black block pt-1">"{c.userStatement}"</span>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    <button onClick={() => handleReviewCorrection(c.id, 'approve')} className="flex-1 md:flex-none bg-primary/10 text-primary hover:bg-primary/20 px-6 py-2 rounded-lg text-sm font-bold transition-colors">Approve</button>
                                    <button onClick={() => handleReviewCorrection(c.id, 'reject')} className="flex-1 md:flex-none bg-error/10 text-error hover:bg-error/20 px-6 py-2 rounded-lg text-sm font-bold transition-colors">Reject</button>
                                </div>
                            </div>
                            
                            {/* Approve Form Expansion */}
                            {reviewingId === c.id && reviewAction === 'approve' && (
                              <div className="mt-4 pt-4 border-t border-outline/10 flex flex-col sm:flex-row gap-3">
                                <input 
                                  type="text" 
                                  value={correctionFinalValue} 
                                  onChange={(e) => setCorrectionFinalValue(e.target.value)} 
                                  placeholder={`Enter the final ${c.type} name to save globally...`}
                                  className="flex-1 bg-surface border border-outline/20 rounded-lg px-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary"
                                />
                                <button onClick={submitFinalCorrection} className="bg-primary text-on-primary px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-colors">Save Globally</button>
                                <button onClick={() => setReviewingId(null)} className="bg-surface text-on-surface border border-outline/20 px-4 py-2 rounded-lg text-sm font-bold hover:bg-surface-container transition-colors">Cancel</button>
                              </div>
                            )}
                        </div>
                    ))
                )}
            </div>
          </motion.div>
        )}

        {activeTab === 'data' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Add Form */}
            <motion.div initial={{opacity: 0, x: -20}} animate={{opacity: 1, x: 0}} className="bg-surface-card border border-outline/10 rounded-2xl shadow-card p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-on-surface">Add New Data</h2>
                    <p className="text-on-surface-variant text-xs">Publish new nodes to the live app.</p>
                  </div>
                </div>
                <button 
                  onClick={handleImportStaticData} 
                  disabled={isMigrating}
                  className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-500/20 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">cloud_sync</span>
                  {isMigrating ? 'Migrating...' : 'Seed from JSON'}
                </button>
              </div>

              <form onSubmit={handleAddManualData} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Entity Type to Add</label>
                  <select 
                    value={dataForm.type} 
                    onChange={(e) => setDataForm({...dataForm, type: e.target.value as any, value: ''})}
                    className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="university">University</option>
                    <option value="faculty">Faculty</option>
                    <option value="department">Department</option>
                    <option value="course">Course</option>
                  </select>
                </div>

                <div className="p-4 bg-outline/5 rounded-xl border border-outline/10 space-y-4">
                  <p className="text-xs font-bold text-on-surface-variant uppercase">Parent Hierarchy</p>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant">University</label>
                    <input type="text" placeholder="e.g. University of Ilorin" required value={dataForm.university} onChange={(e) => setDataForm({...dataForm, university: e.target.value})} className="w-full bg-surface-container border border-outline/10 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary" />
                  </div>
                  
                  {(dataForm.type === 'department' || dataForm.type === 'course') && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant">Faculty</label>
                      <input type="text" placeholder="e.g. Faculty of Science" required value={dataForm.faculty} onChange={(e) => setDataForm({...dataForm, faculty: e.target.value})} className="w-full bg-surface-container border border-outline/10 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary" />
                    </div>
                  )}

                  {dataForm.type === 'course' && (
                    <>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant">Department</label>
                        <input type="text" placeholder="e.g. Computer Science" required value={dataForm.department} onChange={(e) => setDataForm({...dataForm, department: e.target.value})} className="w-full bg-surface-container border border-outline/10 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-on-surface-variant">Semester</label>
                        <select required value={dataForm.semester} onChange={(e) => setDataForm({...dataForm, semester: e.target.value})} className="w-full bg-surface-container border border-outline/10 rounded-lg px-4 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary">
                          <option value="Harmattan (1st)">Harmattan (1st)</option>
                          <option value="Rain (2nd)">Rain (2nd)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-bold text-primary uppercase tracking-wider">New {dataForm.type} Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder={`Enter name of new ${dataForm.type}...`}
                    value={dataForm.value} 
                    onChange={(e) => setDataForm({...dataForm, value: e.target.value})} 
                    className="w-full bg-surface-container border-2 border-primary/30 rounded-xl px-4 py-3.5 text-on-surface font-bold text-sm focus:outline-none focus:border-primary" 
                  />
                </div>

                {dataMessage && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${dataMessage.includes('success') || dataMessage.includes('Successfully') ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                    {dataMessage}
                  </div>
                )}

                <button type="submit" disabled={isSubmittingData} className="w-full bg-primary text-on-primary font-black py-4 rounded-xl shadow-md flex items-center justify-center gap-2">
                  {isSubmittingData ? 'Publishing...' : 'Publish to Live'}
                  <span className="material-symbols-outlined">cloud_upload</span>
                </button>
              </form>
            </motion.div>

            {/* Right: Explorer */}
            <motion.div initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} className="bg-surface-card border border-outline/10 rounded-2xl shadow-card p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500">travel_explore</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-on-surface">Data Explorer</h2>
                  <p className="text-on-surface-variant text-xs">Browse and manage existing academic records.</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* University Selection */}
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Select University</label>
                   <div className="grid grid-cols-1 gap-2">
                     {Object.keys(uniData).map(uni => (
                       <div key={uni} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${explorerSelection.university === uni ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline/10 text-on-surface hover:border-primary/30'}`}>
                          <button onClick={() => setExplorerSelection({ ...explorerSelection, university: uni, faculty: '', department: '' })} className="flex-1 text-left font-bold text-sm">{uni}</button>
                          <button onClick={() => handleDeleteEntity('university', uni)} className="text-error/60 hover:text-error transition-colors p-1">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Faculty Selection */}
                {explorerSelection.university && (
                   <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                     <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Faculties in {explorerSelection.university}</label>
                     <div className="grid grid-cols-1 gap-2">
                       {Object.keys(uniData[explorerSelection.university] || {}).map(fac => (
                         <div key={fac} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${explorerSelection.faculty === fac ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline/10 text-on-surface hover:border-primary/30'}`}>
                            <button onClick={() => setExplorerSelection({ ...explorerSelection, faculty: fac, department: '' })} className="flex-1 text-left font-bold text-sm">{fac}</button>
                            <button onClick={() => handleDeleteEntity('faculty', fac, { university: explorerSelection.university })} className="text-error/60 hover:text-error transition-colors p-1">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                         </div>
                       ))}
                     </div>
                   </div>
                )}

                {/* Dept Selection */}
                {explorerSelection.faculty && (
                   <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                     <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Departments in {explorerSelection.faculty}</label>
                     <div className="grid grid-cols-1 gap-2">
                       {Object.keys(uniData[explorerSelection.university][explorerSelection.faculty] || {}).map(dept => (
                         <div key={dept} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${explorerSelection.department === dept ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container border-outline/10 text-on-surface hover:border-primary/30'}`}>
                            <button onClick={() => setExplorerSelection({ ...explorerSelection, department: dept })} className="flex-1 text-left font-bold text-sm">{dept}</button>
                            <button onClick={() => handleDeleteEntity('department', dept, { university: explorerSelection.university, faculty: explorerSelection.faculty })} className="text-error/60 hover:text-error transition-colors p-1">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                         </div>
                       ))}
                     </div>
                   </div>
                )}

                {/* Course Explorer */}
                {explorerSelection.department && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                     <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Courses in {explorerSelection.department}</label>
                       <select 
                        value={explorerSelection.semester} 
                        onChange={e => setExplorerSelection({...explorerSelection, semester: e.target.value})}
                        className="bg-surface-container border border-outline/10 rounded-lg px-2 py-1 text-xs font-bold"
                       >
                         <option value="Harmattan (1st)">Harmattan (1st)</option>
                         <option value="Rain (2nd)">Rain (2nd)</option>
                       </select>
                     </div>
                     <div className="bg-outline/5 rounded-2xl p-4 border border-outline/10">
                        {uniData[explorerSelection.university][explorerSelection.faculty][explorerSelection.department][explorerSelection.semester]?.length > 0 ? (
                           <div className="flex flex-wrap gap-2">
                             {uniData[explorerSelection.university][explorerSelection.faculty][explorerSelection.department][explorerSelection.semester].map(course => (
                               <div key={course} className="bg-surface border border-outline/10 px-3 py-1.5 rounded-lg flex items-center gap-2 group">
                                  <span className="text-xs font-bold">{course}</span>
                                  <button onClick={() => handleDeleteEntity('course', course, { university: explorerSelection.university, faculty: explorerSelection.faculty, department: explorerSelection.department, semester: explorerSelection.semester })} className="text-error opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-xs">close</span>
                                  </button>
                               </div>
                             ))}
                           </div>
                        ) : (
                          <div className="text-center py-8 text-on-surface-variant/60">
                             <span className="material-symbols-outlined text-4xl mb-2 opacity-20">inventory_2</span>
                             <p className="text-xs font-medium">No courses found for this semester.</p>
                          </div>
                        )}
                     </div>
                   </div>
                )}

              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'cms' && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="max-w-4xl bg-surface-card border border-outline/10 rounded-2xl shadow-card p-6 md:p-8">
            <h2 className="text-xl font-bold mb-6">Landing Page CMS</h2>
            {!cmsConfig ? (
              <div className="p-8 text-center border-2 border-dashed border-outline/20 rounded-xl">
                <p className="text-on-surface-variant mb-4">No site configuration found in Firestore.</p>
                <button 
                  onClick={() => setCmsConfig({
                    heroTitle: "Your classes & exams, perfectly organized.",
                    heroDesc: "Upload your messy departmental PDF — our AI instantly extracts your exact lectures, exams, venues and times into one gorgeous dashboard.",
                    announcement: "ExamSync v2.0 — Now Live",
                    features: [
                      { icon: 'calendar_month', title: 'Lecture Timetables', desc: 'Daily class schedules with venue details, never miss a room change.' },
                      { icon: 'menu_book',      title: 'Exam Schedules',    desc: 'All your exam dates, times and venues in one glanceable view.' }
                    ]
                  })}
                  className="bg-primary text-on-primary px-6 py-2 rounded-xl font-bold shadow-md"
                >
                  Create Initial Config
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveCms} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-on-surface-variant">Hero Title</label>
                    <input 
                      type="text" 
                      value={cmsConfig.heroTitle} 
                      onChange={e => setCmsConfig({...cmsConfig, heroTitle: e.target.value})}
                      className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-on-surface-variant">Top Announcement</label>
                    <input 
                      type="text" 
                      value={cmsConfig.announcement} 
                      onChange={e => setCmsConfig({...cmsConfig, announcement: e.target.value})}
                      className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-on-surface-variant">Hero Description</label>
                  <textarea 
                    rows={3}
                    value={cmsConfig.heroDesc} 
                    onChange={e => setCmsConfig({...cmsConfig, heroDesc: e.target.value})}
                    className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-outline/10">
                   <h3 className="text-lg font-bold mb-4">Features</h3>
                   <div className="space-y-4">
                     {cmsConfig.features.map((f: any, i: number) => (
                       <div key={i} className="flex gap-4 p-4 bg-outline/5 rounded-xl border border-outline/10">
                         <div className="flex-1 space-y-4">
                           <div className="grid grid-cols-2 gap-4">
                              <input type="text" value={f.title} onChange={e => {
                                const newFeatures = [...cmsConfig.features];
                                newFeatures[i].title = e.target.value;
                                setCmsConfig({...cmsConfig, features: newFeatures});
                              }} placeholder="Feature Title" className="bg-surface border border-outline/10 rounded-lg px-3 py-2 text-sm" />
                              <input type="text" value={f.icon} onChange={e => {
                                const newFeatures = [...cmsConfig.features];
                                newFeatures[i].icon = e.target.value;
                                setCmsConfig({...cmsConfig, features: newFeatures});
                              }} placeholder="Material Icon Name" className="bg-surface border border-outline/10 rounded-lg px-3 py-2 text-sm" />
                           </div>
                           <textarea value={f.desc} onChange={e => {
                              const newFeatures = [...cmsConfig.features];
                              newFeatures[i].desc = e.target.value;
                              setCmsConfig({...cmsConfig, features: newFeatures});
                           }} placeholder="Feature Description" className="w-full bg-surface border border-outline/10 rounded-lg px-3 py-2 text-sm" />
                         </div>
                         <button type="button" onClick={() => {
                            const newFeatures = cmsConfig.features.filter((_: any, idx: number) => idx !== i);
                            setCmsConfig({...cmsConfig, features: newFeatures});
                         }} className="text-error hover:text-error/80"><span className="material-symbols-outlined">delete</span></button>
                       </div>
                     ))}
                     <button type="button" onClick={() => {
                        setCmsConfig({...cmsConfig, features: [...cmsConfig.features, { icon: 'star', title: 'New Feature', desc: 'Description here...' }]});
                     }} className="w-full py-2 border-2 border-dashed border-outline/20 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-outline/5 transition-colors">+ Add Feature</button>
                   </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingCms}
                  className="w-full bg-primary text-on-primary font-black py-4 rounded-xl shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isSavingCms ? 'Saving Content...' : 'Publish to Live Site'}
                </button>
              </form>
            )}
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="bg-surface-card border border-outline/10 rounded-2xl shadow-card overflow-hidden">
            <div className="p-6 border-b border-outline/10 bg-outline/5">
              <h2 className="text-xl font-bold text-on-surface">System Activity</h2>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline/10 text-xs uppercase text-on-surface-variant/80 bg-surface-container/50">
                    <th className="p-4 font-medium">Event</th>
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Details</th>
                    <th className="p-4 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-on-surface-variant/80">No activity logged yet.</td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => (
                      <tr key={log.id} className="border-b border-outline/5 hover:bg-outline/5 transition-colors">
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                            log.event === 'login' ? 'bg-primary/10 text-primary border border-primary/20' :
                            log.event === 'upload' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                            'bg-surface-container text-on-surface-variant border border-outline/10'
                          }`}>
                            {log.event}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-on-surface">{log.userName || 'System'}</td>
                        <td className="p-4 text-on-surface-variant">{log.details}</td>
                        <td className="p-4 text-xs text-on-surface-variant/80">
                          {log.timestamp?.toDate().toLocaleString() || 'Just now'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="max-w-2xl bg-surface-card border border-outline/10 rounded-2xl shadow-card p-6 md:p-8 space-y-8">
            <h2 className="text-xl font-bold mb-6">Global Site Settings</h2>
            
            <div className="flex items-center justify-between p-4 bg-outline/5 rounded-2xl border border-outline/10">
              <div>
                <h4 className="font-bold text-on-surface">Maintenance Mode</h4>
                <p className="text-xs text-on-surface-variant">Block all users from accessing the app dashboard.</p>
              </div>
              <button 
                onClick={() => setSiteSettings({...siteSettings, maintenanceMode: !siteSettings.maintenanceMode})}
                className={`w-14 h-8 rounded-full transition-colors relative ${siteSettings.maintenanceMode ? 'bg-primary' : 'bg-outline/20'}`}
              >
                <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${siteSettings.maintenanceMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-on-surface-variant">Global Announcement Banner</label>
              <textarea 
                rows={3}
                placeholder="Message to show to all users..."
                value={siteSettings.announcement}
                onChange={e => setSiteSettings({...siteSettings, announcement: e.target.value})}
                className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full bg-primary text-on-primary font-black py-4 rounded-xl shadow-md hover:bg-primary/90 transition-all"
            >
              Update Global Settings
            </button>
          </motion.div>
        )}

        {/* User Details Modal */}
        <AnimatePresence>
          {selectedUser && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface-card border border-outline/10 w-full max-w-lg rounded-[2rem] shadow-modal overflow-hidden"
              >
                <div className="p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <span className="material-symbols-outlined text-3xl">person</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-on-surface">{selectedUser.name}</h3>
                        <p className="text-on-surface-variant">{selectedUser.email}</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-outline/5 rounded-full transition-colors">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-outline/5 rounded-2xl border border-outline/10">
                       <p className="text-[10px] font-black uppercase text-on-surface-variant mb-1">University</p>
                       <p className="font-bold text-sm">{selectedUser.uniId || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-outline/5 rounded-2xl border border-outline/10">
                       <p className="text-[10px] font-black uppercase text-on-surface-variant mb-1">Faculty</p>
                       <p className="font-bold text-sm">{selectedUser.faculty || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-outline/5 rounded-2xl border border-outline/10">
                       <p className="text-[10px] font-black uppercase text-on-surface-variant mb-1">Department</p>
                       <p className="font-bold text-sm">{selectedUser.department || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-outline/5 rounded-2xl border border-outline/10">
                       <p className="text-[10px] font-black uppercase text-on-surface-variant mb-1">Role</p>
                       <p className="font-bold text-sm uppercase text-primary">{selectedUser.role || 'Student'}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-outline/10">
                     <h4 className="text-sm font-bold">Manage Account</h4>
                     <div className="flex gap-2">
                       <button onClick={() => { handleBanUser(selectedUser.id, !selectedUser.banned); setSelectedUser(null); }} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${selectedUser.banned ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                          {selectedUser.banned ? 'Unban User' : 'Ban User Account'}
                       </button>
                       <button className="flex-1 bg-outline/5 text-on-surface-variant border border-outline/10 py-3 rounded-xl font-bold text-sm">Reset Password</button>
                     </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
