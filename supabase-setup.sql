-- LinkShrink Database Schema Setup
-- Run this in your Supabase SQL Editor (Project → SQL Editor → New Query)

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  image TEXT,
  email_verified TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Create Links Table
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  custom_alias VARCHAR(100) UNIQUE,
  title VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_custom_alias ON links(custom_alias);

-- 3. Create Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_link_id ON tags(link_id);
CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags(tag);

-- 4. Create Analytics Table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(2048),
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(20),
  os VARCHAR(100),
  browser VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_analytics_link_id ON analytics(link_id);
CREATE INDEX IF NOT EXISTS idx_analytics_clicked_at ON analytics(clicked_at);
CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics(country);

-- 5. Create API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  last4 VARCHAR(4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- 6. Create Preferences Table
CREATE TABLE IF NOT EXISTS preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON preferences(user_id);

-- 7. Create Helper Function for Click Count
CREATE OR REPLACE FUNCTION increment_click_count(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE links
  SET click_count = click_count + 1,
      last_clicked_at = CURRENT_TIMESTAMP
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own record" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can read their own links" ON links;
DROP POLICY IF EXISTS "Users can create links" ON links;
DROP POLICY IF EXISTS "Users can update their own links" ON links;
DROP POLICY IF EXISTS "Users can delete their own links" ON links;
DROP POLICY IF EXISTS "Anyone can access short codes for redirect" ON links;
DROP POLICY IF EXISTS "Users can read tags for their links" ON tags;
DROP POLICY IF EXISTS "Users can create tags for their links" ON tags;
DROP POLICY IF EXISTS "Users can delete tags from their links" ON tags;
DROP POLICY IF EXISTS "Users can read analytics for their links" ON analytics;
DROP POLICY IF EXISTS "Anyone can record clicks" ON analytics;
DROP POLICY IF EXISTS "Users can read their API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can create their API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update their API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete their API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can read their preferences" ON preferences;
DROP POLICY IF EXISTS "Users can create their preferences" ON preferences;
DROP POLICY IF EXISTS "Users can update their preferences" ON preferences;

-- Users table policies
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own record" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Links table policies
CREATE POLICY "Users can read their own links" ON links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create links" ON links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own links" ON links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own links" ON links
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can access short codes for redirect" ON links
  FOR SELECT USING (is_active = true);

-- Tags table policies
CREATE POLICY "Users can read tags for their links" ON tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM links WHERE links.id = tags.link_id AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tags for their links" ON tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM links WHERE links.id = tags.link_id AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags from their links" ON tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM links WHERE links.id = tags.link_id AND links.user_id = auth.uid()
    )
  );

-- Analytics table policies
CREATE POLICY "Users can read analytics for their links" ON analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM links WHERE links.id = analytics.link_id AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can record clicks" ON analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM links WHERE links.id = analytics.link_id AND links.is_active = true
    )
  );

-- API keys table policies
CREATE POLICY "Users can read their API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Preferences table policies
CREATE POLICY "Users can read their preferences" ON preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their preferences" ON preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their preferences" ON preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- Completion
-- ============================================
-- All tables, indexes, and RLS policies have been created!
-- Your database is now ready for LinkShrink.
