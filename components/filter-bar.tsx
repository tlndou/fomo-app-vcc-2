"use client"

import { Button } from "@/components/ui/button"
import { X, MapPin, Tag, Hash } from "lucide-react"
import type { FilterState } from "@/types/feed"

interface FilterBarProps {
  filters: FilterState
  onClearFilter: (filterType: keyof FilterState) => void
  onClearAll: () => void
}

export function FilterBar({ filters, onClearFilter, onClearAll }: FilterBarProps) {
  const hasFilters = Object.values(filters).some(Boolean)

  if (!hasFilters) return null

  return (
    <div className="bg-white border-b p-3 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600">Filtering by:</span>

        {filters.location && (
          <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
            <MapPin className="w-3 h-3" />
            {filters.location}
            <Button variant="ghost" size="sm" onClick={() => onClearFilter("location")} className="h-4 w-4 p-0 ml-1">
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {filters.tag && (
          <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            <Tag className="w-3 h-3" />
            {filters.tag}
            <Button variant="ghost" size="sm" onClick={() => onClearFilter("tag")} className="h-4 w-4 p-0 ml-1">
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {filters.hashtag && (
          <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
            <Hash className="w-3 h-3" />
            {filters.hashtag}
            <Button variant="ghost" size="sm" onClick={() => onClearFilter("hashtag")} className="h-4 w-4 p-0 ml-1">
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={onClearAll} className="text-xs">
          Clear all
        </Button>
      </div>
    </div>
  )
}
