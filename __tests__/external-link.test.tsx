import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExternalLink } from '@/components/ui/ExternalLink';

describe('ExternalLink Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Desktop Behavior (≥768px)', () => {
    beforeEach(() => {
      vi.stubGlobal('innerWidth', 1024); // Desktop
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('renders as a regular anchor tag on desktop', () => {
      const { container } = render(
        <ExternalLink href="https://example.com">
          Click me
        </ExternalLink>
      );

      const link = container.querySelector('a');
      expect(link).toBeDefined();
      expect(link?.getAttribute('href')).toBe('https://example.com');
      expect(link?.getAttribute('target')).toBe('_blank');
      expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    });

    it('applies className on desktop', () => {
      const { container } = render(
        <ExternalLink href="https://example.com" className="text-blue">
          Link
        </ExternalLink>
      );

      const link = container.querySelector('a');
      expect(link?.getAttribute('class')).toContain('text-blue');
    });

    it('preserves custom rel attribute', () => {
      const { container } = render(
        <ExternalLink href="https://example.com" rel="nofollow">
          Link
        </ExternalLink>
      );

      const link = container.querySelector('a');
      expect(link?.getAttribute('rel')).toBe('nofollow');
    });
  });

  describe('Mobile Behavior (<768px)', () => {
    beforeEach(() => {
      vi.stubGlobal('innerWidth', 375); // Mobile
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('renders as a button on mobile instead of link', async () => {
      const { container } = render(
        <ExternalLink href="https://example.com">
          Click me
        </ExternalLink>
      );

      // Button should be rendered
      await waitFor(() => {
        const button = container.querySelector('button');
        expect(button).toBeDefined();
        expect(button?.textContent).toContain('Click me');
      });

      // Link should NOT be rendered
      const link = container.querySelector('a');
      expect(link).toBeNull();
    });

    it('shows modal when button is clicked on mobile', async () => {
      const { container } = render(
        <ExternalLink href="https://example.com">
          Click me
        </ExternalLink>
      );

      await waitFor(() => {
        const button = container.querySelector('button');
        if (button) {
          fireEvent.click(button);
        }
      });

      // Modal should appear
      await waitFor(() => {
        expect(screen.queryByText('Open External Link')).toBeDefined();
      });
    });

    it('displays link URL in modal on mobile', async () => {
      const testUrl = 'https://example.com/very/long/url';
      const { container } = render(
        <ExternalLink href={testUrl}>
          Link
        </ExternalLink>
      );

      await waitFor(() => {
        const button = container.querySelector('button');
        if (button) {
          fireEvent.click(button);
        }
      });

      // URL should be visible in modal
      await waitFor(() => {
        expect(screen.queryByText(testUrl)).toBeDefined();
      });
    });
  });

  describe('forceNewTab prop', () => {
    beforeEach(() => {
      vi.stubGlobal('innerWidth', 375); // Mobile
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('renders as link even on mobile when forceNewTab is true', async () => {
      const { container } = render(
        <ExternalLink href="https://example.com" forceNewTab={true}>
          Link
        </ExternalLink>
      );

      await waitFor(() => {
        const link = container.querySelector('a');
        expect(link).toBeDefined();
        expect(link?.getAttribute('target')).toBe('_blank');
      });
    });
  });

  describe('Link content and attributes', () => {
    beforeEach(() => {
      vi.stubGlobal('innerWidth', 1024); // Desktop for this suite
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('renders children correctly', async () => {
      render(
        <ExternalLink href="https://example.com">
          Visit our website
        </ExternalLink>
      );

      await waitFor(() => {
        expect(screen.getByText('Visit our website')).toBeDefined();
      });
    });

    it('supports title attribute', async () => {
      const { container } = render(
        <ExternalLink href="https://example.com" title="External site">
          Link
        </ExternalLink>
      );

      await waitFor(() => {
        const link = container.querySelector('a');
        expect(link?.getAttribute('title')).toBe('External site');
      });
    });
  });
});
