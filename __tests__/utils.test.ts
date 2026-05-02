import { describe, it, expect } from 'vitest';
import { buildShortUrl, formatNumber, formatDate, copyToClipboard } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(0)).toBe('0');
    });

    it('should handle very large numbers', () => {
      expect(formatNumber(1500000)).toBe('1,500,000');
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan'); // Or your format preference
    });

    it('should handle string dates', () => {
      const dateStr = '2024-01-15T00:00:00Z';
      const formatted = formatDate(dateStr);
      expect(formatted).toBeTruthy();
    });
  });

  describe('buildShortUrl', () => {
    it('should build short URL with base', () => {
      const result = buildShortUrl('abc123', 'https://link.shrink');
      expect(result).toBe('https://link.shrink/abc123');
    });

    it('should remove trailing slash from base', () => {
      const result = buildShortUrl('abc123', 'https://link.shrink/');
      expect(result).toBe('https://link.shrink/abc123');
    });

    it('should use relative path when base is empty', () => {
      const result = buildShortUrl('abc123', '');
      expect(result).toBe('/abc123');
    });
  });
});
