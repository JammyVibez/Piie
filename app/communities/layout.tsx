import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "P!!E - Community Platform",
  description: "Connect with communities on P!!E. Explore, share, and grow together.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/pie-icon-32.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/pie-icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="peak">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
