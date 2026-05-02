import { describe, it, expect } from 'vitest';
import { buildShortUrl } from '@/lib/utils';

describe('buildShortUrl', () => {
  it('uses base url without trailing slash', () => {
    const result = buildShortUrl('abc123', 'http://localhost:3000');
    expect(result).toBe('http://localhost:3000/abc123');
  });

  it('removes trailing slash', () => {
    const result = buildShortUrl('abc123', 'http://localhost:3000/');
    expect(result).toBe('http://localhost:3000/abc123');
  });

  it('falls back to relative url when base is empty', () => {
    const result = buildShortUrl('abc123', '');
    expect(result).toBe('/abc123');
  });
});
