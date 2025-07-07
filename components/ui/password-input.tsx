"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { validatePassword, type PasswordValidation } from "@/lib/utils"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  required?: boolean
  showValidation?: boolean
  className?: string
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Enter your password",
  id,
  required = false,
  showValidation = true,
  className
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [validation, setValidation] = useState<PasswordValidation>({
    hasLowercase: false,
    hasUppercase: false,
    hasDigit: false,
    isValid: false
  })

  useEffect(() => {
    setValidation(validatePassword(value))
  }, [value])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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

      {showValidation && value.length > 0 && (
        <div className="space-y-1 text-xs">
          <p className="text-muted-foreground font-medium">Password requirements:</p>
          <div className="space-y-1">
            <div className={`flex items-center gap-2 ${validation.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              {validation.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>At least one lowercase letter (a-z)</span>
            </div>
            <div className={`flex items-center gap-2 ${validation.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              {validation.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-2 ${validation.hasDigit ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
              {validation.hasDigit ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>At least one digit (0-9)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 