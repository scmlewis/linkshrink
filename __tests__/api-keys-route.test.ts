import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/api-keys/route';
import { DELETE } from '@/app/api/api-keys/[id]/route';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: vi.fn() } }));

const authMock = vi.mocked(auth);
const fromMock = vi.mocked(supabaseAdmin.from as unknown as (table: string) => unknown);

beforeEach(() => {
  vi.resetAllMocks();
});

describe('GET /api/api-keys', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null as never);

    const res = await GET();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns empty keys array when no keys exist', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    fromMock.mockReturnValue(query as never);

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ keys: [] });
  });

  it('returns array of keys with all fields', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const mockKeys = [
      { id: 'key-1', name: 'Production Key', last4: '1234', created_at: '2026-04-29T00:00:00Z', last_used_at: null },
      { id: 'key-2', name: 'Test Key', last4: '5678', created_at: '2026-04-28T00:00:00Z', last_used_at: '2026-04-29T12:00:00Z' },
    ];
    const query = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockKeys, error: null }),
    };
    fromMock.mockReturnValue(query as never);

    const res = await GET();

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ keys: mockKeys });
  });
});

describe('POST /api/api-keys', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null as never);

    const req = new Request('http://localhost/api/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test Key' }),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('returns 400 when name is missing', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);

    const req = new Request('http://localhost/api/api-keys', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req as never);

    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: 'Key name is required' });
  });

  it('creates a new api key with name', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);
    // The mock key should have the correct last4 that matches the generated key
    // In this case we'll use the pattern where last4 matches the end of the actual generated key
    const mockKey = {
      id: 'key-1',
      name: 'My Key',
      last4: 'test', // This will be replaced with the actual last 4 of the generated key
      created_at: '2026-04-29T00:00:00Z',
      last_used_at: null,
    };
    
    let capturedInsertData: Record<string, unknown> = {};
    const query = {
      insert: vi.fn().mockImplementation((data: Record<string, unknown>) => {
        capturedInsertData = data;
        return {
          select: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              ...mockKey,
              last4: (data.last4 as string) || mockKey.last4,
            },
            error: null,
          }),
        };
      }),
    };
    fromMock.mockReturnValue(query as never);

    const req = new Request('http://localhost/api/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name: 'My Key' }),
    });

    const res = await POST(req as never);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.key).toMatch(/^sk_live_/);
    expect(data.last4).toBe(data.key.slice(-4));
    expect(data.name).toBe('My Key');
  });
});

describe('DELETE /api/api-keys/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null as never);

    const res = await DELETE(new Request('http://localhost') as never, {
      params: { id: 'key-1' },
    });

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('deletes a key', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);
    
    const selectQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'key-1' }, error: null }),
    };
    
    const eqChain = {
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    
    const deleteQuery = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnValue(eqChain),
    };
    
    fromMock.mockReturnValueOnce(selectQuery as never).mockReturnValueOnce(deleteQuery as never);

    const res = await DELETE(new Request('http://localhost') as never, {
      params: { id: 'key-1' },
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ success: true });
  });
});
