import { useState, useCallback } from 'react'
import { 
  compressMedia, 
  type CompressionProgress, 
  type CompressionResult 
} from '@/lib/media-compression'

export interface UseMediaCompressionOptions {
  onProgress?: (progress: CompressionProgress) => void
  onComplete?: (result: CompressionResult) => void
  onError?: (error: Error) => void
}

export function useMediaCompression(options: UseMediaCompressionOptions = {}) {
  const [isCompressing, setIsCompressing] = useState(false)
  const [progress, setProgress] = useState<CompressionProgress | null>(null)
  const [result, setResult] = useState<CompressionResult | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const compress = useCallback(async (files: File[]) => {
    if (files.length === 0) return

    setIsCompressing(true)
    setProgress(null)
    setResult(null)
    setError(null)

    try {
      const compressionResult = await compressMedia(files, (progress) => {
        setProgress(progress)
        options.onProgress?.(progress)
      })

      setResult(compressionResult)
      options.onComplete?.(compressionResult)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Compression failed')
      setError(error)
      options.onError?.(error)
    } finally {
      setIsCompressing(false)
    }
  }, [options])

  const reset = useCallback(() => {
    setProgress(null)
    setResult(null)
    setError(null)
  }, [])

  return {
    compress,
    reset,
    isCompressing,
    progress,
    result,
    error
  }
} 