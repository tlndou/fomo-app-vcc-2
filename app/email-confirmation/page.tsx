"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Mail, 
  CheckCircle, 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Shield
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function EmailConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resendEmailConfirmation } = useAuth()
  const { toast } = useToast()
  const [isResending, setIsResending] = useState(false)
  
  // Get email from URL params or use a default
  const email = searchParams.get("email") || "your email"

  const handleResendEmail = async () => {
    if (!email || email === "your email") {
      toast({
        title: "Email not found",
        description: "Please try signing up again.",
        variant: "destructive"
      })
      return
    }

    setIsResending(true)
    try {
      await resendEmailConfirmation(email)
      toast({
        title: "Email sent",
        description: "Confirmation email has been resent to your inbox.",
      })
    } catch (error) {
      toast({
        title: "Failed to resend email",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleBackToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <Card className="shadow-lg border-2">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Check your email
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              We've sent you a confirmation link to verify your account
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Icon */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <Mail className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">
                      Next steps:
                    </h3>
                    <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li className="flex items-start gap-2">
                        <span className="font-medium">1.</span>
                        <span>Check your email inbox (and spam folder)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium">2.</span>
                        <span>Click the confirmation link in the email</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-medium">3.</span>
                        <span>Return here and sign in to your account</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-900 dark:text-amber-100 text-sm">
                      Security reminder
                    </h3>
                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                      Never share your confirmation link with anyone. Our team will never ask for it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Time Limit */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Confirmation link expires in 24 hours</span>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleResendEmail}
                variant="outline" 
                className="w-full"
                disabled={isResending}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? "Sending..." : "Resend confirmation email"}
              </Button>

              <Button 
                onClick={handleBackToLogin}
                variant="ghost" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Button>
            </div>

            {/* Help Section */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email?{" "}
                <button 
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="text-foreground font-medium hover:underline disabled:opacity-50"
                >
                  Try again
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{" "}
            <Link href="/help" className="text-foreground font-medium hover:underline">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 