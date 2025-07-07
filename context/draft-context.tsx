"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState } from 'react'
import type { DraftPost, DraftState, DraftActions } from '@/types/draft'
import { useOffline } from '@/hooks/use-offline'

type DraftAction =
  | { type: 'ADD_DRAFT'; payload: DraftPost }
  | { type: 'UPDATE_DRAFT'; payload: { id: string; updates: Partial<DraftPost> } }
  | { type: 'REMOVE_DRAFT'; payload: string }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_SYNC_PROGRESS'; payload: number }
  | { type: 'SET_LAST_SYNC_ATTEMPT'; payload: Date }
  | { type: 'CLEAR_UPLOADED_DRAFTS' }

const initialState: DraftState = {
  drafts: [],
  isSyncing: false,
  syncProgress: 0
}

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'ADD_DRAFT':
      return {
        ...state,
        drafts: [...state.drafts, action.payload]
      }
    
    case 'UPDATE_DRAFT':
      return {
        ...state,
        drafts: state.drafts.map(draft =>
          draft.id === action.payload.id
            ? { ...draft, ...action.payload.updates }
            : draft
        )
      }
    
    case 'REMOVE_DRAFT':
      return {
        ...state,
        drafts: state.drafts.filter(draft => draft.id !== action.payload)
      }
    
    case 'SET_SYNCING':
      return {
        ...state,
        isSyncing: action.payload
      }
    
    case 'SET_SYNC_PROGRESS':
      return {
        ...state,
        syncProgress: action.payload
      }
    
    case 'SET_LAST_SYNC_ATTEMPT':
      return {
        ...state,
        lastSyncAttempt: action.payload
      }
    
    case 'CLEAR_UPLOADED_DRAFTS':
      return {
        ...state,
        drafts: state.drafts.filter(draft => draft.status !== 'uploaded')
      }
    
    default:
      return state
  }
}

interface DraftContextType extends DraftState, DraftActions {}

const DraftContext = createContext<DraftContextType | undefined>(undefined)

export function DraftProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(draftReducer, initialState)
  const [isClient, setIsClient] = useState(false)
  
  // Only use offline hook on client side
  const offlineState = useOffline()
  const isOnline = isClient ? offlineState.isOnline : true

  // Set client flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load drafts from sessionStorage on mount (client-side only)
  useEffect(() => {
    if (!isClient) return
    
    try {
      const savedDrafts = sessionStorage.getItem('fomo-drafts')
      if (savedDrafts) {
        const drafts = JSON.parse(savedDrafts)
        drafts.forEach((draft: DraftPost) => {
          // Convert timestamp back to Date object
          draft.timestamp = new Date(draft.timestamp)
          if (draft.lastAttempt) {
            draft.lastAttempt = new Date(draft.lastAttempt)
          }
          dispatch({ type: 'ADD_DRAFT', payload: draft })
        })
      }
    } catch (error) {
      console.error('Failed to load drafts from sessionStorage:', error)
    }
  }, [isClient])

  // Save drafts to sessionStorage whenever drafts change (client-side only)
  useEffect(() => {
    if (!isClient) return
    
    try {
      sessionStorage.setItem('fomo-drafts', JSON.stringify(state.drafts))
    } catch (error) {
      console.error('Failed to save drafts to sessionStorage:', error)
    }
  }, [state.drafts, isClient])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && state.drafts.some(draft => draft.status === 'draft' || draft.status === 'failed')) {
      syncDrafts()
    }
  }, [isOnline])

  const addDraft = useCallback((draftData: Omit<DraftPost, 'id' | 'timestamp' | 'status' | 'retryCount'>) => {
    const newDraft: DraftPost = {
      ...draftData,
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'draft',
      retryCount: 0
    }
    dispatch({ type: 'ADD_DRAFT', payload: newDraft })
  }, [])

  const updateDraft = useCallback((id: string, updates: Partial<DraftPost>) => {
    dispatch({ type: 'UPDATE_DRAFT', payload: { id, updates } })
  }, [])

  const removeDraft = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_DRAFT', payload: id })
  }, [])

  const retryDraft = useCallback((id: string) => {
    const currentDraft = state.drafts.find(d => d.id === id)
    dispatch({ 
      type: 'UPDATE_DRAFT', 
      payload: { 
        id, 
        updates: { 
          status: 'draft' as const, 
          errorMessage: undefined,
          retryCount: (currentDraft?.retryCount || 0) + 1
        } 
      } 
    })
  }, [state.drafts])

  const syncDrafts = useCallback(async () => {
    const pendingDrafts = state.drafts.filter(draft => 
      draft.status === 'draft' || draft.status === 'failed'
    )

    if (pendingDrafts.length === 0) return

    dispatch({ type: 'SET_SYNCING', payload: true })
    dispatch({ type: 'SET_SYNC_PROGRESS', payload: 0 })
    dispatch({ type: 'SET_LAST_SYNC_ATTEMPT', payload: new Date() })

    try {
      for (let i = 0; i < pendingDrafts.length; i++) {
        const draft = pendingDrafts[i]
        
        // Update progress
        dispatch({ 
          type: 'SET_SYNC_PROGRESS', 
          payload: ((i + 1) / pendingDrafts.length) * 100 
        })

        // Mark as uploading
        dispatch({ 
          type: 'UPDATE_DRAFT', 
          payload: { 
            id: draft.id, 
            updates: { 
              status: 'uploading' as const,
              lastAttempt: new Date()
            } 
          } 
        })

        try {
          // Simulate API call - replace with actual upload logic
          await new Promise((resolve, reject) => {
            setTimeout(() => {
              // Simulate 90% success rate
              if (Math.random() > 0.1) {
                resolve(true)
              } else {
                reject(new Error('Upload failed'))
              }
            }, 1000 + Math.random() * 2000) // Random delay 1-3 seconds
          })

          // Mark as uploaded
          dispatch({ 
            type: 'UPDATE_DRAFT', 
            payload: { 
              id: draft.id, 
              updates: { 
                status: 'uploaded' as const,
                errorMessage: undefined
              } 
            } 
          })

        } catch (error) {
          // Mark as failed
          dispatch({ 
            type: 'UPDATE_DRAFT', 
            payload: { 
              id: draft.id, 
              updates: { 
                status: 'failed' as const,
                errorMessage: error instanceof Error ? error.message : 'Upload failed'
              } 
            } 
          })
        }
      }
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false })
    }
  }, [state.drafts])

  const clearUploadedDrafts = useCallback(() => {
    dispatch({ type: 'CLEAR_UPLOADED_DRAFTS' })
  }, [])

  const value: DraftContextType = {
    ...state,
    addDraft,
    updateDraft,
    removeDraft,
    retryDraft,
    syncDrafts,
    clearUploadedDrafts
  }

  return (
    <DraftContext.Provider value={value}>
      {children}
    </DraftContext.Provider>
  )
}

export function useDrafts() {
  const context = useContext(DraftContext)
  if (context === undefined) {
    throw new Error('useDrafts must be used within a DraftProvider')
  }
  return context
} 