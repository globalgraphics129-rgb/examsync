import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  className?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  icon,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && <label className="text-label-sm font-label-sm text-on-surface-variant ml-1">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            {icon}
          </span>
        )}
        <input
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-3 bg-surface-container-low border-none rounded-xl text-label-md focus:ring-2 focus:ring-secondary transition-all ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default Input;
