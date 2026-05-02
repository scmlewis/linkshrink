'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { redirect: true, callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-h1 font-bold text-primary mb-2">LinkShrink</h1>
          <p className="text-body-md text-on-surface-variant">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container border border-outline rounded-xl p-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter any password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-error text-sm text-center">{error}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface-container text-on-surface-variant">Or continue with OAuth</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleOAuthSignIn('google')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-high border border-outline rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              disabled={!process.env.NEXT_PUBLIC_GOOGLE_ID}
            >
              <span>🔵</span>
              <span className="text-body-md text-on-surface">Continue with Google</span>
            </button>
            <button
              onClick={() => handleOAuthSignIn('github')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-high border border-outline rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              disabled={!process.env.NEXT_PUBLIC_GITHUB_ID}
            >
              <span>⚫</span>
              <span className="text-body-md text-on-surface">Continue with GitHub</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-on-surface-variant text-sm mt-6">
            Don't have an account?{' '}
            <a href="/auth/signup" className="text-primary hover:underline font-semibold">
              Sign up
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-on-surface-variant text-xs mt-6">
          For development: use any email and password combination
        </p>
      </div>
    </div>
  );
}
