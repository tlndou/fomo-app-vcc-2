"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Edit, Trash2, Plus } from "lucide-react"
import type { Party } from "@/types/party"
import { ProtectedRoute } from "@/components/protected-route"
import { HamburgerMenu } from "@/components/hamburger-menu"
import { NotificationIcon } from "@/components/notification-icon"

// Mock drafts data - in a real app, this would come from your database
const mockDrafts: Party[] = []

function DraftsPage() {
  const [drafts, setDrafts] = useState<Party[]>(mockDrafts)
  const router = useRouter()

  const handleEditDraft = (draftId: string) => {
    router.push(`/create-party?draft=${draftId}`)
  }

  const handleDeleteDraft = (draftId: string) => {
    if (confirm("Are you sure you want to delete this draft?")) {
      setDrafts(drafts.filter(draft => draft.id !== draftId))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const DraftCard = ({ draft }: { draft: Party }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{draft.name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Last edited: {formatDate(draft.updatedAt || draft.createdAt || '')}
            </p>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Draft
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(draft.date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatTime(draft.time)}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{draft.location}</span>
          </div>

          {draft.description && (
            <p className="text-sm text-gray-500 line-clamp-2">{draft.description}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => handleEditDraft(draft.id)} 
            className="flex-1"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Continue Editing
          </Button>
          <Button 
            onClick={() => handleDeleteDraft(draft.id)} 
            variant="outline" 
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="text-gray-600 font-medium"
        >
          Back
        </button>
        <h1 className="text-xl font-bold">fomo</h1>
        <div className="flex items-center gap-2">
                      <NotificationIcon unreadCount={0} />
          <HamburgerMenu />
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Drafts</h2>
          <p className="text-gray-600">Continue editing your saved party drafts</p>
        </div>

        {/* Drafts Grid */}
        {drafts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-12">
            <div className="text-lg font-medium mb-2">No drafts found</div>
            <p className="text-sm mb-6">You haven't saved any party drafts yet</p>
            <Button onClick={() => router.push("/create-party")}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Party
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProtectedDraftsPage() {
  return (
    <ProtectedRoute>
      <DraftsPage />
    </ProtectedRoute>
  )
} 