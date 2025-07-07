"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useParties } from "@/context/party-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"

function EditPartyPage() {
  const router = useRouter()
  const params = useParams()
  const partyId = params.partyId as string
  const { updateParty, getPartyById } = useParties()
  const { toast } = useToast()
  const { user } = useAuth()

  // Basic Info State
  const [partyName, setPartyName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")

  // UI State
  const [isLoading, setIsLoading] = useState(false)
  const [originalParty, setOriginalParty] = useState<any>(null)

  // Load party data
  useEffect(() => {
    const loadParty = async () => {
      if (!partyId) return

      try {
        // First try to get from context
        const party = getPartyById(partyId)
        if (party) {
          setOriginalParty(party)
          setPartyName(party.name || "")
          setStartDate(party.date || "")
          setStartTime(party.time || "")
          setLocation(party.location || "")
          setDescription(party.description || "")
          return
        }

        // If not in context, fetch from database
        const { data, error } = await supabase
          .from('parties')
          .select('*')
          .eq('id', partyId)
          .single()

        if (error) {
          console.error('Error fetching party:', error)
          toast({
            title: "Error",
            description: "Failed to load party data.",
            variant: "destructive",
          })
          router.push('/')
          return
        }

        if (data) {
          setOriginalParty(data)
          setPartyName(data.name || "")
          setStartDate(data.date || "")
          setStartTime(data.time || "")
          setLocation(data.location || "")
          setDescription(data.description || "")
        }
      } catch (error) {
        console.error('Error loading party:', error)
        toast({
          title: "Error",
          description: "Failed to load party data.",
          variant: "destructive",
        })
        router.push('/')
      }
    }

    loadParty()
  }, [partyId, getPartyById, router, toast])

  const handleSubmit = async () => {
    // Validate required fields
    if (!partyName.trim()) {
      toast({
        title: "Missing Party Name",
        description: "Please enter a party name to continue.",
        variant: "destructive",
      })
      return
    }

    if (!startDate) {
      toast({
        title: "Missing Date",
        description: "Please select a date for your party.",
        variant: "destructive",
      })
      return
    }

    if (!startTime) {
      toast({
        title: "Missing Time",
        description: "Please select a time for your party.",
        variant: "destructive",
      })
      return
    }

    if (!location.trim()) {
      toast({
        title: "Missing Location",
        description: "Please enter a location for your party.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Only update fields that exist in the database schema
      const updates = {
        name: partyName.trim(),
        date: startDate,
        time: startTime,
        location: location.trim(),
        description: description.trim(),
      }

      await updateParty(partyId, updates)

      toast({
        title: "Party Updated",
        description: `${partyName} has been updated successfully!`,
      })

      router.push('/')
    } catch (error) {
      console.error('Error updating party:', error)
      toast({
        title: "Error",
        description: "Failed to update party. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const ActionButtons = () => (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={() => router.push('/')}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="flex-1"
      >
        {isLoading ? "Updating..." : "Update Party"}
      </Button>
    </div>
  )

  if (!originalParty) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading party data...</p>
          </div>
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
          size="sm"
          onClick={() => router.push('/')}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <h1 className="text-lg font-semibold">Edit Party</h1>
        <div className="w-10"></div> {/* Spacer for center alignment */}
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Party Details</CardTitle>
            <CardDescription>
              Update your party information and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info Tab */}
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="partyName">Party Name *</Label>
                    <Input
                      id="partyName"
                      value={partyName}
                      onChange={(e) => setPartyName(e.target.value)}
                      placeholder="Enter party name"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Time *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your party..."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Note</h4>
                    <p className="text-sm text-muted-foreground">
                      Only basic party information can be edited. Additional features like location tags, 
                      user tags, invites, and co-hosts are not available in edit mode.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="pt-6 border-t">
              <ActionButtons />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ProtectedEditPartyPage() {
  return (
    <ProtectedRoute>
      <EditPartyPage />
    </ProtectedRoute>
  )
} 