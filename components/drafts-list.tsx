"use client"

import { useState } from 'react'
import { useDrafts } from '@/context/draft-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Clock, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  RefreshCw,
  ImageIcon,
  MapPin,
  Tag,
  BarChart3,
  FileText
} from 'lucide-react'
import type { DraftPost } from '@/types/draft'

interface DraftsListProps {
  isOpen: boolean
  onClose: () => void
}

const statusConfig = {
  draft: {
    icon: Clock,
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    textColor: 'text-gray-600 dark:text-gray-400'
  },
  uploading: {
    icon: Upload,
    label: 'Uploading',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300',
    textColor: 'text-red-600 dark:text-red-400'
  },
  uploaded: {
    icon: CheckCircle,
    label: 'Uploaded',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    textColor: 'text-green-600 dark:text-green-400'
  }
}

function DraftItem({ draft, onRetry, onDelete }: { 
  draft: DraftPost
  onRetry: (id: string) => void
  onDelete: (id: string) => void
}) {
  const config = statusConfig[draft.status]
  const Icon = config.icon

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return timestamp.toLocaleDateString()
  }

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(draft.timestamp)}
              </span>
            </div>

            {/* Content */}
            <div className="mb-3">
              <p className="text-sm text-foreground line-clamp-2 mb-2">
                {draft.content || 'No content'}
              </p>
              
              {/* Media indicator */}
              {draft.media && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <ImageIcon className="w-3 h-3" />
                  {draft.media.type === 'image' ? 'Photo' : 'Video'}
                </div>
              )}

              {/* Location */}
              {draft.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  {draft.location}
                </div>
              )}

              {/* Tags */}
              {draft.tags.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <Tag className="w-3 h-3" />
                  {draft.tags.join(', ')}
                </div>
              )}

              {/* Poll */}
              {draft.poll && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <BarChart3 className="w-3 h-3" />
                  {draft.poll.type} poll
                </div>
              )}

              {/* GIF */}
              {draft.gifUrl && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <FileText className="w-3 h-3" />
                  GIF
                </div>
              )}
            </div>

            {/* Error message */}
            {draft.errorMessage && (
              <div className="text-xs text-red-600 dark:text-red-400 mb-2">
                Error: {draft.errorMessage}
              </div>
            )}

            {/* Retry count */}
            {draft.retryCount > 0 && (
              <div className="text-xs text-muted-foreground mb-2">
                Retry attempts: {draft.retryCount}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-2">
            {draft.status === 'failed' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRetry(draft.id)}
                className="h-7 w-7 p-0"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
            
            {draft.status !== 'uploading' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(draft.id)}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function DraftsList({ isOpen, onClose }: DraftsListProps) {
  const { drafts, retryDraft, removeDraft, clearUploadedDrafts } = useDrafts()
  
  const pendingDrafts = drafts.filter(draft => 
    draft.status === 'draft' || draft.status === 'failed'
  )
  const uploadedDrafts = drafts.filter(draft => draft.status === 'uploaded')
  const uploadingDrafts = drafts.filter(draft => draft.status === 'uploading')

  const handleRetry = (id: string) => {
    retryDraft(id)
  }

  const handleDelete = (id: string) => {
    removeDraft(id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Drafts</span>
            {uploadedDrafts.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearUploadedDrafts}
                className="text-xs h-6"
              >
                Clear uploaded
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {drafts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No drafts yet</p>
              <p className="text-xs">Your offline posts will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Uploading drafts */}
              {uploadingDrafts.map(draft => (
                <DraftItem
                  key={draft.id}
                  draft={draft}
                  onRetry={handleRetry}
                  onDelete={handleDelete}
                />
              ))}

              {/* Pending drafts */}
              {pendingDrafts.map(draft => (
                <DraftItem
                  key={draft.id}
                  draft={draft}
                  onRetry={handleRetry}
                  onDelete={handleDelete}
                />
              ))}

              {/* Uploaded drafts */}
              {uploadedDrafts.map(draft => (
                <DraftItem
                  key={draft.id}
                  draft={draft}
                  onRetry={handleRetry}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {drafts.length > 0 && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {pendingDrafts.length} pending, {uploadedDrafts.length} uploaded
              </span>
              <span>
                Total: {drafts.length}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 