"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { WhatsNewDialog } from "@/components/whats-new-dialog"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ErrorBoundary>
        {children}
        <PWAInstallPrompt />
        <WhatsNewDialog />
      </ErrorBoundary>
    </AuthProvider>
  )
}

