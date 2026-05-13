import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import DashboardLayout from '@/app/dashboard/layout';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const pushMock = vi.fn();
const signOutMock = vi.fn();
const pathnameMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock(),
  useSearchParams: () => new URLSearchParams('tab=links'),
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Test User', email: 'test@example.com' } },
    status: 'authenticated',
  }),
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

beforeEach(() => {
  vi.resetAllMocks();
  pathnameMock.mockReturnValue('/dashboard/links');
});

describe('Button', () => {
  it('renders the expected button states', () => {
    render(<Button variant="outline">Action</Button>);

    expect(screen.getByRole('button', { name: 'Action' }).className).toContain('border-outline-variant');
  });

  it('disables itself and shows loading state when requested', () => {
    render(<Button isLoading>Save</Button>);

    const button = screen.getByRole('button', { name: /save/i });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.className).toContain('shadow-lg');
  });
});

describe('Card', () => {
  it('exposes button semantics when clickable', () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Card content</Card>);

    const card = screen.getByRole('button', { name: /card content/i });
    expect(card).toBeTruthy();

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('DashboardLayout', () => {
  it('highlights the active nav item and renders the section header', () => {
    render(
      <DashboardLayout>
        <div>Dashboard body</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Dashboard body')).toBeTruthy();
    expect(screen.getByText(/current section/i)).toBeTruthy();
    expect(screen.getByRole('link', { name: /my links/i }).className).toContain('text-primary');
  });
});