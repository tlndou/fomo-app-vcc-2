"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, Repeat2, Send, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { HamburgerMenu } from "@/components/hamburger-menu"
import type { User, Notification } from "@/types/feed"
import { NotificationIcon } from "@/components/notification-icon"

// Mock users for notifications
const mockUsers: User[] = []

// Mock notifications
const mockNotifications: Notification[] = []

function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "messages">("all")
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const router = useRouter()

  const handleMarkNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === notificationId ? { ...notification, read: true } : notification)),
    )
  }

  const handleAcceptFriendRequest = (userId: string, notificationId: string) => {
    console.log("Accepting friend request from:", userId)
    handleMarkNotificationRead(notificationId)
  }

  const handleDeclineFriendRequest = (userId: string, notificationId: string) => {
    console.log("Declining friend request from:", userId)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "reaction":
        return <Heart className="w-4 h-4 text-red-500" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "friend_request":
        return <UserPlus className="w-4 h-4 text-green-500" />
      case "friend_accepted":
        return <UserPlus className="w-4 h-4 text-green-600" />
      case "repost":
        return <Repeat2 className="w-4 h-4 text-purple-500" />
      case "quote_repost":
        return <MessageCircle className="w-4 h-4 text-purple-600" />
      case "share":
        return <Send className="w-4 h-4 text-pink-500" />
      case "party_cancelled":
        return <X className="w-4 h-4 text-red-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getNotificationText = (notification: Notification) => {
    const userCount = notification.users.length
    const firstUser = notification.users[0]

    if (userCount === 1) {
      switch (notification.type) {
        case "reaction":
          return `reacted ${notification.emoji} to your post`
        case "comment":
          return "commented on your post"
        case "friend_request":
          return "sent you a friend request"
        case "friend_accepted":
          return "accepted your friend request"
        case "repost":
          return "reposted your post"
        case "quote_repost":
          return "quote reposted your post"
        case "share":
          return "shared your post"
        case "party_cancelled":
          return "cancelled a party"
        default:
          return "interacted with your content"
      }
    } else if (userCount === 2) {
      const secondUser = notification.users[1]
      switch (notification.type) {
        case "reaction":
          return `and ${secondUser.name} reacted ${notification.emoji} to your post`
        case "repost":
          return `and ${secondUser.name} reposted your post`
        case "share":
          return `and ${secondUser.name} shared your post`
        case "party_cancelled":
          return `and ${secondUser.name} cancelled a party`
        default:
          return `and ${secondUser.name} interacted with your content`
      }
    } else {
      const othersCount = userCount - 1
      switch (notification.type) {
        case "reaction":
          return `and ${othersCount} other${othersCount > 1 ? "s" : ""} reacted ${notification.emoji} to your post`
        case "repost":
          return `and ${othersCount} other${othersCount > 1 ? "s" : ""} reposted your post`
        case "share":
          return `and ${othersCount} other${othersCount > 1 ? "s" : ""} shared your post`
        case "party_cancelled":
          return `and ${othersCount} other${othersCount > 1 ? "s" : ""} cancelled a party`
        default:
          return `and ${othersCount} other${othersCount > 1 ? "s" : ""} interacted with your content`
      }
    }
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

  const renderUserAvatars = (users: User[], maxShow = 3) => {
    const showUsers = users.slice(0, maxShow)
    const remainingCount = users.length - maxShow

    return (
      <div className="flex -space-x-2">
        {showUsers.map((user, index) => (
          <Avatar key={user.id} className="w-8 h-8 border-2 border-white">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
        ))}
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
            +{remainingCount}
          </div>
        )}
      </div>
    )
  }

  const filteredNotifications =
    activeTab === "active"
      ? notifications.filter((n) => n.partyId) // Only show notifications from parties
      : notifications

  // Mock message notifications
  const [messageNotifications] = useState<any[]>([])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Notifications</h1>
          <div className="flex items-center gap-2">
            <NotificationIcon unreadCount={unreadCount} />
            <HamburgerMenu />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Tab Navigation */}
        <div className="mb-4">
          <div className="flex gap-1 bg-muted p-1 rounded-lg w-full">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              onClick={() => setActiveTab("all")}
              className="flex-1 rounded-md"
            >
              All
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Button
              variant={activeTab === "active" ? "default" : "ghost"}
              onClick={() => setActiveTab("active")}
              className="flex-1 rounded-md"
            >
              Active
            </Button>
            <Button
              variant={activeTab === "messages" ? "default" : "ghost"}
              onClick={() => setActiveTab("messages")}
              className="flex-1 rounded-md"
            >
              Messages
              <Badge variant="destructive" className="ml-2">
                2
              </Badge>
            </Button>
          </div>
        </div>

        {/* View All Messages Link */}
        {activeTab === "messages" && (
          <div className="text-center mb-4">
            <button
              onClick={() => router.push("/messages")}
              className="text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              View all messages
            </button>
          </div>
        )}

        {/* Notifications List */}
        {activeTab === "messages" ? (
          <div>
            {messageNotifications.length === 0 ? (
              <div className="text-center text-muted-foreground mt-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                <p className="text-sm">You'll see message notifications here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messageNotifications.map((msg) => (
                  <Card
                    key={msg.id}
                    className={`transition-colors cursor-pointer ${!msg.read ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" : "hover:bg-muted/50"}`}
                    onClick={() => router.push(`/messages/${msg.user.id}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={msg.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{msg.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{msg.user.name}</span>
                            <span className="text-sm text-muted-foreground">sent you a message</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{msg.content}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-muted-foreground">{getRelativeTime(msg.timestamp)}</span>
                          {!msg.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center text-muted-foreground mt-8">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
            <p className="text-sm">You'll see notifications for reactions, comments, and friend requests here</p>
          </div>
        ) : (
          filteredNotifications
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  !notification.read ? "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" : "hover:bg-muted/50"
                }`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Avatar(s) */}
                    {notification.users.length === 1 ? (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.users[0].avatar || "/placeholder.svg"} />
                        <AvatarFallback>{notification.users[0].name[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      renderUserAvatars(notification.users)
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getNotificationIcon(notification.type)}
                        <span className="font-medium">{notification.users[0].name}</span>
                        <span className="text-sm text-muted-foreground">{getNotificationText(notification)}</span>
                      </div>

                      {/* Party Name */}
                      {notification.partyName && (
                        <div className="text-xs text-blue-600 mb-2">in {notification.partyName}</div>
                      )}

                      {/* Friend Request Actions */}
                      {notification.type === "friend_request" && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              handleAcceptFriendRequest(notification.users[0].id, notification.id)
                            }}
                            className="h-7 px-3"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              handleDeclineFriendRequest(notification.users[0].id, notification.id)
                            }}
                            className="h-7 px-3"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {/* Quote Repost Content */}
                      {notification.type === "quote_repost" && notification.quoteContent && (
                        <div className="bg-muted rounded p-2 mt-2 text-sm text-muted-foreground">
                          <p className="line-clamp-2">"{notification.quoteContent}"</p>
                        </div>
                      )}

                      {/* Original Post Preview */}
                      {notification.post && notification.type !== "quote_repost" && (
                        <div className="bg-muted rounded p-2 mt-2 text-sm text-muted-foreground">
                          <p className="line-clamp-2">"{notification.post.content}"</p>
                        </div>
                      )}

                      {/* Share Message */}
                      {notification.message && (
                        <div className="text-sm text-muted-foreground mt-1">"{notification.message}"</div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">{getRelativeTime(notification.timestamp)}</span>
                      {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                      {notification.type !== "friend_request" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkNotificationRead(notification.id)}
                          className="h-6 w-6 p-0 text-xs"
                        >
                          ✓
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  )
}

export default function ProtectedNotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsPage />
    </ProtectedRoute>
  )
}
