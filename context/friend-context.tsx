"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Friend {
  id: string
  name: string
  username: string
  avatar?: string
  status: "pending" | "friends"
  timestamp: string
}

interface FriendContextType {
  friends: Friend[]
  addFriend: (friend: Omit<Friend, 'timestamp'>) => void
  removeFriend: (friendId: string) => void
  acceptFriendRequest: (friendId: string) => void
  declineFriendRequest: (friendId: string) => void
  getFriendStatus: (userId: string) => "pending" | "friends" | "none"
  getFriendCount: () => number
}

const FriendContext = createContext<FriendContextType | undefined>(undefined)

export function useFriends() {
  const context = useContext(FriendContext)
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendProvider')
  }
  return context
}

interface FriendProviderProps {
  children: ReactNode
}

export function FriendProvider({ children }: FriendProviderProps) {
  const [friends, setFriends] = useState<Friend[]>([])

  // Load friends from localStorage on mount
  useEffect(() => {
    const storedFriends = localStorage.getItem('fomo-friends')
    if (storedFriends) {
      try {
        setFriends(JSON.parse(storedFriends))
      } catch (error) {
        console.error('Failed to parse stored friends:', error)
      }
    }
  }, [])

  // Save friends to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('fomo-friends', JSON.stringify(friends))
  }, [friends])

  const addFriend = (friendData: Omit<Friend, 'timestamp'>) => {
    const newFriend: Friend = {
      ...friendData,
      timestamp: new Date().toISOString(),
    }
    setFriends(prev => [newFriend, ...prev])
  }

  const removeFriend = (friendId: string) => {
    setFriends(prev => prev.filter(friend => friend.id !== friendId))
  }

  const acceptFriendRequest = (friendId: string) => {
    setFriends(prev => prev.map(friend => 
      friend.id === friendId 
        ? { ...friend, status: "friends" as const }
        : friend
    ))
  }

  const declineFriendRequest = (friendId: string) => {
    setFriends(prev => prev.filter(friend => friend.id !== friendId))
  }

  const getFriendStatus = (userId: string) => {
    const friend = friends.find(f => f.id === userId)
    return friend ? friend.status : "none"
  }

  const getFriendCount = () => {
    return friends.filter(friend => friend.status === "friends").length
  }

  const value: FriendContextType = {
    friends,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    declineFriendRequest,
    getFriendStatus,
    getFriendCount,
  }

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  )
} 