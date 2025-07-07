export interface HostRequest {
  id: string
  partyId: string
  partyName: string
  fromHost: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date
  status: "pending" | "accepted" | "declined"
}
