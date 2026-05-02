import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/user/route';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: vi.fn() } }));

const authMock = vi.mocked(auth);
const fromMock = vi.mocked(supabaseAdmin.from as unknown as (table: string) => unknown);

const createQuery = (result: { data: unknown; error: unknown }) => {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
    update: vi.fn().mockReturnThis(),
  };

  return query;
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/user', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null as never);

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns user profile when authenticated', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1', email: 'test@example.com' } } as never);

    const query = createQuery({
      data: { id: 'user-1', email: 'test@example.com', name: 'Test User' },
      error: null,
    });
    fromMock.mockReturnValue(query as never);

    const res = await GET();

    expect(fromMock).toHaveBeenCalledWith('users');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
    });
  });
});

describe('PUT /api/user', () => {
  it('returns 400 when name is missing', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);

    const req = new NextRequest('http://localhost/api/user', {
      method: 'PUT',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await PUT(req);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Name is required' });
  });

  it('returns 400 when name is too long', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);

    const req = new NextRequest('http://localhost/api/user', {
      method: 'PUT',
      body: JSON.stringify({ name: 'a'.repeat(121) }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await PUT(req);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Name is too long' });
  });

  it('updates profile name', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);

    const query = createQuery({
      data: { id: 'user-1', email: 'test@example.com', name: 'New Name' },
      error: null,
    });
    fromMock.mockReturnValue(query as never);

    const req = new NextRequest('http://localhost/api/user', {
      method: 'PUT',
      body: JSON.stringify({ name: 'New Name' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await PUT(req);

    expect(fromMock).toHaveBeenCalledWith('users');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      id: 'user-1',
      email: 'test@example.com',
      name: 'New Name',
    });
  });
});
