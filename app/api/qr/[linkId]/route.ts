import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLink } from '@/lib/links';
import QRCode from 'qrcode';

/**
 * GET /api/qr/[linkId] - Get QR code for a link
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

    // Get link
    const linkResponse = await getLink(linkId);

    if (!linkResponse.success || !linkResponse.data) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Verify ownership
    if (linkResponse.data.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const link = linkResponse.data;
    const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_URL_BASE}/${link.short_code}`;

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#16111b',
        light: '#ffffff',
      },
    });

    return NextResponse.json({
      qrCode: qrDataUrl,
      url: shortUrl,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}
