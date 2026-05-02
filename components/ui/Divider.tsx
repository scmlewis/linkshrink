import React from 'react';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return <div className={`h-full w-px bg-outline-variant ${className}`} />;
  }

  return <div className={`w-full h-px bg-outline-variant ${className}`} />;
};
