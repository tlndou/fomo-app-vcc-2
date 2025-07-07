"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send, X, Trash2, MoreHorizontal, Heart } from "lucide-react"
import { GifPicker } from "./gif-picker"
import type { Comment, User } from "@/types/feed"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (content: string, parentId?: string, gifUrl?: string) => void
  onUserClick: (userId: string) => void
  currentUser: User
  onDeleteComment: (commentId: string) => void
  postId?: string
  showAllComments?: boolean
}

interface CommentItemProps {
  comment: Comment
  onReply: (commentId: string, username: string) => void
  onUserClick: (userId: string) => void
  currentUser: User
  onDeleteComment: (commentId: string) => void
  level?: number
}

function CommentItem({ comment, onReply, onUserClick, currentUser, onDeleteComment, level = 0 }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <div className={`${level > 0 ? "ml-8 border-l-2 border-border pl-4" : ""}`}>
      <div className="flex gap-3 mb-3">
        <button onClick={() => onUserClick(comment.user.id)}>
          <Avatar className="w-8 h-8 hover:opacity-80 transition-opacity">
            <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
            <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
          </Avatar>
        </button>
        <div className="flex-1">
          <div className="bg-muted rounded-lg p-3 relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <button onClick={() => onUserClick(comment.user.id)} className="font-medium text-sm hover:underline text-foreground">
                  {comment.user.name}
                </button>
                {comment.content && <div className="text-sm mt-1 text-foreground">{comment.content}</div>}
                {comment.gifUrl && (
                  <div className="mt-2">
                    <img src={comment.gifUrl || "/placeholder.svg"} alt="Comment GIF" className="max-w-48 rounded-lg" />
                  </div>
                )}
              </div>
              
              {/* Ellipsis menu for current user's comments */}
              {currentUser.id === comment.user.id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 -mt-1 -mr-1">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDeleteComment(comment.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Comment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span>{comment.timestamp.toLocaleTimeString()}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="h-auto p-0 text-xs flex items-center gap-1"
            >
              <Heart className={`w-3 h-3 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              {likeCount > 0 && <span>{likeCount}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id, comment.user.name)}
              className="h-auto p-0 text-xs"
            >
              Reply
            </Button>
          </div>
        </div>
      </div>

      {comment.replies.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          onReply={onReply}
          onUserClick={onUserClick}
          currentUser={currentUser}
          onDeleteComment={onDeleteComment}
          level={level + 1}
        />
      ))}
    </div>
  )
}

export function CommentSection({ comments, onAddComment, onUserClick, currentUser, onDeleteComment, postId, showAllComments = false }: CommentSectionProps) {
  const [showComments, setShowComments] = useState(showAllComments)
  const [newComment, setNewComment] = useState("")
  const [selectedGif, setSelectedGif] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null)
  const router = useRouter()

  const [showMentions, setShowMentions] = useState(false)
  const [showHashtags, setShowHashtags] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [hashtagQuery, setHashtagQuery] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)

  // Auto-focus comment input when showAllComments is true
  useEffect(() => {
    if (showAllComments) {
      const commentInput = document.getElementById("comment-input")
      if (commentInput) {
        commentInput.focus()
      }
    }
  }, [showAllComments])

  // Mock users for mentions (in real app, this would come from props or API)
  const availableUsers = [
    { id: "1", name: "Tina (aka tee)", username: "tina_tee" },
    { id: "2", name: "Leo (aka king)", username: "leo_king" },
    { id: "4", name: "Rina (aka riri)", username: "rina_riri" },
    { id: "host", name: "Party Host", username: "party_host" },
  ]

  // Mock hashtags (in real app, this would come from trending hashtags)
  const availableHashtags = ["party", "wild", "crazy", "help", "announcement", "barcrawl", "fun", "night", "friends"]

  const handleCommentClick = () => {
    // If there are more than 3 comments and we have a postId, navigate to post detail
    if (comments.length > 3 && postId) {
      router.push(`/post/${postId}`)
    } else {
      setShowComments(!showComments)
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    const position = e.target.selectionStart
    setNewComment(text)
    setCursorPosition(position)

    // Check for @ mentions
    const beforeCursor = text.slice(0, position)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
      setShowMentions(true)
      setShowHashtags(false)
    } else {
      setShowMentions(false)
    }

    // Check for # hashtags
    const hashtagMatch = beforeCursor.match(/#(\w*)$/)
    if (hashtagMatch) {
      setHashtagQuery(hashtagMatch[1])
      setShowHashtags(true)
      setShowMentions(false)
    } else {
      setShowHashtags(false)
    }

    // Hide both if no match
    if (!mentionMatch && !hashtagMatch) {
      setShowMentions(false)
      setShowHashtags(false)
    }
  }

  const insertMention = (user: { username: string; name: string }) => {
    const beforeCursor = newComment.slice(0, cursorPosition)
    const afterCursor = newComment.slice(cursorPosition)
    const beforeMention = beforeCursor.replace(/@\w*$/, "")
    const newText = `${beforeMention}@${user.username} ${afterCursor}`
    setNewComment(newText)
    setShowMentions(false)
  }

  const insertHashtag = (hashtag: string) => {
    const beforeCursor = newComment.slice(0, cursorPosition)
    const afterCursor = newComment.slice(cursorPosition)
    const beforeHashtag = beforeCursor.replace(/#\w*$/, "")
    const newText = `${beforeHashtag}#${hashtag} ${afterCursor}`
    setNewComment(newText)
    setShowHashtags(false)
  }

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(mentionQuery.toLowerCase()),
  )

  const filteredHashtags = availableHashtags.filter((hashtag) =>
    hashtag.toLowerCase().includes(hashtagQuery.toLowerCase()),
  )

  const handleAddComment = () => {
    if (newComment.trim() || selectedGif) {
      onAddComment(newComment, replyingTo?.id, selectedGif || undefined)
      setNewComment("")
      setSelectedGif(null)
      setReplyingTo(null)
      setShowMentions(false)
      setShowHashtags(false)
    }
  }

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username })
    // Focus the comment input
    const commentInput = document.getElementById("comment-input")
    if (commentInput) {
      commentInput.focus()
    }
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  return (
    <div>
      {!showAllComments && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCommentClick}
          className="flex items-center gap-2 h-8"
        >
          <MessageCircle className="w-4 h-4" />
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </Button>
      )}

      {(showComments || showAllComments) && (
        <div className="mt-4 space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onUserClick={onUserClick}
              currentUser={currentUser}
              onDeleteComment={onDeleteComment}
            />
          ))}

          <div className="flex gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2 relative">
              {replyingTo && (
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span>
                    Replying to <span className="font-medium text-gray-700">{replyingTo.username}</span>
                  </span>
                  <Button variant="ghost" size="sm" onClick={cancelReply} className="h-5 w-5 p-0 ml-2">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    id="comment-input"
                    value={newComment}
                    onChange={handleTextChange}
                    placeholder={
                      replyingTo
                        ? `Reply to ${replyingTo.username}...`
                        : "Write a comment... (use @ to mention users, # for hashtags)"
                    }
                    className="min-h-[60px]"
                  />

                  {/* Mentions dropdown */}
                  {showMentions && filteredUsers.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
                      {filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => insertMention(user)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span className="font-medium">@{user.username}</span>
                          <span className="text-gray-500 text-sm">{user.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hashtags dropdown */}
                  {showHashtags && filteredHashtags.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded-lg shadow-lg max-h-32 overflow-y-auto z-10">
                      {filteredHashtags.map((hashtag) => (
                        <button
                          key={hashtag}
                          onClick={() => insertHashtag(hashtag)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50"
                        >
                          <span className="text-blue-600">#{hashtag}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <GifPicker onSelectGif={setSelectedGif} />
                  <Button onClick={handleAddComment}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {selectedGif && (
                <div className="relative">
                  <img src={selectedGif || "/placeholder.svg"} alt="Selected GIF" className="max-w-48 rounded-lg" />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setSelectedGif(null)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
