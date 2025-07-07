"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, X, Copy, Check, Plus, Trash2, User, Users } from "lucide-react"
import { HamburgerMenu } from "@/components/hamburger-menu"
import { ProtectedRoute } from "@/components/protected-route"
import type { LocationTag, UserTag, Invite, CoHost } from "@/types/party"
import { useParties } from "@/context/party-context"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

const tagColors = [
  "bg-pink-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-indigo-500",
]

// Generate unique party ID and invite link
const generatePartyId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function CreatePartyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draft')
  const isEditing = !!draftId
  const { addParty, saveDraft, updateDraft, publishDraft, getDraftById } = useParties()
  const { toast } = useToast()
  const { user } = useAuth()

  // Generate unique party ID and invite link
  const [partyId] = useState(() => draftId || generatePartyId())
  const [inviteLink] = useState(() => `https://fomo.app/invite/${partyId}`)

  // Basic Info State
  const [partyName, setPartyName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")

  // Collections State
  const [locationTags, setLocationTags] = useState<LocationTag[]>([])
  const [userTags, setUserTags] = useState<UserTag[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [coHosts, setCoHosts] = useState<CoHost[]>([])

  // UI State
  const [linkCopied, setLinkCopied] = useState(false)
  const [requireApproval, setRequireApproval] = useState(true)

  // Form Input States
  const [inviteEmail, setInviteEmail] = useState("")
  const [newLocationTag, setNewLocationTag] = useState("")
  const [newUserTag, setNewUserTag] = useState("")
  const [newCoHostEmail, setNewCoHostEmail] = useState("")

  // Rich text editor ref
  const editorRef = useRef<HTMLDivElement>(null)

  // Load draft data if editing
  useEffect(() => {
    if (draftId) {
      const draft = getDraftById(draftId)
      if (draft) {
        setPartyName(draft.name || "")
        setStartDate(draft.date || "")
        setStartTime(draft.time || "")
        setLocation(draft.location || "")
        setDescription(draft.description || "")
        setLocationTags(draft.locationTags || [])
        setUserTags(draft.userTags || [])
        setInvites(draft.invites || [])
        setCoHosts(draft.coHosts || [])
        setRequireApproval(draft.requireApproval ?? true)
      }
    }
  }, [draftId, getDraftById])

  // Add Functions
  const addLocationTag = () => {
    if (newLocationTag.trim()) {
      const newTag: LocationTag = {
        id: Date.now().toString(),
        name: newLocationTag.trim(),
      }
      setLocationTags([...locationTags, newTag])
      setNewLocationTag("")
    }
  }

  const addUserTag = () => {
    if (newUserTag.trim()) {
      const newTag: UserTag = {
        id: Date.now().toString(),
        name: newUserTag.trim(),
        color: tagColors[userTags.length % tagColors.length],
      }
      setUserTags([...userTags, newTag])
      setNewUserTag("")
    }
  }

  const addInvite = () => {
    if (inviteEmail.trim()) {
      const newInvite: Invite = {
        id: Date.now().toString(),
        email: inviteEmail.trim(),
        status: "pending",
        name: inviteEmail.split("@")[0],
      }
      setInvites([...invites, newInvite])
      setInviteEmail("")
    }
  }

  const addCoHost = () => {
    if (newCoHostEmail.trim()) {
      const newCoHost: CoHost = {
        id: Date.now().toString(),
        email: newCoHostEmail.trim(),
        name: newCoHostEmail.split("@")[0].replace(/[._]/g, " "),
      }
      setCoHosts([...coHosts, newCoHost])
      setNewCoHostEmail("")
    }
  }

  // Remove Functions
  const removeLocationTag = (id: string) => {
    setLocationTags(locationTags.filter((tag) => tag.id !== id))
  }

  const removeUserTag = (id: string) => {
    setUserTags(userTags.filter((tag) => tag.id !== id))
  }

  const removeInvite = (id: string) => {
    setInvites(invites.filter((invite) => invite.id !== id))
  }

  const removeCoHost = (id: string) => {
    setCoHosts(coHosts.filter((coHost) => coHost.id !== id))
  }

  // Utility Functions
  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleSubmit = (isDraft = false) => {
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

    const partyData = {
      name: partyName,
      date: startDate,
      time: startTime,
      location: location,
      description: description,
      attendees: invites.filter(invite => invite.status === 'approved').length + 1, // +1 for creator
      hosts: [user?.name || "unknown", ...coHosts.map(coHost => coHost.name)], // Include current user name and co-hosts
      status: isDraft ? "draft" as const : "upcoming" as const,
      locationTags,
      userTags,
      invites,
      coHosts,
      requireApproval,
    }

    console.log('🔧 Creating party with data:', partyData)
    console.log('🔧 Current user:', user)
    console.log('🔧 User name being used as host:', user?.name || "unknown")

    if (isEditing) {
      if (isDraft) {
        updateDraft(draftId, partyData)
        toast({
          title: "Draft Updated",
          description: "Your party draft has been updated successfully.",
        })
      } else {
        publishDraft(draftId)
        toast({
          title: "Party Published",
          description: "Your party has been published and is now live!",
        })
      }
    } else {
      if (isDraft) {
        saveDraft(partyData)
        toast({
          title: "Draft Saved",
          description: "Your party draft has been saved successfully.",
        })
      } else {
        addParty(partyData)
        toast({
          title: "Party Created",
          description: "Your party has been created and is now live!",
        })
      }
    }

    // Navigate back to home page
    router.push("/")
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault()
      action()
    }
  }

  // Action buttons component to be used in all tabs
  const ActionButtons = () => (
    <div className="flex gap-4 pt-6 border-t mt-6">
      <Button onClick={() => handleSubmit(true)} variant="outline" className="flex-1">
        {isEditing ? "Update Draft" : "Save as Draft"}
      </Button>
      <Button onClick={() => handleSubmit(false)} className="flex-1">
        {isEditing ? "Publish Party" : "Create Party"}
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-background animate-slide-up">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={() => router.back()} className="text-muted-foreground font-medium">
          cancel
        </button>
        <h1 className="text-xl font-bold">fomo</h1>
        <div className="w-12">
          <HamburgerMenu />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {isEditing ? "Edit Party Draft" : "Set Up Your Party"}
          </h2>
          <p className="text-muted-foreground">
            {isEditing 
              ? "Continue editing your party draft" 
              : "Configure all the details for your upcoming event"
            }
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="basic-info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="post-tags">Post Tags</TabsTrigger>
            <TabsTrigger value="co-hosts">Co-hosts</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic-info">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Party Details
                </CardTitle>
                <CardDescription>Set up the basic information for your party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Party Name */}
                <div>
                  <Label htmlFor="party-name">Party Name</Label>
                  <Input
                    id="party-name"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="Enter party name"
                    className="mt-1"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location">Location</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter party location"
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell people what to expect at your party..."
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <ActionButtons />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invites Tab */}
          <TabsContent value="invites">
            <Card>
              <CardHeader>
                <CardTitle>Manage Invites</CardTitle>
                <CardDescription>Send invites and manage who can join your party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Invite Link */}
                <div>
                  <Label>Party Invite Link</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={inviteLink} readOnly className="flex-1" />
                    <Button onClick={copyInviteLink} variant="outline" size="icon">
                      {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Share this link to invite people to your party</p>
                </div>

                {/* Add Invite */}
                <div>
                  <Label htmlFor="invite-email">Add Individual Invites</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addInvite)}
                      placeholder="Enter email address"
                      className="flex-1"
                    />
                    <Button onClick={addInvite} disabled={!inviteEmail.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Invites List */}
                <div>
                  <Label>Invited People ({invites.length})</Label>
                  <div className="space-y-2 mt-2">
                    {invites.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No invites yet. Add some people to get started!</p>
                      </div>
                    ) : (
                      invites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{invite.name}</div>
                            <div className="text-sm text-muted-foreground">{invite.email}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={invite.status === "approved" ? "default" : "secondary"}>
                              {invite.status}
                            </Badge>
                            <Button
                              onClick={() => removeInvite(invite.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <ActionButtons />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Location Tags</CardTitle>
                <CardDescription>Create location tags for different areas of your party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Location Tag */}
                <div>
                  <Label htmlFor="new-location-tag">Add Location Tag</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="new-location-tag"
                      value={newLocationTag}
                      onChange={(e) => setNewLocationTag(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addLocationTag)}
                      placeholder="e.g., Main Stage, Bar Area, Dance Floor"
                      className="flex-1"
                    />
                    <Button onClick={addLocationTag} disabled={!newLocationTag.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Location Tags List */}
                <div>
                  <Label>Location Tags ({locationTags.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {locationTags.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8 w-full">
                        <p>No location tags yet. Add some to help guests navigate your party!</p>
                      </div>
                    ) : (
                      locationTags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="flex items-center gap-1">
                          {tag.name}
                          <Button
                            onClick={() => removeLocationTag(tag.id)}
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-muted"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <ActionButtons />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Post Tags Tab */}
          <TabsContent value="post-tags">
            <Card>
              <CardHeader>
                <CardTitle>Post Tags</CardTitle>
                <CardDescription>Create custom tags that guests can use when posting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add User Tag */}
                <div>
                  <Label htmlFor="new-user-tag">Add Post Tag</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="new-user-tag"
                      value={newUserTag}
                      onChange={(e) => setNewUserTag(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addUserTag)}
                      placeholder="e.g., OOTD, Food & Drinks, Music"
                      className="flex-1"
                    />
                    <Button onClick={addUserTag} disabled={!newUserTag.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* User Tags List */}
                <div>
                  <Label>Post Tags ({userTags.length})</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userTags.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8 w-full">
                        <p>No post tags yet. Add some to help guests categorize their posts!</p>
                      </div>
                    ) : (
                      userTags.map((tag) => (
                        <Badge key={tag.id} className={`${tag.color} text-white flex items-center gap-1`}>
                          {tag.name}
                          <Button
                            onClick={() => removeUserTag(tag.id)}
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-muted"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <ActionButtons />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Co-hosts Tab */}
          <TabsContent value="co-hosts">
            <Card>
              <CardHeader>
                <CardTitle>Co-hosts</CardTitle>
                <CardDescription>Add co-hosts who can help manage the party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Co-host */}
                <div>
                  <Label htmlFor="new-cohost-email">Add Co-host</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="new-cohost-email"
                      type="email"
                      value={newCoHostEmail}
                      onChange={(e) => setNewCoHostEmail(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, addCoHost)}
                      placeholder="Enter email address"
                      className="flex-1"
                    />
                    <Button onClick={addCoHost} disabled={!newCoHostEmail.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Co-hosts List */}
                <div>
                  <Label>Co-hosts ({coHosts.length})</Label>
                  <div className="space-y-2 mt-2">
                    {coHosts.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No co-hosts yet. Add some to help manage your party!</p>
                      </div>
                    ) : (
                      coHosts.map((coHost) => (
                        <div key={coHost.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={coHost.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{coHost.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{coHost.name}</div>
                              <div className="text-sm text-muted-foreground">{coHost.email}</div>
                            </div>
                          </div>
                          <Button
                            onClick={() => removeCoHost(coHost.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <ActionButtons />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function ProtectedCreatePartyPage() {
  return (
    <ProtectedRoute>
      <CreatePartyPage />
    </ProtectedRoute>
  )
}
