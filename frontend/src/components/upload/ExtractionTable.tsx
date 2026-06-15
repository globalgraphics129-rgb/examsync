import React from 'react';
import type { ExamEntry } from '../../types/exam.types';
import Button from '../ui/Button';

interface ExtractionTableProps {
  entries: ExamEntry[];
  onPublish: () => void;
  isPublishing: boolean;
}

const ExtractionTable: React.FC<ExtractionTableProps> = ({
  entries,
  onPublish,
  isPublishing,
}) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-xl shadow-surface-variant/50 overflow-hidden border border-surface-variant/50">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant text-[11px] font-bold uppercase tracking-[0.15em]">
              <th className="px-8 py-5">Course</th>
              <th className="px-8 py-5">Title</th>
              <th className="px-8 py-5">Schedule</th>
              <th className="px-8 py-5">Type</th>
              <th className="px-8 py-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/50">
            {entries.map((item, i) => (
              <tr 
                key={i} 
                className={`${item.aiConfidence === 'low' ? 'bg-status-warning/5 hover:bg-status-warning/10' : 'hover:bg-surface-container-low/30'} transition-colors group`}
              >
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-6 rounded-full ${item.aiConfidence === 'low' ? 'bg-status-warning' : 'bg-secondary'}`}></div>
                    <span className={`font-bold text-primary ${item.aiConfidence === 'low' ? 'text-secondary' : ''}`}>
                      {item.courseCode}
                    </span>
                    {item.aiConfidence === 'low' && (
                      <span className="material-symbols-outlined text-status-warning text-sm">warning</span>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-body-sm text-on-surface-variant font-medium">
                  {item.courseTitle}
                </td>
                <td className="px-8 py-6 text-body-sm text-primary font-bold">
                  {item.date} · {item.time}
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border ${
                    item.examType === 'CBT' ? 'bg-amber-50 text-secondary border-amber-200' : 'bg-blue-50 text-on-tertiary-fixed-variant border-blue-200'
                  }`}>
                    {item.examType}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  {item.aiConfidence === 'low' ? (
                    <Button variant="primary" className="px-4 py-2 text-[10px] rounded-lg">Verify</Button>
                  ) : (
                    <button className="text-on-surface-variant hover:text-primary transition-colors p-2 rounded-lg hover:bg-surface-container">
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-8 bg-surface-container-low/50 border-t border-surface-variant/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3 text-body-sm text-on-surface-variant italic">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <p>Unconfirmed entries will be marked as <span className="text-secondary font-bold">"Tentative"</span> for students.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-3 text-label-md font-bold text-on-surface-variant hover:text-primary transition-colors">Discard</button>
          <Button 
            variant="primary" 
            icon={isPublishing ? 'sync' : 'publish'} 
            className="px-10 py-4 shadow-xl shadow-secondary/20"
            onClick={onPublish}
            disabled={isPublishing}
          >
            {isPublishing ? 'Publishing...' : 'Confirm & Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExtractionTable;
