"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Party, Invite } from '@/types/party'
import { useAuth } from '@/context/auth-context'
import { partyService } from '@/lib/party-service'
import { supabase } from '@/lib/supabase'

interface PartyContextType {
  parties: Party[]
  drafts: Party[]
  addParty: (party: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateParty: (id: string, updates: Partial<Party>) => Promise<void>
  deleteParty: (id: string) => Promise<void>
  saveDraft: (draft: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateDraft: (id: string, updates: Partial<Party>) => Promise<void>
  deleteDraft: (id: string) => Promise<void>
  publishDraft: (id: string) => Promise<void>
  getPartyById: (id: string) => Party | undefined
  getDraftById: (id: string) => Party | undefined
  completeParty: (id: string) => Promise<void>
  exportData: () => string
  importData: (data: string) => boolean
  migrateFromLocalStorage: () => Promise<void>
  // New optimistic update methods
  optimisticAddParty: (party: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) => void
  optimisticUpdateParty: (id: string, updates: Partial<Party>) => void
  optimisticDeleteParty: (id: string) => void
  isAddingParty: boolean
  isUpdatingParty: boolean
  isDeletingParty: boolean
  debugParties: () => void
  // Host permission and management functions
  isHostOfParty: (party: Party, userId?: string) => boolean
  canEditParty: (party: Party, userId?: string) => boolean
  canCancelParty: (party: Party, userId?: string) => boolean
  canEndPartyEarly: (party: Party, userId?: string) => boolean
  endPartyEarly: (id: string) => Promise<Party>
  cancelParty: (id: string) => Promise<Party>
}

const PartyContext = createContext<PartyContextType | undefined>(undefined)

export function useParties() {
  const context = useContext(PartyContext)
  if (context === undefined) {
    throw new Error('useParties must be used within a PartyProvider')
  }
  return context
}

interface PartyProviderProps {
  children: ReactNode
}

export function PartyProvider({ children }: PartyProviderProps) {
  const [parties, setParties] = useState<Party[]>([])
  const [drafts, setDrafts] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Load parties and drafts from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // Step 4: Check if we need to migrate from localStorage
        const hasLocalParties = localStorage.getItem(`fomo-parties-${user.id}`)
        const hasLocalDrafts = localStorage.getItem(`fomo-drafts-${user.id}`)
        
        if (hasLocalParties || hasLocalDrafts) {
          console.log('Migrating data from localStorage to Supabase...')
          try {
            await migrateFromLocalStorage()
            console.log('Migration completed successfully')
          } catch (error) {
            console.error('Migration failed:', error)
            // Continue loading data even if migration fails
          }
        }
        
        // Load parties and drafts from Supabase
        console.log('Loading parties and drafts from Supabase...')
        const [partiesData, draftsData] = await Promise.all([
          partyService.getParties(user.id),
          partyService.getDrafts(user.id)
        ])
        
        console.log('Loaded parties:', partiesData.length, 'drafts:', draftsData.length)
        
        // If no parties found, try loading all parties as fallback
        if (partiesData.length === 0) {
          console.log('⚠️ No parties found with user filtering, trying fallback...')
          try {
            const { data: allParties } = await supabase
              .from('parties')
              .select('*')
              .neq('status', 'draft')
              .order('created_at', { ascending: false })
            
            if (allParties && allParties.length > 0) {
              console.log('🔍 Found parties in fallback:', allParties)
              // Convert and use all parties as fallback
              const fallbackParties = allParties.map((party: any) => ({
                ...party,
                locationTags: party.location_tags,
                userTags: party.user_tags,
                coHosts: party.co_hosts,
                requireApproval: party.require_approval,
                createdAt: party.created_at,
                updatedAt: party.updated_at
              }))
              setParties(fallbackParties)
            } else {
              setParties(partiesData)
            }
          } catch (fallbackError) {
            console.error('Fallback loading failed:', fallbackError)
            setParties(partiesData)
          }
        } else {
          setParties(partiesData)
        }
        
        setDrafts(draftsData)
        
        // Step 5: Enable real-time updates with subscription
        console.log('Setting up real-time subscriptions...')
        try {
          const subscription = partyService.subscribeToParties((payload) => {
            try {
              console.log('Real-time update received:', payload)
              
              // Convert database fields to frontend format
              const convertParty = (party: any) => ({
                ...party,
                locationTags: party.location_tags,
                userTags: party.user_tags,
                coHosts: party.co_hosts,
                requireApproval: party.require_approval,
                createdAt: party.created_at,
                updatedAt: party.updated_at
              })
              
              if (payload.eventType === 'INSERT') {
                const newParty = convertParty(payload.new)
                if (newParty.status === 'draft') {
                  setDrafts(prev => [newParty, ...prev])
                } else {
                  setParties(prev => [newParty, ...prev])
                }
              } else if (payload.eventType === 'UPDATE') {
                const updatedParty = convertParty(payload.new)
                if (updatedParty.status === 'draft') {
                  setDrafts(prev => prev.map(draft => draft.id === updatedParty.id ? updatedParty : draft))
                } else {
                  setParties(prev => prev.map(party => party.id === updatedParty.id ? updatedParty : party))
                }
              } else if (payload.eventType === 'DELETE') {
                const deletedParty = payload.old
                setParties(prev => prev.filter(party => party.id !== deletedParty.id))
                setDrafts(prev => prev.filter(draft => draft.id !== deletedParty.id))
              }
            } catch (error) {
              console.error('Error handling real-time update:', error)
            }
          })
          
          return () => {
            console.log('Cleaning up real-time subscription...')
            try {
              subscription.unsubscribe()
            } catch (error) {
              console.error('Error unsubscribing from real-time updates:', error)
            }
          }
        } catch (error) {
          console.error('Error setting up real-time subscription:', error)
        }
      } catch (error) {
        console.error('Error loading parties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  // Update party status based on start date and auto-completion
  useEffect(() => {
    const updatePartyStatus = () => {
      try {
        const now = new Date()
        const updatedParties = parties.map(party => {
          try {
            // Skip status transitions for cancelled and completed parties - they are final states
            if (party.status === 'cancelled' || party.status === 'completed') {
              return party
            }
            
            const startDate = new Date(`${party.date} ${party.time}`)
            const endDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000)) // 24 hours after start
            
            // Auto-complete parties that have been live for 24+ hours
            if (party.status === 'live' && now >= endDate) {
              console.log(`🔄 Auto-completing party: ${party.name} (24 hours elapsed)`)
              return { ...party, status: 'completed' as const }
            }
            
            // Transition upcoming parties to live when start time is reached
            // Note: cancelled parties cannot transition to live (they stay cancelled)
            if (party.status === 'upcoming' && now >= startDate) {
              console.log(`🔄 Starting party: ${party.name} (start time reached)`)
              
              // Update user stats for hosts when party starts
              const hosts = party.hosts || []
              const userStatsData = localStorage.getItem('fomo-user-stats')
              const userStats = userStatsData ? JSON.parse(userStatsData) : {}
              
              // Increment hosted parties count for each host
              hosts.forEach((hostName: string) => {
                if (!userStats[hostName]) {
                  userStats[hostName] = { hostedParties: 0, attendedParties: 0, friendCount: 0 }
                }
                userStats[hostName].hostedParties += 1
                console.log(`✅ Incremented hosted parties for ${hostName}: ${userStats[hostName].hostedParties}`)
              })
              
              // Save updated stats
              localStorage.setItem('fomo-user-stats', JSON.stringify(userStats))
              
              return { ...party, status: 'live' as const }
            }
            
            return party
          } catch (error) {
            console.error('Error updating party status:', error)
            return party
          }
        })
        
        // Only update if there are changes
        const hasChanges = updatedParties.some((party, index) => party.status !== parties[index]?.status)
        if (hasChanges) {
          // Update local state immediately for UI responsiveness
          setParties(updatedParties)
          console.log('✅ Updated party statuses:', updatedParties.map(p => ({ name: p.name, status: p.status })))
          
          // Persist status changes to Supabase database
          updatedParties.forEach(async (party, index) => {
            if (party.status !== parties[index]?.status) {
              try {
                console.log(`💾 Persisting status change for ${party.name}: ${parties[index]?.status} → ${party.status}`)
                await partyService.updateParty(party.id, { status: party.status })
                console.log(`✅ Successfully persisted ${party.name} status to database`)
              } catch (error) {
                console.error(`❌ Failed to persist status change for ${party.name}:`, error)
                // Note: We don't revert the local state change since the user still sees the correct status
                // The next app reload will show the correct calculated status anyway
              }
            }
          })
        }
      } catch (error) {
        console.error('Error in updatePartyStatus:', error)
      }
    }

    // Run immediately
    updatePartyStatus()
    
    // Then run every 30 minutes
    const interval = setInterval(updatePartyStatus, 30 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [parties])

  // Helper function to update user stats when party is completed
  const updatePartyStats = async (party: Party) => {
    try {
      const hosts = party.hosts || []
      const attendees = party.invites?.map((invite: Invite) => invite.name) || []

      // Get current user stats from localStorage
      const userStatsData = localStorage.getItem('fomo-user-stats')
      const userStats = userStatsData ? JSON.parse(userStatsData) : {}

      // Update stats for hosts
      hosts.forEach((hostName: string) => {
        if (!userStats[hostName]) {
          userStats[hostName] = { hostedParties: 0, attendedParties: 0, friendCount: 0 }
        }
        userStats[hostName].hostedParties += 1
      })

      // Update stats for attendees (but not hosts to avoid double counting)
      attendees.forEach((attendeeName: string) => {
        if (!hosts.includes(attendeeName)) {
          if (!userStats[attendeeName]) {
            userStats[attendeeName] = { hostedParties: 0, attendedParties: 0, friendCount: 0 }
          }
          userStats[attendeeName].attendedParties += 1
        }
      })

      // Save updated stats
      localStorage.setItem('fomo-user-stats', JSON.stringify(userStats))
      
      console.log('✅ Updated user stats for auto-completed party:', party.name)
    } catch (error) {
      console.error('Error updating party stats:', error)
    }
  }

  const addParty = async (partyData: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Create a temporary party with optimistic data
      const tempParty: Party = {
        id: `temp-${Date.now()}`,
        ...partyData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Optimistically add to local state immediately
      setParties(prev => [tempParty, ...prev])
      
      // Create the party in Supabase
      const newParty = await partyService.createParty(partyData)
      
      // Replace the temporary party with the real one
      setParties(prev => prev.map(party => 
        party.id === tempParty.id ? newParty : party
      ))
      
      console.log('✅ Party created and added to state:', newParty)
    } catch (error) {
      console.error('Error adding party:', error)
      // Remove the temporary party on error
      setParties(prev => prev.filter(party => !party.id.startsWith('temp-')))
      throw error
    }
  }

  const updateParty = async (id: string, updates: Partial<Party>) => {
    try {
      const updatedParty = await partyService.updateParty(id, updates)
      setParties(prev => prev.map(party => 
        party.id === id ? updatedParty : party
      ))
    } catch (error) {
      console.error('Error updating party:', error)
      throw error
    }
  }

  const deleteParty = async (id: string) => {
    try {
      await partyService.deleteParty(id)
      setParties(prev => prev.filter(party => party.id !== id))
    } catch (error) {
      console.error('Error deleting party:', error)
      throw error
    }
  }

  const saveDraft = async (draftData: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Create a temporary draft with optimistic data
      const tempDraft: Party = {
        id: `temp-draft-${Date.now()}`,
        ...draftData,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Optimistically add to local state immediately
      setDrafts(prev => [tempDraft, ...prev])
      
      // Create the draft in Supabase
      const newDraft = await partyService.createParty({
        ...draftData,
        status: 'draft'
      })
      
      // Replace the temporary draft with the real one
      setDrafts(prev => prev.map(draft => 
        draft.id === tempDraft.id ? newDraft : draft
      ))
      
      console.log('✅ Draft saved and added to state:', newDraft)
    } catch (error) {
      console.error('Error saving draft:', error)
      // Remove the temporary draft on error
      setDrafts(prev => prev.filter(draft => !draft.id.startsWith('temp-draft-')))
      throw error
    }
  }

  const updateDraft = async (id: string, updates: Partial<Party>) => {
    try {
      const updatedDraft = await partyService.updateParty(id, updates)
      setDrafts(prev => prev.map(draft => 
        draft.id === id ? updatedDraft : draft
      ))
    } catch (error) {
      console.error('Error updating draft:', error)
      throw error
    }
  }

  const deleteDraft = async (id: string) => {
    try {
      await partyService.deleteParty(id)
      setDrafts(prev => prev.filter(draft => draft.id !== id))
    } catch (error) {
      console.error('Error deleting draft:', error)
      throw error
    }
  }

  const publishDraft = async (id: string) => {
    try {
      const draft = drafts.find(d => d.id === id)
      if (draft) {
        const publishedParty = await partyService.updateParty(id, {
          status: 'upcoming'
        })
        
        setParties(prev => [publishedParty, ...prev])
        setDrafts(prev => prev.filter(d => d.id !== id))
      }
    } catch (error) {
      console.error('Error publishing draft:', error)
      throw error
    }
  }

  const getPartyById = (id: string) => {
    return parties.find(party => party.id === id)
  }

  const getDraftById = (id: string) => {
    return drafts.find(draft => draft.id === id)
  }

  const completeParty = async (id: string) => {
    try {
      const completedParty = await partyService.completeParty(id)
      
      // Update user stats for attendees only (hosts already got credit when party started)
      const attendees = completedParty.invites?.map((invite: Invite) => invite.name) || []

      // Get current user stats from localStorage
      const userStatsData = localStorage.getItem('fomo-user-stats')
      const userStats = userStatsData ? JSON.parse(userStatsData) : {}

      // Update stats for attendees (but not hosts to avoid double counting)
      attendees.forEach((attendeeName: string) => {
        if (!userStats[attendeeName]) {
          userStats[attendeeName] = { hostedParties: 0, attendedParties: 0, friendCount: 0 }
        }
        userStats[attendeeName].attendedParties += 1
      })

      // Save updated stats
      localStorage.setItem('fomo-user-stats', JSON.stringify(userStats))
      
      // Update local state
      setParties(prev => prev.map(party => 
        party.id === id ? completedParty : party
      ))
    } catch (error) {
      console.error('Error completing party:', error)
      throw error
    }
  }

  const migrateFromLocalStorage = async () => {
    if (!user?.id) return
    
    try {
      await partyService.migrateFromLocalStorage(user.id)
    } catch (error) {
      console.error('Error migrating from localStorage:', error)
    }
  }

  const exportData = () => {
    const exportData = {
      parties,
      drafts,
      userStats: localStorage.getItem('fomo-user-stats'),
      friends: localStorage.getItem('fomo-friends'),
      users: localStorage.getItem('fomo-users'),
      timestamp: new Date().toISOString()
    }
    return JSON.stringify(exportData)
  }

  const importData = (data: string) => {
    try {
      const importData = JSON.parse(data)
      
      if (importData.parties) {
        setParties(importData.parties)
      }
      
      if (importData.drafts) {
        setDrafts(importData.drafts)
      }
      
      if (importData.userStats) {
        localStorage.setItem('fomo-user-stats', importData.userStats)
      }
      
      if (importData.friends) {
        localStorage.setItem('fomo-friends', importData.friends)
      }
      
      if (importData.users) {
        localStorage.setItem('fomo-users', importData.users)
      }
      
      return true
    } catch (error) {
      console.error('Failed to import data:', error)
      return false
    }
  }

  const debugParties = () => {
    console.log('🔍 Debug: Current parties state:', parties)
    console.log('🔍 Debug: Current drafts state:', drafts)
    console.log('🔍 Debug: Current user:', user)
    
    // Check localStorage for user data
    const storedUsers = localStorage.getItem('fomo-users')
    const users = storedUsers ? JSON.parse(storedUsers) : {}
    console.log('🔍 Debug: Stored users:', users)
    
    // Check if there are any parties in Supabase
    supabase
      .from('parties')
      .select('*')
      .then(({ data, error }: { data: any; error: any }) => {
        console.log('🔍 Debug: All parties in Supabase:', data)
        console.log('🔍 Debug: Supabase error:', error)
      })
  }

  // Host permission checking
  const isHostOfParty = (party: Party, userId?: string) => {
    if (!userId || !party.hosts) {
      return false
    }
    
    // Get current user data to check both ID and name
    const storedUsers = localStorage.getItem('fomo-users')
    const users = storedUsers ? JSON.parse(storedUsers) : {}
    const currentUser = users[userId]
    const userName = currentUser?.name || userId
    
    // Check if user is a host by ID or name
    const isHost = party.hosts.some(host => {
      const hostMatch = host === userId || 
                       host === userName || 
                       host.toLowerCase() === userId.toLowerCase() || 
                       host.toLowerCase() === userName.toLowerCase()
      
      return hostMatch
    })
    
    return isHost
  }

  const canEditParty = (party: Party, userId?: string) => {
    if (!userId) {
      return false
    }
    const isHost = isHostOfParty(party, userId)
    const canEdit = isHost && (party.status === 'upcoming' || party.status === 'live')
    return canEdit
  }

  const canCancelParty = (party: Party, userId?: string) => {
    if (!userId) {
      return false
    }
    const isHost = isHostOfParty(party, userId)
    const canCancel = isHost && party.status === 'upcoming'
    return canCancel
  }

  const canEndPartyEarly = (party: Party, userId?: string) => {
    if (!userId) {
      return false
    }
    const isHost = isHostOfParty(party, userId)
    // Only live parties can be ended early (upcoming parties should be cancelled instead)
    const canEndEarly = isHost && party.status === 'live'
    return canEndEarly
  }

  // Enhanced party management methods
  const endPartyEarly = async (id: string) => {
    try {
      const party = parties.find(p => p.id === id)
      if (!party) throw new Error('Party not found')
      
      if (!canEndPartyEarly(party, user?.id)) {
        throw new Error('You do not have permission to end this party')
      }

      const completedParty = await partyService.completeParty(id)
      
      // Update user stats
      await updatePartyStats(completedParty)
      
      // Update local state
      setParties(prev => prev.map(party => 
        party.id === id ? completedParty : party
      ))

      console.log('✅ Party ended early:', completedParty.name)
      return completedParty
    } catch (error) {
      console.error('Error ending party early:', error)
      throw error
    }
  }

  const cancelParty = async (id: string) => {
    try {
      const party = parties.find(p => p.id === id)
      if (!party) throw new Error('Party not found')
      
      if (!canCancelParty(party, user?.id)) {
        throw new Error('You do not have permission to cancel this party')
      }

      const cancelledParty = await partyService.updateParty(id, { 
        status: 'cancelled'
      })
      
      // Update local state
      setParties(prev => prev.map(party => 
        party.id === id ? cancelledParty : party
      ))

      console.log('✅ Party cancelled:', cancelledParty.name)
      return cancelledParty
    } catch (error) {
      console.error('Error cancelling party:', error)
      throw error
    }
  }

  const value: PartyContextType = {
    parties,
    drafts,
    addParty,
    updateParty,
    deleteParty,
    saveDraft,
    updateDraft,
    deleteDraft,
    publishDraft,
    getPartyById,
    getDraftById,
    completeParty,
    exportData,
    importData,
    migrateFromLocalStorage,
    optimisticAddParty: () => {},
    optimisticUpdateParty: () => {},
    optimisticDeleteParty: () => {},
    isAddingParty: false,
    isUpdatingParty: false,
    isDeletingParty: false,
    debugParties,
    isHostOfParty,
    canEditParty,
    canCancelParty,
    canEndPartyEarly,
    endPartyEarly,
    cancelParty,
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <PartyContext.Provider value={value}>
      {children}
    </PartyContext.Provider>
  )
} 