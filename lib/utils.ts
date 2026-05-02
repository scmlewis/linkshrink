/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format large numbers with K, M, B suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Parse user agent to extract device info
 */
export function parseUserAgent(userAgent: string): {
  device_type: string;
  os: string;
  browser: string;
} {
  let device_type = 'desktop';
  let os = 'Unknown';
  let browser = 'Unknown';

  // Device detection
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    device_type = 'mobile';
  } else if (/ipad|android/i.test(userAgent)) {
    device_type = 'tablet';
  }

  // OS detection
  if (/windows/i.test(userAgent)) {
    os = 'Windows';
  } else if (/macintosh|macintel|macppc|mac68k/i.test(userAgent)) {
    os = 'macOS';
  } else if (/linux/i.test(userAgent)) {
    os = 'Linux';
  } else if (/iphone|ipod/i.test(userAgent)) {
    os = 'iOS';
  } else if (/android/i.test(userAgent)) {
    os = 'Android';
  }

  // Browser detection
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) {
    browser = 'Chrome';
  } else if (/edge/i.test(userAgent)) {
    browser = 'Edge';
  } else if (/firefox/i.test(userAgent)) {
    browser = 'Firefox';
  } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
    browser = 'Safari';
  } else if (/trident/i.test(userAgent)) {
    browser = 'Internet Explorer';
  }

  return { device_type, os, browser };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Generate a random color for tags
 */
export function getRandomColor(): string {
  const colors = [
    'bg-red-100 text-red-800',
    'bg-blue-100 text-blue-800',
    'bg-green-100 text-green-800',
    'bg-yellow-100 text-yellow-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-cyan-100 text-cyan-800',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Delay execution (useful for debouncing)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build a short URL from base and short code
 */
export function buildShortUrl(shortCode: string, baseUrl?: string): string {
  const normalizedBase = (baseUrl || process.env.NEXT_PUBLIC_SHORT_URL_BASE || '')
    .trim()
    .replace(/\/+$/, '');

  if (!normalizedBase) {
    return `/${shortCode}`;
  }

  return `${normalizedBase}/${shortCode}`;
}
