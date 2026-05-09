import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use placeholder values for build-time, actual validation happens at runtime
const url = supabaseUrl || 'https://placeholder.supabase.co';
const anonKey = supabaseAnonKey || 'placeholder-key';

function createMissingCredentialsProxy(clientName: 'supabase' | 'supabaseAdmin', cause: unknown) {
  const message =
    'Missing Supabase URL or Anon Key. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your deployment environment.';

  if (process.env.NODE_ENV !== 'test') {
    console.warn(`[${clientName}] ${message}`, cause);
  }

  return new Proxy(
    {},
    {
      get() {
        throw new Error(message);
      },
    }
  );
}

function createSafeClient(clientName: 'supabase' | 'supabaseAdmin', key: string) {
  try {
    return createClient(url, key);
  } catch (error) {
    // Never fail module evaluation at build time due missing env.
    return createMissingCredentialsProxy(clientName, error);
  }
}

if (!supabaseServiceKey && process.env.NODE_ENV === 'production') {
  console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY not set. Using anon key for admin operations. Some operations may fail due to RLS policies.');
}

// Client for browser (anon key - limited permissions)
export const supabase = createSafeClient('supabase', anonKey);

// Admin client for server (service key - full permissions)
export const supabaseAdmin = createSafeClient('supabaseAdmin', supabaseServiceKey || anonKey);

// Runtime validation - check at import time if we're running in browser or API
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
}

export default supabase;
