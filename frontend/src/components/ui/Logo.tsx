import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'on-primary';
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', variant = 'dark', size = 'md' }) => {
  const colors = {
    dark: 'text-on-surface',
    light: 'text-on-surface',
    'on-primary': 'text-on-primary-container',
  };

  const sizes = {
    sm: 'text-headline-sm',
    md: 'text-headline-md',
    lg: 'text-headline-lg',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary via-primary-fixed-dim to-secondary flex items-center justify-center shadow-lg shadow-primary/20`}>
        <svg viewBox="0 0 24 24" className="w-5 h-5 md:w-6 md:h-6 fill-none stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className={`${sizes[size]} font-extrabold tracking-tighter ${colors[variant]}`}>
        ExamSync
      </span>
    </div>
  );
};

export default Logo;
