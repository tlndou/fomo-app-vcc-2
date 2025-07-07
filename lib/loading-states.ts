import { create } from 'zustand'

// Loading state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Loading state store
interface LoadingStateStore {
  // Profile states
  profileSave: LoadingState
  profileUpdate: LoadingState
  
  // Party states
  partyCreate: LoadingState
  partyUpdate: LoadingState
  partyDelete: LoadingState
  
  // Auth states
  signIn: LoadingState
  signUp: LoadingState
  signOut: LoadingState
  
  // Actions
  setLoadingState: (key: keyof Omit<LoadingStateStore, 'setLoadingState' | 'resetAll'>, state: LoadingState) => void
  resetAll: () => void
}

export const useLoadingStates = create<LoadingStateStore>((set) => ({
  // Initial states
  profileSave: 'idle',
  profileUpdate: 'idle',
  partyCreate: 'idle',
  partyUpdate: 'idle',
  partyDelete: 'idle',
  signIn: 'idle',
  signUp: 'idle',
  signOut: 'idle',
  
  // Actions
  setLoadingState: (key, state) => set({ [key]: state }),
  resetAll: () => set({
    profileSave: 'idle',
    profileUpdate: 'idle',
    partyCreate: 'idle',
    partyUpdate: 'idle',
    partyDelete: 'idle',
    signIn: 'idle',
    signUp: 'idle',
    signOut: 'idle',
  }),
}))

// Loading state utilities
export const loadingUtils = {
  // Start loading with timeout protection
  startLoading: (setState: (state: LoadingState) => void, timeoutMs: number = 5000) => {
    setState('loading')
    
    // Auto-reset to idle after timeout
    setTimeout(() => {
      setState('idle')
    }, timeoutMs)
  },
  
  // Show success briefly then reset
  showSuccess: (setState: (state: LoadingState) => void, durationMs: number = 2000) => {
    setState('success')
    setTimeout(() => setState('idle'), durationMs)
  },
  
  // Show error briefly then reset
  showError: (setState: (state: LoadingState) => void, durationMs: number = 3000) => {
    setState('error')
    setTimeout(() => setState('idle'), durationMs)
  },
  
  // Optimistic update with fallback
  optimisticUpdate: async <T>(
    immediateUpdate: () => void,
    apiCall: () => Promise<T>,
    setState: (state: LoadingState) => void,
    onSuccess?: (result: T) => void,
    onError?: (error: any) => void
  ) => {
    // Immediate UI update
    immediateUpdate()
    setState('loading')
    
    try {
      const result = await apiCall()
      setState('success')
      onSuccess?.(result)
      
      // Show success briefly
      setTimeout(() => setState('idle'), 2000)
      
      return result
    } catch (error) {
      setState('error')
      onError?.(error)
      
      // Show error briefly
      setTimeout(() => setState('idle'), 3000)
      
      throw error
    }
  }
}

// Toast notification system
export const toastUtils = {
  show: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Create toast element
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`
    toast.textContent = message
    
    // Add to DOM
    document.body.appendChild(toast)
    
    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full')
    }, 100)
    
    // Remove after delay
    setTimeout(() => {
      toast.classList.add('translate-x-full')
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  },
  
  success: (message: string) => toastUtils.show(message, 'success'),
  error: (message: string) => toastUtils.show(message, 'error'),
  info: (message: string) => toastUtils.show(message, 'info'),
} 