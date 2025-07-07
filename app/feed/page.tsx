"use client"

import { useState, useEffect, useRef } from "react"
import { PostItem } from "@/components/post-item"
import { FilterBar } from "@/components/filter-bar"
import { BottomNavigation, type TabType } from "@/components/bottom-navigation"
import { SearchTab } from "@/components/search-tab"
import { MessagesTab } from "@/components/messages-tab"
import { AnnouncementsTab } from "@/components/announcements-tab"
import { FloatingActionButton } from "@/components/floating-action-button"
import { NotificationIcon } from "@/components/notification-icon"
import { DraftsList } from "@/components/drafts-list"
import type { Post, User, Comment, FilterState, Notification } from "@/types/feed"
import type { Party } from "@/types/party"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { HamburgerMenu } from "@/components/hamburger-menu"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Plus } from "lucide-react"
import { OfflineBanner } from "@/components/offline-banner"
import { useParties } from "@/context/party-context"
import { useAuth } from "@/context/auth-context"
import { postService } from "@/lib/party-service"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Calendar, Users } from "lucide-react"

function FeedPage() {
  const [activeTab, setActiveTab] = useState<TabType>("feed")
  const [showDrafts, setShowDrafts] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filters, setFilters] = useState<FilterState>({})
  const [currentParty, setCurrentParty] = useState<Party | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const startY = useRef<number>(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { getPartyById } = useParties()
  const { user } = useAuth()

  // Get party from URL params
  useEffect(() => {
    const partyId = searchParams.get("party")
    if (partyId) {
      const party = getPartyById(partyId)
      setCurrentParty(party || null)
    }
  }, [searchParams, getPartyById])

  // Load posts from localStorage when current party changes
  useEffect(() => {
    const loadPosts = async () => {
      if (currentParty && user) {
        try {
          // Check if we need to migrate posts from localStorage
          const postsKey = `posts_${currentParty.id}_${user.id}`
          const hasLocalPosts = localStorage.getItem(postsKey)
          
          if (hasLocalPosts) {
            console.log('Migrating posts from localStorage to Supabase...')
            try {
              await postService.migratePostsFromLocalStorage(currentParty.id, user.id)
              console.log('Post migration completed successfully')
            } catch (error) {
              console.error('Post migration failed:', error)
            }
          }
          
          // Load posts from Supabase
          const postsData = await postService.getPosts(currentParty.id, user.id)
          setPosts(postsData)
          
          // Set up real-time subscription for posts
          const subscription = postService.subscribeToPosts(currentParty.id, (payload) => {
            console.log('Real-time post update received:', payload)
            
            // Convert database fields to frontend format
            const convertPost = (post: any) => ({
              ...post,
              userId: post.user_id,
              userName: post.user_name,
              userUsername: post.user_username,
              userAvatar: post.user_avatar,
              gifUrl: post.gif_url,
              userReposted: post.user_reposted,
              timestamp: new Date(post.created_at)
            })
            
            if (payload.eventType === 'INSERT') {
              const newPost = convertPost(payload.new)
              setPosts(prev => [newPost, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              const updatedPost = convertPost(payload.new)
              setPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post))
            } else if (payload.eventType === 'DELETE') {
              const deletedPost = payload.old
              setPosts(prev => prev.filter(post => post.id !== deletedPost.id))
            }
          })
          
          return () => {
            subscription.unsubscribe()
          }
        } catch (error) {
          console.error('Error loading posts:', error)
          setPosts([])
        }
      } else {
        setPosts([])
      }
    }

    loadPosts()
  }, [currentParty, user])

  // Handle tab parameter from URL (for party invites)
  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab === "announcements") {
      setActiveTab("announcements")
    }
  }, [searchParams])

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (contentRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (contentRef.current?.scrollTop === 0 && startY.current > 0) {
      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current
      
      if (diff > 0) {
        e.preventDefault()
        const pullDistance = Math.min(diff * 0.5, 100)
        setPullDistance(pullDistance)
        setIsPulling(pullDistance > 20)
      }
    }
  }

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > 50) {
      setIsRefreshing(true)
      setPullDistance(0)
      setIsPulling(false)
      
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Refresh posts (in a real app, this would fetch new data)
      setPosts(prevPosts => [...prevPosts])
      setIsRefreshing(false)
    } else {
      setPullDistance(0)
      setIsPulling(false)
    }
    startY.current = 0
  }

  const handleReact = (postId: string, emoji: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          const existingReaction = post.reactions.find((r) => r.emoji === emoji)
          const userHasReacted = post.reactions.some((r) => r.userReacted)
          
          if (existingReaction) {
            // If user already reacted to this emoji, remove the reaction
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
              // If user hasn't reacted to this emoji, remove any existing reactions and add this one
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
            // New reaction - remove any existing user reactions and add this one
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
        }
        return post
      }),
    )
  }

  const handleComment = (postId: string, content: string, parentId?: string, gifUrl?: string) => {
    if (!user) return

    const newComment: Comment = {
      id: Date.now().toString(),
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        friendStatus: "self",
      },
      content,
      timestamp: new Date(),
      likes: 0,
      userLiked: false,
      replies: [],
      gifUrl,
    }

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          if (parentId) {
            // Add reply to existing comment
            const addReplyToComment = (comments: Comment[]): Comment[] =>
              comments.map((comment) => {
                if (comment.id === parentId) {
                  return {
                    ...comment,
                    replies: [...comment.replies, newComment],
                  }
                }
                return {
                  ...comment,
                  replies: addReplyToComment(comment.replies),
                }
              })

            return {
              ...post,
              comments: addReplyToComment(post.comments),
            }
          } else {
            // Add new top-level comment
            return {
              ...post,
              comments: [...post.comments, newComment],
            }
          }
        }
        return post
      }),
    )
  }

  const handleLocationClick = (location: string) => {
    setFilters((prev) => ({ ...prev, location }))
  }

  const handleTagClick = (tag: string) => {
    setFilters((prev) => ({ ...prev, tag }))
  }

  const handleHashtagClick = (hashtag: string) => {
    setFilters((prev) => ({ ...prev, hashtag }))
  }

  const handleUserClick = (userId: string) => {
    router.push(`/profile/${userId}`)
  }

  const handleSendFriendRequest = (userId: string) => {
    toast({
      title: "Friend Request Sent",
      description: "Your friend request has been sent!",
    })
  }

  const handleClearFilter = (filterType: keyof FilterState) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[filterType]
      return newFilters
    })
  }

  const handleClearAllFilters = () => {
    setFilters({})
  }

  const handleNewPost = () => {
    if (currentParty) {
      router.push(`/new/post?party=${currentParty.id}`)
    } else {
    router.push("/new/post")
    }
  }

  const handleCreateButtonPress = () => {
    const timer = setTimeout(() => {
      setShowDrafts(true)
    }, 500)
    setLongPressTimer(timer)
  }

  const handleCreateButtonRelease = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
      handleNewPost()
    }
  }

  const handleCreateButtonLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
  }

  const handleSharePost = (postId: string, userId: string, message?: string) => {
    toast({
      title: "Post Shared",
      description: "Post has been shared successfully!",
    })
  }

  const handleDeletePost = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
    toast({
      title: "Post Deleted",
      description: "Post has been deleted successfully!",
    })
  }

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
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
            ...post,
            comments: removeCommentFromArray(post.comments),
          }
        }
        return post
      }),
    )
  }

  const handleExitParty = () => {
    router.push("/")
  }

  const handlePartyCancelled = (partyId: string, partyName: string, cancelledBy: string) => {
    // Remove posts related to the cancelled party
    setPosts((prevPosts) =>
      prevPosts.filter((post) => {
        // Remove posts that are specifically about this party
        if (post.content.includes(partyName) && post.user.name === cancelledBy) {
          return false
        }
        return true
      }),
    )

    // Update party status
    setCurrentParty((prev) => prev && prev.id === partyId ? { ...prev, status: 'cancelled' } : prev)

    toast({
      title: "Party Cancelled",
      description: `${partyName} has been cancelled by ${cancelledBy}`,
      variant: "destructive",
    })
  }

  const isHostOfParty = (party: Party) => {
    return user && party.hosts.includes(user.name)
  }

  const getTabPosts = () => {
    if (activeTab === "starred") {
        return posts.filter((post) => post.user.friendStatus === "friends")
    }
    return posts
  }

  const getFilteredPosts = () => {
    const tabPosts = getTabPosts()
    return tabPosts.filter((post) => {
      if (filters.location && post.user.location !== filters.location) return false
      if (filters.tag && !post.tags.includes(filters.tag)) return false
      if (filters.hashtag && !post.content.includes(`#${filters.hashtag}`)) return false
      return true
    })
  }

  const filteredPosts = getFilteredPosts()
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime()
    const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime()
    return bTime - aTime
  })

  const getTabTitle = () => {
    if (currentParty) {
      switch (activeTab) {
        case "starred":
          return "Starred"
        case "announcements":
          return "Announcements"
        case "search":
          return "Search"
        case "messages":
          return "Messages"
        default:
          return currentParty.name
      }
    }

    switch (activeTab) {
      case "starred":
        return "Starred"
      case "announcements":
        return "Announcements"
      case "search":
        return "Search"
      case "messages":
        return "Messages"
      default:
        return "fomo"
    }
  }

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length

  // Create a user object with friendStatus for components that require it
  const currentUserWithStatus: User | null = user ? {
    ...user,
    friendStatus: "self" as const
  } : null

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Offline Banner */}
      <OfflineBanner />
      
      {/* Navbar with Exit Button */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="w-10">
            {currentParty && (
              <Button variant="ghost" size="sm" onClick={handleExitParty} className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          <h1 className="text-lg font-semibold text-foreground">{getTabTitle()}</h1>

          <div className="flex items-center">
            <NotificationIcon unreadCount={unreadCount} />
            <HamburgerMenu />
          </div>
        </div>
      </div>

      {/* Filter Bar (only show for feed and starred tabs) */}
      {(activeTab === "feed" || activeTab === "starred") && (
        <div className="sticky top-[57px] z-40 bg-background border-b border-border">
          <FilterBar filters={filters} onClearFilter={handleClearFilter} onClearAll={handleClearAllFilters} />
        </div>
      )}

      {/* Content */}
      <div 
        ref={contentRef}
        className="max-w-2xl mx-auto overflow-y-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Pull-to-refresh indicator */}
        {(isPulling || isRefreshing) && (
          <div className="flex justify-center items-center py-4 mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                {isRefreshing ? 'Refreshing...' : 'Pull to refresh'}
              </span>
            </div>
          </div>
        )}

        <div className="p-4">
          {activeTab === "search" ? (
            <SearchTab
              posts={posts}
              currentUser={currentUserWithStatus!}
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
              users={[]}
            />
          ) : activeTab === "messages" ? (
            <MessagesTab currentUser={currentUserWithStatus!} users={[]} posts={posts} partyName={currentParty?.name} />
          ) : activeTab === "announcements" ? (
            <AnnouncementsTab
              posts={posts}
              currentUser={currentUserWithStatus!}
              users={[]}
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
              onPartyCancelled={handlePartyCancelled}
              currentParty={currentParty}
            />
          ) : sortedPosts.length === 0 ? (
            <div className="text-center text-muted-foreground mt-8">
              {activeTab === "starred" && "No posts from friends yet."}
              {activeTab === "feed" && "No posts found."}
            </div>
          ) : (
            sortedPosts.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                currentUser={currentUserWithStatus!}
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
                users={[]}
              />
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button with Long Press */}
      <div className="fixed bottom-24 right-6 z-40">
        <Button
          onMouseDown={handleCreateButtonPress}
          onMouseUp={handleCreateButtonRelease}
          onMouseLeave={handleCreateButtonLeave}
          onTouchStart={handleCreateButtonPress}
          onTouchEnd={handleCreateButtonRelease}
          className="h-14 w-14 rounded-full shadow-lg bg-pink-600 hover:bg-pink-700 z-40"
          size="icon"
        >
          <Plus className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} showDrafts={false} />

      {/* Drafts Modal */}
      <DraftsList isOpen={showDrafts} onClose={() => setShowDrafts(false)} />
    </div>
  )
}

export default function ProtectedFeedPage() {
  return (
    <ProtectedRoute>
      <FeedPage />
    </ProtectedRoute>
  )
}
