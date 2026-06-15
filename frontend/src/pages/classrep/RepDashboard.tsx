import { motion } from 'framer-motion';
import { useUpload } from '../../hooks/useUpload';
import DropZone from '../../components/upload/DropZone';
import ExtractionTable from '../../components/upload/ExtractionTable';

const RepDashboard = () => {
  const { 
    isParsing, 
    isPublishing, 
    extractedEntries, 
    metadata, 
    error, 
    parsePDF, 
    publish
  } = useUpload();

  const handleFileSelect = (file: File) => {
    parsePDF(file);
  };

  const handlePublish = async () => {
    const success = await publish({
      session: '2025/2026',
      faculty: 'Science',
      department: 'Computer Science',
      level: 400,
      type: 'Departmental',
    });
    
    if (success) {
      alert('Timetable published successfully!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-lg-mobile md:text-headline-lg font-display-lg text-primary tracking-tight">Upload Schedule</h1>
          <p className="text-on-surface-variant">Manage and publish timetables for your department</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-status-success/10 text-status-success rounded-full border border-status-success/20">
          <span className="material-symbols-outlined text-sm">verified</span>
          <span className="text-label-sm font-bold uppercase tracking-wider">
            Active Session: {metadata?.sessionDetected || '2025/2026'}
          </span>
        </div>
      </section>

      {error && (
        <div className="bg-error/5 border border-error/20 p-4 rounded-2xl text-error text-label-md font-bold flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {extractedEntries.length === 0 ? (
        <DropZone onFileSelect={handleFileSelect} isLoading={isParsing} />
      ) : (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-tertiary-container flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-on-tertiary-container animate-pulse text-2xl">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-headline-md font-bold text-primary tracking-tight">AI Extraction Preview</h3>
                <p className="text-body-sm text-on-surface-variant">Review and verify entries before publishing</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-label-sm font-bold text-secondary hover:underline"
            >
              Upload Different File
            </button>
          </div>

          <ExtractionTable 
          entries={extractedEntries}
          onPublish={handlePublish}
          isPublishing={isPublishing}
        />
        </section>
      )}

      {/* AI Insights & Conflict Detection */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-primary-container p-10 rounded-[2.5rem] text-on-primary-container relative overflow-hidden group shadow-2xl">
          <div className="relative z-10 space-y-4">
            <h4 className="text-headline-md font-bold tracking-tight">Smart Analysis</h4>
            <p className="text-body-lg opacity-80 max-w-md leading-relaxed">
              Our AI automatically detects hall clashes and departmental overlaps to prevent registration stress.
            </p>
          </div>
          <div className="absolute -right-12 -bottom-12 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-[240px]" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-surface-variant shadow-sm flex flex-col justify-center text-center space-y-4">
          <div className="relative inline-block mx-auto">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-surface-container" />
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - 0.98)} className="text-status-success" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-display-lg text-2xl text-primary">98%</div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Extraction Accuracy</p>
            <p className="text-body-sm text-on-surface-variant mt-2">Verified by academic standards</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default RepDashboard;
