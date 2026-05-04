import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    isLoading?: boolean;
  }[];
  closeOnBackdropClick?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions = [],
  closeOnBackdropClick = true,
  size = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => closeOnBackdropClick && onClose()}
      />

      {/* Modal */}
      <div className={`relative glass-panel border border-outline-variant rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${sizeClasses[size]}`}>
        {/* Header */}
        {(title || description) && (
          <div className="border-b border-outline-variant/60 px-6 py-4 bg-black/20">
            {title && <h2 className="text-h2 font-bold text-on-surface tracking-tight">{title}</h2>}
            {description && <p className="text-on-surface-variant text-sm mt-1 leading-relaxed">{description}</p>}
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {actions.length > 0 && (
          <div className="border-t border-outline-variant/60 px-6 py-4 flex gap-3 justify-end bg-black/15">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                size="sm"
                onClick={action.onClick}
                isLoading={action.isLoading}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
