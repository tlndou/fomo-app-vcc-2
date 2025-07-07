"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Party, Invite, CoHost, LocationTag, UserTag } from '@/types/party'
import { useAuth } from '@/context/auth-context'
import { partyService, postService } from '@/lib/party-service'

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
        
        // Check if we need to migrate from localStorage
        const hasLocalData = localStorage.getItem(`fomo-parties-${user.id}`) || localStorage.getItem(`fomo-drafts-${user.id}`)
        
        if (hasLocalData) {
          await migrateFromLocalStorage()
        }
        
        // Load parties and drafts from Supabase
        const [partiesData, draftsData] = await Promise.all([
          partyService.getParties(user.id),
          partyService.getDrafts(user.id)
        ])
        
        setParties(partiesData)
        setDrafts(draftsData)
        
        // Subscribe to real-time updates
        const subscription = partyService.subscribeToParties((payload) => {
          if (payload.eventType === 'INSERT') {
            const newParty = payload.new
            if (newParty.status === 'draft') {
              setDrafts(prev => [newParty, ...prev])
            } else {
              setParties(prev => [newParty, ...prev])
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedParty = payload.new
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
        })
        
        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        console.error('Error loading parties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  const addParty = async (partyData: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newParty = await partyService.createParty(partyData)
      setParties(prev => [newParty, ...prev])
    } catch (error) {
      console.error('Error adding party:', error)
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
      const newDraft = await partyService.createParty({
        ...draftData,
        status: 'draft'
      })
      setDrafts(prev => [newDraft, ...prev])
    } catch (error) {
      console.error('Error saving draft:', error)
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
      
      // Update user stats for hosts and attendees
      const hosts = completedParty.hosts
      const attendees = completedParty.invites?.map((invite: any) => invite.name) || []

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