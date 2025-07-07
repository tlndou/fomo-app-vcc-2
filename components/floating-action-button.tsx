"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 200)
    onClick()
  }

  return (
    <Button
      onClick={handleClick}
      className={`fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg bg-pink-600 hover:bg-pink-700 z-40 transition-transform ${
        isClicked ? "scale-95" : "scale-100"
      }`}
      size="icon"
    >
      <Plus className="h-6 w-6 text-white" />
    </Button>
  )
}
