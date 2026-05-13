import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/app/page';
import DashboardHome from '@/app/dashboard/page';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const pushMock = vi.fn();
const useSessionMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => useSessionMock(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  useSessionMock.mockReturnValue({ status: 'unauthenticated', data: null });
  global.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('/api/analytics')) {
      return new Response(
        JSON.stringify({ total_clicks: 12400, clicks_today: 182, top_country: 'US' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (url.includes('/api/links?page=1&limit=5')) {
      return new Response(JSON.stringify({ links: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as never;
});

describe('landing page UI', () => {
  it('renders the new premium hero and feature layout', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /shorten your links\./i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /explore features/i })).toBeTruthy();
    expect(screen.getByText(/live signal/i)).toBeTruthy();
    expect(screen.getAllByText(/fast capture/i)).toHaveLength(1);
    expect(screen.getAllByText(/clear insight/i)).toHaveLength(1);
    expect(screen.getAllByText(/brand-ready links/i)).toHaveLength(1);
  });
});

describe('dashboard home UI', () => {
  it('renders the updated workspace hero and create form', async () => {
    render(<DashboardHome />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /shorten\. share\. track\./i })).toBeTruthy();
    });

    expect(screen.getByRole('heading', { name: /one small form, clearer output/i })).toBeTruthy();
    expect(screen.getByText(/total clicks/i)).toBeTruthy();
    expect(screen.getByText(/recent links/i)).toBeTruthy();
    expect(screen.getByText(/no links created yet/i)).toBeTruthy();
  });
});