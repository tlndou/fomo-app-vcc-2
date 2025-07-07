"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Navigation, Building, Search, Star, Globe, Clock } from "lucide-react"
import type { LocationTag } from "@/types/party"

interface LocationSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (location: string) => void
  selectedLocation?: string
  partyLocationTags?: LocationTag[] // Preset locations from the party
  partyName?: string // For context
}

// Mock real-world places (in a real app, this would come from Google Places API)
const mockRealWorldPlaces = [
  { id: "1", name: "Starbucks Coffee", address: "123 Main St", distance: "0.2 km", type: "cafe" },
  { id: "2", name: "Central Park", address: "456 Park Ave", distance: "0.5 km", type: "park" },
  { id: "3", name: "Downtown Mall", address: "789 Shopping Blvd", distance: "0.8 km", type: "shopping" },
  { id: "4", name: "University Campus", address: "321 College Rd", distance: "1.2 km", type: "education" },
  { id: "5", name: "Sports Center", address: "654 Fitness St", distance: "1.5 km", type: "gym" },
  { id: "6", name: "Local Restaurant", address: "987 Food Ave", distance: "0.3 km", type: "restaurant" },
  { id: "7", name: "Movie Theater", address: "147 Entertainment Blvd", distance: "0.7 km", type: "entertainment" },
  { id: "8", name: "Library", address: "258 Knowledge St", distance: "0.9 km", type: "library" },
]

// Mock party preset locations
const mockPartyLocations: LocationTag[] = [
  { id: "1", name: "Main Stage" },
  { id: "2", name: "Bar Area" },
  { id: "3", name: "Dance Floor" },
  { id: "4", name: "VIP Lounge" },
  { id: "5", name: "Garden" },
  { id: "6", name: "Rooftop" },
]

export function LocationSelector({ 
  isOpen, 
  onClose, 
  onSelectLocation, 
  selectedLocation, 
  partyLocationTags = [],
  partyName = "Party"
}: LocationSelectorProps) {
  const [activeTab, setActiveTab] = useState<"party" | "nearby" | "current" | "custom">("party")
  const [customLocation, setCustomLocation] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)
  const [nearbyPlaces, setNearbyPlaces] = useState(mockRealWorldPlaces)

  // Simulate loading nearby places when switching to nearby tab
  useEffect(() => {
    if (activeTab === "nearby" && nearbyPlaces.length === 0) {
      setIsLoadingNearby(true)
      // Simulate API call
      setTimeout(() => {
        setNearbyPlaces(mockRealWorldPlaces)
        setIsLoadingNearby(false)
      }, 1000)
    }
  }, [activeTab, nearbyPlaces.length])

  const handleSelectLocation = (location: string) => {
    onSelectLocation(location)
    onClose()
  }

  const handleCustomLocation = () => {
    if (customLocation.trim()) {
      handleSelectLocation(customLocation.trim())
      setCustomLocation("")
    }
  }

  const filteredPartyLocations = partyLocationTags.filter((location) => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredNearby = nearbyPlaces.filter((place) => 
    place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPlaceIcon = (type: string) => {
    switch (type) {
      case "cafe": return "☕"
      case "restaurant": return "🍽️"
      case "park": return "🌳"
      case "shopping": return "🛍️"
      case "gym": return "💪"
      case "entertainment": return "🎬"
      case "library": return "📚"
      case "education": return "🎓"
      default: return "📍"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Location</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex flex-col h-full">
          {/* Tab Navigation */}
          <div className="flex gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === "party" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("party")}
              className="flex-1 text-xs"
            >
              <Star className="w-3 h-3 mr-1" />
              Party
            </Button>
            <Button
              variant={activeTab === "nearby" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("nearby")}
              className="flex-1 text-xs"
            >
              <Globe className="w-3 h-3 mr-1" />
              Nearby
            </Button>
            <Button
              variant={activeTab === "current" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("current")}
              className="flex-1 text-xs"
            >
              <Navigation className="w-3 h-3 mr-1" />
              Current
            </Button>
            <Button
              variant={activeTab === "custom" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("custom")}
              className="flex-1 text-xs"
            >
              <MapPin className="w-3 h-3 mr-1" />
              Custom
            </Button>
          </div>

          {/* Search */}
          {(activeTab === "party" || activeTab === "nearby") && (
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === "party" ? "Search party locations..." : "Search nearby places..."}
                className="flex-1"
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {activeTab === "current" && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => handleSelectLocation("Current Location")}
                  className="w-full justify-start gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Use Current Location
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Uses your device's GPS location
                </p>
              </div>
            )}

            {activeTab === "party" && (
              <div className="space-y-2">
                {partyLocationTags.length > 0 && (
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    📍 {partyName} Locations
                  </div>
                )}
                {filteredPartyLocations.length > 0 ? (
                  filteredPartyLocations.map((location) => (
                    <Button
                      key={location.id}
                      variant="outline"
                      onClick={() => handleSelectLocation(location.name)}
                      className="w-full justify-start gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/20 dark:border-blue-800"
                    >
                      <Building className="w-4 h-4 text-blue-600" />
                      {location.name}
                    </Button>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No party locations found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "nearby" && (
              <div className="space-y-2">
                {isLoadingNearby ? (
                  <div className="text-center text-muted-foreground py-4">
                    <Clock className="w-8 h-8 mx-auto mb-2 animate-spin opacity-50" />
                    <p className="text-sm">Finding nearby places...</p>
                  </div>
                ) : filteredNearby.length > 0 ? (
                  <>
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      🌍 Nearby Places
                    </div>
                    {filteredNearby.map((place) => (
                      <Button
                        key={place.id}
                        variant="outline"
                        onClick={() => handleSelectLocation(`${place.name}, ${place.address}`)}
                        className="w-full justify-start gap-2 text-left h-auto py-3"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{getPlaceIcon(place.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{place.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{place.address}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">{place.distance}</div>
                        </div>
                      </Button>
                    ))}
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No nearby places found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "custom" && (
              <div className="space-y-3">
                <Input
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="Enter custom location"
                  onKeyPress={(e) => e.key === "Enter" && handleCustomLocation()}
                />
                <Button onClick={handleCustomLocation} disabled={!customLocation.trim()} className="w-full">
                  Add Custom Location
                </Button>
              </div>
            )}
          </div>

          {/* Current selection */}
          {selectedLocation && (
            <div className="bg-muted p-3 rounded-lg border-t">
              <div className="text-sm text-muted-foreground">Current location:</div>
              <div className="font-medium">{selectedLocation}</div>
              <Button variant="ghost" size="sm" onClick={() => onSelectLocation("")} className="mt-1 h-6 text-xs">
                Remove
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
