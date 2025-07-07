"use client"

import React, { useState } from 'react'
import { MoreHorizontal, Edit, X, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useParties } from '@/context/party-context'
import { useAuth } from '@/context/auth-context'
import type { Party } from '@/types/party'

interface HostControlsProps {
  party: Party
  onEdit?: () => void
  className?: string
}

export function HostControls({ party, onEdit, className = "" }: HostControlsProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isEndEarlyDialogOpen, setIsEndEarlyDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { canEditParty, canCancelParty, canEndPartyEarly, endPartyEarly, cancelParty } = useParties()
  const { user } = useAuth()
  const { toast } = useToast()

  // Check if current user is a host
  const isHost = canEditParty(party, user?.id)
  const canCancel = canCancelParty(party, user?.id)
  const canEndEarly = canEndPartyEarly(party, user?.id)

  // Don't render if user is not a host
  if (!isHost) {
    return null
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    }
  }

  const handleCancelParty = async () => {
    setIsLoading(true)
    try {
      await cancelParty(party.id)
      toast({
        title: "Party Cancelled",
        description: `${party.name} has been cancelled successfully.`,
        variant: "destructive",
      })
      setIsCancelDialogOpen(false)
    } catch (error) {
      console.error('Error cancelling party:', error)
      toast({
        title: "Error",
        description: "Failed to cancel party. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndPartyEarly = async () => {
    setIsLoading(true)
    try {
      await endPartyEarly(party.id)
      toast({
        title: "Party Ended",
        description: `${party.name} has been ended early successfully.`,
      })
      setIsEndEarlyDialogOpen(false)
    } catch (error) {
      console.error('Error ending party early:', error)
      toast({
        title: "Error",
        description: "Failed to end party early. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getMenuItems = () => {
    const items = []

    // Edit option for upcoming and live parties
    if (party.status === 'upcoming' || party.status === 'live') {
      items.push(
        <DropdownMenuItem key="edit" onClick={handleEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Party
        </DropdownMenuItem>
      )
    }

    // Cancel option for upcoming parties only
    if (canCancel) {
      items.push(
        <DropdownMenuItem 
          key="cancel" 
          onClick={() => setIsCancelDialogOpen(true)}
          className="text-red-600 focus:text-red-600"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel Party
        </DropdownMenuItem>
      )
    }

    // End early option for upcoming and live parties
    if (canEndEarly) {
      items.push(
        <DropdownMenuItem 
          key="end-early" 
          onClick={() => setIsEndEarlyDialogOpen(true)}
          className="text-orange-600 focus:text-orange-600"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          End Party Early
        </DropdownMenuItem>
      )
    }

    return items
  }

  const menuItems = getMenuItems()

  // Don't render if no actions are available
  if (menuItems.length === 0) {
    return null
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-8 w-8 p-0 hover:bg-muted ${className}`}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {menuItems}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cancel Party Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Party</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel "{party.name}"? This action cannot be undone and all attendees will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Keep Party</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelParty}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Cancelling..." : "Cancel Party"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Party Early Dialog */}
      <AlertDialog open={isEndEarlyDialogOpen} onOpenChange={setIsEndEarlyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Party Early</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end "{party.name}" early? This will mark the party as completed and update all attendee statistics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Keep Party Going</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEndPartyEarly}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Ending..." : "End Party Early"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 