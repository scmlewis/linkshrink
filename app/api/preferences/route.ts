import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

const DEFAULT_PREFERENCES = {
  email_notifications: true,
  product_updates: true,
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('preferences')
      .select('email_notifications, product_updates')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Failed to load preferences' }, { status: 500 });
    }

    return NextResponse.json(data || DEFAULT_PREFERENCES);
  } catch (error) {
    console.error('Error in GET /api/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { email_notifications?: boolean; product_updates?: boolean };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const emailNotifications = typeof body.email_notifications === 'boolean'
      ? body.email_notifications
      : DEFAULT_PREFERENCES.email_notifications;
    const productUpdates = typeof body.product_updates === 'boolean'
      ? body.product_updates
      : DEFAULT_PREFERENCES.product_updates;

    const { error } = await supabaseAdmin
      .from('preferences')
      .upsert(
        {
          user_id: session.user.id,
          email_notifications: emailNotifications,
          product_updates: productUpdates,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }

    return NextResponse.json({
      email_notifications: emailNotifications,
      product_updates: productUpdates,
    });
  } catch (error) {
    console.error('Error in PUT /api/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
