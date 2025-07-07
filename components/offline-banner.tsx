"use client"

import { useOffline } from '@/hooks/use-offline'
import { useDrafts } from '@/context/draft-context'
import { AlertTriangle, Wifi, WifiOff, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export function OfflineBanner() {
  const { isOnline, connectionType } = useOffline()
  const { drafts, isSyncing, syncProgress, syncDrafts } = useDrafts()

  const pendingDrafts = drafts.filter(draft => 
    draft.status === 'draft' || draft.status === 'failed'
  )

  const failedDrafts = drafts.filter(draft => draft.status === 'failed')

  if (isOnline && pendingDrafts.length === 0) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-600" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Back online
                  </span>
                  {pendingDrafts.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {pendingDrafts.length} draft{pendingDrafts.length !== 1 ? 's' : ''} pending
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-yellow-600" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    You're offline
                  </span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-300">
                    Posts will be saved and uploaded when connection returns
                  </span>
                </div>
              </>
            )}
          </div>

          {isOnline && pendingDrafts.length > 0 && (
            <div className="flex items-center gap-2">
              {isSyncing ? (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-green-600 animate-pulse" />
                  <span className="text-xs text-green-600">Syncing...</span>
                  <Progress value={syncProgress} className="w-16 h-1" />
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={syncDrafts}
                  className="text-xs h-7"
                >
                  Sync Now
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Show failed drafts */}
        {failedDrafts.length > 0 && (
          <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-600 dark:text-red-400">
                {failedDrafts.length} draft{failedDrafts.length !== 1 ? 's' : ''} failed to upload
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 