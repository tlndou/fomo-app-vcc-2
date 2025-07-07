import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

export interface CompressionProgress {
  fileIndex: number
  fileName: string
  progress: number
  step: string
  totalFiles: number
  overallProgress: number
}

export interface CompressedFile {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

export interface CompressionError {
  fileName: string
  error: string
  fileType: 'image' | 'video'
}

export interface CompressionResult {
  files: CompressedFile[]
  errors: CompressionError[]
  totalOriginalSize: number
  totalCompressedSize: number
}

// Compression settings
const IMAGE_SETTINGS = {
  maxWidth: 1080,
  maxHeight: 1080,
  quality: 0.85,
  maxSizeMB: 2
}

const VIDEO_SETTINGS = {
  maxWidth: 1920,
  maxHeight: 1080,
  bitrate: '3500k',
  maxDuration: 60,
  maxSizeMB: 25
}

const MAX_FILE_SIZE_MB = 100

// File type detection
function isImage(file: File): boolean {
  return file.type.startsWith('image/')
}

function isVideo(file: File): boolean {
  return file.type.startsWith('video/')
}

function isValidFile(file: File): boolean {
  const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024
  return file.size <= maxSizeBytes && (isImage(file) || isVideo(file))
}

// Image compression using HTML5 Canvas
async function compressImage(
  file: File,
  onProgress: (progress: CompressionProgress) => void
): Promise<CompressedFile> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img
        const maxDimension = Math.max(IMAGE_SETTINGS.maxWidth, IMAGE_SETTINGS.maxHeight)
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else {
            width = (width * maxDimension) / height
            height = maxDimension
          }
        }
        
        // Set canvas dimensions
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }
            
            // Check if compressed size is acceptable
            if (blob.size > IMAGE_SETTINGS.maxSizeMB * 1024 * 1024) {
              // Try with lower quality
              canvas.toBlob(
                (finalBlob) => {
                  if (!finalBlob) {
                    reject(new Error('Failed to compress image to acceptable size'))
                    return
                  }
                  
                  const compressedFile = new File([finalBlob], file.name.replace(/\.(png|gif|webp)$/i, '.jpg'), {
                    type: 'image/jpeg'
                  })
                  
                  resolve({
                    file: compressedFile,
                    originalSize: file.size,
                    compressedSize: finalBlob.size,
                    compressionRatio: (file.size - finalBlob.size) / file.size
                  })
                },
                'image/jpeg',
                0.7
              )
            } else {
              const compressedFile = new File([blob], file.name.replace(/\.(png|gif|webp)$/i, '.jpg'), {
                type: 'image/jpeg'
              })
              
              resolve({
                file: compressedFile,
                originalSize: file.size,
                compressedSize: blob.size,
                compressionRatio: (file.size - blob.size) / file.size
              })
            }
          },
          'image/jpeg',
          IMAGE_SETTINGS.quality
        )
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// Video compression using FFmpeg.js
let ffmpeg: FFmpeg | null = null

async function initializeFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg
  
  ffmpeg = new FFmpeg()
  
  try {
    await ffmpeg.load({
      coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm')
    })
  } catch (error) {
    // Fallback to CDN URLs if local files not found
    await ffmpeg.load()
  }
  
  return ffmpeg
}

