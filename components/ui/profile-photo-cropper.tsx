'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from './button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog'
import { Slider } from './slider'
import { Label } from './label'

interface ProfilePhotoCropperProps {
  isOpen: boolean
  onClose: () => void
  onCropComplete: (croppedImageUrl: string) => void
  imageFile: File | null
}

interface CropArea {
  x: number
  y: number
  size: number
}

export function ProfilePhotoCropper({ 
  isOpen, 
  onClose, 
  onCropComplete, 
  imageFile 
}: ProfilePhotoCropperProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [cropArea, setCropArea] = useState<CropArea>({ x: 100, y: 100, size: 150 })
  const [zoom, setZoom] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Load image when file changes
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageUrl(e.target?.result as string)
      }
      reader.readAsDataURL(imageFile)
    }
  }, [imageFile])

  // Initialize crop area when image loads
  useEffect(() => {
    if (imageUrl && containerRef.current) {
      const container = containerRef.current
      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight
      
      // Set initial crop area to center with reasonable size
      const size = Math.min(containerWidth, containerHeight) * 0.6
      const x = (containerWidth - size) / 2
      const y = (containerHeight - size) / 2
      
      setCropArea({ x, y, size })
    }
  }, [imageUrl])

  // Handle mouse/touch events for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setDragStart({ 
      x: clientX - cropArea.x, 
      y: clientY - cropArea.y 
    })
  }, [cropArea])

  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return
    
    e.preventDefault()
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    
    const newX = clientX - containerRect.left - dragStart.x
    const newY = clientY - containerRect.top - dragStart.y
    
    // Constrain to container bounds
    const maxX = container.offsetWidth - cropArea.size
    const maxY = container.offsetHeight - cropArea.size
    
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    }))
  }, [isDragging, dragStart, cropArea.size])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add event listeners for mouse/touch events
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMouseMove(e as any)
      }
    }
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        handleMouseMove(e as any)
      }
    }
    const handleGlobalTouchEnd = () => setIsDragging(false)

    if (isOpen) {
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      document.addEventListener('touchend', handleGlobalTouchEnd)
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('touchmove', handleGlobalTouchMove)
      document.removeEventListener('touchend', handleGlobalTouchEnd)
    }
  }, [isOpen, isDragging, handleMouseMove])

  // Crop the image
  const handleCrop = useCallback(() => {
    if (!imageUrl || !imageRef.current || !containerRef.current) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Set canvas size to final crop size (300x300 for profile photos)
      canvas.width = 300
      canvas.height = 300

      if (ctx) {
        const container = containerRef.current!
        const containerRect = container.getBoundingClientRect()
        
        // Calculate the scale factor between the displayed image and the actual image
        const displayWidth = container.offsetWidth
        const displayHeight = container.offsetHeight
        const scaleX = img.width / displayWidth
        const scaleY = img.height / displayHeight
        
        // Calculate source coordinates and dimensions
        const sourceX = cropArea.x * scaleX
        const sourceY = cropArea.y * scaleY
        const sourceSize = cropArea.size * scaleX

        // Draw the cropped image
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize,
          0, 0, 300, 300
        )

        // Convert to data URL
        const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9)
        onCropComplete(croppedImageUrl)
        onClose()
      }
    }

    img.src = imageUrl
  }, [imageUrl, cropArea, onCropComplete, onClose])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Profile Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image preview with crop overlay */}
          <div 
            ref={containerRef}
            className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            {imageUrl && (
              <>
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Profile photo preview"
                  className="w-full h-full object-contain"
                  style={{ transform: `scale(${zoom})` }}
                />
                
                {/* Crop overlay - circular */}
                <div
                  className="absolute border-2 border-white shadow-lg cursor-move"
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.size,
                    height: cropArea.size,
                    borderRadius: '50%',
                    border: '3px solid white',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleMouseDown}
                >
                  {/* Center indicator */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="zoom">Zoom</Label>
              <Slider
                id="zoom"
                min={0.5}
                max={2}
                step={0.1}
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCrop}>
                Crop & Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 