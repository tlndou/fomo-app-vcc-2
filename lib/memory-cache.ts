interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  clears: number
}

export class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly maxSize: number
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    clears: 0
  }

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }

  /**
   * Store data in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number): void {
    try {
      // Remove expired entries first
      this.cleanup()

      // If cache is full, remove oldest entry
      if (this.cache.size >= this.maxSize) {
        this.evictOldest()
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl
      }

      this.cache.set(key, entry)
      this.stats.sets++

      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache SET: ${key} (TTL: ${ttl}ms)`)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  /**
   * Retrieve data from cache if not expired
   */
  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key)
      
      if (!entry) {
        this.stats.misses++
        if (process.env.NODE_ENV === 'development') {
          console.log(`Cache MISS: ${key}`)
        }
        return null
      }

      // Check if entry has expired
      const now = Date.now()
      const isExpired = (now - entry.timestamp) > entry.ttl

      if (isExpired) {
        this.cache.delete(key)
        this.stats.misses++
        if (process.env.NODE_ENV === 'development') {
          console.log(`Cache EXPIRED: ${key}`)
        }
        return null
      }

      this.stats.hits++
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache HIT: ${key}`)
      }
      return entry.data
    } catch (error) {
      console.error('Cache get error:', error)
      this.stats.misses++
      return null
    }
  }

  /**
   * Remove specific entry from cache
   */
  delete(key: string): boolean {
    try {
      const deleted = this.cache.delete(key)
      if (deleted) {
        this.stats.deletes++
        if (process.env.NODE_ENV === 'development') {
          console.log(`Cache DELETE: ${key}`)
        }
      }
      return deleted
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    try {
      this.cache.clear()
      this.stats.clears++
      if (process.env.NODE_ENV === 'development') {
        console.log('Cache CLEARED')
      }
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Get cache hit rate
   */
  getHitRate(): number {
    const total = this.stats.hits + this.stats.misses
    return total > 0 ? (this.stats.hits / total) * 100 : 0
  }

  /**
   * Get all cache keys (for debugging)
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Get cache contents (for debugging)
   */
  getContents(): Record<string, any> {
    const contents: Record<string, any> = {}
    for (const [key, entry] of this.cache.entries()) {
      contents[key] = {
        data: entry.data,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        expiresAt: entry.timestamp + entry.ttl,
        age: Date.now() - entry.timestamp
      }
    }
    return contents
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Remove oldest entry (FIFO)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache EVICTED: ${oldestKey}`)
      }
    }
  }
}

// Global cache instance
export const globalCache = new MemoryCache(100)

// Cache TTL constants
export const CACHE_TTL = {
  USER_PROFILE: 10 * 60 * 1000,      // 10 minutes
  USER_PARTIES: 5 * 60 * 1000,       // 5 minutes
  PARTY_DETAILS: 5 * 60 * 1000,      // 5 minutes
  USER_FRIENDS: 15 * 60 * 1000,      // 15 minutes
  USER_PREFERENCES: 30 * 60 * 1000,  // 30 minutes
} as const

// Cache key generators
export const CACHE_KEYS = {
  userProfile: (userId: string) => `user-profile-${userId}`,
  userParties: (userId: string) => `user-parties-${userId}`,
  partyDetails: (partyId: string) => `party-details-${partyId}`,
  userFriends: (userId: string) => `user-friends-${userId}`,
  userPreferences: (userId: string) => `user-preferences-${userId}`,
} as const

// Cache invalidation helpers
export const cacheInvalidation = {
  clearUserProfile: (userId: string) => {
    globalCache.delete(CACHE_KEYS.userProfile(userId))
  },
  clearUserParties: (userId: string) => {
    globalCache.delete(CACHE_KEYS.userParties(userId))
  },
  clearPartyDetails: (partyId: string) => {
    globalCache.delete(CACHE_KEYS.partyDetails(partyId))
  },
  clearUserFriends: (userId: string) => {
    globalCache.delete(CACHE_KEYS.userFriends(userId))
  },
  clearUserPreferences: (userId: string) => {
    globalCache.delete(CACHE_KEYS.userPreferences(userId))
  },
  clearAllUserData: (userId: string) => {
    cacheInvalidation.clearUserProfile(userId)
    cacheInvalidation.clearUserParties(userId)
    cacheInvalidation.clearUserFriends(userId)
    cacheInvalidation.clearUserPreferences(userId)
  },
  clearAll: () => {
    globalCache.clear()
  }
} 