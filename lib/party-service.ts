import { supabase } from './supabase'
import type { Party, Invite, CoHost, LocationTag, UserTag } from '@/types/party'

// Party management service
export const partyService = {
  // Get all parties for a user
  async getParties(userId: string) {
    try {
      console.log('🔍 Fetching parties from Supabase for user:', userId)
      
      // Use sync service to get user profile for proper filtering
      const userProfile = await partyService.getUserProfile(userId)
      const userName = userProfile?.name || userId
      
      console.log('🔍 User profile from sync service:', userProfile)
      console.log('🔍 Using user name for filtering:', userName)
      
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .neq('status', 'draft')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }
      
      console.log('🔍 Raw parties data from Supabase:', data)
      
      // Filter parties where the user is a host (by name)
      const userParties = (data || []).filter(party => {
        const hosts = party.hosts || []
        console.log(`🔍 Checking party "${party.name}" with hosts:`, hosts)
        const isHost = hosts.some((host: string) => host === userName)
        console.log(`🔍 Is user "${userName}" a host? ${isHost}`)
        return isHost
      })
      
      console.log('✅ Filtered parties for user:', userParties)
      
      // Convert database fields to frontend format
      const convertedParties = userParties.map(party => ({
        ...party,
        locationTags: party?.location_tags || [],
        userTags: party?.user_tags || [],
        coHosts: party?.co_hosts || [],
        requireApproval: party?.require_approval || false,
        createdAt: party?.created_at,
        updatedAt: party?.updated_at
      }))
      
      console.log('✅ Converted parties:', convertedParties)
      return convertedParties
    } catch (error) {
      console.error('❌ Error fetching parties:', error)
      return []
    }
  },

  // Get all drafts for a user
  async getDrafts(userId: string) {
    try {
      console.log('Fetching drafts from Supabase for user:', userId)
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      console.log('Raw drafts data from Supabase:', data)
      
      // Get user name from localStorage to filter drafts
      const storedUsers = localStorage.getItem('fomo-users')
      const users = storedUsers ? JSON.parse(storedUsers) : {}
      const currentUser = users[userId]
      const userName = currentUser?.name || userId
      
      // Filter drafts where the user is a host (by name)
      const userDrafts = (data || []).filter(party => {
        const hosts = party.hosts || []
        return hosts.some((host: string) => host === userName)
      })
      
      console.log('Filtered drafts for user:', userDrafts)
      
      // Convert database fields to frontend format
      return userDrafts.map(party => ({
        ...party,
        locationTags: party?.location_tags || [],
        userTags: party?.user_tags || [],
        coHosts: party?.co_hosts || [],
        requireApproval: party?.require_approval || false,
        createdAt: party?.created_at,
        updatedAt: party?.updated_at
      }))
    } catch (error) {
      console.error('Error fetching drafts:', error)
      return []
    }
  },
  
  // Create a new party
  async createParty(party: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      console.log('Creating party with data:', party)
      const now = new Date().toISOString()
      
      // Generate a proper UUID
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0
          const v = c === 'x' ? r : (r & 0x3 | 0x8)
          return v.toString(16)
        })
      }
      
      const partyWithTimestamp = {
        id: generateUUID(),
        name: party.name,
        date: party.date,
        time: party.time,
        location: party.location,
        description: party.description,
        hosts: party.hosts || [],
        status: party.status || 'draft',
        created_at: now,
        updated_at: now,
      }
      
      console.log('Party data for database:', partyWithTimestamp)
      
      const { data, error } = await supabase
        .from('parties')
        .insert(partyWithTimestamp)
        .select()
      
      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }
      
      console.log('Party created successfully:', data[0])
      
      // Convert back to camelCase for frontend
      const convertedParty = {
        ...data[0],
        attendees: data[0]?.attendees || 0,
        hosts: data[0]?.hosts || ["unknown"],
        locationTags: data[0]?.location_tags || [],
        userTags: data[0]?.user_tags || [],
        coHosts: data[0]?.co_hosts || [],
        requireApproval: data[0]?.require_approval || false,
        invites: data[0]?.invites || [],
        createdAt: data[0]?.created_at,
        updatedAt: data[0]?.updated_at
      }
      
      console.log('Converted party for frontend:', convertedParty)
      return convertedParty
    } catch (error) {
      console.error('Error creating party:', error)
      throw error
    }
  },
  
  // Update a party
  async updateParty(id: string, updates: Partial<Party>) {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {
        updated_at: new Date().toISOString()
      }
      
      if (updates.name !== undefined) dbUpdates.name = updates.name
      if (updates.date !== undefined) dbUpdates.date = updates.date
      if (updates.time !== undefined) dbUpdates.time = updates.time
      if (updates.location !== undefined) dbUpdates.location = updates.location
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.attendees !== undefined) dbUpdates.attendees = updates.attendees
      if (updates.hosts !== undefined) dbUpdates.hosts = updates.hosts
      if (updates.status !== undefined) dbUpdates.status = updates.status
      
      // Only include these fields if they exist in the database schema
      // Commenting out fields that don't exist in the current schema
      // if (updates.locationTags !== undefined) dbUpdates.location_tags = updates.locationTags
      // if (updates.userTags !== undefined) dbUpdates.user_tags = updates.userTags
      // if (updates.invites !== undefined) dbUpdates.invites = updates.invites
      // if (updates.coHosts !== undefined) dbUpdates.co_hosts = updates.coHosts
      // if (updates.requireApproval !== undefined) dbUpdates.require_approval = updates.requireApproval
      
      const { data, error } = await supabase
        .from('parties')
        .update(dbUpdates)
        .eq('id', id)
        .select()
      
      if (error) throw error
      
      // Convert back to camelCase for frontend
      return {
        ...data[0],
        locationTags: data[0]?.location_tags || [],
        userTags: data[0]?.user_tags || [],
        coHosts: data[0]?.co_hosts || [],
        requireApproval: data[0]?.require_approval || false,
        createdAt: data[0]?.created_at,
        updatedAt: data[0]?.updated_at
      }
    } catch (error) {
      console.error('Error updating party:', error)
      throw error
    }
  },
  
  // Delete a party
  async deleteParty(id: string) {
    try {
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting party:', error)
      throw error
    }
  },

  // Complete a party
  async completeParty(id: string) {
    try {
      const { data, error } = await supabase
        .from('parties')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error completing party:', error)
      throw error
    }
  },

  // Cancel a party
  async cancelParty(id: string, cancelledBy: string) {
    try {
      const { data, error } = await supabase
        .from('parties')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancelled_by: cancelledBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error cancelling party:', error)
      throw error
    }
  },

  // Get party status with time calculations
  async getPartyStatus(id: string) {
    try {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      const party = data
      const now = new Date()
      const startDate = new Date(`${party.date} ${party.time}`)
      const endDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000)) // 24 hours after start
      
      let calculatedStatus = party.status
      
      // Auto-calculate status if needed
      if (party.status === 'upcoming' && now >= startDate) {
        calculatedStatus = 'live'
      } else if (party.status === 'live' && now >= endDate) {
        calculatedStatus = 'completed'
      }
      
      return {
        ...party,
        calculatedStatus,
        startDate,
        endDate,
        isOverdue: party.status === 'live' && now >= endDate
      }
    } catch (error) {
      console.error('Error getting party status:', error)
      throw error
    }
  },
  
  // Subscribe to changes in the parties table for real-time updates
  subscribeToParties(callback: (payload: any) => void) {
    return supabase
      .channel('public:parties')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'parties' }, 
        payload => {
          callback(payload)
        }
      )
      .subscribe()
  },
  
  // Migrate existing localStorage data to Supabase
  async migrateFromLocalStorage(userId: string) {
    try {
      // Get parties from localStorage
      const localParties = JSON.parse(localStorage.getItem(`fomo-parties-${userId}`) || '[]')
      const localDrafts = JSON.parse(localStorage.getItem(`fomo-drafts-${userId}`) || '[]')
      
      const allParties = [...localParties, ...localDrafts]
      
      if (!allParties.length) return []
      
      // Convert localStorage parties to database format
      const partiesForDatabase = allParties.map(party => ({
        id: party.id,
        name: party.name,
        date: party.date,
        time: party.time,
        location: party.location,
        description: party.description,
        hosts: party.hosts || [],
        status: party.status || 'draft',
        created_at: party.createdAt || new Date().toISOString(),
        updated_at: party.updatedAt || new Date().toISOString()
      }))
      
      // Insert all parties into Supabase
      const { data, error } = await supabase
        .from('parties')
        .insert(partiesForDatabase)
        .select()
      
      if (error) throw error
      
      // Clear localStorage after successful migration
      localStorage.removeItem(`fomo-parties-${userId}`)
      localStorage.removeItem(`fomo-drafts-${userId}`)
      
      // Convert back to frontend format
      return data.map(party => ({
        ...party,
        locationTags: party?.location_tags || [],
        userTags: party?.user_tags || [],
        coHosts: party?.co_hosts || [],
        requireApproval: party?.require_approval || false,
        createdAt: party?.created_at,
        updatedAt: party?.updated_at
      }))
    } catch (error) {
      console.error('Error migrating parties from localStorage:', error)
      throw error
    }
  },

  // Get user profile from localStorage
  async getUserProfile(userId: string) {
    const storedUsers = localStorage.getItem('fomo-users')
    const users = storedUsers ? JSON.parse(storedUsers) : {}
    return users[userId] || null
  }
}

