import { NAP } from '../types/nap';
import logger from '../config/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000; // Maximum number of cache entries
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0
  };

  // Default TTL values (in milliseconds)
  private readonly DEFAULT_TTL = {
    NAPS_ALL: 5 * 60 * 1000,      // 5 minutes for all NAPs
    NAP_SINGLE: 10 * 60 * 1000,   // 10 minutes for single NAP
    NAPS_PENDING: 2 * 60 * 1000,  // 2 minutes for pending NAPs
    HEALTH_STATUS: 30 * 1000,     // 30 seconds for health status
  };

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL.NAPS_ALL
    };

    this.cache.set(key, entry);
    this.stats.sets++;
    this.stats.size = this.cache.size;

    logger.debug(`Cache SET: ${key}`, { ttl: entry.ttl });
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      logger.debug(`Cache MISS: ${key}`);
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.misses++;
      this.stats.size = this.cache.size;
      logger.debug(`Cache EXPIRED: ${key}`);
      return null;
    }

    this.stats.hits++;
    logger.debug(`Cache HIT: ${key}`);
    return entry.data as T;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
      logger.debug(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
    this.stats.size = 0;
    logger.info('Cache cleared', { deletedEntries: size });
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    this.stats.deletes += deletedCount;
    this.stats.size = this.cache.size;

    if (deletedCount > 0) {
      logger.info(`Cleared ${deletedCount} expired cache entries`);
    }

    return deletedCount;
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidatePattern(pattern: string): number {
    let deletedCount = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    this.stats.deletes += deletedCount;
    this.stats.size = this.cache.size;

    if (deletedCount > 0) {
      logger.info(`Invalidated ${deletedCount} cache entries matching pattern: ${pattern}`);
    }

    return deletedCount;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Get cache entry info
   */
  getEntryInfo(key: string): { exists: boolean; age?: number; ttl?: number; expired?: boolean } {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return { exists: false };
    }

    const now = Date.now();
    const age = now - entry.timestamp;
    const expired = age > entry.ttl;

    return {
      exists: true,
      age,
      ttl: entry.ttl,
      expired
    };
  }

  /**
   * Cache keys for different data types
   */
  static readonly KEYS = {
    ALL_NAPS: 'naps:all',
    PENDING_NAPS: 'naps:pending',
    NAP_BY_ID: (id: string) => `nap:${id}`,
    HEALTH_STATUS: 'health:status',
    USER_NAPS: (userId: string) => `naps:user:${userId}`,
  };

  /**
   * Get TTL for specific cache type
   */
  getTTL(type: keyof typeof this.DEFAULT_TTL): number {
    return this.DEFAULT_TTL[type];
  }

  /**
   * Start periodic cleanup of expired entries
   */
  startPeriodicCleanup(intervalMs: number = 5 * 60 * 1000): NodeJS.Timeout {
    const interval = setInterval(() => {
      this.clearExpired();
    }, intervalMs);

    logger.info(`Started cache cleanup with ${intervalMs}ms interval`);
    return interval;
  }

  /**
   * Cache wrapper for async functions
   */
  async cached<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    try {
      const data = await fetchFunction();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      logger.error(`Error fetching data for cache key ${key}`, { error });
      throw error;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Start periodic cleanup
cacheService.startPeriodicCleanup();