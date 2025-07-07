"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search } from "lucide-react"

interface GifPickerProps {
  onSelectGif: (gifUrl: string) => void
}

// Mock GIF data - in a real app, you'd use Giphy API
const MOCK_GIFS = [
  "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
  "https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif",
  "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "https://media.giphy.com/media/3o7abAHdYvZdBNnGZq/giphy.gif",
]

export function GifPicker({ onSelectGif }: GifPickerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredGifs = MOCK_GIFS // In real app, filter based on searchTerm

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-500 px-4 py-2 rounded-md">
          <span className="text-xs font-bold">GIF</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            <Input
              placeholder="Search GIFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {filteredGifs.map((gif, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelectGif(gif)
                  setIsOpen(false)
                }}
                className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img src={gif || "/placeholder.svg"} alt="GIF" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <div className="text-xs text-gray-500 text-center">Powered by GIPHY</div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
