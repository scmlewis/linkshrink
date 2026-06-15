import { NextRequest, NextResponse } from 'next/server';
import { getLinkByShortCode, incrementClickCount } from '@/lib/links';
import { recordClick } from '@/lib/analytics';

/**
 * GET /[shortCode] - Redirect to original URL
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    // Get link
    const linkResponse = await getLinkByShortCode(shortCode);

    if (!linkResponse.success || !linkResponse.data) {
      return NextResponse.json(
        { error: 'Link not found or has expired' },
        { status: 404 }
      );
    }

    const link = linkResponse.data;

    // Record click in background (don't wait)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'Unknown';
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || '';

    await Promise.allSettled([
      recordClick(link.id, {
        ip_address: clientIp,
        user_agent: userAgent,
        referrer: referrer,
      }),
      incrementClickCount(link.id),
    ]);

    // Redirect to original URL (302 to allow tracking on repeat visits)
    return NextResponse.redirect(link.original_url, { status: 302 });
  } catch (error) {
    console.error('Error in redirect handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
