import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(timestamp: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "now"
  if (diffInMinutes < 60) return `${diffInMinutes}m`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d`

  return timestamp.toLocaleDateString()
}

export function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function formatDate(timestamp: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (timestamp.toDateString() === today.toDateString()) {
    return "Today"
  } else if (timestamp.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  } else {
    return timestamp.toLocaleDateString()
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export interface PasswordValidation {
  hasLowercase: boolean
  hasUppercase: boolean
  hasDigit: boolean
  isValid: boolean
}

export function validatePassword(password: string): PasswordValidation {
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  
  return {
    hasLowercase,
    hasUppercase,
    hasDigit,
    isValid: hasLowercase && hasUppercase && hasDigit
  }
}

export function getPasswordErrorMessage(validation: PasswordValidation): string {
  const missing = []
  
  if (!validation.hasLowercase) missing.push("lowercase letter")
  if (!validation.hasUppercase) missing.push("uppercase letter")
  if (!validation.hasDigit) missing.push("digit")
  
  if (missing.length === 0) return ""
  
  return `Password must contain at least one ${missing.join(", ")}`
}
