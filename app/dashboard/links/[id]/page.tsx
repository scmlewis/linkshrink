'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { Link as LinkType, LinkAnalytics } from '@/lib/types';
import { formatDate, formatNumber, buildShortUrl, copyToClipboard } from '@/lib/utils';
import { cachedFetch } from '@/lib/fetchCache';

export default function LinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.id as string;

  const [link, setLink] = useState<LinkType | null>(null);
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [linkData, analyticsData] = await Promise.all([
          cachedFetch<LinkType>(`/api/links/${linkId}`),
          cachedFetch<LinkAnalytics>(`/api/analytics/${linkId}`),
        ]);

        setLink(linkData);
        setAnalytics(analyticsData);
      } catch {
        setError('Failed to load link details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [linkId]);

  const handleCopy = async () => {
    if (!link) return;
    const shortUrl = buildShortUrl(link.short_code, typeof window !== 'undefined' ? window.location.origin : '');
    if (await copyToClipboard(shortUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mx-auto block mb-4">error</span>
            <p className="text-h2 mb-2">{error || 'Link not found'}</p>
            <Button variant="primary" onClick={() => router.push('/dashboard?tab=links')}>
              Go to My Links
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shortUrl = buildShortUrl(link.short_code, typeof window !== 'undefined' ? window.location.origin : '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <span className="material-symbols-outlined">arrow_back</span>
          </Button>
          <div>
            <h1 className="text-h1 font-bold text-on-surface">
              {link.nickname || link.title || link.short_code}
            </h1>
            <p className="text-sm text-on-surface-variant">Link Analytics</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleCopy}>
          <span className="material-symbols-outlined">content_copy</span>
          {copied ? 'Copied' : 'Copy Short URL'}
        </Button>
      </div>

      {/* Link Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-1">Short URL</p>
              <p className="font-mono text-on-surface text-lg">{shortUrl}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-1">Destination</p>
              <p className="text-on-surface truncate" title={link.original_url}>{link.original_url}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-1">Created</p>
              <p className="text-on-surface">{formatDate(link.created_at)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-1">Status</p>
              <Badge variant={link.is_active ? 'secondary' : 'warning'}>
                {link.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          {link.description && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-1">Description</p>
              <p className="text-on-surface">{link.description}</p>
            </div>
          )}
          {link.tags && link.tags.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2">Tags</p>
              <div className="flex gap-2 flex-wrap">
                {link.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" size="sm">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Clicks"
          value={formatNumber(analytics?.total_clicks || link.click_count)}
          color="primary"
        />
        <StatCard
          label="Top Referrer"
          value={analytics?.referrers?.[0]?.referrer || 'Direct'}
          color="secondary"
        />
        <StatCard
          label="Top Device"
          value={analytics?.devices?.[0]?.device_type || 'Unknown'}
          color="tertiary"
        />
        <StatCard
          label="Top Country"
          value={analytics?.countries?.[0]?.country || 'Unknown'}
          color="primary-container"
        />
      </div>

      {/* Analytics Breakdowns */}
      {analytics && analytics.total_clicks > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Clicks by Day */}
          {analytics.clicks_by_day.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">Clicks by Day</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.clicks_by_day.slice(-14).reverse().map((day) => (
                    <div key={day.date} className="flex items-center justify-between text-sm">
                      <span className="text-on-surface-variant">{day.date}</span>
                      <span className="font-semibold text-on-surface">{formatNumber(day.clicks)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Referrers */}
          {analytics.referrers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">Referrers</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.referrers.slice(0, 10).map((item) => (
                    <div key={item.referrer} className="flex items-center justify-between text-sm">
                      <span className="text-on-surface-variant truncate mr-2">{item.referrer}</span>
                      <span className="font-semibold text-on-surface shrink-0">{formatNumber(item.clicks)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Devices */}
          {analytics.devices.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">Devices</h3>
                <div className="space-y-2">
                  {analytics.devices.map((item) => {
                    const pct = Math.round((item.clicks / analytics.total_clicks) * 100);
                    return (
                      <div key={item.device_type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-on-surface-variant capitalize">{item.device_type}</span>
                          <span className="font-semibold text-on-surface">{formatNumber(item.clicks)} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Countries */}
          {analytics.countries.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">Countries</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {analytics.countries.slice(0, 10).map((item) => (
                    <div key={item.country} className="flex items-center justify-between text-sm">
                      <span className="text-on-surface-variant">{item.country}</span>
                      <span className="font-semibold text-on-surface">{formatNumber(item.clicks)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Browsers */}
          {analytics.browsers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">Browsers</h3>
                <div className="space-y-2">
                  {analytics.browsers.map((item) => {
                    const pct = Math.round((item.clicks / analytics.total_clicks) * 100);
                    return (
                      <div key={item.browser} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-on-surface-variant">{item.browser}</span>
                          <span className="font-semibold text-on-surface">{formatNumber(item.clicks)} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-secondary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operating Systems */}
          {analytics.operating_systems.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4">Operating Systems</h3>
                <div className="space-y-2">
                  {analytics.operating_systems.map((item) => {
                    const pct = Math.round((item.clicks / analytics.total_clicks) * 100);
                    return (
                      <div key={item.os} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-on-surface-variant">{item.os}</span>
                          <span className="font-semibold text-on-surface">{formatNumber(item.clicks)} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                          <div className="h-full bg-tertiary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
