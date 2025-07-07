"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { PostItem } from "@/components/post-item"
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

// Mock reposts data
const mockReposts: Post[] = []

function RepostsPage() {
  const [originalPost, setOriginalPost] = useState<Post | null>(null)
  const [reposts, setReposts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const postId = params.postId as string
    
    // In a real app, you would fetch the original post and its reposts from an API
    // For now, we'll use mock data
    const foundOriginalPost = {
      id: "1",
      user: mockUsers[0],
      content: "Rina just chunned #party #wild",
      media: "placeholder",
      tags: ["chunder"],
      timestamp: new Date("2024-01-15T22:30:00"),
      reactions: [
        { id: "1", emoji: "❤️", label: "Love", count: 3, userReacted: false },
        { id: "2", emoji: "😂", label: "Funny", count: 1, userReacted: false },
      ],
      comments: [],
      reposts: 2,
      userReposted: false,
    }
    
    if (foundOriginalPost) {
      setOriginalPost(foundOriginalPost)
      setReposts(mockReposts)
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
    setReposts(prevReposts => 
      prevReposts.map(post => {
        if (post.id !== postId) return post
        
        const existingReaction = post.reactions.find((r) => r.emoji === emoji)
        const userHasReacted = post.reactions.some((r) => r.userReacted)
        
        if (existingReaction) {
          if (existingReaction.userReacted) {
            return {
              ...post,
              reactions: post.reactions.map((r) =>
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
              ...post,
              reactions: post.reactions.map((r) => ({
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
            ...post,
            reactions: [
              ...post.reactions.map((r) => ({
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
    )
  }

  const handleComment = (postId: string, content: string, parentId?: string, gifUrl?: string) => {
    // Handle comment addition for reposts
    console.log("Adding comment to repost:", postId, content)
  }

  const handleDeletePost = (postId: string) => {
    setReposts(prevReposts => prevReposts.filter(post => post.id !== postId))
    toast({
      title: "Repost Deleted",
      description: "Your repost has been deleted successfully.",
    })
  }

  const handleDeleteComment = (postId: string, commentId: string) => {
    // Handle comment deletion for reposts
    console.log("Deleting comment from repost:", postId, commentId)
  }

  const handleLocationClick = (location: string) => {
    router.push(`/feed?location=${encodeURIComponent(location)}`)
  }

  const handleTagClick = (tag: string) => {
    router.push(`/feed?tag=${encodeURIComponent(tag)}`)
  }

  const handleHashtagClick = (hashtag: string) => {
    router.push(`/feed?hashtag=${encodeURIComponent(hashtag)}`)
  }

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  const handleSendFriendRequest = (userId: string) => {
    console.log("Sending friend request to:", userId)
  }

  const handleSharePost = (postId: string, userId: string, message?: string) => {
    console.log(`Sharing repost ${postId} with user ${userId}`, message)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Reposts</h1>
            <div className="w-8"></div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto p-4">
          <div className="text-center text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  if (!originalPost) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Reposts</h1>
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
          <h1 className="text-lg font-semibold text-foreground">Reposts</h1>
          <div className="flex items-center gap-2">
            <NotificationIcon unreadCount={0} />
            <HamburgerMenu />
          </div>
        </div>
      </div>

      {/* Original Post */}
      <div className="max-w-2xl mx-auto p-4">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Original Post</h2>
          <PostItem
            post={originalPost}
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

        {/* Reposts */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            {reposts.length} {reposts.length === 1 ? "Repost" : "Reposts"}
          </h2>
          
          {reposts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="text-lg font-medium mb-2">No reposts yet</div>
              <p className="text-sm">Be the first to repost this!</p>
            </div>
          ) : (
            reposts.map((repost) => (
              <PostItem
                key={repost.id}
                post={repost}
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
                hideCommentsMenu={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProtectedRepostsPage() {
  return (
    <ProtectedRoute>
      <RepostsPage />
    </ProtectedRoute>
  )
} 