import { NextRequest, NextResponse } from 'next/server';
import { unparse } from 'papaparse';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function buildFilename(extension: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `linkshrink-export-${date}.${extension}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: links, error: linksError } = await supabaseAdmin
      .from('links')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (linksError) {
      return NextResponse.json({ error: 'Failed to export links' }, { status: 500 });
    }

    const linkIds = (links || []).map((link) => link.id);
    let analytics: Record<string, unknown>[] = [];

    if (linkIds.length > 0) {
      const { data: analyticsData, error: analyticsError } = await supabaseAdmin
        .from('analytics')
        .select('*')
        .in('link_id', linkIds)
        .order('clicked_at', { ascending: false });

      if (analyticsError) {
        return NextResponse.json({ error: 'Failed to export analytics' }, { status: 500 });
      }

      analytics = analyticsData || [];
    }

    const format = new URL(req.url).searchParams.get('format') || 'json';

    if (format === 'csv') {
      const linksCsv = unparse(links || []);
      const analyticsCsv = unparse(analytics || []);
      const csvContent = `Links\n${linksCsv}\n\nAnalytics\n${analyticsCsv}`;

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${buildFilename('csv')}"`,
        },
      });
    }

    const payload = { links: links || [], analytics };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${buildFilename('json')}"`,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/export:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
