"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MessageSquare, Eye, Plus } from "lucide-react"
import type { Post } from "@/types/feed"
import { useRouter } from "next/navigation"

interface CommentsMenuProps {
  post: Post
  onViewComments: () => void
  onAddComment: () => void
}

export function CommentsMenu({ post, onViewComments, onAddComment }: CommentsMenuProps) {
  const router = useRouter()
  const hasComments = post.comments.length > 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8">
          <MessageSquare className="w-4 h-4" />
          {hasComments && post.comments.length}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2">
        <div className="space-y-1">
          {hasComments ? (
            <>
              <Button variant="ghost" size="sm" onClick={onViewComments} className="w-full justify-start gap-2">
                <Eye className="w-4 h-4" />
                View all comments ({post.comments.length})
              </Button>

              <Button variant="ghost" size="sm" onClick={onAddComment} className="w-full justify-start gap-2">
                <Plus className="w-4 h-4" />
                Add comment
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={onAddComment} className="w-full justify-start gap-2">
              <Plus className="w-4 h-4" />
              Add comment
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
} 