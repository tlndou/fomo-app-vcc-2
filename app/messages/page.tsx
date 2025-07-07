"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Search, MessageCircle, Trash2, Star, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { HamburgerMenu } from "@/components/hamburger-menu"
import { NotificationIcon } from "@/components/notification-icon"

interface ChatPreview {
  id: string
  user: {
    id: string
    name: string
    username: string
    avatar: string
    isFriend: boolean
  }
  lastMessage: {
    content: string
    timestamp: Date
    isFromCurrentUser: boolean
  }
  unreadCount: number
  partyName: string
}

function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"general" | "friends">("general")
  const [chats, setChats] = useState<ChatPreview[]>([
    {
      id: "1",
      user: {
        id: "1",
        name: "Tina (aka tee)",
        username: "tina_tee",
        avatar: "/placeholder.svg?height=40&width=40",
        isFriend: false,
      },
      lastMessage: {
        content: "Hey! Did you see what happened at the party?",
        timestamp: new Date("2024-01-15T22:35:00"),
        isFromCurrentUser: false,
      },
      unreadCount: 0,
      partyName: "Sarah's Birthday Bash",
    },
    {
      id: "2",
      user: {
        id: "2",
        name: "Leo (aka king)",
        username: "leo_king",
        avatar: "/placeholder.svg?height=40&width=40",
        isFriend: true,
      },
      lastMessage: {
        content: "Thanks for sharing that post!",
        timestamp: new Date("2024-01-15T21:30:00"),
        isFromCurrentUser: true,
      },
      unreadCount: 0,
      partyName: "Holiday Office Party",
    },
    {
      id: "3",
      user: {
        id: "4",
        name: "Rina (aka riri)",
        username: "rina_riri",
        avatar: "/placeholder.svg?height=40&width=40",
        isFriend: true,
      },
      lastMessage: {
        content: "Are you coming to the next event?",
        timestamp: new Date("2024-01-15T20:15:00"),
        isFromCurrentUser: false,
      },
      unreadCount: 0,
      partyName: "Game Night",
    },
    {
      id: "4",
      user: {
        id: "5",
        name: "Mike Thompson",
        username: "mike_t",
        avatar: "/placeholder.svg?height=40&width=40",
        isFriend: false,
      },
      lastMessage: {
        content: "I'll bring the drinks!",
        timestamp: new Date("2024-01-14T19:45:00"),
        isFromCurrentUser: true,
      },
      unreadCount: 0,
      partyName: "Summer BBQ",
    },
  ])

  const router = useRouter()

  const filteredChats = chats.filter((chat) => {
    // Filter by tab
    if (activeTab === "friends" && !chat.user.isFriend) return false

    // Filter by search query
    if (searchQuery) {
      return (
        chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.partyName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    return true
  })

  const handleChatClick = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId)
    if (chat) {
      router.push(`/messages/${chat.user.id}`)
    }
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChats(chats.filter((chat) => chat.id !== chatId))
  }

  const getRelativeTime = (timestamp: Date): string => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d`

    return timestamp.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">All Messages</h1>
          <div className="flex items-center gap-2">
            <NotificationIcon unreadCount={0} />
            <HamburgerMenu />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Tab Navigation */}
        <div className="mb-4">
          <div className="flex gap-1 bg-muted p-1 rounded-lg w-full">
            <Button
              variant={activeTab === "general" ? "default" : "ghost"}
              onClick={() => setActiveTab("general")}
              className="flex-1 rounded-md flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              General
            </Button>
            <Button
              variant={activeTab === "friends" ? "default" : "ghost"}
              onClick={() => setActiveTab("friends")}
              className="flex-1 rounded-md flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Friends
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="space-y-3">
          {filteredChats.length === 0 ? (
            <div className="text-center text-muted-foreground mt-12">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No conversations found</h3>
              <p className="text-sm">
                {searchQuery
                  ? "Try searching for something else"
                  : activeTab === "friends"
                    ? "You don't have any conversations with friends yet"
                    : "Start messaging people at parties to see conversations here"}
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <Card
                key={chat.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors group"
                onClick={() => handleChatClick(chat.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={chat.user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{chat.user.name[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{chat.user.name}</h3>
                        {chat.user.isFriend && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                          {chat.partyName}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">@{chat.user.username}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage.isFromCurrentUser && "You: "}
                        {chat.lastMessage.content}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-muted-foreground">{getRelativeTime(chat.lastMessage.timestamp)}</span>
                      <div className="flex items-center gap-2">
                        {chat.unreadCount > 0 && (
                          <span className="bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProtectedMessagesPage() {
  return (
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  )
}
