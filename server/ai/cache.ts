import { LRUCache } from 'lru-cache';
import crypto from 'node:crypto';

const responseCache = new LRUCache<string, string>({
  max: 300,
  ttl: 1000 * 60 * 15, // 15 minutes TTL
});

export function generateCacheKey(prefix: string, payload: unknown, timeBucketMinutes = 15): string {
  const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const nowBucket = Math.floor(Date.now() / (1000 * 60 * timeBucketMinutes));
  return crypto
    .createHash('sha256')
    .update(`${prefix}:${serialized}:${nowBucket}`)
    .digest('hex');
}

export function getCachedResponse(key: string): string | undefined {
  return responseCache.get(key);
}

export function setCachedResponse(key: string, value: string): void {
  responseCache.set(key, value);
}

export function getCacheStats(): { size: number; max: number } {
  return {
    size: responseCache.size,
    max: responseCache.max,
  };
}
