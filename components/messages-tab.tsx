"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Send, Users, Star, MessageCircle } from "lucide-react"
import type { User, Post } from "@/types/feed"

interface Message {
  id: string
  from: User
  to: User
  content?: string
  post?: Post
  timestamp: Date
  read: boolean
}

interface MessagesTabProps {
  currentUser: User
  users: User[]
  posts: Post[]
  partyName?: string
}

function getRelativeTime(timestamp: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "now"
  if (diffInMinutes < 60) return `${diffInMinutes}m`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d`

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 52) return `${diffInWeeks}w`

  const diffInYears = Math.floor(diffInWeeks / 52)
  return `${diffInYears}y`
}

export function MessagesTab({ currentUser, users, posts, partyName }: MessagesTabProps) {
  const [activeMessageTab, setActiveMessageTab] = useState<"general" | "starred">("general")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messageContent, setMessageContent] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // Mock messages data - filtered for this party
  const [messages] = useState<Message[]>([])

  const filteredUsers = users.filter((user) => {
    if (activeMessageTab === "starred" && user.friendStatus !== "friends") return false
    if (searchQuery) {
      return (
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return true
  })

  const handleSendMessage = () => {
    if (!selectedUser || (!messageContent.trim() && !selectedPost)) return

    // Here you would send the message
    console.log("Sending message to:", selectedUser.name)
    console.log("Content:", messageContent)
    console.log("Post:", selectedPost)

    setMessageContent("")
    setSelectedPost(null)
    setSelectedUser(null)
  }

  const messageTabs = [
    { id: "general" as const, label: "General", icon: Users },
    { id: "starred" as const, label: "Friends", icon: Star },
  ]

  return (
    <div className="space-y-4">
      {/* Party Context Header */}
      {partyName && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800 font-medium">Messages from {partyName}</div>
          <div className="text-xs text-blue-600">These are messages from people at this party</div>
        </div>
      )}

      {/* Message Tab Header */}
      <div className="bg-white p-4 border-b">
        <div className="space-y-3">
          {/* Sub-tabs */}
          <div className="flex gap-1">
            {messageTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeMessageTab === tab.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveMessageTab(tab.id)}
                  className="flex items-center gap-1"
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </Button>
              )
            })}
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="px-4 space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-sm">
              {activeMessageTab === "starred"
                ? "You don't have any friends at this party yet"
                : "Try searching for someone else"}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const userMessages = messages.filter((msg) => msg.from.id === user.id || msg.to.id === user.id)
            const lastMessage = userMessages[userMessages.length - 1]
            const unreadCount = userMessages.filter((msg) => !msg.read && msg.from.id === user.id).length

            return (
              <Card key={user.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedUser(user)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{user.name}</h3>
                        {user.friendStatus === "friends" && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        {user.isHost && (
                          <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">Host</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                      {user.location && <p className="text-xs text-gray-400">{user.location}</p>}
                      {lastMessage && (
                        <p className="text-sm text-gray-600 truncate mt-1">{lastMessage.content || "Shared a post"}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {lastMessage && (
                        <span className="text-xs text-gray-400">{getRelativeTime(lastMessage.timestamp)}</span>
                      )}
                      {unreadCount > 0 && (
                        <span className="bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Send Message Modal/Bottom Sheet */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-96 rounded-t-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Send to {selectedUser.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                ×
              </Button>
            </div>

            {selectedPost && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium">Sharing post:</p>
                <p className="text-sm text-gray-600 truncate">{selectedPost.content}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Add a message..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
