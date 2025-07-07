"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, MoreVertical } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { NotificationIcon } from "@/components/notification-icon"

interface ChatMessage {
  id: string
  content: string
  timestamp: Date
  isFromCurrentUser: boolean
  status: "sent" | "delivered" | "read"
}

interface ChatUser {
  id: string
  name: string
  username: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hey! Did you see what happened at the party?",
      timestamp: new Date("2024-01-15T22:35:00"),
      isFromCurrentUser: false,
      status: "read",
    },
    {
      id: "2",
      content: "No way! What happened?",
      timestamp: new Date("2024-01-15T22:36:00"),
      isFromCurrentUser: true,
      status: "read",
    },
    {
      id: "3",
      content: "Someone actually chunned in the garden! 😂",
      timestamp: new Date("2024-01-15T22:37:00"),
      isFromCurrentUser: false,
      status: "read",
    },
    {
      id: "4",
      content: "Hahaha no way! Did you get it on video?",
      timestamp: new Date("2024-01-15T22:38:00"),
      isFromCurrentUser: true,
      status: "delivered",
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [chatUser] = useState<ChatUser>({
    id: "1",
    name: "Tina (aka tee)",
    username: "tina_tee",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      timestamp: new Date(),
      isFromCurrentUser: true,
      status: "sent",
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === message.id ? { ...msg, status: "delivered" } : msg)))
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp: Date): string => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (timestamp.toDateString() === today.toDateString()) {
      return "Today"
    } else if (timestamp.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return timestamp.toLocaleDateString()
    }
  }

  const getStatusIcon = (status: ChatMessage["status"]) => {
    switch (status) {
      case "sent":
        return "✓"
      case "delivered":
        return "✓✓"
      case "read":
        return <span className="text-blue-500">✓✓</span>
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = message.timestamp.toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
      return groups
    },
    {} as Record<string, ChatMessage[]>,
  )

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <button onClick={() => router.push(`/profile/${chatUser.id}`)}>
              <Avatar className="w-10 h-10 hover:opacity-80 transition-opacity">
                <AvatarImage src={chatUser.avatar || "/placeholder.svg"} />
                <AvatarFallback>{chatUser.name[0]}</AvatarFallback>
              </Avatar>
            </button>
            <div>
              <button
                onClick={() => router.push(`/profile/${chatUser.id}`)}
                className="font-semibold hover:underline text-left text-foreground"
              >
                {chatUser.name}
              </button>
              <p className="text-sm text-muted-foreground">
                {chatUser.isOnline ? "Online" : `Last seen ${chatUser.lastSeen?.toLocaleTimeString()}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationIcon unreadCount={0} />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex justify-center mb-4">
              <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
                {formatDate(new Date(date))}
              </span>
            </div>

            {/* Messages for this date */}
            <div className="space-y-2">
              {dayMessages.map((message) => (
                <div key={message.id} className={`flex ${message.isFromCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isFromCurrentUser ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs ${
                        message.isFromCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      <span>{formatTime(message.timestamp)}</span>
                      {message.isFromCurrentUser && <span className="ml-1">{getStatusIcon(message.status)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-card border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ProtectedChatPage() {
  return (
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  )
}
