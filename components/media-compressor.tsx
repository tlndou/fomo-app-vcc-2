"use client"

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Upload, 
  Image, 
  Video, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText,
  Loader2
} from 'lucide-react'
import { 
  compressMedia, 
  type CompressionProgress, 
  type CompressionResult,
  formatFileSize,
  getCompressionStats
} from '@/lib/media-compression'

interface MediaCompressorProps {
  onFilesCompressed?: (files: File[]) => void
  maxFiles?: number
  className?: string
}

export function MediaCompressor({ 
  onFilesCompressed, 
  maxFiles = 10,
  className = "" 
}: MediaCompressorProps) {
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState<CompressionProgress | null>(null)
  const [result, setResult] = useState<CompressionResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleCompression = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setIsCompressing(true)
    setProgress(null)
    setResult(null)

    try {
      const compressionResult = await compressMedia(files, (progress) => {
        setProgress(progress)
      })

      setResult(compressionResult)
      
      if (compressionResult.files.length > 0) {
        onFilesCompressed?.(compressionResult.files.map(f => f.file))
      }
    } catch (error) {
      console.error('Compression failed:', error)
    } finally {
      setIsCompressing(false)
      setProgress(null)
    }
  }, [onFilesCompressed])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      handleCompression(files.slice(0, maxFiles))
    }
  }, [handleCompression, maxFiles])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleCompression(files.slice(0, maxFiles))
    }
  }, [handleCompression, maxFiles])

  const resetCompression = () => {
    setResult(null)
    setProgress(null)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Upload Area */}
      {!isCompressing && !result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Media Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-lg font-medium">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports images and videos up to 100MB each
                  </p>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Image className="h-4 w-4" />
                    <span>Images</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    <span>Videos</span>
                  </div>
                </div>
                <Button 
                  onClick={() => document.getElementById('file-input')?.click()}
                  disabled={isCompressing}
                >
                  Select Files
                </Button>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compression Progress */}
      {isCompressing && progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Compressing Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(progress.overallProgress)}%</span>
              </div>
              <Progress value={progress.overallProgress} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current File: {progress.fileName}</span>
                <span>{Math.round(progress.progress)}%</span>
              </div>
              <Progress value={progress.progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{progress.step}</p>
            </div>
            
            <div className="text-xs text-muted-foreground">
              File {progress.fileIndex + 1} of {progress.totalFiles}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compression Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Compression Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Success Summary */}
            {result.files.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Successfully Compressed</span>
                  <Badge variant="secondary">{result.files.length} files</Badge>
                </div>
                
                {(() => {
                  const stats = getCompressionStats(result)
                  return (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Original Size</p>
                        <p className="font-medium">{formatFileSize(result.totalOriginalSize)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Compressed Size</p>
                        <p className="font-medium">{formatFileSize(result.totalCompressedSize)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Space Saved</p>
                        <p className="font-medium text-green-600">
                          {formatFileSize(stats.totalSaved)} ({stats.totalSavedPercentage.toFixed(1)}%)
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg. Compression</p>
                        <p className="font-medium">{(stats.averageCompressionRatio * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  )
                })()}
                
                <Separator />
                
                {/* File List */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Compressed Files:</p>
                  <div className="space-y-1">
                    {result.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="truncate">{file.file.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatFileSize(file.originalSize)}</span>
                          <span>→</span>
                          <span>{formatFileSize(file.compressedSize)}</span>
                          <Badge variant="outline" className="text-xs">
                            {(file.compressionRatio * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-destructive">Failed to Compress</span>
                  <Badge variant="destructive">{result.errors.length} files</Badge>
                </div>
                
                <div className="space-y-2">
                  {result.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{error.fileName}</span>
                          <Badge variant="outline" className="text-xs">
                            {error.fileType}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{error.error}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button onClick={resetCompression} variant="outline">
                Compress More Files
              </Button>
              {result.files.length > 0 && (
                <Button onClick={() => onFilesCompressed?.(result.files.map(f => f.file))}>
                  Use Compressed Files
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 