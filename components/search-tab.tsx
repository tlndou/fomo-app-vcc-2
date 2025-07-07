"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Hash, Tag, User, ImageIcon } from "lucide-react"
import { PostItem } from "./post-item"
import type { Post, User as UserType } from "@/types/feed"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SearchTabProps {
  posts: Post[]
  currentUser: UserType
  users: UserType[]
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
}

export function SearchTab({
  posts,
  currentUser,
  users,
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
}: SearchTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"all" | "users" | "locations" | "tags" | "hashtags" | "media">("all")
  const [searchResults, setSearchResults] = useState<Post[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    const query = searchQuery.toLowerCase()
    let results: Post[] = []

    switch (searchType) {
      case "users":
        results = posts.filter(
          (post) => post.user.name.toLowerCase().includes(query) || post.user.username.toLowerCase().includes(query),
        )
        break
      case "locations":
        results = posts.filter((post) => post.user.location?.toLowerCase().includes(query))
        break
      case "tags":
        results = posts.filter((post) => post.tags.some((tag) => tag.toLowerCase().includes(query)))
        break
      case "hashtags":
        results = posts.filter((post) => post.content.toLowerCase().includes(`#${query}`))
        break
      case "media":
        results = posts.filter((post) => post.media !== undefined)
        break
      default:
        results = posts.filter(
          (post) =>
            post.content.toLowerCase().includes(query) ||
            post.user.name.toLowerCase().includes(query) ||
            post.user.username.toLowerCase().includes(query) ||
            post.user.location?.toLowerCase().includes(query) ||
            post.tags.some((tag) => tag.toLowerCase().includes(query)),
        )
    }

    setSearchResults(results)
    setHasSearched(true)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const searchTypeOptions = [
    { id: "all", label: "All", icon: Search },
    { id: "users", label: "Users", icon: User },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "tags", label: "Tags", icon: Tag },
    { id: "hashtags", label: "Hashtags", icon: Hash },
    { id: "media" as const, label: "Media", icon: ImageIcon },
  ] as const

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="bg-white p-4 border-b">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search posts, users, locations..."
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {/* Search Type Filter */}
          <div className="flex gap-1 overflow-x-auto">
            {searchTypeOptions.map((option) => {
              const Icon = option.icon
              return (
                <Popover key={option.id}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={searchType === option.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (option.id === "all") {
                          setSearchQuery("")
                          setSearchType("all")
                          setSearchResults([])
                          setHasSearched(false)
                        }
                      }}
                      className="flex items-center gap-1 whitespace-nowrap"
                    >
                      <Icon className="w-3 h-3" />
                      {option.label}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <div className="space-y-1">
                      {option.id === "users" && (
                        <>
                          {Array.from(new Set(posts.map((post) => post.user.name))).map((userName) => (
                            <Button
                              key={userName}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSearchQuery(userName)
                                setSearchType("users")
                                handleSearch()
                              }}
                              className="w-full justify-start text-sm"
                            >
                              <User className="w-3 h-3 mr-2" />
                              {userName}
                            </Button>
                          ))}
                        </>
                      )}
                      {option.id === "locations" && (
                        <>
                          {Array.from(new Set(posts.map((post) => post.user.location).filter(Boolean))).map(
                            (location) => (
                              <Button
                                key={location}
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSearchQuery(location!)
                                  setSearchType("locations")
                                  handleSearch()
                                }}
                                className="w-full justify-start text-sm"
                              >
                                <MapPin className="w-3 h-3 mr-2" />
                                {location}
                              </Button>
                            ),
                          )}
                        </>
                      )}
                      {option.id === "tags" && (
                        <>
                          {Array.from(new Set(posts.flatMap((post) => post.tags))).map((tag) => (
                            <Button
                              key={tag}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSearchQuery(tag)
                                setSearchType("tags")
                                handleSearch()
                              }}
                              className="w-full justify-start text-sm"
                            >
                              <Tag className="w-3 h-3 mr-2" />
                              {tag}
                            </Button>
                          ))}
                        </>
                      )}
                      {option.id === "hashtags" && (
                        <>
                          {Array.from(
                            new Set(
                              posts.flatMap(
                                (post) => post.content.match(/#\w+/g)?.map((hashtag) => hashtag.slice(1)) || [],
                              ),
                            ),
                          ).map((hashtag) => (
                            <Button
                              key={hashtag}
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSearchQuery(hashtag)
                                setSearchType("hashtags")
                                handleSearch()
                              }}
                              className="w-full justify-start text-sm"
                            >
                              <Hash className="w-3 h-3 mr-2" />#{hashtag}
                            </Button>
                          ))}
                        </>
                      )}
                      {option.id === "media" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchType("media")
                            handleSearch()
                          }}
                          className="w-full justify-start text-sm"
                        >
                          <ImageIcon className="w-3 h-3 mr-2" />
                          Posts with media
                        </Button>
                      )}
                      {option.id === "all" && (
                        <div className="text-xs text-gray-500 p-2">Search across all content types</div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )
            })}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="px-4">
        {!hasSearched ? (
          <div className="text-center text-gray-500 mt-8">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Search the party</h3>
            <p className="text-sm">Find posts, people, locations, and more</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-lg font-medium mb-2">No results found</div>
            <p className="text-sm">Try searching for something else</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Found {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{searchQuery}"
            </div>
            {searchResults.map((post) => (
              <PostItem
                key={post.id}
                post={post}
                currentUser={currentUser}
                onReact={onReact}
                onComment={onComment}
                onLocationClick={onLocationClick}
                onTagClick={onTagClick}
                onHashtagClick={onHashtagClick}
                onUserClick={onUserClick}
                onSendFriendRequest={onSendFriendRequest}
                onSharePost={onSharePost}
                onDeletePost={onDeletePost}
                onDeleteComment={onDeleteComment}
                users={users}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
