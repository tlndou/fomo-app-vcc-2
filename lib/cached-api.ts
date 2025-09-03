import { globalCache, CACHE_TTL, CACHE_KEYS } from './memory-cache'
import { supabase } from './supabase'

// Types for cached data
export interface UserProfile {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  bio?: string
  created_at: string
  updated_at: string
}

export interface Party {
  id: string
  title: string
  description?: string
  location?: string
  date: string
  host_id: string
  created_at: string
  updated_at: string
}

export interface UserFriend {
  id: string
  username: string
  full_name: string
  avatar_url?: string
  status: 'pending' | 'accepted' | 'blocked'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  notifications_enabled: boolean
  privacy_level: 'public' | 'friends' | 'private'
}

/**
 * Cached user profile retrieval
 */
export async function getCachedUserProfile(userId: string): Promise<UserProfile | null> {
  const cacheKey = CACHE_KEYS.userProfile(userId)
  
  // Try cache first
  const cached = globalCache.get<UserProfile>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Fetch from API
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    // Cache the result
    globalCache.set(cacheKey, data, CACHE_TTL.USER_PROFILE)
    return data
  } catch (error) {
    console.error('Error in getCachedUserProfile:', error)
    return null
  }
}

/**
 * Cached user parties retrieval
 */
export async function getCachedUserParties(userId: string): Promise<Party[]> {
  const cacheKey = CACHE_KEYS.userParties(userId)
  
  // Try cache first
  const cached = globalCache.get<Party[]>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Fetch from API
    const { data, error } = await supabase
      .from('parties')
      .select('*')
      .eq('host_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user parties:', error)
      return []
    }

    // Cache the result
    globalCache.set(cacheKey, data || [], CACHE_TTL.USER_PARTIES)
    return data || []
  } catch (error) {
    console.error('Error in getCachedUserParties:', error)
    return []
  }
}

/**
 * Cached party details retrieval
 */
export async function getCachedPartyDetails(partyId: string): Promise<Party | null> {
  const cacheKey = CACHE_KEYS.partyDetails(partyId)
  
  // Try cache first
  const cached = globalCache.get<Party>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Fetch from API
    const { data, error } = await supabase
      .from('parties')
      .select('*')
      .eq('id', partyId)
      .single()

    if (error) {
      console.error('Error fetching party details:', error)
      return null
    }

    // Cache the result
    globalCache.set(cacheKey, data, CACHE_TTL.PARTY_DETAILS)
    return data
  } catch (error) {
    console.error('Error in getCachedPartyDetails:', error)
    return null
  }
}

/**
 * Cached user friends retrieval
 */
export async function getCachedUserFriends(userId: string): Promise<UserFriend[]> {
  const cacheKey = CACHE_KEYS.userFriends(userId)
  
  // Try cache first
  const cached = globalCache.get<UserFriend[]>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Fetch from API - this is a simplified example
    // You'll need to adjust based on your actual friends table structure
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        id,
        friend:profiles!friendships_friend_id_fkey(
          id,
          username,
          full_name,
          avatar_url
        ),
        status
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')

    if (error) {
      console.error('Error fetching user friends:', error)
      return []
    }

    // Transform the data to match UserFriend interface
    const friends: UserFriend[] = data?.map((item: any) => {
      // Handle case where friend might be an array or null
      const friend = Array.isArray(item.friend) ? item.friend[0] : item.friend
      
      if (!friend) {
        console.warn('Friend data is missing for item:', item)
        return null
      }
      
      return {
        id: friend.id,
        username: friend.username,
        full_name: friend.full_name,
        avatar_url: friend.avatar_url,
        status: item.status
      }
    }).filter(Boolean) as UserFriend[] || []

    // Cache the result
    globalCache.set(cacheKey, friends, CACHE_TTL.USER_FRIENDS)
    return friends
  } catch (error) {
    console.error('Error in getCachedUserFriends:', error)
    return []
  }
}

/**
 * Cached user preferences retrieval
 */
export async function getCachedUserPreferences(userId: string): Promise<UserPreferences | null> {
  const cacheKey = CACHE_KEYS.userPreferences(userId)
  
  // Try cache first
  const cached = globalCache.get<UserPreferences>(cacheKey)
  if (cached) {
    return cached
  }

  try {
    // Fetch from API
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user preferences:', error)
      return null
    }

    // Cache the result
    globalCache.set(cacheKey, data, CACHE_TTL.USER_PREFERENCES)
    return data
  } catch (error) {
    console.error('Error in getCachedUserPreferences:', error)
    return null
  }
}

/**
 * Update user profile and invalidate cache
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      console.error('Error updating user profile:', error)
      return false
    }

    // Invalidate cache
    globalCache.delete(CACHE_KEYS.userProfile(userId))
    return true
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return false
  }
}

/**
 * Create party and invalidate cache
 */
export async function createParty(partyData: Omit<Party, 'id' | 'created_at' | 'updated_at'>): Promise<Party | null> {
  try {
    const { data, error } = await supabase
      .from('parties')
      .insert(partyData)
      .select()
      .single()

    if (error) {
      console.error('Error creating party:', error)
      return null
    }

    // Invalidate user parties cache
    globalCache.delete(CACHE_KEYS.userParties(partyData.host_id))
    return data
  } catch (error) {
    console.error('Error in createParty:', error)
    return null
  }
}

/**
 * Update party and invalidate cache
 */
export async function updateParty(partyId: string, updates: Partial<Party>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('parties')
      .update(updates)
      .eq('id', partyId)

    if (error) {
      console.error('Error updating party:', error)
      return false
    }

    // Invalidate caches
    globalCache.delete(CACHE_KEYS.partyDetails(partyId))
    // Note: You might want to invalidate user parties cache too
    return true
  } catch (error) {
    console.error('Error in updateParty:', error)
    return false
  }
}

/**
 * Delete party and invalidate cache
 */
export async function deleteParty(partyId: string, hostId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('parties')
      .delete()
      .eq('id', partyId)

    if (error) {
      console.error('Error deleting party:', error)
      return false
    }

    // Invalidate caches
    globalCache.delete(CACHE_KEYS.partyDetails(partyId))
    globalCache.delete(CACHE_KEYS.userParties(hostId))
    return true
  } catch (error) {
    console.error('Error in deleteParty:', error)
    return false
  }
}

/**
 * Clear all cache when user logs out
 */
export function clearUserCache(userId: string): void {
  globalCache.delete(CACHE_KEYS.userProfile(userId))
  globalCache.delete(CACHE_KEYS.userParties(userId))
  globalCache.delete(CACHE_KEYS.userFriends(userId))
  globalCache.delete(CACHE_KEYS.userPreferences(userId))
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats() {
  return {
    size: globalCache.size(),
    stats: globalCache.getStats(),
    hitRate: globalCache.getHitRate(),
    keys: globalCache.getKeys(),
    contents: globalCache.getContents()
  }
} 