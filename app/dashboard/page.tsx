'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { buildShortUrl, copyToClipboard, formatNumber, formatDate } from '@/lib/utils';
import { AnalyticsSummary, Link as LinkType } from '@/lib/types';

const summaryLabels = [
  { key: 'total_clicks', label: 'Total clicks', icon: 'ads_click' },
  { key: 'clicks_today', label: 'Clicks today', icon: 'today' },
  { key: 'top_country', label: 'Top country', icon: 'public' },
] as const;

export default function DashboardHome() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentLinks, setRecentLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [longUrl, setLongUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdLink, setCreatedLink] = useState<LinkType | null>(null);
  const [createdQr, setCreatedQr] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [editNickname, setEditNickname] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch analytics summary
        const summaryRes = await fetch('/api/analytics');
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary(summaryData);
        }

        // Fetch recent links
        const linksRes = await fetch('/api/links?page=1&limit=5');
        if (linksRes.ok) {
          const linksData = await linksRes.json();
          setRecentLinks(linksData.links);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShorten = async () => {
    setIsCreating(true);
    setCreateError('');
    setCreatedLink(null);
    setCreatedQr('');

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originalUrl: longUrl, nickname: nickname || undefined }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.error || 'Failed to create link');
        return;
      }

      const data = await res.json();
      setCreatedLink(data);
      setLongUrl('');
      setNickname('');

      const qrRes = await fetch(`/api/qr/${data.id}`);
      if (qrRes.ok) {
        const qrData = await qrRes.json();
        setCreatedQr(qrData.qrCode || '');
      }

      const linksRes = await fetch('/api/links?page=1&limit=5');
      if (linksRes.ok) {
        const linksData = await linksRes.json();
        setRecentLinks(linksData.links);
      }
    } catch {
      setCreateError('Failed to create link');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async (shortCode: string) => {
    const shortUrl = buildShortUrl(shortCode, typeof window !== 'undefined' ? window.location.origin : '');
    if (await copyToClipboard(shortUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleOpenShortUrl = (shortCode: string) => {
    if (typeof window === 'undefined') return;
    const shortUrl = buildShortUrl(shortCode, window.location.origin);
    window.open(shortUrl, '_blank', 'noopener,noreferrer');
  };

  const handleEditLink = (link: LinkType) => {
    setEditingLink(link);
    setEditNickname(link.nickname || '');
  };

  const handleUpdateLink = async () => {
    if (!editingLink) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/links/${editingLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: editNickname || null }),
      });

      if (!res.ok) {
        console.error('Failed to update link');
        return;
      }

      const updatedLink = await res.json();
      setRecentLinks(
        recentLinks.map((link) => (link.id === updatedLink.id ? updatedLink : link))
      );
      setEditingLink(null);
      setEditNickname('');
    } catch (error) {
      console.error('Failed to update link:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'there';

  if (isLoading) {
    return <div className="text-center py-12 text-on-surface-variant">Loading your dashboard...</div>;
  }

  return (
    <div className="space-y-10">
      <section className="glass-panel border border-outline-variant rounded-3xl p-8 md:p-10 text-center relative overflow-hidden hover:border-outline transition-all duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/18 via-transparent to-secondary/12 pointer-events-none" />
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-5">
          <div className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            Welcome back, {displayName}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface leading-tight tracking-tight">
            Shorten. Share. <span className="text-primary">Track.</span>
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            Create compact, reliable links in seconds and monitor their performance in real-time.
          </p>
          <div className="grid gap-3 sm:grid-cols-3 py-2">
            {summaryLabels.map((item) => (
              <div key={item.label} className="rounded-2xl border border-outline-variant bg-black/20 px-4 py-4 text-left shadow-lg shadow-black/10">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="text-xs uppercase tracking-[0.25em] text-on-surface-variant">{item.label}</span>
                  <span className="material-symbols-outlined text-secondary text-sm">{item.icon}</span>
                </div>
                <div className="text-lg font-semibold text-on-surface tracking-tight">
                  {item.key === 'top_country'
                    ? summary?.top_country || 'N/A'
                    : formatNumber(summary?.[item.key] || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 mt-8 rounded-3xl border border-outline-variant bg-black/20 p-4 md:p-5 text-left">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-on-surface-variant">Create link</p>
              <h2 className="text-h2 font-semibold text-on-surface tracking-tight">One small form, clearer output</h2>
            </div>
            <span className="hidden md:inline-flex rounded-full border border-outline-variant px-3 py-1 text-xs uppercase tracking-[0.25em] text-secondary">
              Instant creation
            </span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 flex flex-col gap-4">
              <div>
                <label className="text-label-caps uppercase text-on-surface-variant mb-2 block text-xs">Destination URL</label>
                <input
                  className="w-full bg-black/80 border-2 border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline transition-all duration-200"
                  placeholder="Paste your long link here..."
                  value={longUrl}
                  onChange={(event) => setLongUrl(event.target.value)}
                  type="url"
                />
              </div>
              <div>
                <label className="text-label-caps uppercase text-on-surface-variant mb-2 block text-xs">Nickname (optional)</label>
                <input
                  className="w-full bg-black/80 border-2 border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline transition-all duration-200"
                  placeholder="Give your link a memorable name..."
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  type="text"
                />
              </div>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="uppercase tracking-widest text-xs md:min-w-48 shadow-2xl shadow-primary/30"
              onClick={handleShorten}
              isLoading={isCreating}
              disabled={!longUrl}
            >
              Shorten
              <span className="material-symbols-outlined">arrow_forward</span>
            </Button>
          </div>
        </div>
        {createError && <p className="text-error text-sm mt-3">{createError}</p>}
      </section>

      {createdLink && (
        <Card className="border-primary/40 shadow-xl shadow-primary/10">
          <CardContent className="space-y-4">
            <p className="text-label-caps uppercase text-primary">Your short link is ready</p>
            <div className="flex items-center justify-between gap-3 bg-black/50 border border-outline-variant rounded-lg px-4 py-3">
              <span className="font-mono text-on-surface truncate">
                {buildShortUrl(createdLink.short_code, typeof window !== 'undefined' ? window.location.origin : '')}
              </span>
              <Button variant="outline" size="sm" onClick={() => handleCopy(createdLink.short_code)}>
                <span className="material-symbols-outlined">content_copy</span>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            {createdQr && (
              <div className="flex justify-center">
                <Image
                  src={createdQr}
                  alt="QR code"
                  width={112}
                  height={112}
                  className="rounded-lg border border-outline-variant"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-on-surface-variant mb-1">Workspace</p>
            <h2 className="text-h2 font-semibold text-on-surface tracking-tight">Recent Links</h2>
          </div>
          <Link
            href="/dashboard/links"
            className="text-primary text-xs uppercase tracking-widest flex items-center gap-1"
          >
            View All <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>
        {recentLinks.length > 0 ? (
          <div className="space-y-3">
            {recentLinks.map((link) => (
              <Card key={link.id} className="hover:border-outline transition-colors">
                <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-3 md:block">
                      <div className="min-w-0">
                        <span className="block text-on-surface font-semibold truncate text-lg md:text-base">
                          {link.nickname || link.title || 'Untitled link'}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-1">
                          <span className="material-symbols-outlined text-sm">link</span>
                          <span className="truncate text-xs sm:text-sm overflow-hidden whitespace-nowrap text-ellipsis">
                            {link.original_url}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right md:hidden">
                        <div className="text-secondary bg-surface-container px-3 py-2 rounded-full border border-outline-variant text-xs uppercase tracking-widest">
                          {formatNumber(link.click_count)} clicks
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                      <span className="hidden md:inline">Created {formatDate(link.created_at)}</span>
                      <span className="md:hidden">{formatDate(link.created_at)}</span>
                      <span className="hidden md:inline">•</span>
                      <button
                        type="button"
                        onClick={() => handleOpenShortUrl(link.short_code)}
                        className="text-surface-tint truncate max-w-full text-left"
                        title="Open short link"
                      >
                        {link.short_code}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end md:border-l md:border-outline-variant md:pl-6">
                    <div className="hidden md:block text-secondary bg-surface-container px-3 py-2 rounded-full border border-outline-variant text-xs uppercase tracking-widest">
                      {formatNumber(link.click_count)} clicks
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleCopy(link.short_code)}>
                      <span className="material-symbols-outlined">content_copy</span>
                      <span className="hidden sm:inline">Copy</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditLink(link)} title="Edit link">
                      <span className="material-symbols-outlined">edit</span>
                    </Button>
                    <Link href={`/dashboard/links/${link.id}`} className="text-on-surface-variant hover:text-primary">
                      <span className="material-symbols-outlined">bar_chart</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-on-surface-variant space-y-3">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
                <span className="material-symbols-outlined">link_off</span>
              </div>
              <p className="text-lg text-on-surface">No links created yet.</p>
              <p className="max-w-sm mx-auto leading-relaxed">Your first shortened link will appear here with copy, edit, and analytics actions.</p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Edit Link Modal */}
      <Modal
        isOpen={!!editingLink}
        onClose={() => {
          setEditingLink(null);
          setEditNickname('');
        }}
        title="Edit Link"
        description="Update your link's nickname"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">Nickname</label>
            <input
              type="text"
              placeholder="Give your link a memorable name..."
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
                className="w-full px-4 py-2.5 bg-black/80 border border-outline-variant rounded-xl text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setEditingLink(null);
                setEditNickname('');
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateLink}
              isLoading={isUpdating}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
