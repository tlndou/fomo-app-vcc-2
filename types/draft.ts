import type { Post, Poll } from './feed'

export type DraftStatus = 'draft' | 'uploading' | 'failed' | 'uploaded'

export interface DraftPost {
  id: string
  content: string
  media?: { url: string; type: 'image' | 'video' }
  tags: string[]
  presetTag?: string | null
  location?: string
  poll?: Poll
  gifUrl?: string
  quotedPost?: Post
  timestamp: Date
  status: DraftStatus
  errorMessage?: string
  retryCount: number
  lastAttempt?: Date
}

export interface DraftState {
  drafts: DraftPost[]
  isSyncing: boolean
  syncProgress: number
  lastSyncAttempt?: Date
}

export interface DraftActions {
  addDraft: (draft: Omit<DraftPost, 'id' | 'timestamp' | 'status' | 'retryCount'>) => void
  updateDraft: (id: string, updates: Partial<DraftPost>) => void
  removeDraft: (id: string) => void
  retryDraft: (id: string) => void
  syncDrafts: () => Promise<void>
  clearUploadedDrafts: () => void
} 