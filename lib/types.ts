// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  email_verified?: Date;
  created_at: Date;
  updated_at: Date;
}

// Link Types
export interface Link {
  id: string;
  user_id: string;
  short_code: string;
  original_url: string;
  custom_alias?: string;
  title?: string;
  nickname?: string;
  description?: string;
  created_at: Date;
  expires_at?: Date;
  is_active: boolean;
  click_count: number;
  last_clicked_at?: Date;
  updated_at: Date;
  tags?: string[];
}

// Analytics Types
export interface AnalyticsRecord {
  id: string;
  link_id: string;
  clicked_at: Date;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  country?: string;
  city?: string;
  device_type?: string; // mobile, desktop, tablet
  os?: string;
  browser?: string;
}

// Analytics Summary
export interface AnalyticsSummary {
  total_clicks: number;
  clicks_today: number;
  average_ctr: number;
  top_referrer?: string;
  top_country?: string;
  top_device?: string;
}

// Link Analytics
export interface LinkAnalytics {
  link_id: string;
  total_clicks: number;
  clicks_by_day: Array<{ date: string; clicks: number }>;
  referrers: Array<{ referrer: string; clicks: number }>;
  devices: Array<{ device_type: string; clicks: number }>;
  countries: Array<{ country: string; clicks: number }>;
  browsers: Array<{ browser: string; clicks: number }>;
  operating_systems: Array<{ os: string; clicks: number }>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tag Type
export interface Tag {
  id: string;
  link_id: string;
  tag: string;
  created_at: Date;
}
