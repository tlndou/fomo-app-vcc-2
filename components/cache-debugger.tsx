"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Clock, 
  HardDrive,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useCacheManagement } from '@/hooks/use-cached-data'
import { globalCache } from '@/lib/memory-cache'

interface CacheDebuggerProps {
  isOpen: boolean
  onClose: () => void
}

export function CacheDebugger({ isOpen, onClose }: CacheDebuggerProps) {
  const { stats, refreshStats, clearAllCache, getCacheContents, getCacheKeys } = useCacheManagement()
  const [showDetails, setShowDetails] = useState(false)
  const [cacheContents, setCacheContents] = useState<Record<string, any>>({})

  useEffect(() => {
    if (isOpen) {
      refreshStats()
      setCacheContents(getCacheContents())
    }
  }, [isOpen, refreshStats, getCacheContents])

  const handleRefresh = () => {
    refreshStats()
    setCacheContents(getCacheContents())
  }

  const handleClearAll = () => {
    clearAllCache()
    setCacheContents({})
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const formatAge = (age: number) => {
    const seconds = Math.floor(age / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s ago`
    }
    return `${seconds}s ago`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Cache Debugger</h2>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Cache Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Cache Size</span>
                </div>
                <p className="text-2xl font-bold">{globalCache.size()}/100</p>
                <Progress value={(globalCache.size() / 100) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Hit Rate</span>
                </div>
                <p className="text-2xl font-bold">{globalCache.getHitRate().toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">
                  {stats.hits} hits / {stats.hits + stats.misses} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Operations</span>
                </div>
                <p className="text-2xl font-bold">{stats.sets}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.deletes} deletes, {stats.clears} clears
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Misses</span>
                </div>
                <p className="text-2xl font-bold">{stats.misses}</p>
                <p className="text-xs text-muted-foreground">
                  Cache misses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
            <Button onClick={handleClearAll} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Cache
            </Button>
            <Button 
              onClick={() => setShowDetails(!showDetails)} 
              variant="outline" 
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </div>

          {/* Cache Contents */}
          {showDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Cache Contents ({Object.keys(cacheContents).length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.keys(cacheContents).length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No cached items
                    </p>
                  ) : (
                    Object.entries(cacheContents).map(([key, entry]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {key.split('-')[0]}
                            </Badge>
                            <span className="font-mono text-sm">{key}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatAge(entry.age)}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Created:</span>
                            <p>{formatTime(entry.timestamp)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Expires:</span>
                            <p>{formatTime(entry.expiresAt)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">TTL:</span>
                            <p>{Math.round(entry.ttl / 1000)}s</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Data Type:</span>
                            <p>{Array.isArray(entry.data) ? 'Array' : typeof entry.data}</p>
                          </div>
                        </div>

                        {Array.isArray(entry.data) && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">
                              Items: {entry.data.length}
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cache Keys Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Cache Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {getCacheKeys().map((key) => (
                  <Badge key={key} variant="secondary" className="text-xs">
                    {key}
                  </Badge>
                ))}
                {getCacheKeys().length === 0 && (
                  <p className="text-muted-foreground text-sm">No cache keys</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 