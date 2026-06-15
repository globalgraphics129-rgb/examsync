import React, { useState, useEffect } from 'react';

interface HeroExamCardProps {
  courseCode: string;
  courseTitle: string;
  date: string;
  venue: string;
  initialTimeSeconds: number;
}

const HeroExamCard: React.FC<HeroExamCardProps> = ({
  courseCode,
  courseTitle,
  date,
  venue,
  initialTimeSeconds,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTimeSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-primary text-on-primary shadow-2xl p-8 group">
      {/* Decorative Gradient Overlay */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] rounded-full bg-secondary-container opacity-20 blur-[80px] group-hover:opacity-30 transition-opacity"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <span className="px-4 py-1.5 rounded-full bg-secondary text-primary font-bold text-label-sm shadow-lg">Next Exam</span>
          <span className="material-symbols-outlined text-secondary-container text-3xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
        </div>
        
        <div className="space-y-1 mb-8">
          <h2 className="text-display-lg-mobile md:text-display-lg font-display-lg leading-tight">{courseCode}</h2>
          <p className="text-on-primary-container font-medium text-body-lg opacity-80">{courseTitle}</p>
        </div>

        <div className="flex flex-col mb-8">
          <span className="text-display-lg font-display-lg leading-none tracking-tighter pulse-active">
            {formatTime(timeLeft)}
          </span>
          <span className="text-label-sm font-bold text-on-primary-container/60 mt-3 tracking-widest uppercase">Time Remaining</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3 text-body-sm font-medium bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined text-[20px] text-secondary">calendar_today</span>
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-3 text-body-sm font-medium bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
            <span className="material-symbols-outlined text-[20px] text-secondary">location_on</span>
            <span>{venue}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroExamCard;
