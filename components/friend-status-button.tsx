"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck, Clock } from "lucide-react"
import type { User } from "@/types/feed"

interface FriendStatusButtonProps {
  user: User
  onSendRequest: (userId: string) => void
  onAcceptRequest?: (userId: string) => void
}

export function FriendStatusButton({ user, onSendRequest, onAcceptRequest }: FriendStatusButtonProps) {
  const [status, setStatus] = useState(user.friendStatus || "none")

  if (user.friendStatus === "self") {
    return null // Don't show friend button for current user
  }

  const handleClick = () => {
    if (status === "none") {
      onSendRequest(user.id)
      setStatus("pending")
    } else if (status === "pending" && onAcceptRequest) {
      onAcceptRequest(user.id)
      setStatus("friends")
    }
  }

  const getButtonContent = () => {
    switch (status) {
      case "friends":
        return (
          <>
            <UserCheck className="w-4 h-4" />
            Friends
          </>
        )
      case "pending":
        return (
          <>
            <Clock className="w-4 h-4" />
            Pending
          </>
        )
      default:
        return (
          <>
            <UserPlus className="w-4 h-4" />
            Add Friend
          </>
        )
    }
  }

  return (
    <Button
      variant={status === "friends" ? "secondary" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={status === "pending"}
      className="flex items-center gap-1 h-7 text-xs"
    >
      {getButtonContent()}
    </Button>
  )
}
