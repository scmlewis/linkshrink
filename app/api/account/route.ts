import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', session.user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Account deleted' });
  } catch (error) {
    console.error('Error in DELETE /api/account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
