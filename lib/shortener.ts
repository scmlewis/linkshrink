// Base62 alphabet for short codes
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const BASE = ALPHABET.length;

/**
 * Generates a random short code using base62 encoding
 * @param length - Length of the short code (default: 6)
 * @returns A random short code string
 */
export function generateShortCode(length: number = 6): string {
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  let shortCode = '';
  for (let i = 0; i < length; i++) {
    shortCode += ALPHABET[array[i] % BASE];
  }
  return shortCode;
}

/**
 * Validates if a string is a valid short code format
 * @param code - The code to validate
 * @returns true if valid, false otherwise
 */
export function isValidShortCode(code: string): boolean {
  return /^[A-Za-z0-9]{3,10}$/.test(code);
}

/**
 * Validates if a URL is valid
 * @param url - The URL to validate
 * @returns true if valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL (adds https:// if missing)
 * @param url - The URL to normalize
 * @returns The normalized URL
 */
export function normalizeUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Extracts domain from URL
 * @param url - The URL to extract from
 * @returns The domain
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

/**
 * Generates a slug-like custom alias from text
 * @param text - The text to convert to slug
 * @returns A slug string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}
