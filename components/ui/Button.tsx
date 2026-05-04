import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading = false, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-transparent hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

    const variantStyles = {
      primary:
        'bg-gradient-to-r from-primary via-primary to-secondary text-white hover:from-[#caa3ed] hover:via-[#ddb7ff] hover:to-[#6de0f8] disabled:opacity-60 shadow-lg shadow-primary/30 hover:shadow-primary/45 ring-1 ring-primary/20 font-semibold',
      secondary:
        'bg-surface-container-high text-on-surface hover:bg-surface-container-highest disabled:opacity-60 focus-visible:ring-secondary border-outline-variant',
      outline:
        'border-outline-variant text-on-surface hover:border-surface-tint hover:text-surface-tint hover:bg-surface-container disabled:opacity-60 focus-visible:ring-outline-variant',
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
