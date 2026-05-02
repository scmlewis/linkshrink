import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DELETE } from '@/app/api/account/route';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ supabaseAdmin: { from: vi.fn() } }));

const authMock = vi.mocked(auth);
const fromMock = vi.mocked(supabaseAdmin.from as unknown as (table: string) => unknown);

const createDeleteQuery = (result: { error: unknown }) => ({
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockResolvedValue(result),
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('DELETE /api/account', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null as never);

    const res = await DELETE();

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: 'Unauthorized' });
  });

  it('deletes account when authenticated', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1' } } as never);
    const query = createDeleteQuery({ error: null });
    fromMock.mockReturnValue(query as never);

    const res = await DELETE();

    expect(fromMock).toHaveBeenCalledWith('users');
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ message: 'Account deleted' });
  });
});
