import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type WaitlistEntry = {
  id: string;
  email: string;
  timestamp: string;
};

const WaitlistAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Email Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<WaitlistEntry | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.toLowerCase() !== 'admin') {
      setLoginError('Invalid username');
      return;
    }
    
    setIsLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch', password })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setWaitlist(data.waitlist);
      } else {
        setLoginError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setLoginError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWaitlist = async () => {
    setDashboardLoading(true);
    try {
      const res = await fetch('/api/admin-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fetch', password })
      });
      const data = await res.json();
      if (res.ok) setWaitlist(data.waitlist);
    } catch (err) {
      console.error(err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this email from the waitlist?')) return;
    
    setActionError('');
    try {
      const res = await fetch('/api/admin-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', password, emailId: id })
      });
      
      if (res.ok) {
        setWaitlist(prev => prev.filter(entry => entry.id !== id));
      } else {
        const data = await res.json();
        setActionError(data.error);
      }
    } catch (err) {
      setActionError('Failed to delete entry.');
    }
  };

  const openEmailModal = (user: WaitlistEntry) => {
    setSelectedUser(user);
    setEmailSubject('');
    setEmailBody('');
    setEmailSuccess('');
    setActionError('');
    setIsModalOpen(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setSendingEmail(true);
    setActionError('');
    setEmailSuccess('');

    try {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">
          ${emailBody.replace(/\\n/g, '<br/>')}
          <br/><br/>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #888;">ExamSync - Your Academic Intelligence Platform</p>
        </div>
      `;

      const res = await fetch('/api/admin-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_email', 
          password, 
          emailId: selectedUser.id,
          subject: emailSubject,
          htmlContent 
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setEmailSuccess('Email sent successfully!');
        setTimeout(() => setIsModalOpen(false), 2000);
      } else {
        setActionError(data.error || 'Failed to send email');
      }
    } catch (err) {
      setActionError('Network error. Failed to send email.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-card p-8 rounded-3xl shadow-card border border-outline/10 w-full max-w-sm"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-6 mx-auto">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <h1 className="text-2xl font-black text-center text-on-surface mb-6">Waitlist Admin</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-error/10 text-error text-sm rounded-xl text-center font-bold">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1 ml-1 uppercase">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3 text-on-surface focus:border-primary outline-none"
                placeholder="admin"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1 ml-1 uppercase">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3 text-on-surface focus:border-primary outline-none"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface p-6 md:p-12 font-sans text-on-surface">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Waitlist Admin</h1>
            <p className="text-on-surface-variant mt-1">Manage users eagerly waiting for ExamSync.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm">
              {waitlist.length} {waitlist.length === 1 ? 'User' : 'Users'} Waiting
            </div>
            <button 
              onClick={fetchWaitlist} 
              disabled={dashboardLoading}
              className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
            >
              <span className={`material-symbols-outlined text-[20px] ${dashboardLoading ? 'animate-spin' : ''}`}>sync</span>
            </button>
          </div>
        </div>

        {actionError && !isModalOpen && (
          <div className="p-4 bg-error/10 text-error rounded-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {actionError}
          </div>
        )}

        {/* Table */}
        <div className="bg-surface-card border border-outline/10 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface-variant text-xs uppercase tracking-wider">
                  <th className="p-4 font-bold border-b border-outline/10">Email Address</th>
                  <th className="p-4 font-bold border-b border-outline/10">Joined At</th>
                  <th className="p-4 font-bold border-b border-outline/10 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                {waitlist.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-on-surface-variant">
                      No one is on the waitlist yet.
                    </td>
                  </tr>
                ) : (
                  waitlist.map((entry) => (
                    <tr key={entry.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="p-4 font-medium">{entry.email}</td>
                      <td className="p-4 text-sm text-on-surface-variant">
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEmailModal(entry)}
                            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors tooltip-trigger"
                            title="Send customized email"
                          >
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors tooltip-trigger"
                            title="Remove from waitlist"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Email Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-surface-card w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-outline/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black">Send Email to {selectedUser?.email}</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-4">
                {actionError && (
                  <div className="p-3 bg-error/10 text-error text-sm rounded-xl font-bold">{actionError}</div>
                )}
                {emailSuccess && (
                  <div className="p-3 bg-status-success/10 text-status-success text-sm rounded-xl font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {emailSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 ml-1 uppercase">Subject</label>
                  <input 
                    type="text" 
                    required
                    value={emailSubject}
                    onChange={e => setEmailSubject(e.target.value)}
                    className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3 text-on-surface focus:border-primary outline-none"
                    placeholder="Welcome to ExamSync!"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 ml-1 uppercase">Message</label>
                  <textarea 
                    required
                    value={emailBody}
                    onChange={e => setEmailBody(e.target.value)}
                    rows={6}
                    className="w-full bg-surface-container border border-outline/10 rounded-xl px-4 py-3 text-on-surface focus:border-primary outline-none resize-none"
                    placeholder="Type your message here..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={sendingEmail || !!emailSuccess}
                    className="px-5 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {sendingEmail ? (
                      <><span className="material-symbols-outlined text-[18px] animate-spin">sync</span> Sending...</>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">send</span> Send Email</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default WaitlistAdmin;
