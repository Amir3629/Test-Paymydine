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
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              console.log('🔧 Loading quantity buttons fix...');
              function fixQuantityButtons() {
                const buttons = document.querySelectorAll('button[class*="rounded-full"], .quantity-btn, button[class*="w-12"][class*="h-12"]');
                console.log('Found buttons:', buttons.length);
                buttons.forEach((button, index) => {
                  const isQuantityButton = button.classList.contains('quantity-btn') || 
                                         (button.className.includes('rounded-full') && 
                                          button.className.includes('w-12') && 
                                          button.className.includes('h-12'));
                  if (isQuantityButton) {
                    console.log('Fixing button ' + index + ':', button);
                    button.style.backgroundColor = 'var(--theme-secondary)';
                    button.style.color = 'var(--theme-background)';
                    button.style.border = '1px solid var(--theme-border)';
                    button.style.borderRadius = '50%';
                    button.style.display = 'flex';
                    button.style.alignItems = 'center';
                    button.style.justifyContent = 'center';
                    button.style.cursor = 'pointer';
                    button.style.width = '48px';
                    button.style.height = '48px';
                    button.style.fontSize = '18px';
                    button.style.fontWeight = 'bold';
                    const children = button.querySelectorAll('*');
                    children.forEach(child => {
                      child.style.color = 'var(--theme-background)';
                    });
                  }
                });
                const badges = document.querySelectorAll('[class*="cart-badge"], .absolute.-top-2.-right-2');
                badges.forEach(badge => {
                  if (badge.textContent && !isNaN(badge.textContent.trim())) {
                    console.log('Fixing cart badge:', badge);
                    badge.style.backgroundColor = 'var(--theme-secondary)';
                    badge.style.color = 'var(--theme-background)';
                    badge.style.borderRadius = '50%';
                  }
                });
                console.log('✅ Quantity buttons fix applied!');
              }
              fixQuantityButtons();
              setTimeout(fixQuantityButtons, 1000);
              setTimeout(fixQuantityButtons, 3000);
              const observer = new MutationObserver(function(mutations) {
                let shouldFix = false;
                mutations.forEach(function(mutation) {
                  if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                      if (node.nodeType === 1 && (node.tagName === 'BUTTON' || node.querySelector('button'))) {
                        shouldFix = true;
                      }
                    });
                  }
                });
                if (shouldFix) {
                  setTimeout(fixQuantityButtons, 100);
                }
              });
              observer.observe(document.body, { childList: true, subtree: true });
            })();
          `
        }} />
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