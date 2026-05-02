import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/export/route';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: vi.fn() } }));

const authMock = vi.mocked(auth);
const fromMock = vi.mocked(supabaseAdmin.from as unknown as (table: string) => unknown);

const createLinksQuery = (result: { data: unknown; error: unknown }) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue(result),
});

const createAnalyticsQuery = (result: { data: unknown; error: unknown }) => ({
  select: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockResolvedValue(result),
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/export', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null as never);

    const req = new Request('http://localhost/api/export');
    const res = await GET(req as never);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns json export payload', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);

    const linksQuery = createLinksQuery({
      data: [{ id: 'link-1', user_id: 'user-1', short_code: 'abc' }],
      error: null,
    });
    const analyticsQuery = createAnalyticsQuery({
      data: [{ id: 'analytic-1', link_id: 'link-1' }],
      error: null,
    });

    fromMock.mockImplementation((table: string) => {
      if (table === 'links') {
        return linksQuery as never;
      }
      if (table === 'analytics') {
        return analyticsQuery as never;
      }
      return undefined as never;
    });

    const req = new Request('http://localhost/api/export?format=json');
    const res = await GET(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.links).toHaveLength(1);
    expect(data.analytics).toHaveLength(1);
  });
});
