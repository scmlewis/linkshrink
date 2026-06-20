import { supabaseAdmin } from './supabase';
import { AnalyticsRecord, AnalyticsSummary, LinkAnalytics, ApiResponse } from './types';
import { parseUserAgent } from './utils';

/**
 * Record a click on a shortened link
 */
export async function recordClick(
  linkId: string,
  request: {
    ip_address?: string;
    user_agent?: string;
    referrer?: string;
  }
): Promise<ApiResponse<AnalyticsRecord>> {
  try {
    const { device_type, os, browser } = parseUserAgent(request.user_agent || '');

    let country = 'Unknown';
    let city = 'Unknown';

    if (request.ip_address) {
      try {
        const geoResponse = await fetch(`https://ipapi.co/${request.ip_address}/json/`);
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          country = geoData.country_name || 'Unknown';
          city = geoData.city || 'Unknown';
        }
      } catch {
        // Geo lookup is optional — keep defaults
      }
    }

    const { data: record, error } = await supabaseAdmin
      .from('analytics')
      .insert([
        {
          link_id: linkId,
          ip_address: request.ip_address,
          user_agent: request.user_agent,
          referrer: request.referrer,
          device_type,
          os,
          browser,
          country,
          city,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error recording click:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: record,
    };
  } catch (error) {
    console.error('Error recording click:', error);
    return {
      success: false,
      error: 'Failed to record click',
    };
  }
}

/**
 * Get analytics for a specific link
 */
export async function getLinkAnalytics(linkId: string): Promise<ApiResponse<LinkAnalytics>> {
  try {
    // Only select columns we aggregate on
    const { data: records, error } = await supabaseAdmin
      .from('analytics')
      .select('clicked_at, referrer, device_type, country, browser, os')
      .eq('link_id', linkId)
      .order('clicked_at', { ascending: true });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!records || records.length === 0) {
      return {
        success: true,
        data: {
          link_id: linkId,
          total_clicks: 0,
          clicks_by_day: [],
          referrers: [],
          devices: [],
          countries: [],
          browsers: [],
          operating_systems: [],
        },
      };
    }

    // Aggregate data
    const clicksByDay: Record<string, number> = {};
    const referrers: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const countries: Record<string, number> = {};
    const browsers: Record<string, number> = {};
    const operatingSystems: Record<string, number> = {};

    records.forEach((record) => {
      // Clicks by day
      const date = new Date(record.clicked_at).toISOString().split('T')[0];
      clicksByDay[date] = (clicksByDay[date] || 0) + 1;

      // Referrers
      const referrer = record.referrer || 'Direct';
      referrers[referrer] = (referrers[referrer] || 0) + 1;

      // Devices
      const device = record.device_type || 'Unknown';
      devices[device] = (devices[device] || 0) + 1;

      // Countries
      const country = record.country || 'Unknown';
      countries[country] = (countries[country] || 0) + 1;

      // Browsers
      const browser = record.browser || 'Unknown';
      browsers[browser] = (browsers[browser] || 0) + 1;

      // Operating systems
      const os = record.os || 'Unknown';
      operatingSystems[os] = (operatingSystems[os] || 0) + 1;
    });

    // Convert to array format (inline below where used)

    return {
      success: true,
      data: {
        link_id: linkId,
        total_clicks: records.length,
        clicks_by_day: Object.entries(clicksByDay).map(([date, clicks]) => ({
          date,
          clicks,
        })),
        referrers: Object.entries(referrers)
          .map(([referrer, clicks]) => ({
            referrer,
            clicks,
          }))
          .sort((a, b) => b.clicks - a.clicks),
        devices: Object.entries(devices)
          .map(([device_type, clicks]) => ({
            device_type,
            clicks,
          }))
          .sort((a, b) => b.clicks - a.clicks),
        countries: Object.entries(countries)
          .map(([country, clicks]) => ({
            country,
            clicks,
          }))
          .sort((a, b) => b.clicks - a.clicks),
        browsers: Object.entries(browsers)
          .map(([browser, clicks]) => ({
            browser,
            clicks,
          }))
          .sort((a, b) => b.clicks - a.clicks),
        operating_systems: Object.entries(operatingSystems)
          .map(([os, clicks]) => ({
            os,
            clicks,
          }))
          .sort((a, b) => b.clicks - a.clicks),
      },
    };
  } catch (error) {
    console.error('Error getting link analytics:', error);
    return {
      success: false,
      error: 'Failed to get analytics',
    };
  }
}

function getStartDate(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case '7days':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30days':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90days':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

/**
 * Get overall analytics summary for a user
 */
export async function getUserAnalyticsSummary(
  userId: string,
  range: string = 'all'
): Promise<ApiResponse<AnalyticsSummary>> {
  try {
    const { data: links, error: linksError } = await supabaseAdmin
      .from('links')
      .select('id')
      .eq('user_id', userId);

    if (linksError || !links) {
      return {
        success: false,
        error: 'Failed to get user links',
      };
    }

    const linkIds = links.map((l) => l.id);

    if (linkIds.length === 0) {
      return {
        success: true,
        data: {
          total_clicks: 0,
          clicks_today: 0,
        },
      };
    }

    const startDate = getStartDate(range);

    // Only select columns we actually aggregate on
    let query = supabaseAdmin
      .from('analytics')
      .select('referrer, country, device_type, clicked_at')
      .in('link_id', linkIds);

    if (startDate) {
      query = query.gte('clicked_at', startDate.toISOString());
    }

    const { data: analytics, error: analyticsError } = await query;

    if (analyticsError) {
      return {
        success: false,
        error: 'Failed to get analytics',
      };
    }

    const total_clicks = analytics?.length || 0;

    // Clicks today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clicks_today = analytics?.filter((a) => new Date(a.clicked_at) >= today).length || 0;

    // Aggregate top values in a single pass
    const referrerCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};

    analytics?.forEach((a) => {
      const ref = a.referrer || 'Direct';
      referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;

      const country = a.country || 'Unknown';
      countryCounts[country] = (countryCounts[country] || 0) + 1;

      const device = a.device_type || 'Unknown';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    const top_referrer = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Direct';
    const top_country = Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    const top_device = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';

    return {
      success: true,
      data: {
        total_clicks,
        clicks_today,
        top_referrer,
        top_country,
        top_device,
      },
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return {
      success: false,
      error: 'Failed to get analytics summary',
    };
  }
}

/**
 * Delete analytics for a link (for cleanup)
 */
export async function deleteAnalyticsForLink(linkId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabaseAdmin.from('analytics').delete().eq('link_id', linkId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error('Error deleting analytics:', error);
    return {
      success: false,
      error: 'Failed to delete analytics',
    };
  }
}
