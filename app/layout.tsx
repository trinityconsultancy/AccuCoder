import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { TopNavbar } from "@/components/top-navbar"
import { BottomNavbar } from "@/components/bottom-navbar"
import { FloatingChatBot } from "@/components/floating-chat-bot"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AccuCoder - Medical Coding Platform",
  description: "Your complete medical coding companion with AI assistance and learning tools",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <TopNavbar />
        {children}
        <BottomNavbar />
        <FloatingChatBot />
        <Analytics />
      </body>
    </html>
  )
}
