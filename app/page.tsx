"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, User, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Party } from "@/types/party"
import { ProtectedRoute } from "@/components/protected-route"
import { HamburgerMenu } from "@/components/hamburger-menu"
import { NotificationIcon } from "@/components/notification-icon"
import { supabase } from '@/lib/supabase'
import { useToast } from "@/hooks/use-toast"
import { useParties } from "@/context/party-context"
import { BottomNavigation, type TabType } from "@/components/bottom-navigation"
import { DraftsList } from "@/components/drafts-list"
import { HostControls } from "@/components/host-controls"
import { PartyStatusBadge } from "@/components/party-status-badge"
import { DebugInfo } from "@/components/debug-info"

function HomePage() {
  const [activeTab, setActiveTab] = useState<"active" | "inactive" | "drafts">("active")
  const [showDrafts, setShowDrafts] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [notifiedCancelledParties, setNotifiedCancelledParties] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { toast } = useToast()
  const { parties, drafts } = useParties()

  const liveParties = parties.filter((party) => party.status === "live")
  const upcomingParties = parties.filter((party) => party.status === "upcoming")
  const completedParties = parties.filter((party) => party.status === "completed")
  const cancelledParties = parties.filter((party) => party.status === "cancelled")
  const draftParties = drafts.filter((party) => party.status === "draft")

  // Load notified cancelled parties from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("notifiedCancelledParties")
    if (stored) {
      setNotifiedCancelledParties(new Set(JSON.parse(stored)))
    }
  }, [])

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // Show notification only for newly cancelled parties
  useEffect(() => {
    if (activeTab === "inactive" && cancelledParties.length > 0) {
      const newCancelledParties = cancelledParties.filter(
        party => !notifiedCancelledParties.has(party.id)
      )
      
      if (newCancelledParties.length > 0) {
        // Show notification for new cancelled parties
        toast({
          title: "New Cancelled Parties",
          description: `You have ${newCancelledParties.length} newly cancelled party${newCancelledParties.length > 1 ? 's' : ''} in your inactive parties.`,
          variant: "default",
        })
        
        // Mark these parties as notified
        const updatedNotified = new Set([...notifiedCancelledParties, ...newCancelledParties.map(p => p.id)])
        setNotifiedCancelledParties(updatedNotified)
        localStorage.setItem("notifiedCancelledParties", JSON.stringify([...updatedNotified]))
      }
    }
  }, [activeTab, cancelledParties, notifiedCancelledParties, toast])

  const handlePartyClick = (partyId: string) => {
    router.push(`/feed?party=${partyId}`)
  }

  const handleCreateButtonPress = () => {
    const timer = setTimeout(() => {
      setShowDrafts(true)
    }, 500) // 500ms long press
    setLongPressTimer(timer)
  }

  const handleCreateButtonRelease = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    if (!showDrafts) {
      router.push("/create-party")
    }
  }

  const handleCreateButtonLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    setShowDrafts(false)
  }

  const getStatusBadge = (status: Party["status"]) => {
    switch (status) {
      case "live":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Live Now</Badge>
      case "upcoming":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Upcoming</Badge>
      case "completed":
        return (
          <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
            Completed
          </Badge>
        )
      case "draft":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Draft</Badge>
      case "cancelled":
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Cancelled</Badge>
    }
  }

  const PartyCard = ({ party }: { party: Party }) => (
    <Card
      key={party.id}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{party.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <PartyStatusBadge status={party.status} />
            <HostControls party={party} />
          </div>
        </div>

        <div 
          className="space-y-3 text-muted-foreground"
          onClick={() => handlePartyClick(party.id)}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{party.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{party.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{party.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{party.attendees} attendees</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>Hosted by {party.hosts.join(", ")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Test Supabase connection
  useEffect(() => {
    async function testConnection() {
      try {
        console.log('🔌 Testing Supabase connection...')
        const { data, error } = await supabase.from('parties').select('count').limit(1)
        if (error) {
          console.log('❌ Connection error:', error.message)
        } else {
          console.log('✅ Supabase connected successfully!')
        }
      } catch (err) {
        console.error('❌ Connection test failed:', err)
      }
    }
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="w-10"></div> {/* Spacer for center alignment */}
        <h1 
          className="text-xl font-bold cursor-pointer hover:text-primary transition-colors"
          onClick={scrollToTop}
        >
          fomo
        </h1>
        <div className="flex items-center gap-2">
          <NotificationIcon unreadCount={0} />
          <HamburgerMenu />
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        {/* Debug Info - Temporary */}
        <DebugInfo />
        
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === "active" ? "default" : "ghost"}
              onClick={() => setActiveTab("active")}
              className="rounded-md"
            >
              Active Parties
            </Button>
            <Button
              variant={activeTab === "inactive" ? "default" : "ghost"}
              onClick={() => setActiveTab("inactive")}
              className="rounded-md"
            >
              Inactive Parties
            </Button>
            <Button
              variant={activeTab === "drafts" ? "default" : "ghost"}
              onClick={() => setActiveTab("drafts")}
              className="rounded-md"
            >
              Drafts ({draftParties.length})
            </Button>
          </div>
        </div>

        {activeTab === "active" ? (
          <div className="space-y-8">
            {/* Live Parties */}
            {liveParties.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold">Happening Now</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveParties.map((party) => (
                    <PartyCard key={party.id} party={party} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Parties */}
            {upcomingParties.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Upcoming Parties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingParties.map((party) => (
                    <PartyCard key={party.id} party={party} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : activeTab === "inactive" ? (
          <div className="space-y-8">
            {/* Completed Parties */}
            {completedParties.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Completed Parties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedParties.map((party) => (
                    <PartyCard key={party.id} party={party} />
                  ))}
                </div>
              </section>
            )}

            {/* Cancelled Parties */}
            {cancelledParties.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Cancelled Parties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cancelledParties.map((party) => (
                    <PartyCard key={party.id} party={party} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Drafts */}
            {draftParties.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">My Drafts</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {draftParties.map((draft) => (
                    <Card key={draft.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-semibold">{draft.name}</h3>
                          {getStatusBadge(draft.status)}
                        </div>

                        <div className="space-y-3 text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{draft.date}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{draft.time}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{draft.location}</span>
                          </div>

                          {draft.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{draft.description}</p>
                          )}
                        </div>

                        <Button 
                          onClick={() => router.push(`/create-party?draft=${draft.id}`)} 
                          className="w-full"
                          size="sm"
                        >
                          Continue Editing
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === "active" && liveParties.length === 0 && upcomingParties.length === 0) ||
          (activeTab === "inactive" && completedParties.length === 0 && cancelledParties.length === 0) ||
          (activeTab === "drafts" && draftParties.length === 0)) && (
          <div className="text-center text-muted-foreground mt-12">
            <div className="text-lg font-medium mb-2">No parties found</div>
            <p className="text-sm">
              {activeTab === "active"
                ? "You don't have any active parties right now"
                : activeTab === "inactive"
                ? "You haven't attended any parties yet"
                : "You haven't saved any party drafts yet"}
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button with Long Press */}
      <div className="fixed bottom-6 right-6 z-40">
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

      {/* Drafts Modal */}
      <DraftsList isOpen={showDrafts} onClose={() => setShowDrafts(false)} />
    </div>
  )
}

export default function ProtectedHomePage() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  )
} 