"use client"

import { Button } from "@/components/ui/button"
import { Home, Star, Megaphone, Search, MessageCircle, Clock } from "lucide-react"
import { useDrafts } from "@/context/draft-context"

export type TabType = "feed" | "starred" | "announcements" | "search" | "messages" | "drafts"

interface BottomNavigationProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  showDrafts?: boolean
}

export function BottomNavigation({ activeTab, onTabChange, showDrafts = true }: BottomNavigationProps) {
  const { drafts } = useDrafts()
  const pendingDrafts = drafts.filter(draft => 
    draft.status === 'draft' || draft.status === 'failed'
  )

  const tabs = [
    { id: "feed" as const, label: "Feed", icon: Home },
    { id: "starred" as const, label: "Starred", icon: Star },
    { id: "announcements" as const, label: "Announcements", icon: Megaphone },
    { id: "search" as const, label: "Search", icon: Search },
    { id: "messages" as const, label: "Messages", icon: MessageCircle },
    ...(showDrafts ? [{
      id: "drafts" as const, 
      label: "Drafts", 
      icon: Clock,
      badge: pendingDrafts.length > 0 ? pendingDrafts.length : undefined
    }] : []),
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 relative ${
                  isActive ? "text-pink-600 bg-pink-50 dark:bg-pink-950/20" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
                <span className="text-xs font-medium">{tab.label}</span>
                {tab.badge && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {tab.badge}
                  </div>
                )}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
