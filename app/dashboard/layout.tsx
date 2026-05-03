'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeNavItem = useMemo(() => {
    return [...NAV_ITEMS]
      .sort((firstItem, secondItem) => secondItem.href.length - firstItem.href.length)
      .find((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`));
  }, [pathname]);

  const activeLabel = useMemo(() => {
    return activeNavItem?.label || 'Dashboard';
  }, [activeNavItem]);

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
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-xl font-black tracking-tight">LinkShrink</span>
          <button
            className="text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => router.push('/dashboard/settings')}
            aria-label="Account settings"
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="absolute left-4 right-4 top-20 rounded-2xl border border-outline-variant bg-surface-container-high p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-on-surface-variant">Menu</p>
                <p className="text-lg font-semibold text-on-surface">{session.user?.name || session.user?.email}</p>
              </div>
              <button
                className="text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => {
                const isActive = activeNavItem?.href === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : 'text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                className="mt-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
                onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
              >
                <span className="material-symbols-outlined">logout</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full py-8 bg-[#121212] border-r border-outline-variant transition-all duration-300 z-30 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="px-6 mb-10 flex flex-col gap-1">
          <span className="text-lg font-black text-primary">LinkShrink</span>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNavItem?.href === item.href;
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
    </div>
  );
}
