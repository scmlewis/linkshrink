import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLinkAnalytics, getUserAnalyticsSummary } from '@/lib/analytics';

/**
 * GET /api/analytics/[linkId] - Get analytics for a specific link
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await getLinkAnalytics(linkId);

    if (!response.success) {
      return NextResponse.json({ error: response.error }, { status: 400 });
    }

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error in GET /api/analytics/[linkId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
