"use client"

import React, { type ReactNode, type ErrorInfo } from "react"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: (error: Error) => ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[v0] Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // If it's an auth error, show a more helpful message
      const isAuthError = this.state.error.message?.includes("useAuth") || 
                         this.state.error.message?.includes("AuthProvider")
      
      return (
        this.props.fallback?.(this.state.error) || (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="max-w-md text-center p-6">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
              <p className="text-sm text-muted-foreground mb-4">
                {isAuthError 
                  ? "Authentication error. Please refresh the page."
                  : this.state.error.message}
              </p>
              {isAuthError && (
                <p className="text-xs text-muted-foreground mb-6">
                  If the problem persists, try clearing your browser cache.
                </p>
              )}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined })
                    window.location.reload()
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: undefined })}
                  className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
