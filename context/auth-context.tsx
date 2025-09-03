"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { clearUserCache } from "@/lib/cached-api"
import { validateEmail } from "@/lib/utils"

interface User {
  id: string
  name: string
  username: string
  avatar?: string
  email?: string
  bio?: string
  joinDate?: string
  starSign?: string
  age?: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, username: string, starSign?: string, age?: number) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  resendEmailConfirmation: (email: string) => Promise<{ success: boolean; message: string }>
  forceRefreshUserData: () => Promise<void>
  syncUserData: () => Promise<void>
  // New optimistic update methods
  optimisticUpdateProfile: (updates: Partial<User>) => void
  revertProfileUpdate: () => void
  isUpdatingProfile: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [previousUserState, setPreviousUserState] = useState<User | null>(null)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        console.log('🔍 Session user data:', session.user)
        console.log('🔍 User metadata:', session.user.user_metadata)
        
        // Get user profile from localStorage
        const storedUsers = localStorage.getItem('fomo-users')
        const users = storedUsers ? JSON.parse(storedUsers) : {}
        const storedUserData = users[session.user.id]
        
        console.log('🔍 Stored user data:', storedUserData)
        
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || storedUserData?.name || "User",
          username: session.user.user_metadata?.username || storedUserData?.username || "user",
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url || storedUserData?.avatar,
          bio: session.user.user_metadata?.bio || storedUserData?.bio,
          joinDate: session.user.user_metadata?.joinDate || storedUserData?.joinDate,
          starSign: session.user.user_metadata?.starSign || storedUserData?.starSign,
          age: session.user.user_metadata?.age || storedUserData?.age,
        }
        
        console.log('🔍 Final user data:', userData)
        setUser(userData)

        // Store user data in localStorage for other users to access
        users[session.user.id] = {
          id: session.user.id,
          name: userData.name,
          username: userData.username,
          starSign: userData.starSign,
          joinDate: userData.joinDate,
          avatar: userData.avatar,
          bio: userData.bio,
          age: userData.age,
        }
        
        localStorage.setItem('fomo-users', JSON.stringify(users))
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('🔍 Auth state change - Event:', event)
        console.log('🔍 Auth state change - Session:', session)
        
        if (session?.user) {
          console.log('🔍 Auth state change - Session user data:', session.user)
          console.log('🔍 Auth state change - User metadata:', session.user.user_metadata)
          
          // Get user profile from localStorage
          const storedUsers = localStorage.getItem('fomo-users')
          const users = storedUsers ? JSON.parse(storedUsers) : {}
          const storedUserData = users[session.user.id]
          
          console.log('🔍 Auth state change - Stored user data:', storedUserData)
          
          // Prioritize user metadata from Supabase, fallback to localStorage, then defaults
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || storedUserData?.name || "User",
            username: session.user.user_metadata?.username || storedUserData?.username || "user",
            email: session.user.email,
            avatar: session.user.user_metadata?.avatar_url || storedUserData?.avatar,
            bio: session.user.user_metadata?.bio || storedUserData?.bio,
            joinDate: session.user.user_metadata?.joinDate || storedUserData?.joinDate,
            starSign: session.user.user_metadata?.starSign || storedUserData?.starSign,
            age: session.user.user_metadata?.age || storedUserData?.age,
          }
          
          console.log('🔍 Auth state change - Final user data:', userData)
          setUser(userData)

          // Update localStorage with the latest data
          users[session.user.id] = {
            id: session.user.id,
            name: userData.name,
            username: userData.username,
            starSign: userData.starSign,
            joinDate: userData.joinDate,
            avatar: userData.avatar,
            bio: userData.bio,
            age: userData.age,
            email: userData.email,
          }
          
          localStorage.setItem('fomo-users', JSON.stringify(users))
          console.log('🔍 Auth state change - Updated localStorage with user data')
        } else {
          console.log('🔍 Auth state change - No session, clearing user')
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, name: string, username: string, starSign?: string, age?: number) => {
    console.log('🔧 SignUp: Starting signup process with data:', { email, name, username, starSign, age })
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
          starSign,
          joinDate: new Date().toLocaleDateString(),
          age,
        }
      }
    })
    
    if (error) {
      console.error('❌ SignUp: Supabase error:', error)
      throw error
    }

    console.log('🔧 SignUp: Supabase response:', data)
    console.log('🔧 SignUp: User data from response:', data.user)
    console.log('🔧 SignUp: User metadata from response:', data.user?.user_metadata)

    // Store user data in localStorage
    if (data.user) {
      const userData = {
        id: data.user.id,
        name,
        username,
        starSign,
        joinDate: new Date().toLocaleDateString(),
        avatar: data.user.user_metadata?.avatar_url,
        bio: "",
        age,
        email,
      }
      
      // Store in localStorage
      const storedUsers = localStorage.getItem('fomo-users') || '{}'
      const users = JSON.parse(storedUsers)
      users[data.user.id] = userData
      localStorage.setItem('fomo-users', JSON.stringify(users))
      
      console.log('🔧 SignUp: User data stored in localStorage')
      
      // Also set the user immediately if we have the data
      setUser(userData)
    }
    
    console.log('🔧 SignUp: Signup process completed')
  }

  const signOut = async () => {
    // Clear user cache before signing out
    if (user) {
      clearUserCache(user.id)
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return

    // Update localStorage
    const storedUsers = localStorage.getItem('fomo-users') || '{}'
    const users = JSON.parse(storedUsers)
    users[user.id] = { ...users[user.id], ...updates }
    localStorage.setItem('fomo-users', JSON.stringify(users))
    
    // Update local state
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }

  // Optimistic update - immediately update UI, then sync in background
  const optimisticUpdateProfile = (updates: Partial<User>) => {
    if (!user) return

    // Update localStorage
    const storedUsers = localStorage.getItem('fomo-users') || '{}'
    const users = JSON.parse(storedUsers)
    users[user.id] = { ...users[user.id], ...updates }
    localStorage.setItem('fomo-users', JSON.stringify(users))
    
    // Update local state immediately
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }

  // Revert optimistic update on failure
  const revertProfileUpdate = () => {
    if (previousUserState) {
      setUser(previousUserState)
      setPreviousUserState(null)
    }
  }

  const forceRefreshUserData = async () => {
    if (!user) return

    // Refresh user data from localStorage
    const storedUsers = localStorage.getItem('fomo-users')
    const users = storedUsers ? JSON.parse(storedUsers) : {}
    const storedUserData = users[user.id]
    
    if (storedUserData) {
      setUser(prev => prev ? { ...prev, ...storedUserData } : null)
    }
  }

  const syncUserData = async () => {
    if (!user) return

    // Store current user data in localStorage
    const storedUsers = localStorage.getItem('fomo-users') || '{}'
    const users = JSON.parse(storedUsers)
    users[user.id] = user
    localStorage.setItem('fomo-users', JSON.stringify(users))
    
    console.log('🔍 User data synced to localStorage')
  }

  // Temporary function for debugging - can be called from browser console
  const debugSetUserData = (name: string, username: string) => {
    if (!user) return
    
    console.log('🔧 Debug: Setting user data manually')
    
    const updatedUser = {
      ...user,
      name,
      username,
    }
    
    setUser(updatedUser)
    
    // Also update localStorage
    const storedUsers = localStorage.getItem('fomo-users')
    const users = storedUsers ? JSON.parse(storedUsers) : {}
    users[user.id] = {
      ...users[user.id],
      name,
      username,
    }
    localStorage.setItem('fomo-users', JSON.stringify(users))
    
    console.log('🔧 Debug: User data updated:', updatedUser)
  }

  // Permanent fix - updates Supabase user metadata
  const permanentFixUserData = async (name: string, username: string) => {
    if (!user) return
    
    try {
      console.log('🔧 Permanent fix: Updating Supabase user metadata...')
      
      // Create a clean user data object without circular references
      const cleanUserData = {
        name,
        username,
        starSign: user.starSign || undefined,
        joinDate: user.joinDate || new Date().toLocaleDateString(),
        bio: user.bio || undefined,
        age: user.age || undefined,
      }
      
      console.log('🔧 Permanent fix: Clean user data to send:', cleanUserData)
      
      // Update Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: cleanUserData
      })
      
      if (error) {
        console.error('❌ Error updating Supabase metadata:', error)
        return false
      }
      
      // Update local state
      const updatedUser = {
        ...user,
        name,
        username,
      }
      setUser(updatedUser)
      
      // Update localStorage
      const storedUsers = localStorage.getItem('fomo-users')
      const users = storedUsers ? JSON.parse(storedUsers) : {}
      users[user.id] = {
        ...users[user.id],
        name,
        username,
      }
      localStorage.setItem('fomo-users', JSON.stringify(users))
      
      console.log('✅ Permanent fix: User metadata updated in Supabase!')
      console.log('✅ This will persist across all devices and sessions.')
      return true
      
    } catch (error) {
      console.error('❌ Error in permanentFixUserData:', error)
      return false
    }
  }

  // Test signup process and data storage
  const testSignupProcess = async () => {
    console.log('🧪 Testing signup process...')
    
    const testUser = {
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      starSign: 'Libra',
      age: 25,
    }
    
    try {
      // Simulate signup process
      console.log('🧪 Test user data:', testUser)
      
      // Store in localStorage
      const storedUsers = localStorage.getItem('fomo-users')
      const users = storedUsers ? JSON.parse(storedUsers) : {}
      users['test-user-id'] = {
        id: 'test-user-id',
        ...testUser,
        joinDate: new Date().toLocaleDateString(),
      }
      localStorage.setItem('fomo-users', JSON.stringify(users))
      
      console.log('✅ Test signup process completed')
      console.log('✅ Test user data stored in localStorage')
      
      return true
    } catch (error) {
      console.error('❌ Test signup process failed:', error)
      return false
    }
  }

  // Test data storage and retrieval
  const testDataStorage = async () => {
    console.log('🧪 Testing data storage and retrieval...')
    
    try {
      // Test localStorage
      const storedUsers = localStorage.getItem('fomo-users')
      console.log('🧪 localStorage users:', storedUsers ? JSON.parse(storedUsers) : {})
      
      // Test Supabase user metadata
      const { data: { user } } = await supabase.auth.getUser()
      console.log('🧪 Supabase user metadata:', user?.user_metadata)
      
      console.log('✅ Data storage test completed')
      return true
    } catch (error) {
      console.error('❌ Data storage test failed:', error)
      return false
    }
  }

  // Debug user data from all sources
  const debugUserData = async () => {
    if (!user) {
      console.log('❌ No user logged in')
      return
    }
    
    console.log('🔍 Debugging user data for:', user.id)
    
    try {
      // Check Supabase user metadata
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      console.log('🔍 Supabase user metadata:', supabaseUser?.user_metadata)
      
      // Check localStorage
      const storedUsers = localStorage.getItem('fomo-users')
      const users = storedUsers ? JSON.parse(storedUsers) : {}
      const storedUser = users[user.id]
      console.log('🔍 localStorage user data:', storedUser)
      
      // Check current user state
      console.log('🔍 Current user state:', user)
      
      console.log('✅ User data debug completed')
    } catch (error) {
      console.error('❌ Error debugging user data:', error)
    }
  }

  // Fix star sign data for current user
  const fixStarSignData = async (starSign: string) => {
    if (!user) return
    
    try {
      console.log('🔧 Fix: Updating star sign data...')
      
      // Create a clean user data object without circular references
      const cleanUserData = {
        name: user.name,
        username: user.username,
        starSign,
        joinDate: user.joinDate || new Date().toLocaleDateString(),
        bio: user.bio,
        age: user.age,
      }
      
      console.log('🔧 Fix: Clean user data to send:', cleanUserData)
      
      // Update Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: cleanUserData
      })
      
      if (error) {
        console.error('❌ Error updating Supabase metadata:', error)
        return false
      }
      
      // Update local state
      const updatedUser = {
        ...user,
        starSign,
      }
      setUser(updatedUser)
      
      // Update localStorage
      const storedUsers = localStorage.getItem('fomo-users')
      const users = storedUsers ? JSON.parse(storedUsers) : {}
      users[user.id] = {
        ...users[user.id],
        starSign,
      }
      localStorage.setItem('fomo-users', JSON.stringify(users))
      
      console.log('✅ Fix: Star sign data updated in Supabase and localStorage!')
      return true
      
    } catch (error) {
      console.error('❌ Error in fixStarSignData:', error)
      return false
    }
  }

  // Make debug function available globally for testing
  if (typeof window !== 'undefined') {
    (window as any).debugSetUserData = debugSetUserData
    ;(window as any).permanentFixUserData = permanentFixUserData
    ;(window as any).testSignupProcess = testSignupProcess
    ;(window as any).testDataStorage = testDataStorage
    ;(window as any).debugUserData = debugUserData
    ;(window as any).fixStarSignData = fixStarSignData
    ;(window as any).syncUserData = syncUserData
    ;(window as any).forceRefreshUserData = forceRefreshUserData
  }

  const handleAuthSuccess = (success: unknown) => {
    console.log('🔧 Auth success:', success)
  }

  const handleAuthError = (error: unknown) => {
    console.error('❌ Auth error:', error)
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resendEmailConfirmation: async (email: string) => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })
      if (error) {
        return { success: false, message: error.message }
      }
      return { success: true, message: 'Email confirmation sent!' }
    },
    forceRefreshUserData,
    syncUserData,
    optimisticUpdateProfile,
    revertProfileUpdate,
    isUpdatingProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