async function compressVideo(
  file: File,
  onProgress: (progress: CompressionProgress) => void
): Promise<CompressedFile> {
  const ffmpegInstance = await initializeFFmpeg()
  
  try {
    // Write input file
    ffmpegInstance.writeFile(file.name, await fetchFile(file))
    
    // Get video info using a different approach
    // We'll use a simpler approach without parsing duration for now
    // The video will be limited by the -t parameter in the command
    
    // Compression command
    const outputFileName = `compressed_${file.name.replace(/\.[^/.]+$/, '.mp4')}`
    const command = [
      '-i', file.name,
      '-c:v', 'libx264',
      '-b:v', VIDEO_SETTINGS.bitrate,
      '-maxrate', VIDEO_SETTINGS.bitrate,
      '-bufsize', '7000k',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      '-t', VIDEO_SETTINGS.maxDuration.toString(),
      '-y',
      outputFileName
    ]
    
    // Execute compression
    await ffmpegInstance.exec(command)
    
    // Read compressed file
    const compressedData = await ffmpegInstance.readFile(outputFileName)
    const compressedBlob = new Blob([compressedData], { type: 'video/mp4' })
    
    // Check if compressed size is acceptable
    if (compressedBlob.size > VIDEO_SETTINGS.maxSizeMB * 1024 * 1024) {
      throw new Error(`Compressed video still exceeds ${VIDEO_SETTINGS.maxSizeMB}MB limit`)
    }
    
    const compressedFile = new File([compressedBlob], outputFileName, {
      type: 'video/mp4'
    })
    
    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedBlob.size,
      compressionRatio: (file.size - compressedBlob.size) / file.size
    }
    
  } catch (error) {
    throw new Error(`Video compression failed: ${error}`)
  }
}

// Main compression function
export async function compressMedia(
  files: File[],
  onProgress?: (progress: CompressionProgress) => void
): Promise<CompressionResult> {
  const validFiles = files.filter(isValidFile)
  const errors: CompressionError[] = []
  const compressedFiles: CompressedFile[] = []
  
  let totalOriginalSize = 0
  let totalCompressedSize = 0
  
  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i]
    totalOriginalSize += file.size
    
    try {
      onProgress?.({
        fileIndex: i,
        fileName: file.name,
        progress: 0,
        step: isImage(file) ? 'Compressing image...' : 'Compressing video...',
        totalFiles: validFiles.length,
        overallProgress: (i / validFiles.length) * 100
      })
      
      let compressedFile: CompressedFile
      
      if (isImage(file)) {
        compressedFile = await compressImage(file, (progress) => {
          onProgress?.({
            ...progress,
            fileIndex: i,
            fileName: file.name,
            step: 'Compressing image...',
            totalFiles: validFiles.length,
            overallProgress: ((i + progress.progress / 100) / validFiles.length) * 100
          })
        })
      } else {
        compressedFile = await compressVideo(file, (progress) => {
          onProgress?.({
            ...progress,
            fileIndex: i,
            fileName: file.name,
            step: 'Compressing video...',
            totalFiles: validFiles.length,
            overallProgress: ((i + progress.progress / 100) / validFiles.length) * 100
          })
        })
      }
      
      compressedFiles.push(compressedFile)
      totalCompressedSize += compressedFile.compressedSize
      
      onProgress?.({
        fileIndex: i,
        fileName: file.name,
        progress: 100,
        step: 'Compression complete',
        totalFiles: validFiles.length,
        overallProgress: ((i + 1) / validFiles.length) * 100
      })
      
    } catch (error) {
      errors.push({
        fileName: file.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        fileType: isImage(file) ? 'image' : 'video'
      })
    }
  }
  
  // Add errors for invalid files
  files.forEach(file => {
    if (!isValidFile(file)) {
      errors.push({
        fileName: file.name,
        error: file.size > MAX_FILE_SIZE_MB * 1024 * 1024 
          ? `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`
          : 'Unsupported file type',
        fileType: isImage(file) ? 'image' : 'video'
      })
    }
  })
  
  return {
    files: compressedFiles,
    errors,
    totalOriginalSize,
    totalCompressedSize
  }
}

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function getCompressionStats(result: CompressionResult): {
  totalSaved: number
  totalSavedPercentage: number
  averageCompressionRatio: number
} {
  const totalSaved = result.totalOriginalSize - result.totalCompressedSize
  const totalSavedPercentage = (totalSaved / result.totalOriginalSize) * 100
  const averageCompressionRatio = result.files.length > 0 
    ? result.files.reduce((sum, file) => sum + file.compressionRatio, 0) / result.files.length
    : 0
  
  return {
    totalSaved,
    totalSavedPercentage,
    averageCompressionRatio
  }
} 