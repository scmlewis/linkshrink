'use client';

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Link as LinkType, LinkAnalytics } from '@/lib/types';
import { buildShortUrl, copyToClipboard, formatDate, formatNumber } from '@/lib/utils';

interface LinkDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function LinkDetailPage({ params }: LinkDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [link, setLink] = useState<LinkType | null>(null);
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const shortUrl = useMemo(() => {
    if (!link) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return buildShortUrl(link.short_code, baseUrl);
  }, [link]);

  useEffect(() => {
    let isActive = true;

    const fetchLink = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [linkRes, analyticsRes] = await Promise.all([
          fetch(`/api/links/${id}`),
          fetch(`/api/analytics/${id}`),
        ]);

        if (!linkRes.ok) {
          const data = await linkRes.json().catch(() => ({}));
          if (isActive) {
            setError(data.error || 'Failed to load link');
          }
          return;
        }

        const linkData = await linkRes.json();
        if (isActive) {
          setLink(linkData);
        }

        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          if (isActive) {
            if (Array.isArray(analyticsData)) {
              setAnalytics(analyticsData[0] || null);
            } else {
              setAnalytics(analyticsData);
            }
          }
        }
      } catch (fetchError) {
        if (isActive) {
          setError('Failed to load link');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    fetchLink();

    return () => {
      isActive = false;
    };
  }, [id]);

  const handleCopy = async () => {
    if (!shortUrl) return;
    if (await copyToClipboard(shortUrl)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-error">{error}</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/links')}>
          Back to links
        </Button>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="space-y-4">
        <p className="text-on-surface-variant">Link not found.</p>
        <Button variant="outline" onClick={() => router.push('/dashboard/links')}>
          Back to links
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-on-surface">Link Details</h1>
          <p className="text-body-md text-on-surface-variant">Review performance and share your link.</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/links')}>
          Back to links
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{link.title || 'Untitled link'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-on-surface-variant">Original URL</p>
            <Link href={link.original_url} className="text-secondary break-all" target="_blank">
              {link.original_url}
            </Link>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Short URL</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={shortUrl} className="text-primary break-all" target="_blank">
                {shortUrl}
              </Link>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-on-surface-variant">
            <div>
              <p className="font-semibold text-on-surface">{formatNumber(link.click_count)}</p>
              <p>Clicks</p>
            </div>
            <div>
              <p className="font-semibold text-on-surface">{formatDate(link.created_at)}</p>
              <p>Created</p>
            </div>
            {link.last_clicked_at && (
              <div>
                <p className="font-semibold text-on-surface">{formatDate(link.last_clicked_at)}</p>
                <p>Last click</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Highlights</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-on-surface-variant">Top Referrer</p>
            <p className="font-semibold text-on-surface">
              {analytics?.referrers?.[0]?.referrer || 'Direct'}
            </p>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Top Device</p>
            <p className="font-semibold text-on-surface">
              {analytics?.devices?.[0]?.device_type || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">Top Country</p>
            <p className="font-semibold text-on-surface">
              {analytics?.countries?.[0]?.country || 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
