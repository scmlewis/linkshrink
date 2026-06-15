'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary mb-1">
                    {formatNumber(totalClicks)}
                  </div>
                  <div className="text-sm text-on-surface-variant">Total Clicks</div>
                </div>
                <span className="material-symbols-outlined text-primary text-3xl opacity-30">touch_app</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold text-secondary mb-1">
                    {formatNumber(clicksToday)}
                  </div>
                  <div className="text-sm text-on-surface-variant">Today</div>
                </div>
                <span className="material-symbols-outlined text-secondary text-3xl opacity-30">today</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-3xl font-bold text-tertiary mb-1 truncate" title={summary?.top_referrer || 'Direct'}>
                    {summary?.top_referrer || 'Direct'}
                  </div>
                  <div className="text-sm text-on-surface-variant">Top Referrer</div>
                </div>
                <span className="material-symbols-outlined text-tertiary text-3xl opacity-30 flex-shrink-0 ml-2">public</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-3xl font-bold text-primary-container mb-1">
                    {topCountry}
                  </div>
                  <div className="text-sm text-on-surface-variant">Top Country</div>
                </div>
                <span className="material-symbols-outlined text-primary-container text-3xl opacity-30">language</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {summary && totalClicks > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-2xl">public</span>
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Top Referrer</h3>
              </div>
              <p className="text-2xl font-bold text-on-surface truncate">{summary?.top_referrer || 'Direct'}</p>
              <p className="text-xs text-on-surface-variant mt-1">Most clicks from this source</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-secondary text-2xl">devices</span>
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Top Device</h3>
              </div>
              <p className="text-2xl font-bold text-on-surface truncate">{summary?.top_device || 'Unknown'}</p>
              <p className="text-xs text-on-surface-variant mt-1">Most common device type</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-tertiary text-2xl">language</span>
                <h3 className="text-sm font-semibold text-on-surface uppercase tracking-wider">Top Country</h3>
              </div>
              <p className="text-2xl font-bold text-on-surface truncate">{topCountry}</p>
              <p className="text-xs text-on-surface-variant mt-1">Most clicks from this region</p>
            </CardContent>
          </Card>
        </div>
      ) : (
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
