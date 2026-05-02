'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: string } = {
    Callback: 'Callback error. Please try again.',
    OAuthSignin: 'Error connecting with OAuth provider.',
    OAuthCallback: 'OAuth callback error. Please try again.',
    OAuthCreateAccount: 'Could not create account with OAuth provider.',
    EmailCreateAccount: 'Could not create account with email.',
    EmailSignInError: 'Email sign in is not available.',
    CredentialsSignin: 'Sign in failed. Please check your credentials.',
    SessionCallback: 'Session callback error. Please try again.',
    default: 'An authentication error occurred. Please try again.',
  };

  const message = error ? errorMessages[error] || errorMessages.default : errorMessages.default;

  return (
    <div className="text-center mb-8">
      <h1 className="text-h1 font-bold text-error mb-2">Authentication Error</h1>
      <p className="text-body-md text-on-surface-variant">{message}</p>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center mb-8"><p className="text-on-surface-variant">Loading...</p></div>}>
          <AuthErrorContent />
        </Suspense>

        <div className="bg-surface-container border border-outline rounded-xl p-8 text-center space-y-4">
          <Link href="/auth/signin">
            <Button variant="primary" size="lg" className="w-full">
              Back to Sign In
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
