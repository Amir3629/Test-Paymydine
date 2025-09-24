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
            // CART BADGE FORCE FIX - Ensures cart badge is always visible with correct colors
            (function() {
              const themeColors = {
                'clean-light': { badge: '#E7CBA9', text: '#FAFAFA' },
                'modern-dark': { badge: '#E8B4A0', text: '#0A0E12' },
                'gold-luxury': { badge: '#FFF8DC', text: '#0F0B05' },
                'vibrant-colors': { badge: '#FF6B6B', text: '#e2ceb1' },
                'minimal': { badge: '#4B8FE2', text: '#CFEBF7' }
              };
              
              function fixCartBadge() {
                const theme = document.documentElement.getAttribute('data-theme') || 'clean-light';
                const colors = themeColors[theme] || themeColors['clean-light'];
                const cartBadge = document.querySelector('.cart-badge');
                
                if (cartBadge) {
                  cartBadge.style.cssText = \`
                    background-color: \${colors.badge} !important;
                    color: \${colors.text} !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    display: flex !important;
                    z-index: 9999999 !important;
                    position: absolute !important;
                    top: -8px !important;
                    right: -8px !important;
                    font-weight: bold !important;
                    border-radius: 50% !important;
                    height: 28px !important;
                    width: 28px !important;
                    align-items: center !important;
                    justify-content: center !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
                    font-size: 12px !important;
                    border: none !important;
                    outline: none !important;
                  \`;
                }
              }
              
              // Run immediately
              fixCartBadge();
              
              // Watch for theme changes
              const observer = new MutationObserver(() => {
                fixCartBadge();
              });
              observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['data-theme']
              });
              
              // Also run periodically as safety net
              setInterval(fixCartBadge, 1000);
              
              // FOOD ITEM MODAL CARD FIX - Ensures modal cards have correct theme colors
              function fixModalCards() {
                const theme = document.documentElement.getAttribute('data-theme') || 'clean-light';
                const themeColors = {
                  'clean-light': { bg: '#FAFAFA', text: '#3B3B3B' },
                  'modern-dark': { bg: '#0A0E12', text: '#F8FAFC' },
                  'gold-luxury': { bg: '#0F0B05', text: '#FFF8DC' },
                  'vibrant-colors': { bg: '#e2ceb1', text: '#1E293B' },
                  'minimal': { bg: '#CFEBF7', text: '#1A202C' }
                };
                
                const colors = themeColors[theme] || themeColors['clean-light'];
                
                // Target modal card selectors
                const modalCardSelectors = [
                  '.surface.rounded-3xl.shadow-2xl',
                  '[class*="surface"][class*="rounded-3xl"]',
                  'div[class*="relative"][class*="surface"][class*="rounded"]'
                ];
                
                modalCardSelectors.forEach(selector => {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    // Make sure it's actually a modal card (not too small, not too big)
                    if (rect.width > 200 && rect.width < 600 && rect.height > 100 && rect.height < 500) {
                      element.style.setProperty('background-color', colors.bg, 'important');
                      element.style.setProperty('color', colors.text, 'important');
                      element.style.setProperty('opacity', '1', 'important');
                      element.style.setProperty('visibility', 'visible', 'important');
                      
                      // Also fix text color for child elements
                      element.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div').forEach(child => {
                        child.style.setProperty('color', colors.text, 'important');
                      });
                    }
                  });
                });
                
                // Keep backdrop blurry and dark
                const backdropSelectors = [
                  'div[class*="fixed"][class*="inset-0"][class*="z-50"][class*="flex"][class*="items-center"][class*="justify-center"]',
                  'div[class*="fixed"][class*="inset-0"][class*="z-50"]'
                ];
                
                backdropSelectors.forEach(selector => {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    // Make sure it's the backdrop (full screen size)
                    if (rect.width > window.innerWidth * 0.9 && rect.height > window.innerHeight * 0.9) {
                      element.style.setProperty('background-color', 'rgba(0, 0, 0, 0.6)', 'important');
                      element.style.setProperty('backdrop-filter', 'blur(8px)', 'important');
                      element.style.setProperty('opacity', '1', 'important');
                    }
                  });
                });
              }
              
              // Run modal fix immediately and periodically
              fixModalCards();
              setInterval(fixModalCards, 1000);
              
              // MODAL INFO CARDS FIX - Ensures info cards have correct theme colors
              function fixModalInfoCards() {
                const theme = document.documentElement.getAttribute('data-theme') || 'clean-light';
                const themeColors = {
                  'clean-light': { 
                    bg: 'rgba(255, 255, 255, 0.9)', 
                    text: '#3B3B3B',
                    border: '#EDEDED'
                  },
                  'modern-dark': { 
                    bg: 'rgba(30, 41, 59, 0.9)', 
                    text: '#F8FAFC',
                    border: '#334155'
                  },
                  'gold-luxury': { 
                    bg: 'rgba(26, 22, 18, 0.9)', 
                    text: '#FFF8DC',
                    border: '#CD853F'
                  },
                  'vibrant-colors': { 
                    bg: 'rgba(255, 255, 255, 0.95)', 
                    text: '#1E293B',
                    border: '#E8E0D5'
                  },
                  'minimal': { 
                    bg: 'rgba(255, 255, 255, 0.95)', 
                    text: '#1A202C',
                    border: '#E2E8F0'
                  }
                };
                
                const colors = themeColors[theme] || themeColors['clean-light'];
                
                // Target info card selectors
                const infoCardSelectors = [
                  '[class*="bg-paydine-rose-beige/10"]',
                  '[class*="backdrop-blur-sm"][class*="rounded-2xl"]',
                  'div[class*="backdrop-blur-sm"][class*="rounded-2xl"][class*="p-4"]',
                  'div[class*="backdrop-blur"][class*="rounded-2xl"]'
                ];
                
                infoCardSelectors.forEach(selector => {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(element => {
                    const rect = element.getBoundingClientRect();
                    // Make sure it's an info card (reasonable size for kcal/allergen cards)
                    if (rect.width > 80 && rect.width < 250 && rect.height > 60 && rect.height < 120) {
                      element.style.setProperty('background-color', colors.bg, 'important');
                      element.style.setProperty('color', colors.text, 'important');
                      element.style.setProperty('border-color', colors.border, 'important');
                      element.style.setProperty('opacity', '1', 'important');
                      element.style.setProperty('visibility', 'visible', 'important');
                      element.style.setProperty('backdrop-filter', 'blur(8px)', 'important');
                      element.style.setProperty('border', \`1px solid \${colors.border}\`, 'important');
                      
                      // Also fix text color for ALL child elements
                      element.querySelectorAll('*').forEach(child => {
                        child.style.setProperty('color', colors.text, 'important');
                      });
                    }
                  });
                });
              }
              
              // Run modal info cards fix immediately and periodically
              fixModalInfoCards();
              setInterval(fixModalInfoCards, 500); // Check every 500ms for faster response
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