import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"
// Import PWAInstallPrompt component for PWA installation prompt
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { WhatsNewDialog } from "@/components/whats-new-dialog"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "P!!E - Social Platform",
  description: "Share insights, engage with communities, and climb the ranks in P!!E. Connect, create, and collaborate with creators worldwide.",
  keywords: ["social media", "community", "creators", "collaboration", "P!!E", "social platform"],
  authors: [{ name: "P!!E Team" }],
  creator: "P!!E",
  publisher: "P!!E",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pie-social.replit.app"),
  openGraph: {
    title: "P!!E - Social Platform",
    description: "Share insights, engage with communities, and climb the ranks in P!!E. Connect, create, and collaborate with creators worldwide.",
    url: "/",
    siteName: "P!!E",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/pie-icon.svg",
        width: 100,
        height: 100,
        alt: "P!!E Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "P!!E - Social Platform",
    description: "Share insights, engage with communities, and climb the ranks in P!!E.",
    images: ["/pie-icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/pie-icon-32.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/pie-icon.svg",
  },
  // Add PWA manifest and appleWebApp configuration
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "P!!E"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="peakit" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* Render PWAInstallPrompt component */}
        <PWAInstallPrompt />
        <WhatsNewDialog />
        <Analytics />
      </body>
    </html>
  )
}