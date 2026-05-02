-- LinkShrink Database Verification Script
-- Run this in your Supabase SQL Editor to verify the setup

-- 1. Check all tables exist
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Check api_keys table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'api_keys'
ORDER BY ordinal_position;

-- 3. Check api_keys constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'api_keys';

-- 4. Check unique constraints on api_keys
SELECT constraint_name, column_name
FROM information_schema.constraint_column_usage
WHERE table_name = 'api_keys' AND constraint_name LIKE '%unique%'
ORDER BY constraint_name, column_name;

-- 5. Check indexes on api_keys
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'api_keys'
ORDER BY indexname;

-- 6. Check RLS policies on api_keys
SELECT policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'api_keys'
ORDER BY policyname;

-- 7. Check if users table exists and has correct structure
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 8. Summary - all required tables
SELECT 
  'users' as table_name, EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'users') as exists
UNION ALL
SELECT 
  'links', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'links')
UNION ALL
SELECT 
  'tags', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'tags')
UNION ALL
SELECT 
  'analytics', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics')
UNION ALL
SELECT 
  'api_keys', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys')
UNION ALL
SELECT 
  'preferences', EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'preferences')
ORDER BY table_name;
