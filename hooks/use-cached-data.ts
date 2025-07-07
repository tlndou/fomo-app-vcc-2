import { useState, useEffect, useCallback } from 'react'
import { 
  getCachedUserProfile, 
  getCachedUserParties, 
  getCachedPartyDetails, 
  getCachedUserFriends,
  getCachedUserPreferences,
  clearUserCache,
  type UserProfile,
  type Party,
  type UserFriend,
  type UserPreferences
} from '@/lib/cached-api'
import { globalCache } from '@/lib/memory-cache'

interface UseCachedDataOptions {
  enabled?: boolean
  refetchOnMount?: boolean
  onError?: (error: Error) => void
}

/**
 * Hook for cached user profile data
 */
export function useCachedUserProfile(userId: string, options: UseCachedDataOptions = {}) {
  const [data, setData] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!userId || !options.enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const profile = await getCachedUserProfile(userId)
      setData(profile)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user profile')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [userId, options.enabled, options.onError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch
  }
}

/**
 * Hook for cached user parties data
 */
export function useCachedUserParties(userId: string, options: UseCachedDataOptions = {}) {
  const [data, setData] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!userId || !options.enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const parties = await getCachedUserParties(userId)
      setData(parties)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user parties')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [userId, options.enabled, options.onError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch
  }
}

/**
 * Hook for cached party details data
 */
export function useCachedPartyDetails(partyId: string, options: UseCachedDataOptions = {}) {
  const [data, setData] = useState<Party | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!partyId || !options.enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const party = await getCachedPartyDetails(partyId)
      setData(party)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch party details')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [partyId, options.enabled, options.onError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch
  }
}

/**
 * Hook for cached user friends data
 */
export function useCachedUserFriends(userId: string, options: UseCachedDataOptions = {}) {
  const [data, setData] = useState<UserFriend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!userId || !options.enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const friends = await getCachedUserFriends(userId)
      setData(friends)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user friends')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [userId, options.enabled, options.onError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch
  }
}

/**
 * Hook for cached user preferences data
 */
export function useCachedUserPreferences(userId: string, options: UseCachedDataOptions = {}) {
  const [data, setData] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!userId || !options.enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const preferences = await getCachedUserPreferences(userId)
      setData(preferences)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user preferences')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [userId, options.enabled, options.onError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch
  }
}

/**
 * Hook for cache management and debugging
 */
export function useCacheManagement() {
  const [stats, setStats] = useState(globalCache.getStats())

  const refreshStats = useCallback(() => {
    setStats(globalCache.getStats())
  }, [])

  const clearAllCache = useCallback(() => {
    globalCache.clear()
    refreshStats()
  }, [refreshStats])

  const clearUserCacheData = useCallback((userId: string) => {
    clearUserCache(userId)
    refreshStats()
  }, [refreshStats])

  const getCacheContents = useCallback(() => {
    return globalCache.getContents()
  }, [])

  const getCacheKeys = useCallback(() => {
    return globalCache.getKeys()
  }, [])

  return {
    stats,
    refreshStats,
    clearAllCache,
    clearUserCacheData,
    getCacheContents,
    getCacheKeys
  }
}

/**
 * Hook for cache-aware data fetching with automatic cache invalidation
 */
export function useCacheAwareData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    enabled?: boolean
    onError?: (error: Error) => void
  } = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!options.enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Try cache first
      const cached = globalCache.get<T>(key)
      if (cached) {
        setData(cached)
        setLoading(false)
        return
      }

      // Fetch fresh data
      const freshData = await fetcher()
      
      // Cache the result
      if (options.ttl) {
        globalCache.set(key, freshData, options.ttl)
      }
      
      setData(freshData)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data')
      setError(error)
      options.onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, options.enabled, options.ttl, options.onError])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  const invalidateCache = useCallback(() => {
    globalCache.delete(key)
  }, [key])

  return {
    data,
    loading,
    error,
    refetch,
    invalidateCache
  }
} 