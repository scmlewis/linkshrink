import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT } from '@/app/api/preferences/route';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: vi.fn() } }));

const authMock = vi.mocked(auth);
const fromMock = vi.mocked(supabaseAdmin.from as unknown as (table: string) => unknown);

const createSelectQuery = (result: { data: unknown; error: unknown }) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(result),
});

const createUpsertQuery = (result: { error: unknown }) => ({
  upsert: vi.fn().mockResolvedValue(result),
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/preferences', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null as never);

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns defaults when no preferences row', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const query = createSelectQuery({ data: null, error: { code: 'PGRST116' } });
    fromMock.mockReturnValue(query as never);

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      email_notifications: true,
      product_updates: true,
    });
  });

  it('returns preferences when row exists', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const query = createSelectQuery({
      data: { email_notifications: false, product_updates: true },
      error: null,
    });
    fromMock.mockReturnValue(query as never);

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      email_notifications: false,
      product_updates: true,
    });
  });
});

describe('PUT /api/preferences', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null as never);

    const req = new Request('http://localhost/api/preferences', {
      method: 'PUT',
      body: JSON.stringify({ email_notifications: true, product_updates: false }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await PUT(req as never);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('upserts preferences', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const query = createUpsertQuery({ error: null });
    fromMock.mockReturnValue(query as never);

    const req = new Request('http://localhost/api/preferences', {
      method: 'PUT',
      body: JSON.stringify({ email_notifications: false, product_updates: false }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await PUT(req as never);

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      email_notifications: false,
      product_updates: false,
    });
  });
});
