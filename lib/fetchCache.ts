// In-memory fetch cache with stale-while-revalidate for dashboard pages
interface CacheEntry {
  data: unknown;
  timestamp: number;
  inflight?: Promise<unknown>;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 60000; // 60 seconds

async function fetchAndCache<T>(
  cacheKey: string,
  url: string,
  options?: RequestInit
): Promise<T> {
  const now = Date.now();
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }
  const data = (await response.json()) as T;
  cache.set(cacheKey, { data, timestamp: now });
  return data;
}

export async function cachedFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const cacheKey = `${options?.method || 'GET'}:${url}`;
  const now = Date.now();
  const isGet = !options?.method || options.method === 'GET';

  const cached = cache.get(cacheKey);

  if (cached) {
    const age = now - cached.timestamp;

    if (age < CACHE_TTL) {
      // Fresh — return directly
      return cached.data as T;
    }

    // Stale — return cached data, refresh in background
    if (!cached.inflight) {
      cached.inflight = fetchAndCache(cacheKey, url, options).finally(() => {
        const entry = cache.get(cacheKey);
        if (entry) entry.inflight = undefined;
      });
    }
    return cached.data as T;
  }

  // No cache entry — fetch and store
  if (isGet) {
    return fetchAndCache<T>(cacheKey, url, options);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export function invalidateCache(urlPattern?: string): void {
  if (!urlPattern) {
    cache.clear();
    return;
  }

  for (const key of cache.keys()) {
    if (key.includes(urlPattern)) {
      cache.delete(key);
    }
  }
}

export function getCacheSize(): number {
  return cache.size;
}
