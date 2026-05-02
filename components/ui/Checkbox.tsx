import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start gap-3">
        <div className="flex items-center h-6">
          <input
            ref={ref}
            type="checkbox"
            className={`w-5 h-5 bg-black/80 border-2 border-outline-variant rounded cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${className}`}
            {...props}
          />
        </div>
        {label && (
          <div className="flex flex-col gap-1">
            <label className="text-on-surface cursor-pointer select-none">{label}</label>
            {helperText && <p className="text-on-surface-variant text-sm">{helperText}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
