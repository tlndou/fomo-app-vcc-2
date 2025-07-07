"use client"

import { useParties } from "@/context/party-context"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPartiesPage() {
  const { parties, drafts, debugParties } = useParties()
  const { user } = useAuth()

  const handleDebug = () => {
    console.log('🔧 Debug button clicked')
    debugParties()
  }

  const createTestParty = async () => {
    try {
      const testParty = {
        name: `Test Party ${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: '18:00',
        location: 'Test Location',
        description: 'This is a test party',
        attendees: 1,
        hosts: [user?.name || 'Test User'],
        status: 'upcoming' as const,
        locationTags: [],
        userTags: [],
        invites: [],
        coHosts: [],
        requireApproval: false,
      }

      console.log('🔧 Creating test party:', testParty)
      // This will be handled by the party context
      window.location.href = '/create-party'
    } catch (error) {
      console.error('Error creating test party:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Party Debug Page</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Current User</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parties ({parties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {parties.length === 0 ? (
              <p className="text-muted-foreground">No parties found</p>
            ) : (
              <div className="space-y-2">
                {parties.map((party) => (
                  <div key={party.id} className="border p-3 rounded">
                    <h3 className="font-semibold">{party.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Hosts: {party.hosts?.join(', ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {party.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Drafts ({drafts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {drafts.length === 0 ? (
              <p className="text-muted-foreground">No drafts found</p>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft) => (
                  <div key={draft.id} className="border p-3 rounded">
                    <h3 className="font-semibold">{draft.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Hosts: {draft.hosts?.join(', ')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {draft.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleDebug} variant="outline">
            Debug Parties
          </Button>
          <Button onClick={createTestParty} variant="outline">
            Create Test Party
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Click "Debug Parties" to see console logs</li>
              <li>Click "Create Test Party" to go to create party page</li>
              <li>Create a party and check if it appears here</li>
              <li>Check browser console for detailed logs</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 