"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Check, X } from "lucide-react"

interface PasswordConfirmInputProps {
  password: string
  confirmPassword: string
  onConfirmPasswordChange: (value: string) => void
  placeholder?: string
  id?: string
  required?: boolean
  className?: string
}

export function PasswordConfirmInput({
  password,
  confirmPassword,
  onConfirmPasswordChange,
  placeholder = "Confirm your password",
  id,
  required = false,
  className
}: PasswordConfirmInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(false)

  useEffect(() => {
    setPasswordsMatch(password === confirmPassword && confirmPassword.length > 0)
  }, [password, confirmPassword])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={className}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {confirmPassword.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          {passwordsMatch ? (
            <>
              <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-green-600 dark:text-green-400">Passwords match</span>
            </>
          ) : (
            <>
              <X className="h-3 w-3 text-red-600 dark:text-red-400" />
              <span className="text-red-600 dark:text-red-400">Passwords do not match</span>
            </>
          )}
        </div>
      )}
    </div>
  )
} 