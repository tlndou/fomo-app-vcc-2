"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Heart, Flame, ThumbsDown, Laugh, Zap, Frown, MoreHorizontal } from "lucide-react"
import type { Reaction } from "@/types/feed"

const REACTION_EMOJIS = [
  { emoji: "❤️", icon: Heart, label: "Love" },
  { emoji: "🔥", icon: Flame, label: "Fire" },
  { emoji: "👎", icon: ThumbsDown, label: "Dislike" },
  { emoji: "😂", icon: Laugh, label: "Funny" },
  { emoji: "👏", icon: Zap, label: "Clap" },
  { emoji: "😱", icon: Zap, label: "Shocked" },
  { emoji: "😢", icon: Frown, label: "Sad" },
]

interface EmojiReactionsProps {
  reactions: Reaction[]
  onReact: (emoji: string) => void
}

export function EmojiReactions({ reactions, onReact }: EmojiReactionsProps) {
  const [showReactionPanel, setShowReactionPanel] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const reactionPanelRef = useRef<HTMLDivElement>(null)

  const heartReaction = reactions.find((r) => r.emoji === "❤️")
  const otherReactions = reactions.filter((r) => r.emoji !== "❤️")

  // Handle long press to show reaction panel
  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setShowReactionPanel(true)
    }, 500) // 500ms for long press
    setLongPressTimer(timer)
  }

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }

    if (isDragging) {
      setIsDragging(false)
      if (selectedEmoji) {
        onReact(selectedEmoji)
        setSelectedEmoji(null)
      }
    } else if (!showReactionPanel) {
      // Regular click (not long press) triggers heart reaction
      onReact("❤️")
    }

    // Don't hide panel immediately to allow clicking on reactions
    if (!isDragging) {
      setTimeout(() => setShowReactionPanel(false), 100)
    }
  }

  const handleTouchStart = () => {
    handleMouseDown()
  }

  const handleTouchEnd = () => {
    handleMouseUp()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!showReactionPanel || !reactionPanelRef.current) return

    setIsDragging(true)
    const panel = reactionPanelRef.current
    const panelRect = panel.getBoundingClientRect()

    // Check which emoji button the cursor is over
    const buttons = panel.querySelectorAll("[data-emoji]")
    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect()
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const emoji = button.getAttribute("data-emoji")
        if (emoji) setSelectedEmoji(emoji)
      }
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!showReactionPanel || !reactionPanelRef.current) return

    setIsDragging(true)
    const touch = e.touches[0]
    const panel = reactionPanelRef.current

    // Check which emoji button the touch is over
    const buttons = panel.querySelectorAll("[data-emoji]")
    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect()
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        const emoji = button.getAttribute("data-emoji")
        if (emoji) setSelectedEmoji(emoji)
      }
    })
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) clearTimeout(longPressTimer)
    }
  }, [longPressTimer])

  return (
    <div className="relative flex items-center gap-2">
      {/* Heart reaction button (always visible) */}
      <Button
        variant={heartReaction?.userReacted ? "default" : "ghost"}
        size="sm"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (longPressTimer) {
            clearTimeout(longPressTimer)
            setLongPressTimer(null)
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="flex items-center gap-1 h-8"
      >
        <Heart className={`w-4 h-4 ${heartReaction?.userReacted ? "fill-current" : ""}`} />
        {heartReaction?.count || 0}
      </Button>

      {/* Other reactions that have been used */}
      {otherReactions.map((reaction) => (
        <Button
          key={reaction.id}
          variant={reaction.userReacted ? "default" : "ghost"}
          size="sm"
          onClick={() => onReact(reaction.emoji)}
          className="flex items-center gap-1 h-8 px-2"
        >
          <span>{reaction.emoji}</span>
          {reaction.count}
        </Button>
      ))}

      {/* Floating reaction panel (shows on long press) */}
      {showReactionPanel && (
        <div
          ref={reactionPanelRef}
          className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border p-1 flex items-center z-10"
          style={{ transform: "translateY(-10px)" }}
        >
          {REACTION_EMOJIS.slice(0, 6).map((emoji) => (
            <button
              key={emoji.emoji}
              data-emoji={emoji.emoji}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform ${
                selectedEmoji === emoji.emoji ? "bg-gray-100 scale-125" : "hover:bg-gray-50"
              }`}
              onClick={() => {
                onReact(emoji.emoji)
                setShowReactionPanel(false)
              }}
            >
              {emoji.emoji}
            </button>
          ))}

          {/* More emojis button */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-50">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-4 gap-1">
                {/* Additional emojis here */}
                {"😍 🤩 😮 🎉 👍 💯 🙏 👀".split(" ").map((emoji) => (
                  <button
                    key={emoji}
                    className="h-10 w-10 rounded hover:bg-gray-100 flex items-center justify-center text-lg"
                    onClick={() => {
                      onReact(emoji)
                      setShowReactionPanel(false)
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}
