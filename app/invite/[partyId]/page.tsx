"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Users, Smartphone, Download, ExternalLink, PartyPopper } from "lucide-react"
import type { Party } from "@/types/party"
import { formatTimeString } from "@/lib/utils"

interface PartyInvite extends Omit<Party, "hosts"> {
  description: string
  coverImage?: string
  maxAttendees: number
  hosts: Array<{
    id: string
    name: string
    avatar?: string
  }>
}

const mockPartyInvite: PartyInvite = {
  id: "1",
  name: "Sarah & Mike's Birthday Bash 🎉",
  date: "Saturday, January 20, 2024",
  time: "7:00 PM",
  location: "The Rooftop Bar, 123 Main St, Downtown",
  attendees: 23,
  maxAttendees: 50,
  hosts: [
    { id: "host1", name: "Sarah Chen", avatar: "/placeholder.svg?height=60&width=60" },
    { id: "host2", name: "Mike Rodriguez", avatar: "/placeholder.svg?height=60&width=60" },
    { id: "host3", name: "Alex Kim", avatar: "/placeholder.svg?height=60&width=60" },
  ],
  status: "upcoming",
  description: "Come celebrate our birthdays! There'll be drinks, dancing, and great vibes ✨",
}

export default function PartyInvitePage() {
  const params = useParams()
  const router = useRouter()
  const partyId = params.partyId as string

  const [party] = useState<PartyInvite>(mockPartyInvite)
  const [isAppInstalled, setIsAppInstalled] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [isDetectingApp, setIsDetectingApp] = useState(true)

  // Detect if app is installed (simplified for demo)
  useEffect(() => {
    const detectApp = async () => {
      // Simulate app detection
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Random detection for demo purposes
      const hasApp = Math.random() > 0.5
      setIsAppInstalled(hasApp)
      setIsDetectingApp(false)
    }

    detectApp()
  }, [])

  const formatHostNames = (hosts: PartyInvite["hosts"]) => {
    if (hosts.length === 1) {
      return `${hosts[0].name} wants`
    } else if (hosts.length === 2) {
      return `${hosts[0].name} & ${hosts[1].name} want`
    } else if (hosts.length === 3) {
      return `${hosts[0].name}, ${hosts[1].name} & ${hosts[2].name} want`
    } else {
      return `${hosts[0].name}, ${hosts[1].name} & ${hosts.length - 2} others want`
    }
  }

  const handleJoinParty = async () => {
    setIsJoining(true)

    if (isAppInstalled) {
      // Deep link to app announcements tab
      const deepLink = `fomoapp://feed?tab=announcements&partyId=${partyId}`

      try {
        window.location.href = deepLink

        // Fallback: if deep link doesn't work, redirect to web version
        setTimeout(() => {
          router.push(`/feed?party=${partyId}&tab=announcements`)
        }, 2000)
      } catch (error) {
        console.error("Deep link failed:", error)
        router.push(`/feed?party=${partyId}&tab=announcements`)
      }
    } else {
      // Redirect to app store
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
      const appStoreUrl = isIOS
        ? "https://apps.apple.com/app/fomo"
        : "https://play.google.com/store/apps/details?id=com.fomo.app"

      window.open(appStoreUrl, "_blank")
    }

    setIsJoining(false)
  }

  const handleViewInBrowser = () => {
    router.push(`/feed?party=${partyId}&tab=announcements`)
  }

  const spotsLeft = party.maxAttendees - party.attendees

  if (isDetectingApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto overflow-hidden">
        {/* Demo Toggle (remove in production) */}
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAppInstalled(!isAppInstalled)}
            className="bg-white/90 text-xs"
          >
            Demo: App {isAppInstalled ? "Installed" : "Not Installed"}
          </Button>
        </div>

        {/* Party Invite Badge */}
        <div className="absolute top-6 left-6 z-10">
          <Badge className="bg-white/90 text-purple-600 hover:bg-white">
            <PartyPopper className="w-4 h-4 mr-1" />
            Party Invite
          </Badge>
        </div>

        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-gray-300 to-gray-400 relative flex items-center justify-center">
          <div className="text-gray-500 text-6xl">📷</div>
          {party.coverImage && (
            <img
              src={party.coverImage || "/placeholder.svg"}
              alt={party.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        <CardContent className="p-6">
          {/* Party Title */}
          <h1 className="text-2xl font-bold text-center mb-4">{party.name}</h1>

          {/* Host Avatars */}
          <div className="flex justify-center mb-3">
            <div className="flex -space-x-3">
              {party.hosts.slice(0, 3).map((host, index) => (
                <Avatar key={host.id} className="w-12 h-12 border-4 border-white">
                  <AvatarImage src={host.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{host.name[0]}</AvatarFallback>
                </Avatar>
              ))}
              {party.hosts.length > 3 && (
                <div className="w-12 h-12 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center text-sm font-medium">
                  +{party.hosts.length - 3}
                </div>
              )}
            </div>
          </div>

          {/* Host Names */}
          <p className="text-center text-gray-600 mb-6">
            <span className="font-medium">Hosted by {party.hosts.map((h) => h.name).join(", ")}</span>
            <br />
            <span className="text-sm">{formatHostNames(party.hosts)} you to join the party!</span>
          </p>

          <Separator className="my-6" />

          {/* Party Details */}
          <div className="space-y-4">
            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-semibold">{party.date}</div>
                <div className="text-gray-600">Starting at {formatTimeString(party.time)}</div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-semibold">Location</div>
                <div className="text-gray-600">{party.location}</div>
              </div>
            </div>

            {/* Attendees */}
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-semibold">{party.attendees} going</div>
                <div className="text-gray-600">{spotsLeft} spots left</div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          <p className="text-gray-700 text-center mb-6">{party.description}</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleJoinParty}
              disabled={isJoining}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  {isAppInstalled ? "Opening App..." : "Redirecting..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isAppInstalled ? (
                    <>
                      <Smartphone className="w-4 h-4" />
                      Join Party & View Updates
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download App to Join
                    </>
                  )}
                </div>
              )}
            </Button>

            <Button variant="outline" onClick={handleViewInBrowser} className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              View in Browser
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
