"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Search, Send, Star } from "lucide-react"
import type { User, Post } from "@/types/feed"

interface SharePostModalProps {
  isOpen: boolean
  onClose: () => void
  post: Post
  users: User[]
  onSharePost: (userId: string, message?: string) => void
}

export function SharePostModal({ isOpen, onClose, post, users, onSharePost }: SharePostModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [message, setMessage] = useState("")

  // Sort users to prioritize friends
  const sortedUsers = [...users].sort((a, b) => {
    // Friends first
    if (a.friendStatus === "friends" && b.friendStatus !== "friends") return -1
    if (a.friendStatus !== "friends" && b.friendStatus === "friends") return 1
    return 0
  })

  const filteredUsers = sortedUsers.filter(
    (user) =>
      user.friendStatus !== "self" &&
      (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleSend = () => {
    if (selectedUser) {
      onSharePost(selectedUser.id, message)
      setMessage("")
      setSelectedUser(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Post preview */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{post.user.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{post.user.name}</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
          </div>

          {/* Search users */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="flex-1"
            />
          </div>

          {/* User list */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No users found</div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                    selectedUser?.id === user.id ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      {user.friendStatus === "friends" && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>
                    <span className="text-sm text-gray-500">@{user.username}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message input */}
          {selectedUser && (
            <div className="space-y-2">
              <div className="text-sm">
                Sending to <span className="font-medium">{selectedUser.name}</span>
              </div>
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a message (optional)"
                  className="flex-1"
                />
                <Button onClick={handleSend}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
