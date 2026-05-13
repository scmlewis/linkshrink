'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { copyToClipboard } from '@/lib/utils';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  title?: string;
  className?: string;
  rel?: string;
  forceNewTab?: boolean;
}

export const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  children,
  title,
  className = '',
  rel = 'noopener noreferrer',
  forceNewTab = false,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCopyUrl = async () => {
    if (await copyToClipboard(href)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    window.open(href, '_blank', rel);
    setIsModalOpen(false);
  };

  // On mobile, show modal to prevent new tab clutter
  if (isMobile && !forceNewTab) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          title={title}
          className={`cursor-pointer hover:underline ${className}`}
        >
          {children}
        </button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Open External Link"
          description="Choose how you'd like to open this link"
          size="sm"
          actions={[
            {
              label: 'Open in New Tab',
              onClick: handleOpenLink,
              variant: 'primary',
            },
            {
              label: copied ? 'Copied!' : 'Copy Link',
              onClick: handleCopyUrl,
              variant: 'outline',
            },
          ]}
        >
          <div className="space-y-3 break-all">
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Link URL:</p>
              <p className="text-sm text-secondary font-mono">{href}</p>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // On desktop or when forced, use regular link behavior
  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      title={title}
      className={`cursor-pointer hover:underline ${className}`}
    >
      {children}
    </a>
  );
};
