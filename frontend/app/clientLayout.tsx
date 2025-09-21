"use client"

import { useEffect, useState } from "react"
import type React from "react"
import Head from "next/head"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { saveSubscription } from "./actions"
import { useThemeStore } from "@/store/theme-store"
import ThemeCSSLoader from "@/components/theme-css-loader"
import "@/lib/i18n" // Import i18n configuration

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display" })

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function ClientLayout({
  children,
  className,
}: {
  children: React.ReactNode
  className: string
}) {
  const [mounted, setMounted] = useState(false)
  const { loadSettings } = useThemeStore()

  useEffect(() => {
    setMounted(true)
    // Load theme settings from admin panel
    loadSettings()
  }, [loadSettings])

  // Use suppressHydrationWarning on the body element
  return (
    <div 
      className={cn(className, inter.variable, playfairDisplay.variable)}
      suppressHydrationWarning
    >
      <ThemeCSSLoader />
      {children}
      <Toaster />
    </div>
  )
}
