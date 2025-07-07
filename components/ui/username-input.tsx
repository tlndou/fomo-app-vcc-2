"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Check, X, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface UsernameInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
  required?: boolean
  className?: string
}

export function UsernameInput({
  value,
  onChange,
  placeholder = "janedoe123",
  id,
  required = false,
  className
}: UsernameInputProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [debouncedValue, setDebouncedValue] = useState(value)

  // Debounce the username check
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, 500)

    return () => clearTimeout(timer)
  }, [value])

  // Check username availability
  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedValue || debouncedValue.length < 3) {
        setIsAvailable(null)
        return
      }

      setIsChecking(true)
      try {
        // Use count query instead of single() for more reliable results
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('username', debouncedValue)

        if (error) {
          console.error('Error checking username:', error)
          setIsAvailable(null)
        } else {
          // count will be 0 if username is available, > 0 if taken
          setIsAvailable(count === 0)
        }
      } catch (error) {
        console.error('Error checking username:', error)
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }

    checkUsername()
  }, [debouncedValue])

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={className}
        />
        {isChecking && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isChecking && value.length >= 3 && isAvailable !== null && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isAvailable ? (
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="text-xs">
          {value.length < 3 ? (
            <span className="text-muted-foreground">Username must be at least 3 characters</span>
          ) : isChecking ? (
            <span className="text-muted-foreground">Checking availability...</span>
          ) : isAvailable === true ? (
            <span className="text-green-600 dark:text-green-400">Username is available</span>
          ) : isAvailable === false ? (
            <span className="text-red-600 dark:text-red-400">Username is already taken</span>
          ) : null}
        </div>
      )}
    </div>
  )
} 