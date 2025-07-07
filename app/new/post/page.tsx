"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useParties } from "@/context/party-context"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { postService } from "@/lib/party-service"
import { X, Image, MapPin, Tag, BarChart3 } from "lucide-react"
import { Post } from "@/types/feed"
import { GifPicker } from "@/components/gif-picker"
import { PresetTagSelector } from "@/components/preset-tag-selector"
import { PollCreator } from "@/components/poll-creator"
import { LocationSelector } from "@/components/location-selector"

interface Poll {
  type: "vote" | "quiz" | "question"
  question: string
  options: Array<{ id: string; text: string; isCorrect?: boolean }>
}

interface NewPostContentAreaProps {
  content: string
  onContentChange: (content: string) => void
  placeholder: string
  maxLength: number
  selectedTags: string[]
  onRemoveTag: (tag: string) => void
  selectedGif?: string | null
  onRemoveGif: () => void
  selectedMedia?: { url: string; type: "image" | "video" } | null
  onRemoveMedia: () => void
  poll?: Poll | null
  onRemovePoll: () => void
  quotedPost?: Post | null
  isQuoteRepost?: boolean
  selectedLocation?: string | null
  onRemoveLocation: () => void
}

export function NewPostContentArea({
  content,
  onContentChange,
  placeholder,
  maxLength,
  selectedTags,
  onRemoveTag,
  selectedGif,
  onRemoveGif,
  selectedMedia,
  onRemoveMedia,
  poll,
  onRemovePoll,
  quotedPost,
  isQuoteRepost,
  selectedLocation,
  onRemoveLocation,
}: NewPostContentAreaProps) {
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

  return (
    <div className="px-4 pb-24">
      {/* Quote Repost indicator */}
      {isQuoteRepost && (
        <div className="flex items-center gap-2 mb-4 text-gray-500">
          <span className="text-sm">Quote Repost</span>
            </div>
      )}

      {/* Selected Location */}
      {selectedLocation && (
        <div className="flex items-center gap-2 mb-3 text-blue-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{selectedLocation}</span>
          <button
            onClick={onRemoveLocation}
            className="h-4 w-4 p-0 hover:bg-gray-300 rounded-full flex items-center justify-center"
          >
            ×
          </button>
          </div>
        )}

        {/* Post content */}
      <textarea
          value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-none resize-none text-lg focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[160px] bg-transparent"
          maxLength={maxLength}
        />

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedTags.map((tag) => (
            <div key={tag} className="flex items-center gap-1 bg-gray-200 px-2 py-1 rounded-full text-sm">
                {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="h-4 w-4 p-0 hover:bg-gray-300 rounded-full flex items-center justify-center"
              >
                ×
              </button>
            </div>
            ))}
          </div>
        )}

        {/* Selected GIF */}
        {selectedGif && (
          <div className="mt-3 relative inline-block">
            <img src={selectedGif || "/placeholder.svg"} alt="Selected GIF" className="max-w-48 rounded-lg" />
          <Button variant="destructive" size="sm" onClick={onRemoveGif} className="absolute top-1 right-1 h-6 w-6 p-0">
            ×
            </Button>
          </div>
        )}

        {/* Selected Media */}
        {selectedMedia && (
          <div className="mt-3 relative inline-block">
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url || "/placeholder.svg"}
                alt="Selected media"
                className="max-w-full max-h-64 rounded-lg"
              />
            ) : (
              <video src={selectedMedia.url} controls className="max-w-full max-h-64 rounded-lg" />
            )}
            <Button
              variant="destructive"
              size="sm"
            onClick={onRemoveMedia}
              className="absolute top-1 right-1 h-6 w-6 p-0"
            >
            ×
            </Button>
          </div>
        )}

        {/* Poll Preview */}
        {poll && (
        <div className="mt-3 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm font-medium capitalize">{poll.type} Poll</span>
                </div>
            <Button variant="ghost" size="sm" onClick={onRemovePoll} className="h-6 w-6 p-0">
              ×
                </Button>
              </div>
              <div className="text-sm font-medium mb-2">{poll.question}</div>
              {poll.type !== "question" && (
                <div className="space-y-1">
                  {poll.options.map((option) => (
                <div key={option.id} className="text-xs text-gray-600">
                      • {option.text}
                    </div>
                  ))}
                </div>
              )}
        </div>
      )}

      {/* Quoted Post Preview (for quote reposts) */}
      {quotedPost && (
        <div className="mt-4 border border-gray-200 rounded-lg p-3">
              <div className="flex items-start gap-3">
            <img
              src={quotedPost.user.avatar || "/placeholder.svg"}
              alt={quotedPost.user.name}
              className="w-8 h-8 rounded-full"
            />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{quotedPost.user.name}</span>
                <span className="text-gray-500 text-xs">@{quotedPost.user.username}</span>
                <span className="text-gray-400 text-xs">·</span>
                <span className="text-gray-400 text-xs">
                  {quotedPost.timestamp instanceof Date
                    ? getRelativeTime(quotedPost.timestamp)
                    : getRelativeTime(new Date(quotedPost.timestamp))}
                    </span>
                  </div>
              <p className="text-sm text-gray-900 line-clamp-3">{quotedPost.content}</p>

              {/* Media placeholder for quoted post */}
              {quotedPost.media && (
                <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-center mt-2">
                  <div className="text-gray-400 text-xs">📷 Original media</div>
                    </div>
                  )}
                </div>
              </div>
        </div>
      )}
    </div>
  )
}

