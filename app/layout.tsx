'use client'

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"
import { TopNavbar } from "@/components/top-navbar"
import { BottomNavbar } from "@/components/bottom-navbar"
import { FloatingChatBot } from "@/components/floating-chat-bot"
import { usePathname } from "next/navigation"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  // Public pages without app navigation
  const isPublicPage = pathname === '/' || pathname === '/signup' || pathname === '/login'

  return (
    <html lang="en">
      <head>
        <title>AccuCoder - Medical Coding Platform</title>
        <meta name="description" content="Your complete medical coding companion with AI assistance and learning tools" />
        <meta name="generator" content="v0.app" />
      </head>
      <body className={`font-sans antialiased`}>
        {!isPublicPage && <TopNavbar />}
        {children}
        {!isPublicPage && <BottomNavbar />}
        {!isPublicPage && <FloatingChatBot />}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