// Post management service
export const postService = {
  // Get posts for a specific party
  async getPosts(partyId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('party_id', partyId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Convert timestamp strings back to Date objects
      return (data || []).map(post => ({
        ...post,
        userId: post.user_id,
        userName: post.user_name,
        userUsername: post.user_username,
        userAvatar: post.user_avatar,
        gifUrl: post.gif_url,
        userReposted: post.user_reposted,
        timestamp: new Date(post.created_at)
      }))
    } catch (error) {
      console.error('Error fetching posts:', error)
      return []
    }
  },

  // Create a new post
  async createPost(post: any, partyId: string) {
    try {
      const postData = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        party_id: partyId,
        user_id: post.userId,
        user_name: post.userName,
        user_username: post.userUsername,
        user_avatar: post.userAvatar,
        content: post.content,
        media: post.media,
        gif_url: post.gifUrl,
        tags: post.tags || [],
        poll: post.poll,
        location: post.location,
        reactions: post.reactions || [],
        comments: post.comments || [],
        reposts: post.reposts || 0,
        user_reposted: post.userReposted || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('posts')
        .insert(postData)
        .select()
      
      if (error) throw error
      
      // Convert back to frontend format
      return {
        ...data[0],
        userId: data[0].user_id,
        userName: data[0].user_name,
        userUsername: data[0].user_username,
        userAvatar: data[0].user_avatar,
        gifUrl: data[0].gif_url,
        userReposted: data[0].user_reposted,
        timestamp: new Date(data[0].created_at)
      }
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  },

  // Subscribe to post changes
  subscribeToPosts(partyId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`posts:${partyId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts',
          filter: `party_id=eq.${partyId}`
        }, 
        payload => {
          callback(payload)
        }
      )
      .subscribe()
  },

  // Migrate posts from localStorage
  async migratePostsFromLocalStorage(partyId: string, userId: string) {
    try {
      const postsKey = `posts_${partyId}_${userId}`
      const localPosts = JSON.parse(localStorage.getItem(postsKey) || '[]')
      
      if (!localPosts.length) return []
      
      // Convert localStorage posts to database format
      const postsForDatabase = localPosts.map((post: any) => ({
        id: post.id,
        party_id: partyId,
        user_id: post.userId,
        user_name: post.userName,
        user_username: post.userUsername,
        user_avatar: post.userAvatar,
        content: post.content,
        media: post.media,
        gif_url: post.gifUrl,
        tags: post.tags || [],
        poll: post.poll,
        location: post.location,
        reactions: post.reactions || [],
        comments: post.comments || [],
        reposts: post.reposts || 0,
        user_reposted: post.userReposted || false,
        created_at: post.timestamp || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))
      
      const { data, error } = await supabase
        .from('posts')
        .insert(postsForDatabase)
        .select()
      
      if (error) throw error
      
      // Clear localStorage after successful migration
      localStorage.removeItem(postsKey)
      
      // Convert back to frontend format
      return data.map(post => ({
        ...post,
        userId: post.user_id,
        userName: post.user_name,
        userUsername: post.user_username,
        userAvatar: post.user_avatar,
        gifUrl: post.gif_url,
        userReposted: post.user_reposted,
        timestamp: new Date(post.created_at)
      }))
    } catch (error) {
      console.error('Error migrating posts from localStorage:', error)
      throw error
    }
  }
} 