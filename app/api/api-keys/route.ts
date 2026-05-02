import { NextResponse, NextRequest } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const KEY_PREFIX = 'sk_live_';

function generateApiKey(): string {
  const raw = randomBytes(24).toString('base64url');
  return `${KEY_PREFIX}${raw}`;
}

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, last4, created_at, last_used_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }

    return NextResponse.json({ keys: data || [] });
  } catch (error) {
    console.error('Error in GET /api/api-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Key name is required' }, { status: 400 });
    }

    const apiKey = generateApiKey();
    const keyHash = hashKey(apiKey);
    const last4 = apiKey.slice(-4);

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_id: session.user.id,
        name: name.trim(),
        key_hash: keyHash,
        last4,
        created_at: new Date().toISOString(),
      })
      .select('id, name, last4, created_at, last_used_at')
      .single();

    if (error) {
      console.error('Error inserting API key:', error);
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
    }

    return NextResponse.json({ ...data, key: apiKey });
  } catch (error) {
    console.error('Error in POST /api/api-keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
