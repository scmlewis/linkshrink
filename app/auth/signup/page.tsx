'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForm } from '@/lib/useForm';

export default function SignUp() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async (values) => {
      try {
        // Validate matching passwords
        if (values.password !== values.confirmPassword) {
          form.setFieldError('confirmPassword', 'Passwords do not match');
          return;
        }

        // Sign in with credentials (auto-creates user)
        const result = await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (!result?.ok) {
          form.setFieldError('email', 'Failed to create account');
        } else {
          router.push('/dashboard');
        }
      } catch {
        form.setFieldError('email', 'An error occurred. Please try again.');
      }
    },
  });

  const handleOAuthSignIn = (provider: 'google' | 'github') => {
    signIn(provider, { redirect: true, callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-h1 font-bold text-primary mb-2">LinkShrink</h1>
          <p className="text-body-md text-on-surface-variant">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-surface-container border border-outline rounded-xl p-8">
          {/* Form */}
          <form onSubmit={form.handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              name="email"
              value={form.values.email}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={form.touched.email ? form.errors.email : undefined}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              name="password"
              value={form.values.password}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={form.touched.password ? form.errors.password : undefined}
              helperText="Must include uppercase letters and numbers"
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              name="confirmPassword"
              value={form.values.confirmPassword}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={form.touched.confirmPassword ? form.errors.confirmPassword : undefined}
              required
            />

            {form.errors.email && !form.touched.email && (
              <p className="text-error text-sm text-center">{form.errors.email}</p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={form.isSubmitting}
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-surface-container text-on-surface-variant">Or sign up with OAuth</span>
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
              <span className="text-body-md text-on-surface">Sign up with Google</span>
            </button>
            <button
              onClick={() => handleOAuthSignIn('github')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-high border border-outline rounded-lg hover:bg-surface-container-highest transition-colors disabled:opacity-50"
              disabled={!process.env.NEXT_PUBLIC_GITHUB_ID}
            >
              <span>⚫</span>
              <span className="text-body-md text-on-surface">Sign up with GitHub</span>
            </button>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-on-surface-variant text-sm mt-6">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-on-surface-variant text-xs mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
