import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-transparent hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary';

    const variantStyles = {
      primary: 'bg-primary text-on-primary hover:bg-[#1a3a8a] disabled:opacity-60 shadow-lg shadow-primary/30 hover:shadow-primary/50 focus-visible:ring-offset-surface font-semibold',
      secondary: 'bg-secondary text-on-secondary hover:bg-secondary-container disabled:opacity-60 focus-visible:ring-secondary',
      outline: 'border-outline text-on-surface hover:border-surface-tint hover:text-surface-tint hover:bg-surface-container disabled:opacity-60 focus-visible:ring-outline',
      danger: 'bg-error text-on-error hover:bg-error-container disabled:opacity-60 focus-visible:ring-error',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {props.children}
      </button>
    );
  }
);

Button.displayName = 'Button';
