import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useExamStore } from '../../store/examStore';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import api from '../../lib/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pdf' | 'text'>('pdf');
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const { clearExams } = useExamStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (activeTab === 'pdf' && !file) return;
    if (activeTab === 'text' && !textContent.trim()) return;

    setIsUploading(true);
    setStatusMsg('Reading your timetable...');

    try {
      let parsedEntries: any[] = [];

      if (activeTab === 'text') {
        // --- Text mode: send to AI parse endpoint ---
        setStatusMsg('AI is extracting schedule...');
        const parseRes = await api.post('/parse', { text: textContent });
        parsedEntries = parseRes.data.entries || [];
      } else if (file) {
        // --- PDF mode: read as base64 and send to AI parse endpoint ---
        setStatusMsg('Reading PDF...');
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        setStatusMsg('AI is extracting schedule...');
        const parseRes = await api.post('/parse', { pdfBase64: base64 });
        parsedEntries = parseRes.data.entries || [];
      }

      if (parsedEntries.length === 0) {
        setStatusMsg('');
        alert('The AI could not find any schedule entries. Please check the content and try again.');
        setIsUploading(false);
        return;
      }

      // --- Save entries to Firestore ---
      setStatusMsg(`Saving ${parsedEntries.length} entries to your schedule...`);
      const batch = parsedEntries.map((entry: any) =>
        addDoc(collection(db, 'timetable_entries'), {
          ...entry,
          department: user?.department || entry.department || 'General',
          level: user?.level || entry.level || 100,
          faculty: user?.faculty,
          uniId: user?.uniId,
          session: '2025/2026',
          uploadedBy: user?.uid,
          createdAt: serverTimestamp(),
        })
      );
      await Promise.all(batch);

      // Clear cached exams so dashboard re-fetches fresh data
      clearExams();

      setStatusMsg('Done! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (e: any) {
      console.error('Upload error:', e);
      setStatusMsg('');
      const errMsg = e.response?.data?.error || e.message || 'Unknown error';
      alert(`Upload failed: ${errMsg}. Check the browser console for details.`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8 py-12 px-4"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2 shadow-lg">
          <span className="material-symbols-outlined text-3xl">auto_awesome</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface tracking-tight">Feed the AI</h1>
        <p className="text-on-surface-variant text-lg max-w-lg mx-auto">Upload your departmental PDF or paste your raw timetable text. Our AI will instantly extract and organize your schedule.</p>
      </div>

      <motion.div
        className="bg-surface-card rounded-[2rem] p-6 md:p-10 shadow-elevated border border-outline/10 relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[100px] pointer-events-none"></div>

        {/* Tabs */}
        <div className="flex p-1 bg-surface-container rounded-2xl w-max mx-auto mb-8 relative z-10 border border-outline/10">
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'pdf' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            PDF / Image
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'text' ? 'bg-secondary text-on-secondary shadow-md' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Paste Text
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[300px] relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'pdf' ? (
              <motion.div
                key="pdf"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`border-2 border-dashed rounded-[2rem] p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative group ${file ? 'border-primary bg-primary/5' : 'border-outline/30 hover:border-primary/50 hover:bg-surface-container'}`}
              >
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${file ? 'bg-primary text-on-primary shadow-lg' : 'bg-surface-container-high text-on-surface-variant group-hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-4xl">{file ? 'check' : 'cloud_upload'}</span>
                </motion.div>
                <h3 className="text-xl font-bold text-on-surface mb-2">
                  {file ? file.name : 'Click or drag file here'}
                </h3>
                <p className="text-on-surface-variant">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supports PDF, PNG, JPG up to 10MB'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="text"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4 h-full"
              >
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your timetable text here...&#10;&#10;E.g.&#10;Monday: MTH101 8AM-10AM Venue LT1&#10;Tuesday: CSC 401 10AM-12PM Venue LT 3..."
                  className="w-full h-[300px] bg-surface-container-high border border-outline/10 rounded-[2rem] p-8 text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container transition-all resize-none outline-none placeholder:text-on-surface-variant/50"
                ></textarea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {statusMsg && (
          <div className="mt-4 flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-primary text-sm font-medium relative z-10">
            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
            {statusMsg}
          </div>
        )}

        <div className="mt-8 relative z-10">
          <Button
            variant="primary"
            className="w-full py-5 text-lg font-bold tracking-wide disabled:opacity-50"
            icon={isUploading ? 'sync' : 'auto_awesome'}
            disabled={isUploading || (activeTab === 'pdf' && !file) || (activeTab === 'text' && !textContent.trim())}
            onClick={handleUpload}
          >
            {isUploading ? 'Processing...' : 'Extract Schedule with AI'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UploadPage;
