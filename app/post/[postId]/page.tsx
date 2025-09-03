"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { PostItem } from "@/components/post-item"
import { CommentSection } from "@/components/comment-section"
import { NotificationIcon } from "@/components/notification-icon"
import { HamburgerMenu } from "@/components/hamburger-menu"
import { useToast } from "@/hooks/use-toast"
import type { Post, User, Comment } from "@/types/feed"

// Mock data (in a real app, this would come from an API)
const currentUser: User = {
  id: "current-user",
  name: "You",
  username: "you",
  avatar: "/placeholder.svg?height=40&width=40",
  friendStatus: "self",
}

const mockUsers: User[] = []

const mockPosts: Post[] = []

function PostDetailPage() {
  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const postId = params.postId as string
    const foundPost = mockPosts.find(p => p.id === postId)
    
    if (foundPost) {
      setPost(foundPost)
    } else {
      toast({
        title: "Post not found",
        description: "The post you're looking for doesn't exist.",
        variant: "destructive",
      })
      router.push("/feed")
    }
    
    setIsLoading(false)
  }, [params.postId, router, toast])

  const handleBack = () => {
    router.back()
  }

  const handleReact = (postId: string, emoji: string) => {
    setPost(prevPost => {
      if (!prevPost || prevPost.id !== postId) return prevPost
      
      const existingReaction = prevPost.reactions.find((r) => r.emoji === emoji)
      const userHasReacted = prevPost.reactions.some((r) => r.userReacted)
      
      if (existingReaction) {
        if (existingReaction.userReacted) {
          return {
            ...prevPost,
            reactions: prevPost.reactions.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count - 1,
                    userReacted: false,
                  }
                : r,
            ),
          }
        } else {
          return {
            ...prevPost,
            reactions: prevPost.reactions.map((r) => ({
              ...r,
              userReacted: false,
              count: r.userReacted ? r.count - 1 : r.count,
            })).map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count + 1,
                    userReacted: true,
                  }
                : r,
            ),
          }
        }
      } else {
        return {
          ...prevPost,
          reactions: [
            ...prevPost.reactions.map((r) => ({
              ...r,
              userReacted: false,
              count: r.userReacted ? r.count - 1 : r.count,
            })),
            {
              id: Date.now().toString(),
              emoji,
              label: emoji,
              count: 1,
              userReacted: true,
            },
          ],
        }
      }
    })
  }

  const handleComment = (postId: string, content: string, parentId?: string, gifUrl?: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      user: currentUser,
      content,
      timestamp: new Date(),
      replies: [],
      likes: 0,
      userLiked: false,
      gifUrl,
    }

    setPost(prevPost => {
      if (!prevPost || prevPost.id !== postId) return prevPost
      
      if (parentId) {
        const addReplyToComment = (comments: Comment[]): Comment[] =>
          comments.map((comment) =>
            comment.id === parentId
              ? { ...comment, replies: [...comment.replies, newComment] }
              : { ...comment, replies: addReplyToComment(comment.replies) },
          )

        return {
          ...prevPost,
          comments: addReplyToComment(prevPost.comments),
        }
      } else {
        return {
          ...prevPost,
          comments: [...prevPost.comments, newComment],
        }
      }
    })
  }

  const handleDeletePost = (postId: string) => {
    setPost(null)
    toast({
      title: "Post Deleted",
      description: "Your post has been deleted successfully.",
    })
    router.back()
  }

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPost(prevPost => {
      if (!prevPost || prevPost.id !== postId) return prevPost
      
      const removeCommentFromArray = (comments: Comment[]): Comment[] =>
        comments.filter((comment) => {
          if (comment.id === commentId) {
            return false
          }
          return {
            ...comment,
            replies: removeCommentFromArray(comment.replies),
          }
        })

      return {
        ...prevPost,
        comments: removeCommentFromArray(prevPost.comments),
      }
    })
    
    toast({
      title: "Comment Deleted",
      description: "Your comment has been deleted successfully.",
    })
  }

  const handleLocationClick = (location: string) => {
    // Navigate to feed with location filter
    router.push(`/feed?location=${encodeURIComponent(location)}`)
  }

  const handleTagClick = (tag: string) => {
    // Navigate to feed with tag filter
    router.push(`/feed?tag=${encodeURIComponent(tag)}`)
  }

  const handleHashtagClick = (hashtag: string) => {
    // Navigate to feed with hashtag filter
    router.push(`/feed?hashtag=${encodeURIComponent(hashtag)}`)
  }

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  const handleSendFriendRequest = (userId: string) => {
    console.log("Sending friend request to:", userId)
  }

  const handleSharePost = (postId: string, userId: string, message?: string) => {
    console.log(`Sharing post ${postId} with user ${userId}`, message)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Post</h1>
            <div className="w-8"></div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-4">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Post</h1>
            <div className="w-8"></div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-4">
          <div className="text-center text-muted-foreground">Post not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Post</h1>
          <div className="flex items-center gap-2">
            <NotificationIcon unreadCount={0} />
            <HamburgerMenu />
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4">
          <PostItem
            post={post}
            currentUser={currentUser}
            onReact={handleReact}
            onComment={handleComment}
            onLocationClick={handleLocationClick}
            onTagClick={handleTagClick}
            onHashtagClick={handleHashtagClick}
            onUserClick={handleUserClick}
            onSendFriendRequest={handleSendFriendRequest}
            onSharePost={handleSharePost}
            onDeletePost={handleDeletePost}
            onDeleteComment={handleDeleteComment}
            users={mockUsers}
            disableClick={true}
            hideCommentsMenu={true}
          />
        </div>

        {/* Comments Section */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Comments</h3>
          <CommentSection
            comments={post.comments}
            onAddComment={(content, parentId, gifUrl) => handleComment(post.id, content, parentId, gifUrl)}
            onUserClick={handleUserClick}
            currentUser={currentUser}
            onDeleteComment={(commentId) => handleDeleteComment(post.id, commentId)}
            postId={post.id}
            showAllComments={true}
          />
        </div>
      </div>
    </div>
  )
}

export default function ProtectedPostDetailPage() {
  return (
    <ProtectedRoute>
      <PostDetailPage />
    </ProtectedRoute>
  )
}
