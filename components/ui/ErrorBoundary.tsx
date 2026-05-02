'use client';

import React, { ReactNode } from 'react';
import { Button } from './Button';
import { Card, CardContent } from './Card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          () => this.setState({ hasError: false, error: null })
        );
      }

      return (
        <Card className="border-error/20">
          <CardContent className="py-8 text-center">
            <div className="space-y-4">
              <span className="material-symbols-outlined text-6xl text-error mx-auto block">
                error
              </span>
              <div>
                <p className="text-h2 mb-2 text-on-surface">Something went wrong</p>
                <p className="text-on-surface-variant mb-4">
                  {process.env.NODE_ENV === 'development'
                    ? this.state.error.message
                    : 'An unexpected error occurred. Please try again.'}
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
