export interface Party {
  id: string
  name: string
  date: string
  time: string
  location: string
  description?: string
  attendees: number
  hosts: string[]
  status: "live" | "upcoming" | "completed" | "draft" | "cancelled"
  locationTags?: LocationTag[]
  userTags?: UserTag[]
  invites?: Invite[]
  coHosts?: CoHost[]
  requireApproval?: boolean
  createdAt?: string
  updatedAt?: string
  cancelledAt?: string
  cancelledBy?: string
}

export interface LocationTag {
  id: string
  name: string
}

export interface UserTag {
  id: string
  name: string
  color: string
}

export interface Invite {
  id: string
  email: string
  status: "approved" | "pending"
  name: string
}

export interface CoHost {
  id: string
  email: string
  name: string
  avatar?: string
}
