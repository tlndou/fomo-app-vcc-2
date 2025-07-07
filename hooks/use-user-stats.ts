import { useState, useEffect } from 'react'
import { useParties } from '@/context/party-context'
import { useAuth } from '@/context/auth-context'
import { useFriends } from '@/context/friend-context'

export interface UserStats {
  hostedParties: number
  attendedParties: number
  friendCount: number
}

export function useUserStats(userId?: string) {
  const { parties } = useParties()
  const { user: authUser } = useAuth()
  const { getFriendCount } = useFriends()
  const [stats, setStats] = useState<UserStats>({
    hostedParties: 0,
    attendedParties: 0,
    friendCount: 0,
  })

  useEffect(() => {
    if (!userId || !authUser) return

    // Get stored user stats from localStorage
    const userStatsData = localStorage.getItem('fomo-user-stats')
    const userStats = userStatsData ? JSON.parse(userStatsData) : {}
    
    const currentUserStats = userStats[authUser.name] || {
      hostedParties: 0,
      attendedParties: 0,
      friendCount: 0,
    }

    // Get friend count from friend context
    const friendCount = getFriendCount()

    setStats({
      hostedParties: currentUserStats.hostedParties,
      attendedParties: currentUserStats.attendedParties,
      friendCount,
    })
  }, [userId, authUser, getFriendCount])

  // Function to increment friend count when a new friendship is created
  const incrementFriendCount = () => {
    setStats(prev => ({
      ...prev,
      friendCount: prev.friendCount + 1
    }))

    // Update localStorage
    const userStatsData = localStorage.getItem('fomo-user-stats')
    const userStats = userStatsData ? JSON.parse(userStatsData) : {}
    
    if (authUser?.name) {
      if (!userStats[authUser.name]) {
        userStats[authUser.name] = { hostedParties: 0, attendedParties: 0, friendCount: 0 }
      }
      userStats[authUser.name].friendCount += 1
      localStorage.setItem('fomo-user-stats', JSON.stringify(userStats))
    }
  }

  // Function to decrement friend count when a friendship is removed
  const decrementFriendCount = () => {
    setStats(prev => ({
      ...prev,
      friendCount: Math.max(0, prev.friendCount - 1)
    }))

    // Update localStorage
    const userStatsData = localStorage.getItem('fomo-user-stats')
    const userStats = userStatsData ? JSON.parse(userStatsData) : {}
    
    if (authUser?.name) {
      if (!userStats[authUser.name]) {
        userStats[authUser.name] = { hostedParties: 0, attendedParties: 0, friendCount: 0 }
      }
      userStats[authUser.name].friendCount = Math.max(0, userStats[authUser.name].friendCount - 1)
      localStorage.setItem('fomo-user-stats', JSON.stringify(userStats))
    }
  }

  // Function to increment hosted parties count when a party is completed
  const incrementHostedParties = () => {
    setStats(prev => ({
      ...prev,
      hostedParties: prev.hostedParties + 1
    }))
  }

  // Function to increment attended parties count when a party is completed
  const incrementAttendedParties = () => {
    setStats(prev => ({
      ...prev,
      attendedParties: prev.attendedParties + 1
    }))
  }

  return {
    stats,
    incrementFriendCount,
    decrementFriendCount,
    incrementHostedParties,
    incrementAttendedParties,
  }
} 