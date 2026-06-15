import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  children?: React.ReactNode;
  icon?: string;
  className?: string;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  className = '',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'px-8 py-4 rounded-xl font-bold text-label-md flex items-center justify-center gap-2 transition-all active:scale-95';

  const variants = {
    primary: 'bg-secondary-container text-on-secondary-container hover:shadow-lg',
    secondary: 'bg-primary-container text-on-primary-container hover:shadow-lg',
    outline: 'border border-outline text-primary hover:bg-surface-container',
    ghost: 'p-2 text-on-surface-variant hover:text-secondary',
  };

  const isIconButton = !children && icon;

  return (
    <button
      className={`${isIconButton ? 'p-2 rounded-full' : baseStyles} ${variants[variant]} ${className} ${(isLoading || disabled) ? 'opacity-60 cursor-not-allowed' : ''}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
      ) : (
        icon && <span className="material-symbols-outlined">{icon}</span>
      )}
      {children}
    </button>
  );
};

export default Button;
