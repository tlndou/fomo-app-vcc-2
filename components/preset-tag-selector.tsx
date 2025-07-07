"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface PresetTag {
  id: string
  name: string
  color: string
}

interface PresetTagSelectorProps {
  isOpen: boolean
  onClose: () => void
  selectedTags: string[]
  onUpdateTags: (tags: string[]) => void
}

// Mock preset tags set by the host (like Reddit flairs)
const presetTags: PresetTag[] = [
  { id: "1", name: "OOTD", color: "bg-pink-500" },
  { id: "2", name: "Food & Drinks", color: "bg-orange-500" },
  { id: "3", name: "Music", color: "bg-purple-500" },
  { id: "4", name: "Group Photo", color: "bg-blue-500" },
  { id: "5", name: "Funny Moment", color: "bg-yellow-500" },
  { id: "6", name: "Behind the Scenes", color: "bg-green-500" },
  { id: "7", name: "Announcement", color: "bg-red-500" },
  { id: "8", name: "Games", color: "bg-indigo-500" },
  { id: "9", name: "Memories", color: "bg-rose-500" },
  { id: "10", name: "Vibes", color: "bg-teal-500" },
]

export function PresetTagSelector({ isOpen, onClose, selectedTags, onUpdateTags }: PresetTagSelectorProps) {
  const handleSelectTag = (tag: PresetTag) => {
    if (selectedTags.includes(tag.name)) {
      onUpdateTags(selectedTags.filter((t) => t !== tag.name))
    } else if (selectedTags.length < 3) {
      onUpdateTags([...selectedTags, tag.name])
    }
  }

  const handleClearTags = () => {
    onUpdateTags([])
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Tags ({selectedTags.length}/3)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Selected tags:</div>
                <Button variant="ghost" size="sm" onClick={handleClearTags} className="h-8 w-8 p-0">
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => {
                  const tagColor = presetTags.find((t) => t.name === tag)?.color || "bg-gray-500"
                  return (
                    <Badge key={tag} className={`${tagColor} text-white flex items-center gap-1`}>
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUpdateTags(selectedTags.filter((t) => t !== tag))}
                        className="h-4 w-4 p-0 hover:bg-white/20"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tag Grid */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <div className="text-sm text-gray-600 mb-3">
              Choose a flair to categorize your post (like Reddit flairs):
            </div>

            {presetTags.map((tag) => (
              <Button
                key={tag.id}
                variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                onClick={() => handleSelectTag(tag)}
                disabled={!selectedTags.includes(tag.name) && selectedTags.length >= 3}
                className="w-full justify-start"
              >
                <Badge className={`${tag.color} text-white mr-2`}>{tag.name}</Badge>
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClearTags} className="flex-1">
              Clear All
            </Button>
            <Button onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
