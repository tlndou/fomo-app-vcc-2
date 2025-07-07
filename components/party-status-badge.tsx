"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, CheckCircle, X, Calendar } from 'lucide-react'
import type { Party } from '@/types/party'

interface PartyStatusBadgeProps {
  status: Party['status']
  className?: string
}

export function PartyStatusBadge({ status, className = "" }: PartyStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'upcoming':
        return {
          label: 'Upcoming',
          icon: <Calendar className="w-3 h-3 mr-1" />,
          className: 'bg-blue-500 hover:bg-blue-600 text-white',
        }
      case 'live':
        return {
          label: 'Live Now',
          icon: <Play className="w-3 h-3 mr-1" />,
          className: 'bg-green-500 hover:bg-green-600 text-white',
        }
      case 'completed':
        return {
          label: 'Completed',
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
          className: 'bg-gray-500 hover:bg-gray-600 text-white',
        }
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: <X className="w-3 h-3 mr-1" />,
          className: 'bg-red-500 hover:bg-red-600 text-white',
        }
      case 'draft':
        return {
          label: 'Draft',
          icon: <Clock className="w-3 h-3 mr-1" />,
          className: 'bg-yellow-500 hover:bg-yellow-600 text-white',
        }
      default:
        return {
          label: 'Unknown',
          icon: <Clock className="w-3 h-3 mr-1" />,
          className: 'bg-gray-500 hover:bg-gray-600 text-white',
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge className={`${config.className} ${className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
} 