export default function NewPostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const partyId = searchParams.get("party")
  const { parties } = useParties()
  const { user } = useAuth()
  const { toast } = useToast()

  const [content, setContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [selectedGif, setSelectedGif] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showGifPicker, setShowGifPicker] = useState(false)
  const [showTagSelector, setShowTagSelector] = useState(false)
  const [showPollCreator, setShowPollCreator] = useState(false)
  const [showLocationSelector, setShowLocationSelector] = useState(false)

  const currentParty = parties.find(p => p.id === partyId)
  const maxLength = 250
  const remainingCharacters = maxLength - content.length

  const handleContentChange = (newContent: string) => {
    if (newContent.length <= maxLength) {
      setContent(newContent)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && !selectedImage && !selectedGif && !poll) {
      toast({
        title: "Empty post",
        description: "Please add some content to your post.",
        variant: "destructive",
      })
      return
    }

    if (!user || !currentParty) return

    setIsSubmitting(true)

    try {
      // Create new post using Supabase
      const newPost = await postService.createPost({
        userId: user.id,
        userName: user.name,
        userUsername: user.username,
        userAvatar: user.avatar || "/placeholder-user.jpg",
        content: content.trim(),
        media: imagePreview || undefined,
        gifUrl: selectedGif || undefined,
        tags: selectedTags,
        poll: poll || undefined,
        location: selectedLocation || undefined,
      }, currentParty.id)

      toast({
        title: "Post created!",
        description: "Your post has been shared successfully.",
      })

      // Navigate back to feed
      router.push(`/feed?party=${partyId}`)
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentParty) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Party Not Found</h1>
          <p className="text-muted-foreground">The party you're trying to post to doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-foreground"
        >
          Cancel
        </Button>
        <div className="flex-1 text-center">
          <h1 className="font-semibold">New Post</h1>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (!content.trim() && !selectedImage && !selectedGif && !poll)}
          variant="ghost"
          className="text-foreground"
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </header>

      {/* User Info and Content */}
      <div className="flex gap-3 px-4 pt-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatar || "/placeholder-user.jpg"} />
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {/* User Info and Location Icon */}
          <div className="flex items-center gap-3 mb-3">
            <div>
              <span className="font-semibold text-foreground">{user?.name}</span>
              <span className="text-muted-foreground ml-2">@{user?.username}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowLocationSelector(true)}
              className="text-blue-600 hover:text-blue-700 p-0 h-auto"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Content Area */}
          <NewPostContentArea
            content={content}
            onContentChange={handleContentChange}
            placeholder="What's happening at the party?"
            maxLength={maxLength}
            selectedTags={selectedTags}
            onRemoveTag={(tag) => setSelectedTags(selectedTags.filter(t => t !== tag))}
            selectedGif={selectedGif || null}
            onRemoveGif={() => setSelectedGif("")}
            selectedMedia={imagePreview ? { url: imagePreview, type: "image" as const } : null}
            onRemoveMedia={() => {
              setSelectedImage(null)
              setImagePreview("")
            }}
            poll={poll}
            onRemovePoll={() => setPoll(null)}
            quotedPost={null}
            isQuoteRepost={false}
            selectedLocation={selectedLocation || null}
            onRemoveLocation={() => setSelectedLocation("")}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <label htmlFor="image-upload" className="cursor-pointer">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button variant="ghost" size="icon" asChild>
                <span>
                  <Image className="h-5 w-5" />
                </span>
              </Button>
            </label>
            
          <Button
            variant="ghost"
              size="icon"
              onClick={() => setShowGifPicker(true)}
          >
              <span className="text-xs font-bold">GIF</span>
          </Button>
            
          <Button
            variant="ghost"
              size="icon"
              onClick={() => setShowTagSelector(true)}
          >
              <Tag className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
              size="icon"
            onClick={() => setShowPollCreator(true)}
          >
              <BarChart3 className="h-5 w-5" />
          </Button>
          </div>

          <div className="text-sm text-gray-500">
            {remainingCharacters}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showGifPicker && (
        <GifPicker
          onSelectGif={(gifUrl: string) => {
            setSelectedGif(gifUrl)
            setShowGifPicker(false)
          }}
        />
      )}

      {showTagSelector && (
        <PresetTagSelector
          isOpen={showTagSelector}
          selectedTags={selectedTags}
          onUpdateTags={(tags: string[]) => {
            setSelectedTags(tags)
            setShowTagSelector(false)
          }}
          onClose={() => setShowTagSelector(false)}
        />
      )}

      {showPollCreator && (
      <PollCreator
        isOpen={showPollCreator}
          onCreatePoll={(newPoll) => {
            setPoll(newPoll)
            setShowPollCreator(false)
          }}
        onClose={() => setShowPollCreator(false)}
        />
      )}

      {showLocationSelector && (
        <LocationSelector
          isOpen={showLocationSelector}
          onSelectLocation={(location) => {
            setSelectedLocation(location)
            setShowLocationSelector(false)
          }}
          onClose={() => setShowLocationSelector(false)}
          partyLocationTags={currentParty?.locationTags || []}
          partyName={currentParty?.name}
        />
      )}
    </div>
  )
}
