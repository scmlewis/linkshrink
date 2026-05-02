'use client';

import React from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';

interface ErrorPageProps {
  statusCode?: number;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showContactSupport?: boolean;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 500,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
  showContactSupport = true,
}) => {
  const getIcon = () => {
    switch (statusCode) {
      case 404:
        return 'search_off';
      case 403:
        return 'lock';
      case 500:
        return 'error';
      case 503:
        return 'cloud_off';
      default:
        return 'warning';
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          <div className="space-y-6">
            <div>
              <span className="material-symbols-outlined text-7xl text-error mx-auto block mb-4">
                {getIcon()}
              </span>
              <p className="text-sm font-mono text-on-surface-variant mb-2">
                Error {statusCode}
              </p>
              <h1 className="text-h1 font-bold text-on-surface mb-2">{title}</h1>
              <p className="text-on-surface-variant">{description}</p>
            </div>

            <div className="flex flex-col gap-2">
              {onRetry && (
                <Button variant="primary" onClick={onRetry}>
                  Try Again
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </Button>
            </div>

            {showContactSupport && (
              <p className="text-xs text-on-surface-variant">
                If the problem persists,{' '}
                <a href="mailto:support@linkshrink.com" className="text-primary hover:underline">
                  contact support
                </a>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
