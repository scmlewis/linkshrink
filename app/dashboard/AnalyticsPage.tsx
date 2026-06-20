'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { StatCard } from '@/components/ui/StatCard';
import { AnalyticsSummary } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import { cachedFetch } from '@/lib/fetchCache';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ range: dateRange });

      const summaryData = await cachedFetch<AnalyticsSummary>(`/api/analytics?${params}`);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const totalClicks = summary?.total_clicks || 0;
  const clicksToday = summary?.clicks_today || 0;
  const topCountry = summary?.top_country || 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-surface-container to-transparent pb-4 mb-6 -mx-6 px-6 lg:-mx-10 lg:px-10 py-4 lg:py-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h1 font-bold text-on-surface">Analytics</h1>
            <p className="text-body-md text-on-surface-variant">Track clicks and engagement across your links</p>
          </div>
          <Select
            options={[
              { value: '7days', label: 'Last 7 Days' },
              { value: '30days', label: 'Last 30 Days' },
              { value: '90days', label: 'Last 90 Days' },
              { value: 'all', label: 'All Time' },
            ]}
            value={dateRange}
            onChange={(e) => setDateRange(e.currentTarget.value)}
            className="w-full sm:w-auto min-w-40 py-2 text-sm"
          />
        </div>
      </div>

      {/* Overview Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Total Clicks" value={formatNumber(totalClicks)} icon="touch_app" color="primary" />
          <StatCard label="Today" value={formatNumber(clicksToday)} icon="today" color="secondary" />
          <StatCard label="Top Referrer" value={summary?.top_referrer || 'Direct'} icon="public" color="tertiary" />
          <StatCard label="Top Country" value={topCountry} icon="language" color="primary-container" />
        </div>
      )}

      {/* Empty state */}
      {summary && totalClicks === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant mx-auto block">
                analytics
              </span>
              <div>
                <p className="text-h2 mb-2">No Analytics Data Yet</p>
                <p className="text-on-surface-variant">
                  Start creating and sharing shortened links to see analytics data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
