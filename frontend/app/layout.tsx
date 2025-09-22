import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import ClientLayout from "./clientLayout"
import { ThemeProvider } from "@/components/theme-provider"
import ThemeDevSwitcher from "@/components/ThemeDevSwitcher"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "PayMyDine - A Luxurious Dining Experience",
  description: "Order, pay, and enjoy your meal seamlessly.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="theme-vars">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E7CBA9" />
        <style id="theme-vars-inline">{`
          /* Let CSS variables handle all backgrounds - no overrides */
          html, body { background: var(--theme-background); }
        `}</style>
      </head>
      <body className={inter.className + ' text-theme'}>
        <ThemeProvider>
          <ClientLayout className={cn("min-h-screen font-sans antialiased", inter.variable)}>
            {children}
            <Toaster />
          </ClientLayout>
          <ThemeDevSwitcher />
        </ThemeProvider>
      </body>
    </html>
  )
}