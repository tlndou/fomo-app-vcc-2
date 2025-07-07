"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Repeat2, Eye, MessageSquare } from "lucide-react"
import type { Post } from "@/types/feed"
import { useRouter } from "next/navigation"

interface RepostMenuProps {
  post: Post
  onViewReposts?: () => void
  onQuoteRepost: () => void
}

export function RepostMenu({ post, onViewReposts, onQuoteRepost }: RepostMenuProps) {
  const router = useRouter()
  const handleViewReposts = () => {
    if (onViewReposts) {
      onViewReposts()
    } else {
      router.push(`/post/${post.id}/reposts`)
    }
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8">
          <Repeat2 className="w-4 h-4" />
          {post.reposts}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" onClick={handleViewReposts} className="w-full justify-start gap-2">
            <Eye className="w-4 h-4" />
            View all reposts ({post.reposts})
          </Button>

          <Button variant="ghost" size="sm" onClick={onQuoteRepost} className="w-full justify-start gap-2">
            <MessageSquare className="w-4 h-4" />
            Quote repost
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
