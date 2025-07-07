"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Send, Trash2, MoreHorizontal } from "lucide-react"
import { EmojiReactions } from "./emoji-reactions"
import { RepostMenu } from "./repost-menu"
import { CommentsMenu } from "./comments-menu"
import { FriendStatusButton } from "./friend-status-button"
import { HashtagText } from "./hashtag-text"
import type { Post, User } from "@/types/feed"
import { SharePostModal } from "./share-post-modal"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PostItemProps {
  post: Post
  currentUser: User
  onReact: (postId: string, emoji: string) => void
  onComment: (postId: string, content: string, parentId?: string, gifUrl?: string) => void
  onLocationClick: (location: string) => void
  onTagClick: (tag: string) => void
  onHashtagClick: (hashtag: string) => void
  onUserClick: (userId: string) => void
  onSendFriendRequest: (userId: string) => void
  onSharePost: (postId: string, userId: string, message?: string) => void
  onDeletePost: (postId: string) => void
  onDeleteComment: (postId: string, commentId: string) => void
  users: User[]
  disableClick?: boolean
  hideCommentsMenu?: boolean
}

export function PostItem({
  post,
  currentUser,
  onReact,
  onComment,
  onLocationClick,
  onTagClick,
  onHashtagClick,
  onUserClick,
  onSendFriendRequest,
  onSharePost,
  onDeletePost,
  onDeleteComment,
  users,
  disableClick = false,
  hideCommentsMenu = false,
}: PostItemProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const router = useRouter()

  const handleViewReposts = () => {
    // Navigate to reposts page or show modal
    console.log("View reposts for post:", post.id)
    // You could navigate to `/post/${post.id}/reposts` or show a modal
  }

  const handleQuoteRepost = () => {
    // Navigate to new post page with original post data for quote repost
    const postData = encodeURIComponent(
      JSON.stringify({
        originalPost: {
          id: post.id,
          user: post.user,
          content: post.content,
          timestamp: post.timestamp,
          media: post.media,
        },
      }),
    )
    router.push(`/new/post?repost=${postData}`)
  }

  const handleViewComments = () => {
    router.push(`/post/${post.id}`)
  }

  const handleAddComment = () => {
    router.push(`/post/${post.id}`)
  }

  const handleSharePost = (userId: string, message?: string) => {
    onSharePost(post.id, userId, message)
  }

  return (
    <Card className={`mb-4 ${!disableClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`} onClick={!disableClick ? () => router.push(`/post/${post.id}`) : undefined}>
      <CardContent className="p-4">
        {/* User info */}
        <div className="flex items-start gap-3 mb-3">
          <button onClick={(e) => { e.stopPropagation(); router.push(`/profile/${post.user.id}`) }}>
            <Avatar className="w-12 h-12 hover:opacity-80 transition-opacity">
              <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
            </Avatar>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <button onClick={(e) => { e.stopPropagation(); router.push(`/profile/${post.user.id}`) }} className="hover:underline">
                <h3 className="font-semibold text-foreground">{post.user.name}</h3>
              </button>
              <button onClick={(e) => { e.stopPropagation(); router.push(`/profile/${post.user.id}`) }} className="hover:underline">
                <span className="text-muted-foreground text-sm">@{post.user.username}</span>
              </button>
              <FriendStatusButton user={post.user} onSendRequest={onSendFriendRequest} />
            </div>
            {post.user.location && (
              <button
                onClick={(e) => { e.stopPropagation(); onLocationClick(post.user.location!) }}
                className="flex items-center gap-1 text-sm text-muted-foreground mt-1 hover:text-blue-600 hover:underline"
              >
                <MapPin className="w-4 h-4" />
                {post.user.location}
              </button>
            )}
            <div className="text-xs text-muted-foreground mt-1">{post.timestamp.toLocaleString()}</div>
          </div>
          
          {/* Ellipsis menu for current user's posts */}
          {currentUser.id === post.user.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDeletePost(post.id) }} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Post content */}
        <div className="mb-3">
          <p className="text-foreground mb-2">
            <HashtagText text={post.content} onHashtagClick={onHashtagClick} />
          </p>

          {/* Media placeholder */}
          {post.media && (
            <div className="bg-muted border-2 border-dashed border-border rounded-lg p-8 text-center mb-3">
              <div className="text-muted-foreground">📷</div>
              <div className="text-sm text-muted-foreground mt-1">post media</div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 mb-3">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {post.tags.map((tag) => (
                <button key={tag} onClick={(e) => { e.stopPropagation(); onTagClick(tag) }}>
                  <Badge variant="secondary" className="text-xs hover:bg-muted cursor-pointer">
                    {tag}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quoted Post (for quote reposts) */}
        {post.quotedPost && (
          <Card className="mt-3 border border-border bg-muted cursor-pointer hover:bg-muted/80 transition-colors" onClick={(e) => { e.stopPropagation(); router.push(`/post/${post.quotedPost!.id}`) }}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={post.quotedPost.user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{post.quotedPost.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/profile/${post.quotedPost!.user.id}`) }}
                      className="hover:underline"
                    >
                      <span className="font-medium text-sm text-foreground">{post.quotedPost.user.name}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/profile/${post.quotedPost!.user.id}`) }}
                      className="hover:underline"
                    >
                      <span className="text-muted-foreground text-xs">@{post.quotedPost.user.username}</span>
                    </button>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(post.quotedPost.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-3">
                    <HashtagText text={post.quotedPost.content} onHashtagClick={onHashtagClick} />
                  </p>

                  {/* Condensed media for quoted post */}
                  {post.quotedPost.media && (
                    <div className="text-muted-foreground text-xs mt-2">
                      📷 media
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t" onClick={(e) => e.stopPropagation()}>
          <EmojiReactions reactions={post.reactions} onReact={(emoji) => onReact(post.id, emoji)} />

          <div className="flex items-center gap-2">
            <RepostMenu post={post} onViewReposts={handleViewReposts} onQuoteRepost={handleQuoteRepost} />
            
            {!hideCommentsMenu && (
              <CommentsMenu 
                post={post} 
                onViewComments={handleViewComments} 
                onAddComment={handleAddComment} 
              />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-2 h-8"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Share Modal */}
        <SharePostModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          post={post}
          users={users}
          onSharePost={handleSharePost}
        />
      </CardContent>
    </Card>
  )
}
