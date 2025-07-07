"use client"

import React from 'react'
import { useAuth } from '@/context/auth-context'
import { useParties } from '@/context/party-context'

export function DebugInfo() {
  const { user } = useAuth()
  const { parties, debugParties } = useParties()

  const runDebug = () => {
    console.log('🔍 Debug Info:')
    console.log('Current user:', user)
    console.log('User ID:', user?.id)
    console.log('User name:', user?.name)
    console.log('Parties:', parties)
    
    // Check each party's hosts
    parties.forEach((party, index) => {
      console.log(`Party ${index + 1}:`, {
        name: party.name,
        hosts: party.hosts,
        status: party.status,
        isUserHost: party.hosts?.some(host => 
          host === user?.id || 
          host === user?.name ||
          host.toLowerCase().includes(user?.id?.toLowerCase() || '') ||
          host.toLowerCase().includes(user?.name?.toLowerCase() || '')
        )
      })
    })
    
    debugParties()
  }

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">Debug Info</h3>
      <div className="text-sm text-yellow-700 mb-2">
        <p><strong>User ID:</strong> {user?.id || 'None'}</p>
        <p><strong>User Name:</strong> {user?.name || 'None'}</p>
        <p><strong>Parties Count:</strong> {parties.length}</p>
        <p><strong>Upcoming Parties:</strong> {parties.filter(p => p.status === 'upcoming').length}</p>
        <p><strong>Live Parties:</strong> {parties.filter(p => p.status === 'live').length}</p>
      </div>
      <button 
        onClick={runDebug}
        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
      >
        Run Debug
      </button>
    </div>
  )
} 