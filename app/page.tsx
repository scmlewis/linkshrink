'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

const featureCards = [
  {
    icon: 'bolt',
    title: 'Fast capture',
    description: 'Turn long URLs into clean links without slowing down the flow of work.',
  },
  {
    icon: 'analytics',
    title: 'Clear insight',
    description: 'See clicks, sources, and performance at a glance with less visual noise.',
  },
  {
    icon: 'target',
    title: 'Brand-ready links',
    description: 'Use nicknames, tags, and QR codes to make every link feel intentional.',
  },
];

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  return (
    <div className="min-h-screen page-gradient">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-outline-variant/60 glass-panel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-lg shadow-primary/10">
                <span className="material-symbols-outlined">link</span>
              </span>
              <div>
                <h1 className="text-lg font-bold text-primary tracking-tight">LinkShrink</h1>
                <p className="text-xs uppercase tracking-[0.25em] text-on-surface-variant">Link intelligence</p>
              </div>
            </div>
            <Link href="/auth/signin">
              <Button variant="outline" className="uppercase tracking-widest text-xs">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="py-24 md:py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center relative z-10">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-outline-variant bg-surface-container-low mb-6">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs uppercase tracking-[0.3em] text-on-surface-variant">Modern URL shortening</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
                Shorten your links.
              </span>
              <br />
              <span className="text-on-surface">Make the result feel premium.</span>
            </h2>
            <p className="text-xl text-on-surface-variant mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Create compact links, track performance, and present every destination with a cleaner, more polished brand layer.
            </p>
            <div className="flex gap-4 justify-center lg:justify-start flex-wrap">
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
                Explore features
                <span className="material-symbols-outlined text-base">expand_more</span>
              </Button>
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-outline-variant/70 p-6 md:p-8 shadow-2xl shadow-primary/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-on-surface-variant">Live signal</p>
                <p className="text-xl font-semibold text-on-surface tracking-tight">A cleaner dashboard story</p>
              </div>
              <span className="rounded-full border border-outline-variant px-3 py-1 text-xs uppercase tracking-[0.25em] text-secondary">
                Preview
              </span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Clicks today', value: '12.4k', accent: 'secondary' },
                { label: 'Active links', value: '182', accent: 'primary' },
                { label: 'QR scans', value: '1.8k', accent: 'tertiary' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-outline-variant bg-black/20 px-5 py-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-on-surface-variant mb-2">{stat.label}</p>
                    <p className={`text-3xl font-bold tracking-tight ${stat.accent === 'primary' ? 'text-primary' : stat.accent === 'secondary' ? 'text-secondary' : 'text-tertiary'}`}>
                      {stat.value}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">trending_up</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight">Powerful features</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">Everything you need to create, track, and optimize your links without a generic look.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feature, idx) => (
              <div
                key={feature.title}
                className="group glass-panel p-8 rounded-2xl border border-outline-variant hover:border-outline hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="mb-6 flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                  </span>
                  <span className="text-xs uppercase tracking-[0.25em] text-on-surface-variant">0{idx + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center glass-panel rounded-3xl p-12 md:p-16 border border-outline-variant hover:border-outline hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
          <h2 className="text-3xl md:text-5xl font-bold text-on-surface mb-6 leading-tight tracking-tight">
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

      <footer className="border-t border-outline-variant">
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-sm text-on-surface-variant">
          <p>&copy; 2026 LinkShrink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}