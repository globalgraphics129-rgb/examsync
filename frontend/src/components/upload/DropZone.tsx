import React, { useCallback } from 'react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, isLoading }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isLoading) return;
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      onFileSelect(file);
    }
  }, [onFileSelect, isLoading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div 
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`group relative flex flex-col items-center justify-center w-full min-h-[320px] border-4 border-dashed ${isLoading ? 'border-surface-variant cursor-wait' : 'border-surface-variant hover:border-secondary cursor-pointer'} rounded-[2.5rem] bg-white/50 hover:bg-white transition-all overflow-hidden shadow-sm hover:shadow-2xl`}
    >
      <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center p-8 space-y-6">
        <div className={`w-20 h-20 bg-secondary-container text-on-secondary-container rounded-[2rem] flex items-center justify-center shadow-lg ${isLoading ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`}>
          <span className="material-symbols-outlined text-4xl">
            {isLoading ? 'sync' : 'cloud_upload'}
          </span>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-headline-md font-bold text-primary">
            {isLoading ? 'Analyzing Timetable...' : 'Drag & Drop Timetable'}
          </h3>
          <p className="text-on-surface-variant max-w-sm leading-relaxed">
            {isLoading 
              ? 'Our AI is scanning every cell for course codes, dates, and venues. This usually takes 5-10 seconds.'
              : 'Upload the official university PDF or a clear image. Our AI will extract dates, venues, and courses automatically.'}
          </p>
        </div>

        {!isLoading && (
          <>
            <label className="px-10 py-4 bg-secondary-container text-on-secondary-container rounded-xl font-bold cursor-pointer shadow-xl shadow-secondary/20 active:scale-95 transition-all">
              Browse Files
              <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleFileChange} />
            </label>
            <p className="text-[10px] font-bold text-outline uppercase tracking-[0.2em]">Max 10MB (PDF, PNG, JPG)</p>
          </>
        )}
      </div>

      {isLoading && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-surface-container overflow-hidden">
          <div className="h-full bg-secondary w-1/2 animate-shimmer"></div>
        </div>
      )}
    </div>
  );
};

export default DropZone;
