import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { DraftProvider } from "@/context/draft-context"
import { PartyProvider } from "@/context/party-context"
import { FriendProvider } from "@/context/friend-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FOMO App",
  description: "Never miss out on what's happening",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <PartyProvider>
              <FriendProvider>
                <DraftProvider>
                  {children}
                  <Toaster />
                </DraftProvider>
              </FriendProvider>
            </PartyProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
