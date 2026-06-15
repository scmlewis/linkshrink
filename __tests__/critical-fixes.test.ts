import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/[shortCode]/route';
import { supabase, supabaseAdmin } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  supabaseAdmin: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

const fromMock = vi.mocked(supabase.from as unknown as (table: string) => unknown);
const adminFromMock = vi.mocked(supabaseAdmin.from as unknown as (table: string) => unknown);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Critical Priority Fix - 302 Redirect', () => {
  it('should use 302 redirect status code for tracking', async () => {
    const mockLink = {
      id: 'link-1',
      user_id: 'user-1',
      short_code: 'test123',
      original_url: 'https://example.com',
      custom_alias: null,
      title: 'Test Link',
      description: null,
      nickname: null,
      is_active: true,
      expires_at: null,
      created_at: '2026-04-29T00:00:00Z',
      click_count: 0,
      last_clicked_at: null,
      updated_at: '2026-04-29T00:00:00Z',
    };

    const selectMock = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockLink, error: null }),
    };
    fromMock.mockReturnValue(selectMock as never);

    const req = new Request('http://localhost/test123', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Mozilla/5.0',
        'referer': 'http://example.com',
      },
    });

    const response = await GET(req as never, {
      params: { shortCode: 'test123' },
    });

    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toBe('https://example.com/');
  });
});