'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Spinner, LoadingState } from '@/components/ui/Spinner';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AnalyticsSummary, LinkAnalytics } from '@/lib/types';
import { formatNumber, formatDate } from '@/lib/utils';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<LinkAnalytics[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    let isActive = true;

    try {
      setIsLoading(true);
      const params = new URLSearchParams({ range: dateRange });

      const summaryRes = await fetch(`/api/analytics?${params}`);
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        if (isActive) {
          setSummary(summaryData);
        }
      }

      if (isActive) {
        setAnalytics([]);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      if (isActive) {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const firstAnalytic = analytics[0];
  const totalClicks = summary?.total_clicks || 0;
  const clicksToday = summary?.clicks_today || 0;
  const topReferrer = summary?.top_referrer || 'Direct';
  const topDevice = summary?.top_device || 'N/A';
  const topCountry = summary?.top_country || 'N/A';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
          className="w-auto min-w-40 py-2 text-sm"
        />
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
                <div>
                  <div className="text-3xl font-bold text-tertiary mb-1">
                    {topReferrer}
                  </div>
                  <div className="text-sm text-on-surface-variant">Top Referrer</div>
                </div>
                <span className="material-symbols-outlined text-tertiary text-3xl opacity-30">public</span>
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
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant text-center py-8">
                Detailed analytics will be available as you gather more click data
              </p>
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
