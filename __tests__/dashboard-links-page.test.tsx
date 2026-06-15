import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LinksPage from '@/app/dashboard/LinksPage';

const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

beforeEach(() => {
  vi.resetAllMocks();
  global.fetch = vi.fn() as never;
});

describe('dashboard links page', () => {
  it('shows loading first and then renders fetched links', async () => {
    const deferred = createDeferred<Response>();
    const fetchMock = vi.fn(() => deferred.promise);
    global.fetch = fetchMock as never;

    render(<LinksPage />);

    expect(screen.getByRole('status', { name: /loading/i })).toBeTruthy();

    deferred.resolve(
      new Response(
        JSON.stringify({
          links: [
            {
              id: 'link-1',
              user_id: 'user-1',
              short_code: 'abc123',
              original_url: 'https://example.com/docs',
              title: 'Docs',
              nickname: 'Docs',
              description: 'Product documentation',
              created_at: '2026-05-04T12:00:00.000Z',
              updated_at: '2026-05-04T12:00:00.000Z',
              is_active: true,
              click_count: 42,
              tags: ['docs', 'product'],
            },
          ],
          pagination: { totalPages: 1 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my links/i })).toBeTruthy();
    });

    expect(screen.getByText('Docs')).toBeTruthy();
    expect(screen.getByText('https://example.com/docs')).toBeTruthy();
    expect(screen.getByText('Product documentation')).toBeTruthy();
    expect(screen.getAllByText('docs').length).toBe(2);
    expect(screen.getAllByText('product').length).toBe(2);
    expect(screen.getAllByText('42').length).toBe(2);
    expect(fetchMock).toHaveBeenCalledWith('/api/links?page=1&limit=10&sort=created', undefined);
  });

  it('opens and closes the create form from the header action', async () => {
    global.fetch = vi.fn(async () =>
      new Response(JSON.stringify({ links: [], pagination: { totalPages: 1 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    ) as never;

    render(<LinksPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /my links/i })).toBeTruthy();
    });

    expect(screen.queryByPlaceholderText('https://example.com/very/long/url')).toBeNull();

    fireEvent.click(screen.getAllByRole('button', { name: /create link/i })[0]);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://example.com/very/long/url')).toBeTruthy();
    });
    expect(screen.getByPlaceholderText('my-awesome-link')).toBeTruthy();
    expect(screen.getByPlaceholderText('My awesome link')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.queryByPlaceholderText('https://example.com/very/long/url')).toBeNull();
  });
});