'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen page-gradient">
      {/* Navigation */}
      <nav className="border-b border-outline-variant bg-black/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">link</span>
              <h1 className="text-xl font-bold text-primary">LinkShrink</h1>
            </div>
            <Link href="/auth/signin">
              <Button variant="outline" className="uppercase tracking-widest text-xs">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-outline-variant bg-surface-container-low mb-6">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs uppercase tracking-[0.3em] text-on-surface-variant">Modern URL Shortening</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
              Shorten Your Links
            </span>
            <br />
            <span className="text-on-surface">Amplify Your Reach</span>
          </h2>
          <p className="text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto leading-relaxed">
            Create short, memorable URLs and track every click with detailed analytics. Perfect for marketing campaigns, social media, and more.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/signup">
              <Button variant="primary" size="lg" className="uppercase tracking-widest text-xs">
                Get Started Free
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="uppercase tracking-widest text-xs"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
              <span className="material-symbols-outlined text-base">expand_more</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-4">Powerful Features</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">Everything you need to create, track, and optimize your links</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'bolt',
                title: 'Lightning Fast',
                description: 'Create short links instantly with our optimized algorithm',
              },
              {
                icon: 'analytics',
                title: 'Detailed Analytics',
                description: 'Track clicks, devices, referrers, and geographic data in real-time',
              },
              {
                icon: 'target',
                title: 'Custom Aliases',
                description: 'Create memorable short links with custom names for your brand',
              },
              {
                icon: 'sell',
                title: 'Tag & Organize',
                description: 'Organize your links with custom tags for easy management',
              },
              {
                icon: 'qr_code_2',
                title: 'QR Codes',
                description: 'Generate QR codes for every shortened link automatically',
              },
              {
                icon: 'verified_user',
                title: 'Secure & Private',
                description: 'Enterprise-grade security with ROW Level Security on all data',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group glass-panel p-8 rounded-xl border border-outline-variant hover:border-outline hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
              >
                <span className="material-symbols-outlined text-4xl text-secondary mb-6 inline-block group-hover:scale-110 group-hover:text-primary transition-all duration-300">
                  {feature.icon}
                </span>
                <h3 className="text-xl font-bold text-on-surface mb-2">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center glass-panel rounded-2xl p-12 md:p-16 border border-outline-variant hover:border-outline hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
          <h2 className="text-3xl md:text-5xl font-bold text-on-surface mb-6 leading-tight">
            Ready to shorten your links?
          </h2>
          <p className="text-lg text-on-surface-variant mb-10 leading-relaxed">
            Join thousands of users already using LinkShrink to track and optimize their links.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="uppercase tracking-widest text-xs">
              Start Free Today
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-sm text-on-surface-variant">
          <p>&copy; 2026 LinkShrink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}