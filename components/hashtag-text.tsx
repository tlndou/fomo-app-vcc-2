"use client"

interface HashtagTextProps {
  text: string
  onHashtagClick: (hashtag: string) => void
}

export function HashtagText({ text, onHashtagClick }: HashtagTextProps) {
  // Split text by hashtags and render them as clickable links
  const parts = text.split(/(#\w+)/g)

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("#")) {
          const hashtag = part.slice(1) // Remove the # symbol
          return (
            <button
              key={index}
              onClick={() => onHashtagClick(hashtag)}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              {part}
            </button>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
