import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md';
  className?: string;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onRemove,
}) => {
  const variantStyles = {
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    tertiary: 'bg-tertiary-container text-on-tertiary-container',
    success: 'bg-green-900/40 text-green-300',
    warning: 'bg-orange-900/40 text-orange-300',
    error: 'bg-error-container text-on-error-container',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${onRemove ? 'hover:shadow-md hover:shadow-primary/30' : ''} ${className}`}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:opacity-70 transition-opacity focus:outline-none focus-visible:ring-1 focus-visible:ring-current rounded-full"
          aria-label="Remove"
        >
          ✕
        </button>
      )}
    </div>
  );
};
