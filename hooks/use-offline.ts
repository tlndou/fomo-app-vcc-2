import { useState, useEffect } from 'react'

export interface OfflineState {
  isOnline: boolean
  isConnecting: boolean
  lastOnline: Date | null
  connectionType: 'wifi' | 'cellular' | 'ethernet' | 'unknown'
}

export function useOffline() {
  const [offlineState, setOfflineState] = useState<OfflineState>({
    isOnline: true, // Default to true for SSR
    isConnecting: false,
    lastOnline: null,
    connectionType: 'unknown'
  })

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Set initial state based on actual navigator.onLine
    setOfflineState(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      lastOnline: navigator.onLine ? new Date() : null
    }))

    const handleOnline = () => {
      setOfflineState(prev => ({
        ...prev,
        isOnline: true,
        isConnecting: false,
        lastOnline: new Date()
      }))
    }

    const handleOffline = () => {
      setOfflineState(prev => ({
        ...prev,
        isOnline: false,
        isConnecting: false
      }))
    }

    // Detect connection type if available
    const detectConnectionType = () => {
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection
        if (connection) {
          setOfflineState(prev => ({
            ...prev,
            connectionType: connection.effectiveType === '4g' ? 'cellular' : 
                           connection.type === 'wifi' ? 'wifi' : 
                           connection.type === 'ethernet' ? 'ethernet' : 'unknown'
          }))
        }
      }
    }

    // Initial detection
    detectConnectionType()

    // Event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Connection change detection
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        connection.addEventListener('change', detectConnectionType)
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (typeof navigator !== 'undefined' && 'connection' in navigator) {
        const connection = (navigator as any).connection
        if (connection) {
          connection.removeEventListener('change', detectConnectionType)
        }
      }
    }
  }, [])

  return offlineState
} 