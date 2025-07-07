export interface User {
  id: string
  name: string
  username: string
  avatar?: string
  location?: string
  friendStatus: "friends" | "pending" | "none" | "self"
  isHost?: boolean
  bio?: string
  joinDate?: string
  starSign?: string
  age?: number
}

export interface Reaction {
  id: string
  emoji: string
  label: string
  count: number
  userReacted: boolean
}

export interface Comment {
  id: string
  user: User
  content: string
  timestamp: Date
  likes: number
  userLiked: boolean
  replies: Comment[]
  gifUrl?: string
}

export interface Post {
  id: string
  user: User
  content: string
  media?: string
  tags: string[]
  presetTag?: string | null
  timestamp: Date
  reactions: Reaction[]
  comments: Comment[]
  reposts: number
  userReposted: boolean
  quotedPost?: Post
  poll?: Poll
  gifUrl?: string
}

export interface Poll {
  type: "vote" | "quiz" | "question"
  question: string
  options: Array<{ id: string; text: string; isCorrect?: boolean }>
}

export interface FilterState {
  location?: string
  tag?: string
  hashtag?: string
}

export interface Notification {
  id: string
  type: "reaction" | "comment" | "friend_request" | "friend_accepted" | "repost" | "quote_repost" | "share" | "party_cancelled"
  users: User[]
  post?: Post
  timestamp: Date
  read: boolean
  emoji?: string
  message?: string
  quoteContent?: string
  partyId?: string
  partyName?: string
}
