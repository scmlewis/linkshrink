'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { buildShortUrl, copyToClipboard, formatNumber, formatDate } from '@/lib/utils';
import { AnalyticsSummary, Link as LinkType } from '@/lib/types';

export default function DashboardHome() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentLinks, setRecentLinks] = useState<LinkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [longUrl, setLongUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdLink, setCreatedLink] = useState<LinkType | null>(null);
  const [createdQr, setCreatedQr] = useState('');
  const [copied, setCopied] = useState(false);

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
        body: JSON.stringify({ originalUrl: longUrl }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.error || 'Failed to create link');
        return;
      }

      const data = await res.json();
      setCreatedLink(data);
      setLongUrl('');

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
    } catch (error) {
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

  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'there';

  if (isLoading) {
    return <div className="text-center py-12 text-on-surface-variant">Loading...</div>;
  }

  return (
    <div className="space-y-10">
      <section className="glass-panel border border-outline rounded-2xl p-8 text-center relative overflow-hidden hover:border-outline-variant transition-all duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-secondary/10 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="inline-flex items-center justify-center gap-2 text-xs uppercase tracking-[0.3em] text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
            Welcome back, {displayName}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface leading-tight">
            Shorten. Share. <span className="text-primary">Track.</span>
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
            Create compact, reliable links in seconds and monitor their performance in real-time.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 py-2">
            <span className="px-4 py-2 text-xs uppercase tracking-widest rounded-full border border-outline-variant text-on-surface-variant hover:border-outline transition-colors">
              {formatNumber(summary?.total_clicks || 0)} total clicks
            </span>
            <span className="px-4 py-2 text-xs uppercase tracking-widest rounded-full border border-outline-variant text-on-surface-variant hover:border-outline transition-colors">
              {formatNumber(summary?.clicks_today || 0)} clicks today
            </span>
            <span className="px-4 py-2 text-xs uppercase tracking-widest rounded-full border border-outline-variant text-on-surface-variant hover:border-outline transition-colors">
              Top country: {summary?.top_country || 'N/A'}
            </span>
          </div>
        </div>
        <div className="relative z-10 mt-8 flex flex-col gap-4 md:flex-row">
          <div className="flex-1 text-left">
            <label className="text-label-caps uppercase text-on-surface-variant mb-2 block text-xs">Destination URL</label>
            <input
              className="w-full bg-black/80 border-2 border-outline-variant rounded-lg px-4 py-3 text-on-surface placeholder-on-surface-variant focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-outline transition-all duration-200"
              placeholder="Paste your long link here..."
              value={longUrl}
              onChange={(event) => setLongUrl(event.target.value)}
              type="url"
            />
          </div>
          <Button
            variant="primary"
            size="lg"
            className="uppercase tracking-widest text-xs md:self-end"
            onClick={handleShorten}
            isLoading={isCreating}
            disabled={!longUrl}
          >
            Shorten
            <span className="material-symbols-outlined">arrow_forward</span>
          </Button>
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
                <img
                  src={createdQr}
                  alt="QR code"
                  className="h-28 w-28 rounded-lg border border-outline-variant"
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2">
          <h2 className="text-h2 font-semibold text-on-surface">Recent Links</h2>
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
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-col min-w-0">
                        <span className="text-on-surface font-semibold truncate">
                          {link.title || 'Untitled link'}
                        </span>
                        <Link
                          href={buildShortUrl(link.short_code, typeof window !== 'undefined' ? window.location.origin : '')}
                          className="text-surface-tint text-sm truncate"
                          target="_blank"
                        >
                          {link.short_code}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(link.short_code)}>
                          <span className="material-symbols-outlined">content_copy</span>
                        </Button>
                        <Link href={`/dashboard/links/${link.id}`} className="text-on-surface-variant hover:text-primary">
                          <span className="material-symbols-outlined">bar_chart</span>
                        </Link>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant mt-2">
                      <span className="material-symbols-outlined text-sm">link</span>
                      <span className="truncate">{link.original_url}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:border-l md:border-outline-variant md:pl-6">
                    <div className="text-secondary bg-surface-container px-3 py-2 rounded-full border border-outline-variant text-xs uppercase tracking-widest">
                      {formatNumber(link.click_count)} clicks
                    </div>
                    <span className="text-xs text-on-surface-variant">{formatDate(link.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-on-surface-variant">
              No links created yet.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
