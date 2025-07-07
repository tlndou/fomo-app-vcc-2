import React from 'react'
import { Button, ButtonProps } from './button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { LoadingState } from '@/lib/loading-states'

interface LoadingButtonProps extends ButtonProps {
  loadingState: LoadingState
  loadingText?: string
  successText?: string
  errorText?: string
  onSuccess?: () => void
  onError?: () => void
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loadingState,
  loadingText = "Loading...",
  successText = "Success!",
  errorText = "Error!",
  onSuccess,
  onError,
  disabled,
  ...props
}) => {
  // Auto-trigger callbacks
  React.useEffect(() => {
    if (loadingState === 'success' && onSuccess) {
      onSuccess()
    }
    if (loadingState === 'error' && onError) {
      onError()
    }
  }, [loadingState, onSuccess, onError])

  const getButtonContent = () => {
    switch (loadingState) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {loadingText}
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
            {successText}
          </>
        )
      case 'error':
        return (
          <>
            <XCircle className="w-4 h-4 mr-2 text-red-500" />
            {errorText}
          </>
        )
      default:
        return children
    }
  }

  const getButtonVariant = () => {
    switch (loadingState) {
      case 'success':
        return 'default' as const
      case 'error':
        return 'destructive' as const
      default:
        return props.variant || 'default'
    }
  }

  return (
    <Button
      {...props}
      variant={getButtonVariant()}
      disabled={disabled || loadingState === 'loading'}
      className={`transition-all duration-200 ${
        loadingState === 'success' ? 'bg-green-500 hover:bg-green-600' :
        loadingState === 'error' ? 'bg-red-500 hover:bg-red-600' :
        props.className || ''
      }`}
    >
      {getButtonContent()}
    </Button>
  )
} 