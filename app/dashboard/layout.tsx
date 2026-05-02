'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/dashboard/links', label: 'My Links', icon: 'link' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: 'analytics' },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: 'vpn_key' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeLabel = useMemo(() => {
    const match = NAV_ITEMS.find((item) => pathname?.startsWith(item.href));
    return match?.label || 'Dashboard';
  }, [pathname]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-pulse text-h2 text-primary">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col lg:flex-row relative overflow-x-hidden">
      <div className="bg-glow" />

      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-outline-variant">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            className="text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-xl font-black tracking-tight">LinkShrink</span>
          <button className="text-on-surface-variant hover:text-primary transition-colors" aria-label="Account">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full py-8 bg-[#121212] border-r border-outline-variant transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="px-6 mb-10 flex flex-col gap-1">
          <span className="text-lg font-black text-primary">LinkShrink</span>
          {sidebarOpen && <span className="text-xs text-on-surface-variant">V2.4.0</span>}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.2em] transition-all ${
                  isActive
                    ? 'bg-surface-container-high text-primary border-r-4 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                } ${sidebarOpen ? '' : 'justify-center'}`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>
        <div className="mt-auto flex flex-col gap-2 border-t border-outline-variant pt-6">
          <button
            className="text-on-surface-variant hover:text-on-surface flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.2em]"
            onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
          >
            <span className="material-symbols-outlined">logout</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
          <button
            className="text-on-surface-variant hover:text-on-surface flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.2em]"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="material-symbols-outlined">menu_open</span>
            {sidebarOpen && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 px-6 py-8 lg:px-10 lg:py-10 relative z-10">
        <header className="hidden lg:flex items-center justify-between mb-8">
          <h2 className="text-h2 font-semibold text-on-surface">{activeLabel}</h2>
        </header>
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden glass-panel fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant px-6 py-3 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs uppercase tracking-widest ${
                isActive ? 'text-primary' : 'text-on-surface-variant'
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="h-20 lg:hidden" />
    </div>
  );
}
