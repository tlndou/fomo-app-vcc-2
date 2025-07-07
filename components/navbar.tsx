"use client"

import { ArrowLeft, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  title: string
  showBackButton?: boolean
  onBack?: () => void
  showSettings?: boolean
  onSettings?: () => void
}

export function Navbar({ title, showBackButton = false, onBack, showSettings = false, onSettings }: NavbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="w-10">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

        <div className="w-10">
          {showSettings && (
            <Button variant="ghost" size="sm" onClick={onSettings} className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
