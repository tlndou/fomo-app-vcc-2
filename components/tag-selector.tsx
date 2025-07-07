"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { CardDescription } from "@/components/ui/card"

interface TagSelectorProps {
  isOpen: boolean
  onClose: () => void
  selectedTags: string[]
  onUpdateTags: (tags: string[]) => void
  partyUserTags?: Array<{ id: string; name: string; color: string }>
}

const eventTags = [
  "Party",
  "Birthday",
  "Wedding",
  "Corporate",
  "Graduation",
  "Holiday",
  "Anniversary",
  "Celebration",
  "Networking",
  "Fundraiser",
]

const popularTags = [
  "Fun",
  "Music",
  "Dancing",
  "Food",
  "Drinks",
  "Friends",
  "Memories",
  "Good Times",
  "Vibes",
  "Epic",
  "Crazy",
  "Wild",
  "Chill",
  "Amazing",
]

export function TagSelector({ isOpen, onClose, selectedTags, onUpdateTags, partyUserTags = [] }: TagSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<"party" | "event" | "popular">("party")
  const [searchQuery, setSearchQuery] = useState("")
  const [customTag, setCustomTag] = useState("")

  const getCurrentTags = () => {
    switch (activeCategory) {
      case "party":
        return partyUserTags.map(tag => tag.name)
      case "event":
        return eventTags
      case "popular":
        return popularTags
      default:
        return eventTags
    }
  }

  const currentTags = getCurrentTags()
  const filteredTags = currentTags.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onUpdateTags(selectedTags.filter((t) => t !== tag))
    } else if (selectedTags.length < 3) {
      onUpdateTags([...selectedTags, tag])
    }
  }

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim()) && selectedTags.length < 3) {
      onUpdateTags([...selectedTags, customTag.trim()])
      setCustomTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    onUpdateTags(selectedTags.filter((t) => t !== tag))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Additional Tags ({selectedTags.length}/3)</DialogTitle>
          <CardDescription>Add additional custom tags beyond the preset flair</CardDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Selected Tags:</div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="default" className="flex items-center gap-1">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveTag(tag)}
                      className="h-4 w-4 p-0 hover:bg-white/20"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeCategory === "party" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory("party")}
              className="flex-1"
            >
              Party Tags
            </Button>
            <Button
              variant={activeCategory === "event" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory("event")}
              className="flex-1"
            >
              Event Tags
            </Button>
            <Button
              variant={activeCategory === "popular" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveCategory("popular")}
              className="flex-1"
            >
              Popular Tags
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="flex-1"
            />
          </div>

          {/* Custom Tag Input */}
          <div className="flex gap-2">
            <Input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="Create custom tag..."
              onKeyPress={(e) => e.key === "Enter" && handleAddCustomTag()}
              className="flex-1"
            />
            <Button
              onClick={handleAddCustomTag}
              disabled={!customTag.trim() || selectedTags.length >= 3 || selectedTags.includes(customTag.trim())}
              size="sm"
            >
              Add
            </Button>
          </div>

          {/* Tag Grid */}
          <div className="max-h-60 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {filteredTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleTag(tag)}
                  disabled={!selectedTags.includes(tag) && selectedTags.length >= 3}
                  className="justify-start"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
