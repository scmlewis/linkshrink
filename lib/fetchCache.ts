// Simple in-memory fetch cache for dashboard pages
// Prevents refetching the same data when navigating between tabs
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

export async function cachedFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const cacheKey = `${options?.method || 'GET'}:${url}`;
  const now = Date.now();

  // Check if we have a valid cache entry
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  // Fetch fresh data
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as T;

  // Cache the result (only for GET requests)
  if (!options?.method || options.method === 'GET') {
    cache.set(cacheKey, { data, timestamp: now });
  }

  return data;
}

export function invalidateCache(urlPattern?: string): void {
  if (!urlPattern) {
    cache.clear();
    return;
  }

  // Invalidate cache entries matching the pattern
  for (const key of cache.keys()) {
    if (key.includes(urlPattern)) {
      cache.delete(key);
    }
  }
}

export function getCacheSize(): number {
  return cache.size;
}
