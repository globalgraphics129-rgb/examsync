import React from 'react';

interface ExamCardProps {
  courseCode: string;
  courseTitle: string;
  time: string;
  venue: string;
  type: 'CBT' | 'Written';
  countdown?: string;
  className?: string;
}

const ExamCard: React.FC<ExamCardProps> = ({
  courseCode,
  courseTitle,
  time,
  venue,
  type,
  countdown,
  className = '',
}) => {
  const borderColor = type === 'CBT' ? 'signature-border-amber' : 'signature-border-blue';
  const typeColor = type === 'CBT' ? 'text-secondary' : 'text-on-tertiary-container';

  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm ${borderColor} flex items-center justify-between hover:translate-x-1 transition-transform cursor-pointer ${className}`}>
      <div className="space-y-1">
        <p className={`${typeColor} font-bold text-label-sm`}>{type} EXAM</p>
        <h4 className="text-headline-md font-headline-md text-primary">{courseCode}</h4>
        <p className="text-on-surface-variant text-body-sm">{courseTitle}</p>
      </div>
      
      <div className="text-right space-y-1">
        <p className="font-bold text-primary text-headline-md">{time}</p>
        <p className="text-body-sm text-on-surface-variant">{venue}</p>
        {countdown && (
          <span className="inline-flex items-center gap-1 text-status-warning text-label-sm font-bold bg-status-warning/10 px-2 py-0.5 rounded-full mt-2">
            <span className="material-symbols-outlined text-[14px]">timer</span>
            {countdown}
          </span>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
