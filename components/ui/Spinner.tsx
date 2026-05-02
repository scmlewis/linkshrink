import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'tertiary';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    tertiary: 'border-tertiary border-t-transparent',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
  size = 'md',
  fullScreen = false,
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'fixed inset-0' : 'w-full h-32'}`}>
      <Spinner size={size} />
    </div>
  );
};
